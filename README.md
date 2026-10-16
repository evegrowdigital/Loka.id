# LOKA

Platform toko digital: satu tautan untuk menjual produk digital, jasa, dan mengelola penghasilan.
Next.js 14 + Supabase (database, login, penyimpanan file) + Xendit (pembayaran). Warna brand biru.

## Fitur

| Area | Halaman |
|---|---|
| Publik | `/` landing, `/login`, `/register`, `/[username]` toko publik + checkout, `/pesanan/[id]` halaman pembeli setelah bayar |
| Kreator | `/dashboard` ringkasan, `/dashboard/produk`, `/pesanan`, `/toko`, `/statistik`, `/saldo` |
| Admin | `/admin` ringkasan, pengguna, persetujuan penarikan, transaksi, pengaturan biaya |

## Cara kerja uang (penting dipahami)

1. Pembeli klik Bayar, server membuat **order pending** (harga diambil dari database, bukan dari browser) dan tagihan **Xendit**.
2. Pembeli membayar di halaman Xendit (QRIS, Virtual Account, e-wallet, dll).
3. Xendit memanggil **webhook** `/api/webhooks/xendit`. Server memeriksa token, **mengecek ulang tagihan langsung ke Xendit**, lalu memanggil fungsi database `mark_order_paid`.
4. `mark_order_paid` mengubah order jadi `paid` dan mencatat saldo ke tabel `ledger` (tidak bisa tercatat dua kali).
5. Pembeli membuka `/pesanan/[id]?t=TOKEN`, dan produk (tautan atau file privat bertanda waktu) tampil setelah status `paid`.
6. Kreator menarik saldo lewat fungsi `request_withdrawal` (dikunci per kreator, cek saldo, hitung biaya 5%/2%, catat ledger). Admin mentransfer manual lalu klik **Setujui** (atau **Tolak** untuk mengembalikan saldo).
7. Paket Pro dibayar lewat Xendit juga (30 hari) dan diaktifkan otomatis oleh webhook.

Data setiap kreator dipisahkan dengan **Row Level Security** di database. File produk disimpan di bucket privat dan tidak pernah ikut terbaca publik.

## Setup (urut)

### 1. Supabase
1. Buat project di supabase.com.
2. Buka **SQL Editor**, tempel seluruh isi `supabase/schema.sql`, klik **Run**.
3. **Project Settings > API**: salin `Project URL`, `anon public key`, dan `service_role key`.
4. **Authentication > URL Configuration**: isi **Site URL** dengan alamat Vercel-mu, dan tambahkan `https://ALAMATMU/login` di Redirect URLs.
5. **Authentication > Providers > Email**: untuk uji coba boleh matikan "Confirm email". Untuk produksi, biarkan aktif dan pasang SMTP sendiri (email bawaan Supabase sangat terbatas).
6. Daftar sebagai pengguna lewat `/register`, lalu jadikan dirimu admin di SQL Editor:
   ```sql
   update public.profiles set role = 'admin' where email = 'emailkamu@contoh.com';
   ```

### 2. Xendit
1. Daftar di xendit.co, pakai mode **Test** dulu.
2. **Settings > API Keys**: buat key dengan izin tulis untuk *Invoices*. Salin sebagai `XENDIT_SECRET_KEY`.
3. **Settings > Webhooks**: untuk event **Invoices paid** dan **Invoices expired**, isi URL `https://ALAMATMU/api/webhooks/xendit`. Salin **Callback verification token** sebagai `XENDIT_CALLBACK_TOKEN`.

### 3. Resend (email otomatis, opsional tapi disarankan)
1. Daftar di resend.com, lalu **Domains > Add Domain** dan ikuti langkah menambah record DNS sampai statusnya *Verified*.
   Tanpa domain terverifikasi, Resend hanya mengizinkan kirim ke email pemilik akun (cukup untuk uji coba).
