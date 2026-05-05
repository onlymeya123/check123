@extends('layouts.app')

@section('title', isset($product) ? 'Edit Produk' : 'Tambah Produk')
@section('header', isset($product) ? 'Edit Produk' : 'Tambah Produk')
@section('description', 'Kelola SKU, barcode, harga, stok, dan alert minimum.')

@section('content')
    <form method="POST" action="{{ isset($product) ? route('products.update', $product) : route('products.store') }}" class="grid gap-6 lg:grid-cols-3">
        @csrf
        @isset($product)
            @method('PUT')
        @endisset
        <section class="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div class="grid gap-4 md:grid-cols-2">
                <label class="space-y-2 md:col-span-2">
                    <span class="text-sm font-semibold text-slate-700">Nama produk</span>
                    <input name="name" value="{{ old('name', $product->name ?? '') }}" class="w-full rounded-2xl border-slate-200" required>
                </label>
                <label class="space-y-2">
                    <span class="text-sm font-semibold text-slate-700">SKU</span>
                    <input name="sku" value="{{ old('sku', $product->sku ?? '') }}" class="w-full rounded-2xl border-slate-200" required>
                </label>
                <label class="space-y-2">
                    <span class="text-sm font-semibold text-slate-700">Barcode</span>
                    <input name="barcode" value="{{ old('barcode', $product->barcode ?? '') }}" class="w-full rounded-2xl border-slate-200">
                </label>
                <label class="space-y-2">
                    <span class="text-sm font-semibold text-slate-700">Kategori</span>
                    <select name="category_id" class="w-full rounded-2xl border-slate-200" required>
                        @foreach ($categories as $category)
                            <option value="{{ $category->id }}" @selected((int) old('category_id', $product->category_id ?? 0) === $category->id)>{{ $category->name }}</option>
                        @endforeach
                    </select>
                </label>
                <label class="space-y-2">
                    <span class="text-sm font-semibold text-slate-700">Satuan</span>
                    <select name="unit_id" class="w-full rounded-2xl border-slate-200" required>
                        @foreach ($units as $unit)
                            <option value="{{ $unit->id }}" @selected((int) old('unit_id', $product->unit_id ?? 0) === $unit->id)>{{ $unit->name }} ({{ $unit->symbol }})</option>
                        @endforeach
                    </select>
                </label>
                <label class="space-y-2">
                    <span class="text-sm font-semibold text-slate-700">Harga modal</span>
                    <input type="number" min="0" name="cost_price" value="{{ old('cost_price', $product->cost_price ?? 0) }}" class="w-full rounded-2xl border-slate-200" required>
                </label>
                <label class="space-y-2">
                    <span class="text-sm font-semibold text-slate-700">Harga jual</span>
                    <input type="number" min="0" name="price" value="{{ old('price', $product->price ?? 0) }}" class="w-full rounded-2xl border-slate-200" required>
                </label>
                <label class="space-y-2">
                    <span class="text-sm font-semibold text-slate-700">Stok</span>
                    <input type="number" min="0" name="stock" value="{{ old('stock', $product->stock ?? 0) }}" class="w-full rounded-2xl border-slate-200" required>
                </label>
                <label class="space-y-2">
                    <span class="text-sm font-semibold text-slate-700">Stok minimum</span>
                    <input type="number" min="0" name="minimum_stock" value="{{ old('minimum_stock', $product->minimum_stock ?? 5) }}" class="w-full rounded-2xl border-slate-200" required>
                </label>
                <label class="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                    <input type="checkbox" name="is_active" value="1" @checked(old('is_active', $product->is_active ?? true)) class="rounded border-slate-300 text-amber-500">
                    <span class="text-sm font-semibold text-slate-700">Produk aktif dan tampil di POS</span>
                </label>
                <label class="space-y-2 md:col-span-2">
                    <span class="text-sm font-semibold text-slate-700">Deskripsi</span>
                    <textarea name="description" rows="4" class="w-full rounded-2xl border-slate-200">{{ old('description', $product->description ?? '') }}</textarea>
                </label>
            </div>
        </section>
        <aside class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 class="font-bold text-slate-900">Kontrol stok</h2>
            <p class="mt-2 text-sm text-slate-500">Alert otomatis muncul di dashboard saat stok berada di bawah minimum.</p>
            <div class="mt-6 flex gap-3">
                <a href="{{ route('products.index') }}" class="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600">Batal</a>
                <button class="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white">Simpan</button>
            </div>
        </aside>
    </form>
@endsection
