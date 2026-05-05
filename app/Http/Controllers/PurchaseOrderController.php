<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\StockMovement;
use App\Models\Supplier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\View\View;

class PurchaseOrderController extends Controller
{
    public function index(): View
    {
        $orders = PurchaseOrder::query()
            ->with(['supplier', 'user'])
            ->latest()
            ->paginate(12);

        return view('purchase_orders.index', compact('orders'));
    }

    public function create(): View
    {
        return view('purchase_orders.create', [
            'suppliers' => Supplier::query()->orderBy('name')->get(),
            'products' => Product::query()->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'supplier_id' => ['required', 'exists:suppliers,id'],
            'status' => ['required', 'in:draft,ordered,received'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.qty' => ['required', 'integer', 'min:1'],
            'items.*.unit_cost' => ['required', 'numeric', 'min:0'],
        ]);

        $order = DB::transaction(function () use ($data, $request) {
            $items = collect($data['items'])->filter(fn (array $item) => (int) $item['qty'] > 0)->values();
            $total = $items->sum(fn (array $item) => (int) $item['qty'] * (float) $item['unit_cost']);

            $order = PurchaseOrder::query()->create([
                'supplier_id' => $data['supplier_id'],
                'user_id' => $request->user()->id,
                'po_number' => 'PO-'.now()->format('YmdHis'),
                'status' => $data['status'],
                'ordered_at' => now(),
                'received_at' => $data['status'] === 'received' ? now() : null,
                'total' => $total,
            ]);

            foreach ($items as $item) {
                $product = Product::query()->lockForUpdate()->findOrFail($item['product_id']);
                $qty = (int) $item['qty'];
                $subtotal = $qty * (float) $item['unit_cost'];

                PurchaseOrderItem::query()->create([
                    'purchase_order_id' => $order->id,
                    'product_id' => $product->id,
                    'qty' => $qty,
                    'unit_cost' => $item['unit_cost'],
                    'subtotal' => $subtotal,
                ]);

                if ($data['status'] === 'received') {
                    $before = $product->stock;
                    $product->increment('stock', $qty);
                    $product->update(['cost_price' => $item['unit_cost']]);

                    StockMovement::query()->create([
                        'product_id' => $product->id,
                        'user_id' => $request->user()->id,
                        'type' => 'purchase',
                        'qty' => $qty,
                        'stock_before' => $before,
                        'stock_after' => $before + $qty,
                        'reference_type' => PurchaseOrder::class,
                        'reference_id' => $order->id,
                        'notes' => $order->po_number,
                    ]);
                }
            }

            return $order;
        });

        return redirect()->route('purchase-orders.show', $order)->with('status', 'Purchase order berhasil dibuat.');
    }

    public function show(PurchaseOrder $purchaseOrder): View
    {
        $purchaseOrder->load(['supplier', 'items.product', 'user']);

        return view('purchase_orders.show', ['order' => $purchaseOrder]);
    }
}
