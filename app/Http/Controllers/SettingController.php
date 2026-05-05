<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\View\View;

class SettingController extends Controller
{
    public function edit(): View
    {
        $settings = Cache::get('store.settings', [
            'store_name' => config('app.name'),
            'store_address' => 'Jl. Primadona No. 13, Bandung',
            'store_phone' => '0812-3456-7890',
            'payment_methods' => ['cash', 'qris', 'debit'],
            'printer_name' => 'Thermal ESC/POS 58mm',
        ]);

        return view('settings.edit', compact('settings'));
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'store_name' => ['required', 'string', 'max:120'],
            'store_address' => ['nullable', 'string'],
            'store_phone' => ['nullable', 'string', 'max:30'],
            'payment_methods' => ['nullable', 'array'],
            'payment_methods.*' => ['string', 'max:30'],
            'printer_name' => ['nullable', 'string', 'max:120'],
        ]);

        Cache::forever('store.settings', $validated);

        return to_route('settings.edit')->with('status', 'Pengaturan toko berhasil disimpan.');
    }
}
