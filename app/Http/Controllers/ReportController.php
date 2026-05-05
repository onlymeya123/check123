<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function sales(Request $request)
    {
        $range = $this->range($request);
        $transactions = Transaction::query()
            ->with(['cashier', 'customer'])
            ->whereBetween('created_at', $range)
            ->latest()
            ->paginate(20)
            ->withQueryString();

        $summary = Transaction::query()
            ->whereBetween('created_at', $range)
            ->selectRaw('COUNT(*) as trx_count, COALESCE(SUM(total), 0) as revenue, COALESCE(SUM(discount), 0) as discount')
            ->first();

        return view('reports.sales', compact('transactions', 'summary'));
    }

    public function profitLoss(Request $request)
    {
        $range = $this->range($request);
        $summary = TransactionItem::query()
            ->whereHas('transaction', fn ($query) => $query->whereBetween('created_at', $range))
            ->selectRaw('COALESCE(SUM(subtotal), 0) as revenue, COALESCE(SUM(cost_price * qty), 0) as cost, COALESCE(SUM(profit), 0) as gross_profit')
            ->first();

        return view('reports.profit-loss', compact('summary'));
    }

    public function stock()
    {
        $products = Product::query()->with(['category', 'unit'])->orderBy('stock')->paginate(25);

        return view('reports.stock', compact('products'));
    }

    public function cashier(Request $request)
    {
        $range = $this->range($request);
        $cashiers = User::query()
            ->select('users.id', 'users.name')
            ->leftJoin('transactions', function ($join) use ($range): void {
                $join->on('transactions.user_id', '=', 'users.id')
                    ->whereBetween('transactions.created_at', $range);
            })
            ->groupBy('users.id', 'users.name')
            ->selectRaw('COUNT(transactions.id) as trx_count, COALESCE(SUM(transactions.total), 0) as revenue')
            ->orderByDesc('revenue')
            ->get();

        return view('reports.cashier', compact('cashiers'));
    }

    private function range(Request $request): array
    {
        $start = $request->date('start_date', now()->startOfMonth())->startOfDay();
        $end = $request->date('end_date', now())->endOfDay();

        return [$start, $end];
    }
}
