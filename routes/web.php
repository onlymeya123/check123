<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\PurchaseOrderController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\UnitController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => redirect()->route('dashboard'));

require __DIR__.'/auth.php';

Route::middleware('auth')->group(function (): void {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');

    Route::middleware('permission:transactions.create|transactions.full')->group(function (): void {
        Route::get('/pos', [SaleController::class, 'create'])->name('pos.index');
        Route::post('/pos', [SaleController::class, 'store'])->name('pos.store');
        Route::get('/pos/{transaction}/receipt', [SaleController::class, 'receipt'])->name('pos.receipt');
    });

    Route::resource('products', ProductController::class)->middleware('permission:products.manage|products.read');
    Route::resource('categories', CategoryController::class)->middleware('permission:categories.manage|categories.read');
    Route::resource('units', UnitController::class)->middleware('permission:products.manage|products.read');
    Route::resource('customers', CustomerController::class)->middleware('permission:customers.manage|customers.create|customers.read');
    Route::resource('suppliers', SupplierController::class)->middleware('permission:suppliers.manage|suppliers.read');
    Route::resource('purchase-orders', PurchaseOrderController::class)
        ->except(['edit', 'update', 'destroy'])
        ->middleware('permission:purchases.full|purchases.read');

    Route::get('/inventory/stock-opname', [InventoryController::class, 'create'])->name('inventory.opname');
    Route::post('/inventory/stock-opname', [InventoryController::class, 'store'])->name('inventory.opname.store');

    Route::prefix('reports')->name('reports.')->middleware('permission:reports.full|reports.read')->group(function (): void {
        Route::get('/sales', [ReportController::class, 'sales'])->name('sales');
        Route::get('/profit-loss', [ReportController::class, 'profitLoss'])->name('profit-loss');
        Route::get('/stock', [ReportController::class, 'stock'])->name('stock');
        Route::get('/cashier', [ReportController::class, 'cashier'])->name('cashier');
    });

    Route::resource('users', UserController::class)->middleware('permission:users.manage|users.read');
    Route::get('/settings', [SettingController::class, 'edit'])->name('settings.edit');
    Route::put('/settings', [SettingController::class, 'update'])->name('settings.update');
});
