<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Product;
use App\Models\Transaction;
use App\Services\TransactionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class SaleController extends Controller
{
    public function create(): View
    {
        return view('pos.create', [
            'products' => Product::query()->active()->with('category')->orderBy('name')->get(),
            'customers' => Customer::query()->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request, TransactionService $service): RedirectResponse
    {
        $validated = $request->validate([
            'customer_id' => ['nullable', 'exists:customers,id'],
            'discount' => ['nullable', 'numeric', 'min:0'],
            'tax' => ['nullable', 'numeric', 'min:0'],
            'items' => ['required', 'array'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.qty' => ['required', 'integer', 'min:1'],
            'items.*.discount' => ['nullable', 'numeric', 'min:0'],
            'payments' => ['required', 'array'],
            'payments.*.method' => ['required', 'string', 'max:50'],
            'payments.*.amount' => ['required', 'numeric', 'min:0'],
            'payments.*.reference' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $validated['items'] = collect($validated['items'])
            ->filter(fn (array $item): bool => filled($item['product_id'] ?? null) && (int) ($item['qty'] ?? 0) > 0)
            ->values()
            ->all();

        $transaction = $service->store([
            ...$validated,
            'user_id' => $request->user()->id,
        ]);

        return redirect()
            ->route('pos.receipt', $transaction)
            ->with('success', 'Transaksi berhasil disimpan.');
    }

    public function receipt(Transaction $transaction): View
    {
        return view('pos.receipt', [
            'transaction' => $transaction->load(['items', 'payments', 'cashier', 'customer']),
        ]);
    }
}
