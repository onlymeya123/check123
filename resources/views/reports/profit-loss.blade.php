@extends('layouts.app')

@section('content')
    <div class="panel">
        <div class="header">
            <div>
                <h1>Laporan Laba Rugi</h1>
                <p>Estimasi profit berdasarkan margin item transaksi.</p>
            </div>
        </div>
        <div class="grid metrics">
            <div class="card">
                <span>Omzet</span>
                <strong>Rp {{ number_format((float) $summary->revenue, 0, ',', '.') }}</strong>
            </div>
            <div class="card">
                <span>HPP</span>
                <strong>Rp {{ number_format((float) $summary->cost, 0, ',', '.') }}</strong>
            </div>
            <div class="card">
                <span>Laba Kotor</span>
                <strong>Rp {{ number_format((float) $summary->gross_profit, 0, ',', '.') }}</strong>
            </div>
        </div>
    </div>
@endsection
