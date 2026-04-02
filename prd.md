# PRD — Project Requirements Document

## 1. Overview

Aplikasi ini bertujuan untuk mendigitalkan pencatatan stok gudang yang sebelumnya mungkin dilakukan secara manual atau tidak terorganisir. Masalah utama yang ingin diselesaikan adalah kesulitan melacak jumlah stok real-time, lokasi penyimpanan (rak), dan riwayat masuk-keluar barang berdasarkan nomor batch.

Tujuan utama aplikasi adalah menyediakan platform berbasis web yang sederhana bagi **Admin Tunggal** untuk mengelola inventaris, memantau pergerakan stok (masuk/keluar), dan mendapatkan peringatan dini jika stok menipis langsung di dashboard.

## 2. Requirements

Berikut adalah persyaratan tingkat tinggi untuk pengembangan sistem:

- **Aksesibilitas:** Aplikasi harus dapat diakses melalui Web Browser (desktop/laptop diutamakan untuk input data manual).
- **Pengguna:** Sistem dirancang untuk satu pengguna (Admin Tunggal) dengan akses penuh.
- **Data Input:** Input data dilakukan secara manual (diketik), bukan scan barcode.
- **Spesifisitas Data:** Setiap produk harus mencatat informasi mendetail seperti Nomor Batch dan Lokasi Rak.
- **Notifikasi:** Peringatan stok rendah (Low Stock Alert) cukup ditampilkan secara visual di halaman Dashboard.

## 3. Core Features

Fitur-fitur kunci yang harus ada dalam versi pertama (MVP):

1.  **Dashboard Utama**
    - Ringkasan total jumlah produk dan nilai aset (opsional).
    - **Panel Peringatan Stok:** Daftar produk yang jumlahnya di bawah batas minimum.
    - **Chart Tren Stok:** Visualisasi pergerakan stok masuk dan keluar dalam bentuk **Area Chart** untuk menunjukkan akumulasi perubahan stok dalam rentang waktu tertentu (misal: mingguan atau bulanan).
    - **Chart Komposisi Stok:** Grafik (seperti bar chart atau pie chart) untuk membandingkan jumlah stok antar produk atau kategori produk.
2.  **Manajemen Produk (Master Data)**
    - Tambah, Edit, dan Hapus Produk.
    - Kolom wajib: Nama Produk, SKU, Satuan, Lokasi Rak, dan Minimum Stok.
3.  **Pencatatan Stok Masuk (Inbound)**
    - Form untuk menambah stok.
    - Input: Pilih Produk, Jumlah, **Nomor Batch**, dan Tanggal Masuk.
4.  **Pencatatan Stok Keluar (Outbound)**
    - Form untuk mengurangi stok.
    - Input: Pilih Produk, Jumlah, Pilih Batch (FIFO/LIFO manual), dan Keterangan.
5.  **Laporan Riwayat (Movement Logs)**
    - Tabel sederhana yang mencatat siapa (Admin), kapan, barang apa, dan berapa jumlah yang masuk/keluar.

## 4. User Flow

Alur kerja sederhana bagi Admin saat menggunakan aplikasi:

1.  **Login:** Admin masuk menggunakan email dan password.
2.  **Monitoring:** Admin melihat Dashboard untuk mengecek apakah ada barang yang perlu dipesan ulang (Low Stock) serta melihat tren pergerakan stok.
3.  **Setup Produk (Awal):** Jika barang baru, Admin membuat data produk baru lengkap dengan lokasi rak.
4.  **Update Stok:**
    - Jika barang datang: Admin membuka menu "Stok Masuk", mengetik jumlah dan nomor batch, lalu simpan.
    - Jika barang keluar: Admin membuka menu "Stok Keluar", memilih produk, mengetik jumlah, lalu simpan.
5.  **Verifikasi:** Sistem otomatis memperbarui sisa stok, mencatat transaksi di riwayat, dan memperbarui visualisasi chart di dashboard.

## 5. Architecture

Berikut adalah gambaran arsitektur sistem dan aliran data secara teknis namun sederhana:

```mermaid
sequenceDiagram
    participant User as Admin (Browser)
    participant UI as Frontend (Next.js)
    participant Server as Backend Logic
    participant DB as Database (SQLite)

    Note over User, DB: Proses Menambah Stok (Stok Masuk)

    User->>UI: Input Data Stok (Nama, Qty, Batch, Rak)
    UI->>Server: Kirim Request (Create Transaction)
    Server->>DB: Validasi & Simpan Data Transaksi
    DB-->>Server: Konfirmasi Sukses
    Server->>DB: Update Total Stok Produk
    DB-->>Server: Stok Terupdate
    Server-->>UI: Kirim Status Sukses & Data Baru
    UI-->>User: Tampilkan Notifikasi "Stok Berhasil Ditambah"
    UI->>User: Refresh Tampilan Dashboard
```

## 6. Design & Technical Constraints

Bagian ini mengatur batasan teknis dan panduan desain yang harus dipatuhi tanpa mendikte pemilihan library secara spesifik.

1.  **High-Level Technology:**
    Sistem harus dibangun menggunakan teknologi modern yang mendukung pengembangan cepat (rapid development) dan kemudahan pemeliharaan (maintainability). Pengembang dibebaskan memilih tools yang tepat selama tidak terikat pada stack spesifik secara kaku, namun tetap memprioritaskan performa dan skalabilitas untuk penggunaan skala kecil hingga menengah.

2.  **Typography Rules:**
    Sistem antarmuka (UI) wajib menggunakan konfigurasi font variable sebagai berikut untuk menjaga konsistensi visual:
    - `--font-sans: Geist Mono, ui-monospace, monospace;`
    - `--font-serif: serif;`
    - `--font-mono: JetBrains Mono, monospace;`

3.  **Theme:**
    Sistem antarmuka (UI) harus diatur menggunakan **Dark Mode** sebagai tampilan default (default theme).

## 7. Entity Relationship Diagram (ERD)

Berikut adalah diagram relasi entitas yang menggambarkan struktur database dan hubungan antar data dalam sistem:

```mermaid
erDiagram
    USERS ||--o{ TRANSACTIONS : makes
    PRODUCTS ||--o{ BATCHES : contains
    BATCHES ||--o{ TRANSACTIONS : affects

    USERS {
        int id PK
        string name
        string email
        string password
    }

    PRODUCTS {
        int id PK
        string name
        string sku
        string unit
        string rack_location
        int min_stock
    }

    BATCHES {
        int id PK
        int product_id FK
        string batch_number
        int current_quantity
        date expiry_date
    }

    TRANSACTIONS {
        int id PK
        string type
        int quantity
        int batch_id FK
        datetime created_at
        string notes
        int user_id FK
    }
```

## 8. Development Phases

Berikut adalah rencana tahapan pengembangan sistem yang disusun secara berurutan untuk memastikan kelancaran proses pembangunan aplikasi dari perencanaan hingga pengujian:

```mermaid
flowchart TD
    Start((Mulai)) --> Planning[Planning<br/>Kebutuhan & Desain Database]
    Planning --> Frontend[Frontend Development<br/>UI & Dashboard]
    Planning --> Backend[Backend Development<br/>API & Logic Stok]
    Frontend --> Integration[Integration<br/>Hubungkan UI dengan API]
    Backend --> Integration
    Integration --> Testing[Testing<br/>UAT & Bug Fixing]
    Testing --> Finish((Selesai/Deployment))
```
