@extends('layouts.app')

@section('content')
    <section class="mb-6">
        <h1 class="text-2xl font-bold">Laporan Kasir</h1>
        <p class="text-sm text-slate-500">Performa transaksi per user.</p>
    </section>

    <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <table class="w-full text-left text-sm">
            <thead>
                <tr class="text-xs uppercase tracking-wide text-slate-400">
                    <th class="py-3">Kasir</th>
                    <th class="py-3">Transaksi</th>
                    <th class="py-3">Omzet</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
                @foreach ($cashiers as $cashier)
                    <tr>
                        <td class="py-3 font-semibold">{{ $cashier->cashier?->name ?? '-' }}</td>
                        <td class="py-3">{{ $cashier->transaction_count }}</td>
                        <td class="py-3">Rp {{ number_format($cashier->revenue, 0, ',', '.') }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>
@endsection
