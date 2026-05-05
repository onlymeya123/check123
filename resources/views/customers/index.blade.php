@extends('layouts.app')

@section('content')
<div class="flex flex-wrap items-center justify-between gap-3">
    <div>
        <p class="text-sm font-semibold uppercase tracking-wide text-blue-600">Pelanggan</p>
        <h1 class="text-2xl font-bold text-slate-950">Database pelanggan</h1>
    </div>
    @canany(['customers.create', 'customers.manage'])
        <a href="{{ route('customers.create') }}" class="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Tambah Pelanggan</a>
    @endcanany
</div>

<div class="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
    <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
                <th class="px-4 py-3">Nama</th>
                <th class="px-4 py-3">Kontak</th>
                <th class="px-4 py-3">Poin</th>
                <th class="px-4 py-3">Aksi</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-sm">
            @forelse($customers as $customer)
                <tr>
                    <td class="px-4 py-3 font-semibold">{{ $customer->name }}</td>
                    <td class="px-4 py-3 text-slate-600">{{ $customer->phone }}<br>{{ $customer->email }}</td>
                    <td class="px-4 py-3">{{ $customer->loyalty_points }}</td>
                    <td class="px-4 py-3">
                        @can('customers.manage')
                            <a href="{{ route('customers.edit', $customer) }}" class="text-blue-600">Edit</a>
                        @else
                            <span class="text-slate-400">Read</span>
                        @endcan
                    </td>
                </tr>
            @empty
                <tr><td colspan="4" class="px-4 py-8 text-center text-slate-500">Belum ada pelanggan.</td></tr>
            @endforelse
        </tbody>
    </table>
</div>

<div class="mt-4">{{ $customers->links() }}</div>
@endsection
