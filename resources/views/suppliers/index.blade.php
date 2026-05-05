@extends('layouts.app')

@section('title', 'Supplier')
@section('page_title', 'Supplier')
@section('content')
    <div class="mb-6 flex items-center justify-between">
        <div>
            <h1 class="text-2xl font-bold text-slate-900">Supplier</h1>
            <p class="text-sm text-slate-500">Data pemasok dan kontak pembelian.</p>
        </div>
        @can('suppliers.manage')
            <a href="{{ route('suppliers.create') }}" class="rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white">Tambah Supplier</a>
        @endcan
    </div>
    <div class="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table class="min-w-full divide-y divide-slate-100">
            <thead class="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                <tr>
                    <th class="px-4 py-3">Nama</th>
                    <th class="px-4 py-3">Kontak</th>
                    <th class="px-4 py-3">Telepon</th>
                    <th class="px-4 py-3 text-right">Aksi</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-sm">
                @forelse ($suppliers as $supplier)
                    <tr>
                        <td class="px-4 py-3 font-semibold">{{ $supplier->name }}</td>
                        <td class="px-4 py-3">{{ $supplier->contact ?? '-' }}</td>
                        <td class="px-4 py-3">{{ $supplier->phone ?? '-' }}</td>
                        <td class="px-4 py-3 text-right">
                            @can('suppliers.manage')
                                <a href="{{ route('suppliers.edit', $supplier) }}" class="text-orange-700">Edit</a>
                            @endcan
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="4" class="px-4 py-6 text-center text-slate-500">Belum ada supplier.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
    <div class="mt-4">{{ $suppliers->links() }}</div>
@endsection
