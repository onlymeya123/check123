@extends('layouts.app')

@section('title', isset($customer) ? 'Edit Pelanggan' : 'Tambah Pelanggan')
@section('page_title', isset($customer) ? 'Edit Pelanggan' : 'Tambah Pelanggan')
@section('page_actions')
    <a href="{{ route('customers.index') }}" class="btn-secondary">Kembali</a>
@endsection

@section('content')
    <form method="POST" action="{{ isset($customer) ? route('customers.update', $customer) : route('customers.store') }}" class="panel max-w-2xl space-y-4">
        @csrf
        @isset($customer)
            @method('PUT')
        @endisset
        <div>
            <label class="label">Nama</label>
            <input name="name" value="{{ old('name', $customer->name ?? '') }}" class="input" required>
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
            <div>
                <label class="label">Telepon</label>
                <input name="phone" value="{{ old('phone', $customer->phone ?? '') }}" class="input">
            </div>
            <div>
                <label class="label">Email</label>
                <input type="email" name="email" value="{{ old('email', $customer->email ?? '') }}" class="input">
            </div>
        </div>
        <div>
            <label class="label">Alamat</label>
            <textarea name="address" class="input" rows="3">{{ old('address', $customer->address ?? '') }}</textarea>
        </div>
        <button class="btn-primary">Simpan</button>
    </form>
@endsection
