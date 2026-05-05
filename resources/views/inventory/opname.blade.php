@extends('layouts.app')

@section('title', 'Stok Opname')

@section('content')
    <div class="max-w-3xl">
        <h1 class="text-2xl font-bold text-slate-900">Stok Opname</h1>
        <p class="mt-1 text-sm text-slate-500">Sesuaikan stok fisik dan catat audit movement.</p>

        <form method="POST" action="{{ route('inventory.opname.store') }}" class="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            @csrf
            <label class="text-sm font-semibold text-slate-700">Produk</label>
            <select name="product_id" class="mt-1 w-full rounded-xl border-slate-300" required>
                @foreach($products as $product)
                    <option value="{{ $product->id }}">{{ $product->name }} - stok sistem {{ $product->stock }}</option>
                @endforeach
            </select>

            <label class="mt-4 block text-sm font-semibold text-slate-700">Stok fisik</label>
            <input type="number" min="0" name="stock" class="mt-1 w-full rounded-xl border-slate-300" required>

            <label class="mt-4 block text-sm font-semibold text-slate-700">Catatan</label>
            <textarea name="notes" rows="3" class="mt-1 w-full rounded-xl border-slate-300"></textarea>

            <button class="mt-5 rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white">Simpan opname</button>
        </form>
    </div>
@endsection
