<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\View\View;

class InventoryController extends Controller
{
    public function create(): View
    {
        return view('inventory.opname', [
            'products' => Product::query()->with(['category', 'unit'])->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'actual_stock' => ['required', 'integer', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        DB::transaction(function () use ($validated): void {
            $product = Product::query()->lockForUpdate()->findOrFail($validated['product_id']);
            $before = $product->stock;
            $after = (int) $validated['actual_stock'];

            $product->update(['stock' => $after]);

            StockMovement::query()->create([
                'product_id' => $product->id,
                'user_id' => auth()->id(),
                'type' => 'opname',
                'qty' => $after - $before,
                'stock_before' => $before,
                'stock_after' => $after,
                'notes' => $validated['notes'] ?? 'Stock opname',
            ]);
        });

        return back()->with('status', 'Stok berhasil disesuaikan.');
    }
}
