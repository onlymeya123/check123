@extends('layouts.app')

@section('title', 'Kasir POS')

@section('content')
<form method="POST" action="{{ route('pos.store') }}" x-data="pos(@js($products), @js(old('items', [])))" class="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
    @csrf
    <section class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
                <h2 class="text-xl font-semibold text-slate-900">Produk</h2>
                <p class="text-sm text-slate-500">Scan barcode USB atau cari nama/SKU. Item masuk keranjang dalam satu klik.</p>
            </div>
            <input type="search" x-model="keyword" placeholder="Cari nama, SKU, barcode..." class="w-full rounded-2xl border-slate-200 md:w-80">
        </div>
        <div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <template x-for="product in filteredProducts" :key="product.id">
                <button type="button" @click="add(product)" class="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-amber-300 hover:bg-amber-50">
                    <div class="flex items-start justify-between gap-3">
                        <div>
                            <p class="font-semibold text-slate-900" x-text="product.name"></p>
                            <p class="mt-1 text-xs text-slate-500" x-text="product.sku + ' | ' + (product.barcode ?? '-')"></p>
                        </div>
                        <span class="rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-600" x-text="'Stok ' + product.stock"></span>
                    </div>
                    <p class="mt-4 text-lg font-bold text-amber-600" x-text="money(product.price)"></p>
                    <p class="mt-1 text-xs text-red-600" x-show="product.stock <= product.minimum_stock">Stok minimum tercapai</p>
                </button>
            </template>
        </div>
    </section>

    <aside class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 class="text-xl font-semibold text-slate-900">Keranjang</h2>
        <div class="mt-4">
            <label class="text-sm font-medium text-slate-600">Pelanggan</label>
            <select name="customer_id" class="mt-1 w-full rounded-2xl border-slate-200">
                <option value="">Walk-in Customer</option>
                @foreach($customers as $customer)
                    <option value="{{ $customer->id }}">{{ $customer->name }} - {{ $customer->phone }}</option>
                @endforeach
            </select>
        </div>

        <div class="mt-5 space-y-3">
            <template x-for="(item, index) in cart" :key="item.product_id">
                <div class="rounded-2xl border border-slate-200 p-3">
                    <input type="hidden" :name="`items[${index}][product_id]`" :value="item.product_id">
                    <input type="hidden" :name="`items[${index}][qty]`" :value="item.qty">
                    <input type="hidden" :name="`items[${index}][discount]`" :value="item.discount">
                    <div class="flex items-start justify-between">
                        <div>
                            <p class="font-semibold text-slate-900" x-text="item.name"></p>
                            <p class="text-xs text-slate-500" x-text="money(item.price)"></p>
                        </div>
                        <button type="button" @click="remove(index)" class="text-sm font-semibold text-red-500">Hapus</button>
                    </div>
                    <div class="mt-3 flex items-center justify-between gap-2">
                        <div class="flex items-center rounded-full border border-slate-200">
                            <button type="button" @click="decrement(index)" class="px-3 py-1">-</button>
                            <span class="min-w-8 text-center font-semibold" x-text="item.qty"></span>
                            <button type="button" @click="increment(index)" class="px-3 py-1">+</button>
                        </div>
                        <input type="number" min="0" x-model.number="item.discount" class="w-28 rounded-xl border-slate-200 text-sm" placeholder="Diskon">
                    </div>
                    <p class="mt-2 text-right font-semibold text-slate-900" x-text="money(lineTotal(item))"></p>
                </div>
            </template>
            <div x-show="cart.length === 0" class="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                Keranjang kosong.
            </div>
        </div>

        <div class="mt-5 space-y-3 border-t border-slate-200 pt-5">
            <label class="block text-sm font-medium text-slate-600">Diskon transaksi</label>
            <input type="number" name="discount" x-model.number="discount" min="0" class="w-full rounded-2xl border-slate-200">
            <label class="block text-sm font-medium text-slate-600">Pembayaran tunai</label>
            <input type="hidden" name="payments[0][method]" value="cash">
            <input type="number" name="payments[0][amount]" x-model.number="paid" min="0" class="w-full rounded-2xl border-slate-200">
        </div>

        <div class="mt-5 space-y-2 rounded-2xl bg-slate-50 p-4">
            <div class="flex justify-between text-sm"><span>Subtotal</span><strong x-text="money(subtotal)"></strong></div>
            <div class="flex justify-between text-sm"><span>Diskon</span><strong x-text="money(discount || 0)"></strong></div>
            <div class="flex justify-between text-lg font-bold text-slate-900"><span>Total</span><strong x-text="money(total)"></strong></div>
            <div class="flex justify-between text-sm text-emerald-700"><span>Kembalian</span><strong x-text="money(change)"></strong></div>
        </div>

        @error('items')<p class="mt-3 text-sm text-red-600">{{ $message }}</p>@enderror
        @error('payments')<p class="mt-3 text-sm text-red-600">{{ $message }}</p>@enderror

        <button type="submit" class="mt-5 w-full rounded-2xl bg-amber-500 px-5 py-3 font-semibold text-white shadow-sm hover:bg-amber-600">
            Bayar & Cetak Struk
        </button>
    </aside>
</form>

<script>
function pos(products, initialItems) {
    return {
        products,
        keyword: '',
        cart: [],
        discount: 0,
        paid: 0,
        init() {
            if (Array.isArray(initialItems) && initialItems.length) {
                initialItems.forEach((item) => {
                    const product = this.products.find((candidate) => candidate.id == item.product_id);
                    if (product) {
                        this.cart.push({ product_id: product.id, name: product.name, price: Number(product.price), stock: product.stock, qty: Number(item.qty), discount: Number(item.discount ?? 0) });
                    }
                });
            }
        },
        get filteredProducts() {
            const term = this.keyword.toLowerCase();
            return this.products.filter((product) => [product.name, product.sku, product.barcode].filter(Boolean).join(' ').toLowerCase().includes(term));
        },
        add(product) {
            const existing = this.cart.find((item) => item.product_id === product.id);
            if (existing) {
                if (existing.qty < product.stock) existing.qty++;
                return;
            }
            this.cart.push({ product_id: product.id, name: product.name, price: Number(product.price), stock: product.stock, qty: 1, discount: 0 });
        },
        increment(index) {
            if (this.cart[index].qty < this.cart[index].stock) this.cart[index].qty++;
        },
        decrement(index) {
            if (this.cart[index].qty > 1) this.cart[index].qty--;
        },
        remove(index) { this.cart.splice(index, 1); },
        lineTotal(item) { return Math.max(0, (item.price * item.qty) - Number(item.discount || 0)); },
        get subtotal() { return this.cart.reduce((total, item) => total + this.lineTotal(item), 0); },
        get total() { return Math.max(0, this.subtotal - Number(this.discount || 0)); },
        get change() { return Math.max(0, Number(this.paid || 0) - this.total); },
        money(value) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value || 0); },
    };
}
</script>
@endsection
