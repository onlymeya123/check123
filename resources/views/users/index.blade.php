@extends('layouts.app')

@section('content')
<div class="flex items-center justify-between">
    <div>
        <h1 class="text-2xl font-bold text-slate-900">User & RBAC</h1>
        <p class="text-sm text-slate-500">Kelola akun dan peran akses.</p>
    </div>
    @can('users.manage')
        <a href="{{ route('users.create') }}" class="rounded-2xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white">Tambah User</a>
    @endcan
</div>

<div class="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
    <table class="min-w-full divide-y divide-slate-100 text-sm">
        <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
                <th class="px-4 py-3">Nama</th>
                <th class="px-4 py-3">Email</th>
                <th class="px-4 py-3">Role</th>
                <th class="px-4 py-3 text-right">Aksi</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
            @foreach($users as $user)
                <tr>
                    <td class="px-4 py-3 font-semibold text-slate-900">{{ $user->name }}</td>
                    <td class="px-4 py-3 text-slate-600">{{ $user->email }}</td>
                    <td class="px-4 py-3">
                        @foreach($user->roles as $role)
                            <span class="rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">{{ $role->name }}</span>
                        @endforeach
                    </td>
                    <td class="px-4 py-3 text-right">
                        @can('users.manage')
                            <a href="{{ route('users.edit', $user) }}" class="font-semibold text-amber-600">Edit</a>
                        @endcan
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>
</div>

<div class="mt-4">{{ $users->links() }}</div>
@endsection
