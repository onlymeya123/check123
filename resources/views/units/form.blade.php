@extends('layouts.app')

@section('content')
    <div class="rounded-3xl bg-white p-6 shadow-sm border border-slate-100 max-w-2xl">
        <h1 class="text-xl font-semibold text-slate-900">{{ isset($unit) ? 'Edit satuan' : 'Tambah satuan' }}</h1>
        <form method="POST" action="{{ isset($unit) ? route('units.update', $unit) : route('units.store') }}" class="mt-6 space-y-4">
            @csrf
            @isset($unit)
                @method('PUT')
            @endisset
            <div>
                <label class="text-sm font-medium text-slate-600">Nama</label>
                <input name="name" value="{{ old('name', $unit->name ?? '') }}" class="mt-1 w-full rounded-2xl border-slate-200" required>
            </div>
            <div>
                <label class="text-sm font-medium text-slate-600">Simbol</label>
                <input name="symbol" value="{{ old('symbol', $unit->symbol ?? '') }}" class="mt-1 w-full rounded-2xl border-slate-200" required>
            </div>
            <button class="rounded-2xl bg-slate-900 px-5 py-3 text-white font-semibold">Simpan</button>
        </form>
    </div>
@endsection
