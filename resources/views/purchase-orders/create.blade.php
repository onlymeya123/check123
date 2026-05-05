@extends('layouts.app')

@section('title', 'Buat Pembelian')
@section('page-title', 'Buat Purchase Order')

@section('content')
<form method="POST" action="{{ route('purchase-orders.store') }}" class="grid gap-6 lg:grid-cols-[1fr_360px]">
    @csrf
    <section class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div class="grid gap-4 md:grid-cols-3">
            <label class="md:col-span-2 text-sm font-semibold text-slate-700">Supplier
                <select name="supplier_id" required class="mt-2 w-full rounded-2xl border-slate-200">
                    @foreach ($suppliers as $supplier)
                        <option value="{{ $supplier->id }}">{{ $supplier->name }}</option>
                    @endforeach
                </select>
            </label>
            <label class="text-sm font-semibold text-slate-700">Status
                <select name="status" class="mt-2 w-full rounded-2xl border-slate-200">
                    <option value="ordered">Ordered</option>
                    <option value="received">Received</option>
                    <option value="draft">Draft</option>
                </select>
            </label>
        </div>

        <div class="mt-6 space-y-3" x-data="{ rows: [{ product_id: '', qty: 1, unit_cost: 0 }] }">
            <template x-for="(row, index) in rows" :key="index">
                <div class="grid gap-3 rounded-2xl bg-slate-50 p-3 md:grid-cols-[1fr_100px_140px_40px]">
                    <select :name="`items[${index}][product_id]`" x-model="row.product_id" required class="rounded-xl border-slate-200">
                        <option value="">Pilih produk</option>
                        @foreach ($products as $product)
                            <option value="{{ $product->id }}">{{ $product->name }} ({{ $product->sku }})</option>
                        @endforeach
                    </select>
                    <input type="number" min="1" :name="`items[${index}][qty]`" x-model.number="row.qty" class="rounded-xl border-slate-200">
                    <input type="number" min="0" :name="`items[${index}][unit_cost]`" x-model.number="row.unit_cost" class="rounded-xl border-slate-200" placeholder="Harga beli">
                    <button type="button" class="rounded-xl bg-rose-100 text-rose-700" @click="rows.splice(index, 1)" x-show="rows.length > 1">x</button>
                </div>
            </template>
            <button type="button" @click="rows.push({ product_id: '', qty: 1, unit_cost: 0 })" class="rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600">+ Tambah item</button>
        </div>
    </section>

    <aside class="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
        <p class="text-sm text-slate-300">Jika status Received dipilih, stok produk otomatis bertambah dan stock movement dicatat sebagai purchase.</p>
        <button class="mt-6 w-full rounded-2xl bg-amber-400 px-4 py-3 font-bold text-slate-950">Simpan PO</button>
    </aside>
</form>
@endsection
