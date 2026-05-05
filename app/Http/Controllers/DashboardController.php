<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\StockMovement;
use App\Models\Transaction;
use Carbon\CarbonImmutable;
use Illuminate\View\View;

class DashboardController extends Controller
{
    public function __invoke(): View
    {
        $today = CarbonImmutable::today();

        $salesToday = Transaction::query()
            ->whereDate('created_at', $today)
            ->sum('total');

        return view('dashboard', [
            'salesToday' => $salesToday,
            'transactionsToday' => Transaction::query()->whereDate('created_at', $today)->count(),
            'lowStockProducts' => Product::query()->with('category')->lowStock()->orderBy('stock')->take(8)->get(),
            'activeProducts' => Product::query()->active()->count(),
            'recentTransactions' => Transaction::query()->with(['cashier', 'customer'])->latest()->take(8)->get(),
            'stockMovements' => StockMovement::query()->with(['product', 'user'])->latest()->take(8)->get(),
            'chartSales' => collect(range(6, 0))->map(function (int $day) {
                $date = CarbonImmutable::today()->subDays($day);

                return [
                    'label' => $date->format('d M'),
                    'total' => (float) Transaction::query()->whereDate('created_at', $date)->sum('total'),
                ];
            }),
        ]);
    }
}
