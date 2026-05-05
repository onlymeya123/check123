@extends('layouts.app')

@section('content')
    <div class="min-h-screen bg-slate-950 px-6 py-10 text-white">
        <div class="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div class="flex flex-col justify-center">
                <span class="mb-4 inline-flex w-fit rounded-full bg-amber-400 px-4 py-1 text-xs font-black uppercase tracking-widest text-slate-950">Cireng Primadona POS</span>
                <h1 class="text-4xl font-black leading-tight md:text-6xl">Transaksi cepat, stok akurat, laporan real-time.</h1>
                <p class="mt-5 max-w-xl text-lg text-slate-300">Aplikasi Point of Sale Laravel untuk kasir, inventory, pembelian, pelanggan, RBAC, audit trail, dan laporan usaha ritel.</p>
                <div class="mt-8 grid gap-4 sm:grid-cols-3">
                    <div class="rounded-2xl border border-white/10 bg-white/10 p-4">
                        <p class="text-2xl font-black">&lt;3s</p>
                        <p class="text-sm text-slate-300">target transaksi</p>
                    </div>
                    <div class="rounded-2xl border border-white/10 bg-white/10 p-4">
                        <p class="text-2xl font-black">RBAC</p>
                        <p class="text-sm text-slate-300">Spatie Permission</p>
                    </div>
                    <div class="rounded-2xl border border-white/10 bg-white/10 p-4">
                        <p class="text-2xl font-black">98%</p>
                        <p class="text-sm text-slate-300">akurasi stok</p>
                    </div>
                </div>
            </div>

            <form method="POST" action="{{ route('login') }}" class="rounded-3xl bg-white p-8 text-slate-900 shadow-2xl">
                @csrf
                <h2 class="text-2xl font-black">Masuk ke POS</h2>
                <p class="mt-1 text-sm text-slate-500">Gunakan akun admin/kasir yang sudah dibuat.</p>
                <label class="mt-6 block text-sm font-bold">Email</label>
                <input name="email" type="email" value="{{ old('email') }}" required autofocus class="mt-2 w-full rounded-2xl border-slate-200">
                @error('email')<p class="mt-2 text-sm text-red-600">{{ $message }}</p>@enderror

                <label class="mt-4 block text-sm font-bold">Password</label>
                <input name="password" type="password" required class="mt-2 w-full rounded-2xl border-slate-200">
                @error('password')<p class="mt-2 text-sm text-red-600">{{ $message }}</p>@enderror

                <div class="mt-4 flex items-center justify-between text-sm">
                    <label class="flex items-center gap-2"><input type="checkbox" name="remember" class="rounded border-slate-300"> Ingat saya</label>
                    <a href="{{ route('password.request') }}" class="font-bold text-amber-600">Reset password</a>
                </div>

                <button class="mt-6 w-full rounded-2xl bg-amber-400 px-5 py-3 font-black text-slate-950 hover:bg-amber-300">Login</button>
                <p class="mt-5 text-center text-sm text-slate-500">Belum punya akun? <a href="{{ route('register') }}" class="font-bold text-amber-600">Daftar sebagai Kasir</a></p>
                <div class="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                    Demo seed: <strong>admin@cirengprimadona.test</strong> / <strong>password</strong>
                </div>
            </form>
        </div>
    </div>
@endsection
