# Cireng Primadona POS

Cireng Primadona adalah aplikasi Point of Sale (POS) berbasis web untuk usaha ritel kecil hingga menengah. Aplikasi ini dibangun dengan arsitektur Laravel 13, Blade, MySQL, dan RBAC berbasis Spatie Permission sesuai PRD.

## Fitur Utama

- Autentikasi email/password, registrasi, logout, dan reset password via email.
- RBAC: Super Admin, Admin, Manajer, dan Kasir dengan permission matrix sesuai PRD.
- Dashboard real-time untuk omzet, transaksi, stok rendah, produk terlaris, dan performa kasir.
- POS kasir dengan pencarian nama/SKU/barcode, keranjang, diskon, multi pembayaran, kembalian, dan struk cetak.
- Manajemen produk, kategori, satuan, stok minimum, stok opname, pelanggan, supplier, dan purchase order.
- Laporan penjualan, laba rugi, stok, dan kasir.
- Activity log untuk aksi penting user.
- Layer `Controller -> Service -> Repository -> Model -> MySQL`.

## Tech Stack

| Layer | Teknologi |
| --- | --- |
| Backend | Laravel 13, PHP 8.3+ |
| Frontend | Blade, Tailwind CSS, Alpine.js |
| Database | MySQL |
| RBAC | spatie/laravel-permission |
| Export | maatwebsite/excel, barryvdh/laravel-dompdf |
| Build | Vite |

## Setup Lokal

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
npm install
npm run build
php artisan serve
```

Login awal:

- Email: `admin@cirengprimadona.test`
- Password: `password`

## Struktur Penting

- `app/Http/Controllers` - controller modul dashboard, POS, master data, pembelian, laporan, auth.
- `app/Services/TransactionService.php` - transaksi atomik dengan lock stok dan rollback otomatis.
- `app/Repositories` - akses data produk dan transaksi.
- `app/Models` - model Eloquent untuk schema PRD.
- `database/migrations` - schema users, RBAC, produk, stok, pelanggan, supplier, PO, transaksi, pembayaran.
- `database/seeders` - role, permission, admin awal, produk contoh Cireng Primadona.
- `resources/views` - UI Blade responsive.

## Modul PRD yang Diimplementasikan

| Modul | Status |
| --- | --- |
| POS transaksi | Tersedia |
| Produk & stok | Tersedia |
| User & RBAC | Tersedia |
| Supplier & pembelian | Tersedia |
| Pelanggan | Tersedia |
| Laporan | Tersedia |
| Pengaturan toko/pembayaran/printer | Tersedia sebagai konfigurasi UI |
| Loyalty point | Disiapkan di schema pelanggan |
| Payment gateway / printer thermal | Placeholder konfigurasi, siap integrasi |

## Catatan Environment

Environment cloud saat implementasi tidak memiliki PHP dan Composer, sehingga verifikasi runtime Laravel perlu dijalankan di environment yang menyediakan PHP 8.3+ dan Composer.
