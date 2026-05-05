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

    Route::resource('products', ProductController::class)
        ->only(['index', 'show'])
        ->middleware('permission:products.manage|products.read');
    Route::resource('products', ProductController::class)
        ->except(['index', 'show'])
        ->middleware('permission:products.manage');

    Route::resource('categories', CategoryController::class)
        ->only(['index'])
        ->middleware('permission:categories.manage|categories.read');
    Route::resource('categories', CategoryController::class)
        ->except(['index', 'show'])
        ->middleware('permission:categories.manage');

    Route::resource('units', UnitController::class)
        ->only(['index'])
        ->middleware('permission:products.manage|products.read');
    Route::resource('units', UnitController::class)
        ->except(['index', 'show'])
        ->middleware('permission:products.manage');

    Route::resource('customers', CustomerController::class)
        ->only(['index'])
        ->middleware('permission:customers.manage|customers.create|customers.read');
    Route::resource('customers', CustomerController::class)
        ->only(['create', 'store'])
        ->middleware('permission:customers.manage|customers.create');
    Route::resource('customers', CustomerController::class)
        ->only(['edit', 'update', 'destroy'])
        ->middleware('permission:customers.manage');

    Route::resource('suppliers', SupplierController::class)
        ->only(['index'])
        ->middleware('permission:suppliers.manage|suppliers.read');
    Route::resource('suppliers', SupplierController::class)
        ->except(['index', 'show'])
        ->middleware('permission:suppliers.manage');
    Route::resource('purchase-orders', PurchaseOrderController::class)
        ->only(['index', 'show'])
        ->middleware('permission:purchases.full|purchases.read');
    Route::resource('purchase-orders', PurchaseOrderController::class)
        ->only(['create', 'store'])
        ->middleware('permission:purchases.full');

    Route::get('/inventory/stock-opname', [InventoryController::class, 'create'])->middleware('permission:products.manage')->name('inventory.opname');
    Route::post('/inventory/stock-opname', [InventoryController::class, 'store'])->middleware('permission:products.manage')->name('inventory.opname.store');

    Route::prefix('reports')->name('reports.')->middleware('permission:reports.full|reports.read')->group(function (): void {
        Route::get('/sales', [ReportController::class, 'sales'])->name('sales');
        Route::get('/profit-loss', [ReportController::class, 'profitLoss'])->name('profit-loss');
        Route::get('/stock', [ReportController::class, 'stock'])->name('stock');
        Route::get('/cashier', [ReportController::class, 'cashier'])->name('cashier');
    });

    Route::resource('users', UserController::class)->only(['index'])->middleware('permission:users.manage|users.read');
    Route::resource('users', UserController::class)->except(['index', 'show', 'destroy'])->middleware('permission:users.manage');
    Route::get('/settings', [SettingController::class, 'edit'])->middleware('permission:settings.full|settings.limited')->name('settings.edit');
    Route::put('/settings', [SettingController::class, 'update'])->middleware('permission:settings.full|settings.limited')->name('settings.update');
});
