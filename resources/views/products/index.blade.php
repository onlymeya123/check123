@extends('layouts.app')

@section('title', 'Produk')

@section('content')
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
            <p class="text-sm font-semibold uppercase tracking-wide text-orange-500">Produk & Inventori</p>
            <h1 class="text-2xl font-bold text-slate-950">Katalog produk</h1>
        </div>
        @can('products.manage')
            <a href="{{ route('products.create') }}" class="rounded-2xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-sm">Tambah Produk</a>
        @endcan
    </div>

    <form class="mt-6 flex gap-3">
        <input name="search" value="{{ request('search') }}" placeholder="Cari nama, SKU, barcode" class="w-full rounded-2xl border-slate-200">
        <button class="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white">Cari</button>
    </form>

    <div class="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table class="w-full text-left text-sm">
            <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                    <th class="px-5 py-4">Produk</th>
                    <th class="px-5 py-4">Kategori</th>
                    <th class="px-5 py-4">Harga</th>
                    <th class="px-5 py-4">Stok</th>
                    <th class="px-5 py-4">Status</th>
                    <th class="px-5 py-4"></th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
                @forelse($products as $product)
                    <tr>
                        <td class="px-5 py-4">
                            <p class="font-semibold text-slate-900">{{ $product->name }}</p>
                            <p class="text-xs text-slate-500">{{ $product->sku }} @if($product->barcode) · {{ $product->barcode }} @endif</p>
                        </td>
                        <td class="px-5 py-4">{{ $product->category->name }}</td>
                        <td class="px-5 py-4">Rp {{ number_format((float) $product->price, 0, ',', '.') }}</td>
                        <td class="px-5 py-4">
                            <span class="{{ $product->stock <= $product->minimum_stock ? 'text-red-600' : 'text-slate-900' }} font-semibold">{{ $product->stock }}</span>
                            <span class="text-xs text-slate-500">{{ $product->unit->symbol }}</span>
                        </td>
                        <td class="px-5 py-4">
                            <span class="rounded-full px-3 py-1 text-xs font-bold {{ $product->is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500' }}">
                                {{ $product->is_active ? 'Aktif' : 'Nonaktif' }}
                            </span>
                        </td>
                        <td class="px-5 py-4 text-right">
                            @can('products.manage')
                                <a href="{{ route('products.edit', $product) }}" class="text-sm font-bold text-orange-600">Edit</a>
                            @endcan
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="6" class="px-5 py-12 text-center text-slate-500">Produk belum tersedia.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <div class="mt-6">{{ $products->links() }}</div>
@endsection
