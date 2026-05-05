@extends('layouts.app')

@section('content')
<div class="space-y-6">
    <div>
        <h1 class="text-3xl font-bold text-slate-900">{{ $user->exists ? 'Edit User' : 'Tambah User' }}</h1>
        <p class="text-slate-500">Assign role RBAC sesuai permission matrix.</p>
    </div>

    <form method="POST" action="{{ $user->exists ? route('users.update', $user) : route('users.store') }}" class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        @csrf
        @if($user->exists)
            @method('PUT')
        @endif

        <div class="grid gap-4 md:grid-cols-2">
            <label class="space-y-1 text-sm font-semibold text-slate-600">Nama
                <input name="name" value="{{ old('name', $user->name) }}" class="mt-1 w-full rounded-2xl border-slate-200" required>
            </label>
            <label class="space-y-1 text-sm font-semibold text-slate-600">Email
                <input type="email" name="email" value="{{ old('email', $user->email) }}" class="mt-1 w-full rounded-2xl border-slate-200" required>
            </label>
            <label class="space-y-1 text-sm font-semibold text-slate-600">Password
                <input type="password" name="password" class="mt-1 w-full rounded-2xl border-slate-200" @unless($user->exists) required @endunless>
            </label>
            <label class="space-y-1 text-sm font-semibold text-slate-600">Role
                <select name="role" class="mt-1 w-full rounded-2xl border-slate-200" required>
                    @foreach($roles as $role)
                        <option value="{{ $role->name }}" @selected(old('role', $user->roles->first()?->name) === $role->name)>{{ $role->name }}</option>
                    @endforeach
                </select>
            </label>
        </div>

        <div class="mt-6 flex justify-end gap-3">
            <a href="{{ route('users.index') }}" class="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600">Batal</a>
            <button class="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Simpan</button>
        </div>
    </form>
</div>
@endsection
