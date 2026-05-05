@extends('layouts.app')

@section('title', 'Laporan Stok')
@section('page-title', 'Laporan Stok')
@section('page-subtitle', 'Ketersediaan barang dan alert minimum')

@section('content')
    <div class="card">
        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>Produk</th>
                        <th>Kategori</th>
                        <th>Stok</th>
                        <th>Min</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($products as $product)
                        <tr>
                            <td>{{ $product->name }}</td>
                            <td>{{ $product->category->name }}</td>
                            <td>{{ $product->stock }}</td>
                            <td>{{ $product->minimum_stock }}</td>
                            <td><span class="badge {{ $product->stock <= $product->minimum_stock ? 'badge-danger' : 'badge-success' }}">{{ $product->stock <= $product->minimum_stock ? 'Perlu restock' : 'Aman' }}</span></td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>
@endsection
