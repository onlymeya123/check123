@extends('layouts.app')

@section('guest')
    <div class="min-h-screen bg-slate-100 flex items-center justify-center px-4">
        <div class="w-full max-w-md bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
            <div class="mb-6">
                <p class="text-sm font-semibold text-amber-600">Cireng Primadona POS</p>
                <h1 class="text-3xl font-bold text-slate-900">Buat User Awal</h1>
                <p class="text-slate-500 mt-2">Pendaftaran default mendapatkan role Kasir. Admin dapat mengubah role dari menu User.</p>
            </div>

            <form method="POST" action="{{ route('register') }}" class="space-y-4">
                @csrf
                <label class="block">
                    <span class="text-sm font-medium text-slate-700">Nama</span>
                    <input name="name" value="{{ old('name') }}" required class="mt-1 w-full rounded-xl border-slate-300 focus:border-amber-500 focus:ring-amber-500">
                    @error('name') <span class="text-sm text-red-600">{{ $message }}</span> @enderror
                </label>
                <label class="block">
                    <span class="text-sm font-medium text-slate-700">Email</span>
                    <input name="email" type="email" value="{{ old('email') }}" required class="mt-1 w-full rounded-xl border-slate-300 focus:border-amber-500 focus:ring-amber-500">
                    @error('email') <span class="text-sm text-red-600">{{ $message }}</span> @enderror
                </label>
                <label class="block">
                    <span class="text-sm font-medium text-slate-700">Password</span>
                    <input name="password" type="password" required class="mt-1 w-full rounded-xl border-slate-300 focus:border-amber-500 focus:ring-amber-500">
                    @error('password') <span class="text-sm text-red-600">{{ $message }}</span> @enderror
                </label>
                <label class="block">
                    <span class="text-sm font-medium text-slate-700">Konfirmasi Password</span>
                    <input name="password_confirmation" type="password" required class="mt-1 w-full rounded-xl border-slate-300 focus:border-amber-500 focus:ring-amber-500">
                </label>
                <button class="w-full rounded-xl bg-slate-900 text-white font-semibold py-3">Daftar</button>
            </form>
        </div>
    </div>
@endsection
