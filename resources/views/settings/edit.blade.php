@extends('layouts.app')

@section('title', 'Pengaturan')
@section('header', 'Pengaturan Toko')
@section('subtitle', 'Data toko, pembayaran, printer')

@section('content')
    <form method="POST" action="{{ route('settings.update') }}" class="grid gap-4 lg:grid-cols-3">
        @csrf
        @method('PUT')
        @php($settings = $settings ?? [])
        @foreach ([
            'store_name' => 'Nama toko',
            'store_address' => 'Alamat',
            'store_phone' => 'Telepon',
            'payment_methods' => 'Metode pembayaran',
            'printer_name' => 'Printer',
            'receipt_footer' => 'Footer struk',
        ] as $key => $label)
            <label class="panel">
                <span class="text-sm font-semibold text-slate-600">{{ $label }}</span>
                <input name="{{ $key }}" value="{{ old($key, $settings[$key] ?? '') }}" class="mt-2 w-full rounded-2xl border-slate-200" @readonly(! auth()->user()->can('settings.full') && ! auth()->user()->can('settings.limited'))>
            </label>
        @endforeach
        <div class="lg:col-span-3">
            <button class="rounded-2xl bg-amber-500 px-5 py-3 font-semibold text-slate-950">Simpan pengaturan</button>
        </div>
    </form>
@endsection
