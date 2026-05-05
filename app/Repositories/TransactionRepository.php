<?php

namespace App\Repositories;

use App\Models\Transaction;
use Illuminate\Support\Carbon;

class TransactionRepository
{
    public function create(array $data): Transaction
    {
        return Transaction::create($data);
    }

    public function nextInvoiceNumber(): string
    {
        $prefix = 'CP-'.Carbon::now()->format('Ymd').'-';
        $next = Transaction::query()
            ->where('invoice_number', 'like', $prefix.'%')
            ->count() + 1;

        return $prefix.str_pad((string) $next, 4, '0', STR_PAD_LEFT);
    }
}
