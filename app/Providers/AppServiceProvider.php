<?php

namespace App\Providers;

use App\Repositories\ProductRepository;
use App\Repositories\TransactionRepository;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(ProductRepository::class);
        $this->app->singleton(TransactionRepository::class);
    }

    public function boot(): void
    {
        Gate::before(fn ($user) => $user->hasRole('Super Admin') ? true : null);
        Blade::if('role', fn (string $role): bool => auth()->check() && auth()->user()->hasRole($role));
    }
}
