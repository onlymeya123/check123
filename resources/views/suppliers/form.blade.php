@extends('layouts.app')

@section('title', $supplier->exists ? 'Edit Supplier' : 'Tambah Supplier')

@section('content')
<div class="max-w-3xl space-y-6">
    <div>
        <p class="text-sm font-semibold text-amber-600">Supplier</p>
        <h1 class="text-2xl font-bold text-slate-900">{{ $supplier->exists ? 'Edit Supplier' : 'Tambah Supplier' }}</h1>
    </div>
    <form method="POST" action="{{ $supplier->exists ? route('suppliers.update', $supplier) : route('suppliers.store') }}" class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        @csrf
        @if($supplier->exists)
            @method('PUT')
        @endif
        <div class="grid gap-4 md:grid-cols-2">
            <label class="space-y-1">
                <span class="text-sm font-semibold text-slate-700">Nama</span>
                <input name="name" value="{{ old('name', $supplier->name) }}" required class="w-full rounded-2xl border-slate-200">
            </label>
            <label class="space-y-1">
                <span class="text-sm font-semibold text-slate-700">Kontak</span>
                <input name="contact" value="{{ old('contact', $supplier->contact) }}" class="w-full rounded-2xl border-slate-200">
            </label>
            <label class="space-y-1">
                <span class="text-sm font-semibold text-slate-700">Telepon</span>
                <input name="phone" value="{{ old('phone', $supplier->phone) }}" class="w-full rounded-2xl border-slate-200">
            </label>
            <label class="space-y-1">
                <span class="text-sm font-semibold text-slate-700">Email</span>
                <input type="email" name="email" value="{{ old('email', $supplier->email) }}" class="w-full rounded-2xl border-slate-200">
            </label>
            <label class="space-y-1 md:col-span-2">
                <span class="text-sm font-semibold text-slate-700">Alamat</span>
                <textarea name="address" rows="3" class="w-full rounded-2xl border-slate-200">{{ old('address', $supplier->address) }}</textarea>
            </label>
        </div>
        <div class="mt-6 flex gap-3">
            <button class="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white">Simpan</button>
            <a href="{{ route('suppliers.index') }}" class="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700">Batal</a>
        </div>
    </form>
</div>
@endsection
