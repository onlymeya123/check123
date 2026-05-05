<?php

namespace App\Repositories;

use App\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;

class ProductRepository
{
    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return Product::query()
            ->with(['category', 'unit'])
            ->when($filters['search'] ?? null, function ($query, string $search): void {
                $query->where(function ($nested) use ($search): void {
                    $nested->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%")
                        ->orWhere('barcode', 'like', "%{$search}%");
                });
            })
            ->when($filters['low_stock'] ?? false, fn ($query) => $query->lowStock())
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }

    public function activeForPos(?string $search = null): Collection
    {
        $cacheKey = 'pos-products:'.md5((string) $search);

        return Cache::remember($cacheKey, now()->addMinutes(5), function () use ($search) {
            return Product::query()
                ->with(['category', 'unit'])
                ->active()
                ->when($search, function ($query, string $search): void {
                    $query->where(function ($nested) use ($search): void {
                        $nested->where('name', 'like', "%{$search}%")
                            ->orWhere('sku', 'like', "%{$search}%")
                            ->orWhere('barcode', 'like', "%{$search}%");
                    });
                })
                ->orderBy('name')
                ->limit(60)
                ->get();
        });
    }

    public function findForUpdate(int $id): Product
    {
        return Product::query()->lockForUpdate()->findOrFail($id);
    }
}
