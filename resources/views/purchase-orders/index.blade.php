@extends('layouts.app')

@section('content')
<div class="flex items-center justify-between">
    <div>
        <h1 class="text-2xl font-bold">Pembelian</h1>
        <p class="text-sm text-slate-500">Purchase order dan penerimaan barang.</p>
    </div>
    @can('purchases.full')
        <a href="{{ route('purchase-orders.create') }}" class="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Buat PO</a>
    @endcan
</div>

<div class="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <table class="min-w-full divide-y divide-slate-200 text-sm">
        <thead class="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
                <th class="px-4 py-3">Nomor</th>
                <th class="px-4 py-3">Supplier</th>
                <th class="px-4 py-3">Status</th>
                <th class="px-4 py-3 text-right">Total</th>
                <th class="px-4 py-3"></th>
            </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
            @forelse ($orders as $order)
                <tr>
                    <td class="px-4 py-3 font-semibold">{{ $order->po_number }}</td>
                    <td class="px-4 py-3">{{ $order->supplier->name }}</td>
                    <td class="px-4 py-3"><span class="rounded-full bg-slate-100 px-3 py-1 text-xs">{{ ucfirst($order->status) }}</span></td>
                    <td class="px-4 py-3 text-right">Rp {{ number_format((float) $order->total, 0, ',', '.') }}</td>
                    <td class="px-4 py-3 text-right"><a href="{{ route('purchase-orders.show', $order) }}" class="text-brand-700">Detail</a></td>
                </tr>
            @empty
                <tr><td colspan="5" class="px-4 py-8 text-center text-slate-500">Belum ada purchase order.</td></tr>
            @endforelse
        </tbody>
    </table>
</div>

<div class="mt-4">{{ $orders->links() }}</div>
@endsection
