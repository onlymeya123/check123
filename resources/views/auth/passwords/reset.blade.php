@extends('layouts.app')

@section('guest')
<div class="min-h-screen grid place-items-center px-4 py-12">
    <div class="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl border border-slate-100">
        <h1 class="text-2xl font-black text-slate-950">Reset password</h1>
        <form method="POST" action="{{ route('password.update') }}" class="mt-6 space-y-4">
            @csrf
            <input type="hidden" name="token" value="{{ $token }}">
            <input type="email" name="email" value="{{ old('email', $email ?? '') }}" required class="w-full rounded-2xl border-slate-200" placeholder="Email">
            <input type="password" name="password" required class="w-full rounded-2xl border-slate-200" placeholder="Password baru">
            <input type="password" name="password_confirmation" required class="w-full rounded-2xl border-slate-200" placeholder="Konfirmasi password">
            <button class="w-full rounded-2xl bg-amber-500 py-3 font-bold text-slate-950">Simpan password</button>
        </form>
    </div>
</div>
@endsection
