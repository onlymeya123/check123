@extends('layouts.app')

@section('content')
    <div class="max-w-xl rounded-3xl bg-white p-6 shadow-sm">
        <h1 class="text-2xl font-bold text-slate-900">{{ $category->exists ? 'Edit Kategori' : 'Tambah Kategori' }}</h1>
        <form method="POST" action="{{ $category->exists ? route('categories.update', $category) : route('categories.store') }}" class="mt-6 space-y-4">
            @csrf
            @if($category->exists)
                @method('PUT')
            @endif
            <div>
                <label class="text-sm font-semibold text-slate-600">Nama</label>
                <input name="name" value="{{ old('name', $category->name) }}" class="mt-1 w-full rounded-2xl border-slate-200" required>
            </div>
            <div>
                <label class="text-sm font-semibold text-slate-600">Deskripsi</label>
                <textarea name="description" class="mt-1 w-full rounded-2xl border-slate-200">{{ old('description', $category->description) }}</textarea>
            </div>
            <button class="rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white">Simpan</button>
        </form>
    </div>
@endsection
