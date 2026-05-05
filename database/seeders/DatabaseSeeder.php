<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RolePermissionSeeder::class);

        $admin = User::query()->firstOrCreate(
            ['email' => 'admin@cirengprimadona.test'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
            ]
        );
        $admin->assignRole('Super Admin');

        $unit = Unit::query()->firstOrCreate(['symbol' => 'pcs'], ['name' => 'Pieces']);
        $food = Category::query()->firstOrCreate(['name' => 'Cireng'], ['description' => 'Produk cireng siap jual']);
        $drink = Category::query()->firstOrCreate(['name' => 'Minuman'], ['description' => 'Minuman pendamping']);

        $products = [
            ['category_id' => $food->id, 'unit_id' => $unit->id, 'name' => 'Cireng Original', 'sku' => 'CRG-ORI', 'barcode' => '899100000001', 'cost_price' => 2500, 'price' => 5000, 'stock' => 80, 'minimum_stock' => 10],
            ['category_id' => $food->id, 'unit_id' => $unit->id, 'name' => 'Cireng Ayam Pedas', 'sku' => 'CRG-AYP', 'barcode' => '899100000002', 'cost_price' => 3500, 'price' => 7000, 'stock' => 60, 'minimum_stock' => 10],
            ['category_id' => $food->id, 'unit_id' => $unit->id, 'name' => 'Cireng Keju', 'sku' => 'CRG-KJU', 'barcode' => '899100000003', 'cost_price' => 4000, 'price' => 8000, 'stock' => 45, 'minimum_stock' => 8],
            ['category_id' => $drink->id, 'unit_id' => $unit->id, 'name' => 'Es Teh Manis', 'sku' => 'DRK-TEH', 'barcode' => '899100000004', 'cost_price' => 1500, 'price' => 4000, 'stock' => 100, 'minimum_stock' => 12],
        ];

        foreach ($products as $product) {
            Product::query()->firstOrCreate(['sku' => $product['sku']], $product);
        }

        Supplier::query()->firstOrCreate(
            ['name' => 'Dapur Bahan Primadona'],
            ['contact' => 'Ibu Sari', 'phone' => '081234567890', 'email' => 'supplier@cirengprimadona.test']
        );
    }
}
