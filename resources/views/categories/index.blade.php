@extends('layouts.app')

@section('content')
<div class="flex items-center justify-between">
    <div>
        <p class="text-sm font-semibold uppercase tracking-wide text-emerald-600">Kategori</p>
        <h1 class="text-3xl font-black text-slate-950">Kategori Produk</h1>
    </div>
    @can('categories.manage')
        <a href="{{ route('categories.create') }}" class="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white">Tambah Kategori</a>
    @endcan
</div>

<div class="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
    <table class="min-w-full divide-y divide-slate-200 text-sm">
        <thead class="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
            <tr>
                <th class="px-5 py-4">Nama</th>
                <th class="px-5 py-4">Deskripsi</th>
                <th class="px-5 py-4 text-right">Aksi</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
            @forelse($categories as $category)
                <tr>
                    <td class="px-5 py-4 font-semibold text-slate-900">{{ $category->name }}</td>
                    <td class="px-5 py-4 text-slate-600">{{ $category->description ?: '-' }}</td>
                    <td class="px-5 py-4 text-right">
                        @can('categories.manage')
                            <a href="{{ route('categories.edit', $category) }}" class="font-bold text-emerald-700">Edit</a>
                        @endcan
                    </td>
                </tr>
            @empty
                <tr><td colspan="3" class="px-5 py-10 text-center text-slate-500">Belum ada kategori.</td></tr>
            @endforelse
        </tbody>
    </table>
</div>

<div class="mt-4">{{ $categories->links() }}</div>
@endsection
