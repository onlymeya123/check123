<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ $title ?? 'Cireng Primadona POS' }}</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="min-h-screen bg-slate-100 text-slate-900 antialiased">
    <div class="flex min-h-screen">
        @auth
            <aside class="hidden w-72 shrink-0 border-r border-slate-200 bg-white p-6 lg:block">
                <div class="mb-8">
                    <p class="text-xs font-bold uppercase tracking-[0.35em] text-orange-500">Cireng</p>
                    <h1 class="mt-1 text-2xl font-black text-slate-950">Primadona POS</h1>
                    <p class="mt-2 text-sm text-slate-500">Point of Sale web real-time untuk outlet cireng.</p>
                </div>
                <nav class="space-y-1 text-sm font-semibold">
                    <x-nav-link route="dashboard" label="Dashboard" />
                    <x-nav-link route="pos.index" label="Kasir POS" />
                    <x-nav-link route="products.index" label="Produk & Stok" />
                    <x-nav-link route="customers.index" label="Pelanggan" />
                    <x-nav-link route="suppliers.index" label="Supplier" />
                    <x-nav-link route="purchase-orders.index" label="Pembelian" />
                    <x-nav-link route="inventory.opname" label="Stok Opname" />
                    <x-nav-link route="reports.sales" label="Laporan" />
                    <x-nav-link route="users.index" label="User & RBAC" />
                    <x-nav-link route="settings.edit" label="Pengaturan" />
                </nav>
            </aside>
        @endauth

        <main class="flex min-w-0 flex-1 flex-col">
            @auth
                <header class="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur lg:px-8">
                    <div class="flex items-center justify-between gap-4">
                        <div>
                            <p class="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{{ now()->format('d M Y') }}</p>
                            <h2 class="text-xl font-black text-slate-950">{{ $title ?? 'Dashboard' }}</h2>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="hidden text-right sm:block">
                                <p class="text-sm font-bold">{{ auth()->user()->name }}</p>
                                <p class="text-xs text-slate-500">{{ auth()->user()->roles->pluck('name')->join(', ') ?: 'User' }}</p>
                            </div>
                            <form method="POST" action="{{ route('logout') }}">
                                @csrf
                                <button class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">Logout</button>
                            </form>
                        </div>
                    </div>
                    <nav class="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
                        <x-mobile-nav route="dashboard" label="Dashboard" />
                        <x-mobile-nav route="pos.index" label="POS" />
                        <x-mobile-nav route="products.index" label="Produk" />
                        <x-mobile-nav route="reports.sales" label="Laporan" />
                    </nav>
                </header>
            @endauth

            <section class="flex-1 p-4 lg:p-8">
                @if (session('success'))
                    <div class="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                        {{ session('success') }}
                    </div>
                @endif
                @if ($errors->any())
                    <div class="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                        {{ $errors->first() }}
                    </div>
                @endif
                {{ $slot }}
            </section>
        </main>
    </div>
</body>
</html>
