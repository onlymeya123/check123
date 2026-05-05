<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Repositories\ProductRepository;
use App\Repositories\TransactionRepository;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TransactionService
{
    public function __construct(
        private readonly ProductRepository $products,
        private readonly TransactionRepository $transactions,
    ) {
    }

    public function store(array $data): Transaction
    {
        return DB::transaction(function () use ($data) {
            $items = collect($data['items'] ?? [])
                ->filter(fn (array $item) => (int) ($item['qty'] ?? 0) > 0)
                ->values();

            if ($items->isEmpty()) {
                throw ValidationException::withMessages(['items' => 'Keranjang transaksi masih kosong.']);
            }

            $productIds = $items->pluck('product_id')->all();
            $products = Product::query()
                ->whereIn('id', $productIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $subtotal = 0;
            $payloadItems = [];

            foreach ($items as $item) {
                $product = $products->get((int) $item['product_id']);

                if (! $product) {
                    throw ValidationException::withMessages(['items' => 'Produk tidak ditemukan.']);
                }

                $qty = (int) $item['qty'];

                if ($product->stock < $qty) {
                    throw ValidationException::withMessages([
                        'items' => "Stok {$product->name} tidak mencukupi.",
                    ]);
                }

                $lineDiscount = (float) ($item['discount'] ?? 0);
                $lineSubtotal = max(0, ($product->price * $qty) - $lineDiscount);
                $subtotal += $lineSubtotal;

                $payloadItems[] = [
                    'product' => $product,
                    'qty' => $qty,
                    'price' => $product->price,
                    'discount' => $lineDiscount,
                    'subtotal' => $lineSubtotal,
                ];
            }

            $discount = (float) ($data['discount'] ?? 0);
            $tax = (float) ($data['tax'] ?? 0);
            $total = max(0, $subtotal - $discount + $tax);
            $paid = collect($data['payments'] ?? [])->sum(fn (array $payment) => (float) ($payment['amount'] ?? 0));

            if ($paid < $total) {
                throw ValidationException::withMessages(['payments' => 'Nominal pembayaran kurang dari total transaksi.']);
            }

            $transaction = $this->transactions->create([
                'invoice_number' => $this->transactions->nextInvoiceNumber(),
                'user_id' => $data['user_id'],
                'customer_id' => $data['customer_id'] ?? null,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'tax' => $tax,
                'total' => $total,
                'paid' => $paid,
                'change' => $paid - $total,
                'status' => 'paid',
                'notes' => $data['notes'] ?? null,
            ]);

            foreach ($payloadItems as $item) {
                $profit = (($item['price'] - $item['product']->cost_price) * $item['qty']) - $item['discount'];

                TransactionItem::query()->create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $item['product']->id,
                    'product_name' => $item['product']->name,
                    'sku' => $item['product']->sku,
                    'qty' => $item['qty'],
                    'unit_price' => $item['price'],
                    'discount' => $item['discount'],
                    'subtotal' => $item['subtotal'],
                    'cost_price' => $item['product']->cost_price,
                    'profit' => $profit,
                ]);

                StockMovement::query()->create([
                    'product_id' => $item['product']->id,
                    'user_id' => $data['user_id'],
                    'type' => 'sale',
                    'qty' => -1 * $item['qty'],
                    'stock_before' => $item['product']->stock,
                    'stock_after' => $item['product']->stock - $item['qty'],
                    'reference_type' => Transaction::class,
                    'reference_id' => $transaction->id,
                    'notes' => $transaction->invoice_number,
                ]);

                $this->products->decrementStock($item['product'], $item['qty']);
            }

            foreach ($data['payments'] ?? [] as $payment) {
                Payment::query()->create([
                    'transaction_id' => $transaction->id,
                    'method' => Arr::get($payment, 'method', 'cash'),
                    'amount' => (float) Arr::get($payment, 'amount', 0),
                    'reference' => Arr::get($payment, 'reference'),
                    'meta' => Arr::get($payment, 'meta', []),
                ]);
            }

            return $transaction->load(['items.product', 'payments', 'customer', 'cashier']);
        });
    }
}
