# Ultah 24 — Vanessa Aurora

Website ucapan ulang tahun ke-24 untuk Vanessa Aurora. Statis (HTML + CSS + JavaScript biasa),
tanpa framework, tanpa build, tanpa login. Siap dipasang di GitHub Pages.

## Isi halaman

| Bagian | Keterangan |
|---|---|
| Gerbang | Hitung mundur sampai **23 September 2026, 00.00 WIB**. Halaman utama tertutup sebelum itu. |
| Hero | Foto utama full-screen yang mengecil jadi kartu sambil kolase foto berterbangan masuk (parallax saat scroll). |
| Ucapan | Kalimat pembuka. |
| Sorotan | Dua baris foto utama yang berjalan pelan, bisa diklik. |
| Kenangan | 30 foto gaya polaroid, diketuk untuk membuka tampilan besar. |
| Surat | Surat pribadi. |
| Harapan | Empat kartu doa. |
| Penutup | Kue ulang tahun, tombol tiup lilin, confetti. |

## Cara mengubah isi

Semua teks, caption, dan daftar foto ada di satu file: **`assets/js/data.js`**.
Ubah di situ, simpan, selesai — tidak perlu menyentuh HTML/CSS.

Yang paling sering diubah:

- `bukaPada` — kapan website boleh dibuka (format ISO, `+07:00` berarti WIB).
- `surat.isi` — isi surat.
- `utama` — foto untuk hero dan kolase. **Item pertama adalah foto hero.**
- `galeri` — foto beserta caption untuk bagian Kenangan.

Untuk menambah foto baru: salin file ke `assets/img/`, lalu tambahkan barisnya di `data.js`.
Pakai nama file tanpa spasi (contoh: `kenangan-31.jpg`).

## Hitung mundur

Waktu diambil dari **header `Date` milik server**, bukan jam HP. Jadi memajukan jam
perangkat tidak akan membuka halaman lebih cepat. Kalau server tidak bisa dihubungi,
barulah jam perangkat dipakai sebagai cadangan.

Catatan: ini pengaman ringan, bukan kunci. Isinya tetap ada di dalam berkas halaman,
jadi orang yang paham teknis masih bisa mengintip. Untuk kejutan ulang tahun, ini sudah cukup.

## Mengetes sebelum tanggalnya

- `?preview=1` — lewati hitung mundur, langsung buka isi website.
- `?motion=1` — paksa animasi tetap jalan walau perangkat memakai mode "kurangi gerak".

Bisa digabung: `?preview=1&motion=1`

## Menjalankan di komputer sendiri

Perlu server lokal (bukan buka file langsung), supaya pengecekan waktu server jalan:

```bash
npx serve .
```

## Memasang di VPS sendiri

Lihat **[DEPLOY.md](DEPLOY.md)** — cara memasang di VPS yang sudah melayani
`skriningtb.my.id`, supaya `ikhvara.my.id` membuka website ini dan keduanya tidak
saling nyasar.

## Memasang di GitHub Pages

1. Push ke branch `main`.
2. Di GitHub: **Settings → Pages → Source: Deploy from a branch → Branch: `main` / `(root)` → Save**.
3. Tunggu 1–2 menit. Alamatnya: `https://siyambahnaikhwan.github.io/ultah24/`

## Catatan

- Folder `Foto/` dan `Design/` tidak ikut di-push (lihat `.gitignore`). Semua foto yang
  dipakai website sudah disalin dan diganti namanya di `assets/img/`.
- Sudah dites di tampilan mobile (375px) dan desktop.
- Menghormati pengaturan "kurangi gerak" di perangkat: animasi otomatis dimatikan bagi
  yang mengaktifkannya.
