@extends('layouts.app')

@section('title', 'Laporan Penjualan')
@section('page')
    <div>
        <h1 class="text-2xl font-bold text-slate-950">Laporan Penjualan</h1>
        <p class="text-slate-500">Filter periode untuk visibilitas omzet real-time.</p>
    </div>
@endsection

@section('content')
    <form class="mb-6 flex flex-wrap gap-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <input class="rounded-2xl border-slate-200" type="date" name="from" value="{{ $from->toDateString() }}">
        <input class="rounded-2xl border-slate-200" type="date" name="to" value="{{ $to->toDateString() }}">
        <button class="rounded-2xl bg-amber-500 px-5 py-2 font-semibold text-white">Generate</button>
        <button class="rounded-2xl border border-slate-200 px-5 py-2 font-semibold text-slate-700" name="export" value="csv">Export Excel</button>
        <button class="rounded-2xl border border-slate-200 px-5 py-2 font-semibold text-slate-700" name="export" value="pdf">Export PDF</button>
    </form>

    <div class="grid gap-4 md:grid-cols-3">
        <div class="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p class="text-sm text-slate-500">Total Omzet</p>
            <p class="text-2xl font-bold">Rp {{ number_format($total, 0, ',', '.') }}</p>
        </div>
        <div class="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p class="text-sm text-slate-500">Transaksi</p>
            <p class="text-2xl font-bold">{{ $transactions->count() }}</p>
        </div>
        <div class="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p class="text-sm text-slate-500">Rata-rata</p>
            <p class="text-2xl font-bold">Rp {{ number_format($transactions->count() ? $total / $transactions->count() : 0, 0, ',', '.') }}</p>
        </div>
    </div>

    <div class="mt-6 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
        <table class="w-full text-left text-sm">
            <thead class="bg-slate-50 text-slate-500">
                <tr>
                    <th class="p-4">Invoice</th>
                    <th class="p-4">Tanggal</th>
                    <th class="p-4">Kasir</th>
                    <th class="p-4 text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($transactions as $transaction)
                    <tr class="border-t border-slate-100">
                        <td class="p-4 font-semibold">{{ $transaction->invoice_number }}</td>
                        <td class="p-4">{{ $transaction->created_at->format('d M Y H:i') }}</td>
                        <td class="p-4">{{ $transaction->cashier?->name }}</td>
                        <td class="p-4 text-right">Rp {{ number_format($transaction->total, 0, ',', '.') }}</td>
                    </tr>
                @empty
                    <tr><td colspan="4" class="p-4 text-center text-slate-500">Tidak ada data.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
@endsection
