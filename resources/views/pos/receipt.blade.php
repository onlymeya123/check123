@extends('layouts.app')

@section('title', 'Struk '.$transaction->invoice_number)
@section('header', 'Struk Penjualan')

@section('content')
    <section class="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm print:shadow-none">
        <div class="text-center">
            <div class="text-lg font-black text-slate-950">Cireng Primadona</div>
            <p class="text-sm text-slate-500">{{ config('app.store.address') }}</p>
            <p class="text-xs text-slate-400">{{ $transaction->created_at->format('d M Y H:i') }}</p>
        </div>

        <div class="my-4 border-y border-dashed border-slate-300 py-3 text-sm">
            <div class="flex justify-between"><span>No</span><strong>{{ $transaction->invoice_number }}</strong></div>
            <div class="flex justify-between"><span>Kasir</span><strong>{{ $transaction->cashier->name }}</strong></div>
            <div class="flex justify-between"><span>Pelanggan</span><strong>{{ $transaction->customer->name ?? 'Umum' }}</strong></div>
        </div>

        <div class="space-y-3 text-sm">
            @foreach($transaction->items as $item)
                <div>
                    <div class="font-semibold text-slate-900">{{ $item->product_name }}</div>
                    <div class="flex justify-between text-slate-500">
                        <span>{{ $item->qty }} x Rp {{ number_format($item->unit_price, 0, ',', '.') }}</span>
                        <span>Rp {{ number_format($item->subtotal, 0, ',', '.') }}</span>
                    </div>
                </div>
            @endforeach
        </div>

        <div class="mt-4 border-t border-dashed border-slate-300 pt-3 text-sm">
            <div class="flex justify-between"><span>Subtotal</span><span>Rp {{ number_format($transaction->subtotal, 0, ',', '.') }}</span></div>
            <div class="flex justify-between"><span>Diskon</span><span>Rp {{ number_format($transaction->discount, 0, ',', '.') }}</span></div>
            <div class="flex justify-between text-lg font-black text-slate-950"><span>Total</span><span>Rp {{ number_format($transaction->total, 0, ',', '.') }}</span></div>
            <div class="flex justify-between"><span>Bayar</span><span>Rp {{ number_format($transaction->paid, 0, ',', '.') }}</span></div>
            <div class="flex justify-between"><span>Kembali</span><span>Rp {{ number_format($transaction->change, 0, ',', '.') }}</span></div>
        </div>

        <p class="mt-6 text-center text-xs text-slate-500">Terima kasih sudah membeli Cireng Primadona.</p>
        <button onclick="window.print()" class="mt-4 w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white print:hidden">Cetak Struk</button>
    </section>
@endsection
