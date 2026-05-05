<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'users.manage',
            'users.read',
            'products.manage',
            'products.read',
            'categories.manage',
            'categories.read',
            'transactions.full',
            'transactions.create',
            'transactions.read',
            'suppliers.manage',
            'suppliers.read',
            'purchases.full',
            'purchases.read',
            'customers.manage',
            'customers.create',
            'customers.read',
            'reports.full',
            'reports.read',
            'settings.full',
            'settings.limited',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission);
        }

        $matrix = [
            'Super Admin' => $permissions,
            'Admin' => [
                'users.manage',
                'products.manage',
                'categories.manage',
                'transactions.full',
                'suppliers.manage',
                'purchases.full',
                'customers.manage',
                'reports.full',
                'settings.limited',
            ],
            'Manajer' => [
                'users.read',
                'products.read',
                'categories.read',
                'transactions.read',
                'suppliers.read',
                'purchases.read',
                'customers.read',
                'reports.read',
            ],
            'Kasir' => [
                'products.read',
                'transactions.create',
                'customers.create',
                'customers.read',
            ],
        ];

        foreach ($matrix as $role => $rolePermissions) {
            Role::findOrCreate($role)->syncPermissions($rolePermissions);
        }
    }
}
