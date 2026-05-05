@extends('layouts.app')

@section('content')
    <div class="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <form method="POST" action="{{ route('password.email') }}" class="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
            @csrf
            <h1 class="text-2xl font-black text-slate-900">Reset password</h1>
            <p class="mt-2 text-sm text-slate-500">Masukkan email untuk menerima link reset password.</p>
            <label class="mt-6 block text-sm font-semibold">Email</label>
            <input name="email" type="email" required class="mt-2 w-full rounded-xl border-slate-200">
            <button class="mt-6 w-full rounded-xl bg-amber-500 px-4 py-3 font-bold text-slate-950">Kirim link reset</button>
            <a href="{{ route('login') }}" class="mt-4 block text-center text-sm font-semibold text-amber-700">Kembali login</a>
        </form>
    </div>
@endsection
