@extends('layouts.app')

@section('title', 'Satuan')

@section('content')
<div class="flex items-center justify-between">
    <div>
        <h1 class="text-2xl font-bold text-slate-900">Satuan</h1>
        <p class="text-slate-500">Satuan jual produk.</p>
    </div>
    @can('products.manage')
        <a href="{{ route('units.create') }}" class="rounded-2xl bg-amber-600 px-4 py-2 font-semibold text-white">Tambah satuan</a>
    @endcan
</div>

<div class="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
    <table class="min-w-full divide-y divide-slate-100 text-sm">
        <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
                <th class="px-5 py-3">Nama</th>
                <th class="px-5 py-3">Simbol</th>
                <th class="px-5 py-3">Aksi</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
            @foreach ($units as $unit)
                <tr>
                    <td class="px-5 py-4 font-semibold text-slate-900">{{ $unit->name }}</td>
                    <td class="px-5 py-4">{{ $unit->symbol }}</td>
                    <td class="px-5 py-4">
                        @can('products.manage')
                            <a href="{{ route('units.edit', $unit) }}" class="font-semibold text-amber-700">Edit</a>
                        @endcan
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>
    <div class="border-t border-slate-100 px-5 py-4">{{ $units->links() }}</div>
</div>
@endsection
