@extends('layouts.app')

@section('title', $purchaseOrder->po_number)
@section('page-title', 'Detail Pembelian')
@section('page-subtitle', $purchaseOrder->supplier->name)

@section('content')
    <div class="rounded-3xl border bg-white p-6 shadow-sm">
        <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
                <p class="text-sm text-slate-500">Nomor PO</p>
                <h2 class="text-2xl font-black">{{ $purchaseOrder->po_number }}</h2>
            </div>
            <span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">{{ strtoupper($purchaseOrder->status) }}</span>
        </div>
        <div class="overflow-hidden rounded-2xl border">
            <table class="w-full text-left text-sm">
                <thead class="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                        <th class="px-4 py-3">Produk</th>
                        <th class="px-4 py-3">Qty</th>
                        <th class="px-4 py-3">Harga</th>
                        <th class="px-4 py-3 text-right">Subtotal</th>
                    </tr>
                </thead>
                <tbody class="divide-y">
                    @foreach ($purchaseOrder->items as $item)
                        <tr>
                            <td class="px-4 py-3 font-semibold">{{ $item->product->name }}</td>
                            <td class="px-4 py-3">{{ $item->qty }}</td>
                            <td class="px-4 py-3">Rp {{ number_format($item->unit_cost, 0, ',', '.') }}</td>
                            <td class="px-4 py-3 text-right font-bold">Rp {{ number_format($item->subtotal, 0, ',', '.') }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        <div class="mt-5 text-right text-xl font-black">Total Rp {{ number_format($purchaseOrder->total, 0, ',', '.') }}</div>
    </div>
@endsection
