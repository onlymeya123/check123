@extends('layouts.app')

@section('title', 'Dashboard')
@section('header', 'Dashboard Operasional')

@section('content')
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <x-stat-card title="Penjualan Hari Ini" :value="'Rp '.number_format($todaySales, 0, ',', '.')" subtitle="Real-time dari transaksi paid" color="emerald" />
        <x-stat-card title="Transaksi" :value="$todayTransactions" subtitle="Invoice hari ini" color="blue" />
        <x-stat-card title="Produk Aktif" :value="$productsCount" subtitle="SKU siap jual" color="amber" />
        <x-stat-card title="Stok Minimum" :value="$lowStockProducts->count()" subtitle="Butuh restock" color="red" />
    </div>

    <div class="mt-6 grid gap-6 lg:grid-cols-3">
        <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 class="text-lg font-semibold text-slate-900">Grafik Penjualan 7 Hari</h2>
                    <p class="text-sm text-slate-500">Monitoring tren omzet harian.</p>
                </div>
                <a href="{{ route('reports.sales') }}" class="text-sm font-semibold text-blue-600 hover:text-blue-700">Lihat laporan</a>
            </div>
            <canvas class="mt-4" id="salesChart" height="130"></canvas>
        </section>

        <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 class="text-lg font-semibold text-slate-900">Alert Stok Minimum</h2>
            <div class="mt-4 space-y-3">
                @forelse ($lowStockProducts as $product)
                    <div class="rounded-xl border border-red-100 bg-red-50 p-3">
                        <div class="font-semibold text-red-900">{{ $product->name }}</div>
                        <div class="text-sm text-red-700">Stok {{ $product->stock }} / minimum {{ $product->minimum_stock }}</div>
                    </div>
                @empty
                    <div class="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">Semua stok berada di atas minimum.</div>
                @endforelse
            </div>
        </section>
    </div>

    <div class="mt-6 grid gap-6 lg:grid-cols-2">
        <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 class="text-lg font-semibold text-slate-900">Transaksi Terbaru</h2>
            <div class="mt-4 overflow-x-auto">
                <table class="min-w-full divide-y divide-slate-200 text-sm">
                    <thead class="text-left text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                            <th class="py-3">Invoice</th>
                            <th class="py-3">Kasir</th>
                            <th class="py-3 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        @forelse ($recentTransactions as $transaction)
                            <tr>
                                <td class="py-3 font-medium">{{ $transaction->invoice_number }}</td>
                                <td class="py-3">{{ $transaction->cashier?->name }}</td>
                                <td class="py-3 text-right">Rp {{ number_format($transaction->total, 0, ',', '.') }}</td>
                            </tr>
                        @empty
                            <tr><td colspan="3" class="py-6 text-center text-slate-500">Belum ada transaksi.</td></tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </section>

        <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 class="text-lg font-semibold text-slate-900">Aksi Cepat</h2>
            <div class="mt-4 grid gap-3 sm:grid-cols-2">
                <a href="{{ route('pos.index') }}" class="rounded-xl bg-blue-600 p-4 font-semibold text-white shadow-sm hover:bg-blue-700">Buka POS</a>
                <a href="{{ route('products.create') }}" class="rounded-xl border border-slate-200 p-4 font-semibold hover:bg-slate-50">Tambah Produk</a>
                <a href="{{ route('inventory.opname') }}" class="rounded-xl border border-slate-200 p-4 font-semibold hover:bg-slate-50">Stok Opname</a>
                <a href="{{ route('purchase-orders.create') }}" class="rounded-xl border border-slate-200 p-4 font-semibold hover:bg-slate-50">Buat Pembelian</a>
            </div>
        </section>
    </div>
@endsection

@push('scripts')
    <script>
        const chartData = @json($salesChart);
        new Chart(document.getElementById('salesChart'), {
            type: 'line',
            data: {
                labels: chartData.map(item => item.date),
                datasets: [{
                    label: 'Penjualan',
                    data: chartData.map(item => item.total),
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.12)',
                    fill: true,
                    tension: 0.35
                }]
            },
            options: { plugins: { legend: { display: false } }, scales: { y: { ticks: { callback: value => 'Rp ' + Number(value).toLocaleString('id-ID') } } } }
        });
    </script>
@endpush