2. **API Keys > Create API Key** (izin *Sending access*). Salin sebagai `RESEND_API_KEY`.
3. Isi `RESEND_FROM`, contoh: `LOKA <noreply@domainmu.com>`.
4. Jika database dibuat sebelum fitur email ada, jalankan juga `supabase/migrations/002_email.sql` di SQL Editor.

Email yang dikirim setelah pembayaran terverifikasi: **bukti pembelian + tombol Buka produk** ke pembeli, dan **pesanan baru** ke penjual.
Setiap pesanan hanya dikirimi email sekali (aman walau webhook datang dua kali). Pembeli bisa minta kirim ulang dari halaman `/pesanan/...`.

### 4. Vercel
1. Unggah proyek ke GitHub (`git init`, `git add .`, `git commit`, `git push`), lalu **Add New > Project** di Vercel dan pilih repository.
2. **Settings > Environment Variables**: isi semua variabel dari `.env.example`.
   `SUPABASE_SERVICE_ROLE_KEY` dan `XENDIT_SECRET_KEY` bersifat rahasia: hanya di Vercel, jangan di-commit.
3. **Deploy**. Setelah selesai, isi `NEXT_PUBLIC_SITE_URL` dengan alamat final lalu **Redeploy**.

### 5. Uji alur penuh (mode Test)
1. Daftar sebagai kreator, buat produk (isi tautan atau unggah file), buka `/usernamemu`.
2. Beli produk itu. Di halaman Xendit Test, gunakan fitur simulasi pembayaran di dashboard Xendit.
3. Email bukti masuk ke pembeli dan email pesanan baru ke penjual. Halaman `/pesanan/...` akan berubah menjadi "Pembayaran berhasil" dan menampilkan tombol Buka produk. Saldo kreator bertambah.
4. Ajukan penarikan, lalu setujui dari `/admin`.

## Sebelum menerima uang sungguhan

- Ganti Xendit ke mode **Live** (butuh verifikasi bisnis di Xendit) dan perbarui kunci serta token di Vercel.
- Siapkan **Syarat & Ketentuan**, **Kebijakan Privasi**, dan kebijakan refund. Pelajari kewajiban hukum dan pajak untuk platform pembayaran dan biaya layanan (potongan 5%/2% ditampilkan sebagai biaya layanan pencairan, bukan pajak).
- Pasang SMTP sendiri di Supabase agar email konfirmasi dan reset kata sandi andal.
- Uji kegagalan: pembayaran kedaluwarsa, webhook terkirim dua kali (sudah aman: idempotent), penarikan bersamaan.

## Belum ada di versi ini

- **Pencairan otomatis** ke rekening (sekarang admin transfer manual). Bisa ditambah dengan Xendit Disbursement.
- **Lupa kata sandi**, login Google, verifikasi identitas kreator (KYC).
- **Pembatasan spam** pada pencatatan kunjungan, dan **agregasi statistik di server** (sekarang statistik dihitung di browser dari 90 hari data kunjungan, cukup untuk toko kecil-menengah).
- Penjual yang menghapus produk yang sudah terjual dicegah (produk hanya bisa disembunyikan) supaya akses pembeli tetap aman.

## Menjalankan lokal

```bash
cp .env.example .env.local   # isi nilainya
npm install
npm run dev
```

## Struktur

```
supabase/schema.sql         skema, RLS, fungsi transaksi, storage
app/api/checkout            buat order + tagihan Xendit
app/api/webhooks/xendit     terima konfirmasi pembayaran
app/api/orders/[id]/access  beri akses produk ke pembeli yang sudah bayar
app/api/orders/[id]/resend  kirim ulang email bukti ke pembeli
app/api/pro/checkout        bayar paket Pro
lib/email.js                pengiriman email (Resend) dan templat
lib/db.js                   klien Supabase, pemuatan data, perhitungan saldo dan statistik
lib/server.js               helper server (service role + Xendit)
```
