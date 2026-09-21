# Pasang di VPS (satu VPS, dua website)

Panduan ini untuk menaruh website ulang tahun di VPS yang **sudah** dipakai website
skrining TB, supaya `ikhvara.my.id` membuka website yang benar dan tidak nyasar ke
website satunya.

> Panduan ini mengasumsikan **Ubuntu/Debian + Nginx**. Kalau VPS-mu pakai Apache,
> lihat bagian [Kalau pakai Apache](#kalau-pakai-apache) di bawah.

---

## Kenapa bisa nyasar ke website yang salah

Nginx memilih website berdasarkan **`server_name`** yang cocok dengan domain di
permintaan. Kalau tidak ada yang cocok, Nginx melemparnya ke blok **`default_server`** —
dan kalau website skrining TB kebetulan jadi `default_server`, semua domain baru akan
mendarat di sana.

Jadi kuncinya cuma dua:

1. Tiap website punya blok `server { … }` sendiri dengan `server_name` yang jelas.
2. Tidak ada blok yang menyerobot domain milik orang lain.

---

## Langkah 1 — Arahkan DNS

Di panel pengelola domain `ikhvara.my.id`, buat record berikut
(ganti `123.45.67.89` dengan IP VPS-mu):

| Type | Name | Value |
|---|---|---|
| A | `@` | `123.45.67.89` |
| A | `www` | `123.45.67.89` |

Kalau website ulang tahun mau ditaruh di subdomain, tambahkan juga:

| Type | Name | Value |
|---|---|---|
| A | `ultah` | `123.45.67.89` |

Cek sampai sudah menyebar (dari komputer sendiri):

```bash
nslookup ikhvara.my.id
```

---

## Langkah 2 — Taruh berkasnya di VPS

```bash
sudo mkdir -p /var/www
sudo git clone https://github.com/SiyambahnaIkhwan/ultah24.git /var/www/ultah24
sudo chown -R www-data:www-data /var/www/ultah24
sudo chmod -R 755 /var/www/ultah24
```

Kalau repo-nya privat, pakai deploy key atau ganti dengan mengunggah manual:

```bash
# dari komputer sendiri
scp -r C:/Code/Ultah/* user@123.45.67.89:/tmp/ultah24/
```

---

## Langkah 3 — Tentukan pembagian domainnya

Pilih salah satu. Caranya sama, hanya beda isi `server_name`.

**Pilihan A — `ikhvara.my.id` untuk website ulang tahun**

| Domain | Website |
|---|---|
| `ikhvara.my.id`, `www.ikhvara.my.id` | Ulang tahun (statis) |
| `skrining.ikhvara.my.id` | Skrining TB (Laravel) |

**Pilihan B — `ikhvara.my.id` tetap untuk skrining TB**

| Domain | Website |
|---|---|
| `ikhvara.my.id`, `www.ikhvara.my.id` | Skrining TB (Laravel) |
| `ultah.ikhvara.my.id` | Ulang tahun (statis) |

Contoh di bawah memakai **Pilihan A**. Untuk Pilihan B, tinggal tukar isi
`server_name` di kedua berkas.

---

## Langkah 4 — Blok Nginx untuk website ulang tahun

```bash
sudo nano /etc/nginx/sites-available/ultah24
```

Isi:

```nginx
server {
    listen 80;
    listen [::]:80;

    server_name ikhvara.my.id www.ikhvara.my.id;

    root /var/www/ultah24;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    # foto & aset boleh di-cache lama
    location ~* \.(jpg|jpeg|png|gif|webp|svg|ico|woff2?)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # halaman & skrip jangan di-cache lama, supaya perubahan langsung kelihatan
    location ~* \.(html|css|js)$ {
        expires 10m;
        add_header Cache-Control "public, must-revalidate";
    }

    gzip on;
    gzip_types text/css application/javascript image/svg+xml;

    access_log /var/log/nginx/ultah24.access.log;
    error_log  /var/log/nginx/ultah24.error.log;
}
```

Aktifkan:

```bash
sudo ln -s /etc/nginx/sites-available/ultah24 /etc/nginx/sites-enabled/
```

---

## Langkah 5 — Pastikan website skrining TB tidak menyerobot

Buka berkas konfigurasi website lama:

```bash
ls /etc/nginx/sites-enabled/
sudo nano /etc/nginx/sites-enabled/skrining   # sesuaikan namanya
```

Periksa dua hal:

1. **`server_name` harus spesifik**, bukan `_` atau kosong:

   ```nginx
   server_name skrining.ikhvara.my.id;     # BENAR
   # server_name _;                        # SALAH — menyerobot semua domain
   ```

2. **Hapus `default_server`** dari blok itu kalau ada:

   ```nginx
   listen 80 default_server;   # ← hapus kata "default_server"
   listen 80;                  # ← jadi begini
   ```

Kalau berkas `/etc/nginx/sites-enabled/default` bawaan Nginx masih ada dan tidak
dipakai, sebaiknya dinonaktifkan:

```bash
sudo rm /etc/nginx/sites-enabled/default
```

### (Opsional) Penangkap domain tak dikenal

Supaya domain asing yang diarahkan ke IP VPS-mu tidak masuk ke website mana pun:

```bash
sudo nano /etc/nginx/sites-available/00-catchall
```

```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    return 444;
}
```

```bash
sudo ln -s /etc/nginx/sites-available/00-catchall /etc/nginx/sites-enabled/
```

---

## Langkah 6 — Uji lalu muat ulang

```bash
sudo nginx -t          # harus "syntax is ok" dan "test is successful"
sudo systemctl reload nginx
```

Kalau `nginx -t` mengeluh *conflicting server name*, berarti ada dua blok memakai
domain yang sama — perbaiki dulu sebelum reload.

---

## Langkah 7 — Pasang HTTPS

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d ikhvara.my.id -d www.ikhvara.my.id
```

Certbot akan menambah blok `listen 443 ssl` sendiri dan mengatur pengalihan dari
http ke https. Perpanjangan otomatis bisa diuji dengan:

```bash
sudo certbot renew --dry-run
```

---

## Memastikan sudah benar

Dari VPS, tanya langsung ke Nginx dengan domain tertentu:

```bash
curl -I -H 'Host: ikhvara.my.id' http://127.0.0.1/
curl -I -H 'Host: skrining.ikhvara.my.id' http://127.0.0.1/
```

Lihat juga log mana yang terisi saat kamu membuka domainnya:

```bash
sudo tail -f /var/log/nginx/ultah24.access.log
```

Dari browser, buka `https://ikhvara.my.id` — kalau masih memunculkan website lama,
biasanya karena salah satu dari ini:

| Gejala | Penyebab biasanya |
|---|---|
| Muncul website skrining TB | Blok lama masih `default_server` atau `server_name _` |
| Muncul halaman "Welcome to nginx" | Berkas `sites-enabled/default` masih aktif |
| 404 | `root` salah, atau `index.html` tidak ada di folder itu |
| 403 | Izin berkas; jalankan lagi perintah `chown`/`chmod` di Langkah 2 |
| Masih lama padahal sudah benar | Cache browser atau DNS — coba mode penyamaran / `ipconfig /flushdns` |

---

## Memperbarui isi website nanti

```bash
cd /var/www/ultah24
sudo git pull
```

Tidak perlu reload Nginx — berkas statis langsung terbaca.

---

## Catatan soal hitung mundur

Hitung mundur mengambil waktu dari header `Date` balasan server. Nginx mengirim
header itu secara bawaan, jadi tidak ada yang perlu diatur. Pastikan jam VPS benar:

```bash
timedatectl
```

Kalau melenceng:

```bash
sudo timedatectl set-ntp true
```

---

## Kalau pakai Apache

Konsepnya sama, istilahnya saja yang beda: `VirtualHost` + `ServerName`.

```bash
sudo nano /etc/apache2/sites-available/ultah24.conf
```

```apache
<VirtualHost *:80>
    ServerName ikhvara.my.id
    ServerAlias www.ikhvara.my.id
    DocumentRoot /var/www/ultah24

    <Directory /var/www/ultah24>
        Options -Indexes +FollowSymLinks
        AllowOverride None
        Require all granted
    </Directory>

    ErrorLog  ${APACHE_LOG_DIR}/ultah24.error.log
    CustomLog ${APACHE_LOG_DIR}/ultah24.access.log combined
</VirtualHost>
```

```bash
sudo a2ensite ultah24
sudo apache2ctl configtest
sudo systemctl reload apache2
sudo certbot --apache -d ikhvara.my.id -d www.ikhvara.my.id
```

Di Apache, VirtualHost **pertama** yang ter-load jadi penangkap bawaan. Kalau domain
baru nyasar ke website lama, cek urutannya dengan:

```bash
sudo apache2ctl -S
```
