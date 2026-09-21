# Pasang di VPS (dua domain, satu VPS)

Panduan ini untuk menambahkan website ulang tahun ke VPS yang **sudah** melayani
website skrining TB, tanpa mengganggu yang sudah jalan.

| Domain | Website | Status |
|---|---|---|
| `skriningtb.my.id` | Skrining TB (Laravel) | sudah jalan — **jangan diubah**, cukup dicek |
| `ikhvara.my.id` | Ulang tahun (statis) | yang akan dipasang |

> Panduan ini mengasumsikan **Ubuntu/Debian + Nginx**. Kalau VPS-mu pakai Apache,
> lompat ke bagian [Kalau pakai Apache](#kalau-pakai-apache).

---

## Kenapa domain baru bisa nyasar ke website lama

Nginx memilih website dengan mencocokkan domain pada permintaan ke `server_name`
di tiap blok `server { … }`. Kalau **tidak ada** yang cocok, permintaannya dilempar
ke blok yang bertanda `default_server` — dan kalau blok skrining TB kebetulan
memegang tanda itu, `ikhvara.my.id` akan mendarat di website skrining TB.

Karena itu Langkah 0 dan Langkah 4 di bawah sama pentingnya dengan memasang
berkasnya sendiri.

---

## Langkah 0 — Lihat dulu keadaan sekarang

Masuk ke VPS, lalu:

```bash
ls -l /etc/nginx/sites-enabled/
```

```bash
sudo nginx -T | grep -nE 'server_name|listen|root'
```

Perhatikan apakah ada baris `default_server` atau `server_name _;`. Catat juga nama
berkas konfigurasi milik skrining TB — nanti dipakai di Langkah 4.

---

## Langkah 1 — Arahkan DNS `ikhvara.my.id`

Di panel pengelola domain `ikhvara.my.id`, buat dua record
(ganti `123.45.67.89` dengan IP VPS-mu — IP yang sama dengan skriningtb.my.id):

| Type | Name | Value |
|---|---|---|
| A | `@` | `123.45.67.89` |
| A | `www` | `123.45.67.89` |

Cek dari komputer sendiri sampai IP-nya muncul benar:

```bash
nslookup ikhvara.my.id
```

Tunggu sampai ini benar dulu sebelum menjalankan certbot di Langkah 6, kalau tidak
penerbitan sertifikatnya akan gagal.

---

## Langkah 2 — Taruh berkasnya di VPS

```bash
sudo git clone https://github.com/SiyambahnaIkhwan/ultah24.git /var/www/ultah24
sudo chown -R www-data:www-data /var/www/ultah24
sudo chmod -R 755 /var/www/ultah24
```

Repo `ultah24` privat, jadi `git clone` akan meminta kredensial. Dua cara:

**Cara A — deploy key (sekali atur, seterusnya `git pull` lancar)**

```bash
ssh-keygen -t ed25519 -f ~/.ssh/ultah24 -N ""
cat ~/.ssh/ultah24.pub
```

Salin isinya ke GitHub: repo `ultah24` → Settings → Deploy keys → Add deploy key
(cukup akses baca). Lalu:

```bash
printf 'Host github-ultah24\n  HostName github.com\n  User git\n  IdentityFile ~/.ssh/ultah24\n' >> ~/.ssh/config
sudo git clone github-ultah24:SiyambahnaIkhwan/ultah24.git /var/www/ultah24
```

**Cara B — unggah manual dari komputer sendiri**

```bash
scp -r C:/Code/Ultah/index.html C:/Code/Ultah/assets user@123.45.67.89:/tmp/ultah24/
```

lalu di VPS: `sudo mv /tmp/ultah24 /var/www/ultah24` dan jalankan `chown`/`chmod` di atas.

Pastikan `index.html` benar-benar ada di akar folder:

```bash
ls /var/www/ultah24/index.html
```

---

## Langkah 3 — Blok Nginx untuk `ikhvara.my.id`

```bash
sudo nano /etc/nginx/sites-available/ikhvara
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

    # foto & font boleh disimpan lama di browser
    location ~* \.(jpg|jpeg|png|gif|webp|svg|ico|woff2?)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # halaman, gaya, dan skrip jangan lama-lama, supaya perubahan cepat kelihatan
    location ~* \.(html|css|js)$ {
        expires 10m;
        add_header Cache-Control "public, must-revalidate";
    }

    gzip on;
    gzip_types text/css application/javascript image/svg+xml;

    access_log /var/log/nginx/ikhvara.access.log;
    error_log  /var/log/nginx/ikhvara.error.log;
}
```

Aktifkan:

```bash
sudo ln -s /etc/nginx/sites-available/ikhvara /etc/nginx/sites-enabled/
```

---

## Langkah 4 — Cek blok skrining TB (tanpa mengubah cara kerjanya)

Buka konfigurasi skrining TB (nama berkasnya dari Langkah 0):

```bash
sudo nano /etc/nginx/sites-enabled/skriningtb
```

**Jangan sentuh** bagian `root`, `location ~ \.php`, atau `fastcgi_pass` — itu yang
membuat Laravel jalan. Cukup pastikan dua hal:

1. `server_name` menyebut domainnya secara jelas:

   ```nginx
   server_name skriningtb.my.id www.skriningtb.my.id;   # BENAR
   # server_name _;                                     # SALAH — menyerobot semua domain
   ```

2. Tidak ada `default_server`:

   ```nginx
   listen 80 default_server;        # ← buang kata "default_server"
   listen 443 ssl default_server;   # ← ini juga
   ```

   menjadi:

   ```nginx
   listen 80;
   listen 443 ssl;
   ```

Kalau berkas bawaan Nginx masih aktif dan tidak dipakai, nonaktifkan:

```bash
sudo rm /etc/nginx/sites-enabled/default
```

### (Opsional) Penangkap domain tak dikenal

Supaya domain asing yang diarahkan orang ke IP VPS-mu tidak masuk ke website mana pun:

```bash
sudo tee /etc/nginx/sites-available/00-catchall > /dev/null <<'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    return 444;
}
EOF
sudo ln -s /etc/nginx/sites-available/00-catchall /etc/nginx/sites-enabled/
```

---

## Langkah 5 — Uji lalu muat ulang

```bash
sudo nginx -t
sudo systemctl reload nginx
```

`nginx -t` harus menjawab *syntax is ok* dan *test is successful*. Kalau muncul
**conflicting server name**, berarti ada dua blok memakai domain yang sama —
perbaiki dulu, jangan di-reload.

`reload` tidak memutus koneksi, jadi website skrining TB tidak akan mati sedetik pun.

---

## Langkah 6 — HTTPS untuk `ikhvara.my.id`

Skrining TB sudah punya sertifikatnya sendiri; perintah ini membuat sertifikat
terpisah dan tidak mengganggunya.

```bash
sudo certbot --nginx -d ikhvara.my.id -d www.ikhvara.my.id
```

Kalau certbot belum terpasang:

```bash
sudo apt install certbot python3-certbot-nginx -y
```

Cek daftar sertifikat dan uji perpanjangan otomatis:

```bash
sudo certbot certificates
sudo certbot renew --dry-run
```

---

## Memastikan sudah benar

Tanya langsung ke Nginx dari dalam VPS, per domain:

```bash
curl -I -H 'Host: ikhvara.my.id'    http://127.0.0.1/
curl -I -H 'Host: skriningtb.my.id' http://127.0.0.1/
```

Keduanya harus `200`, dan yang pertama tidak boleh memunculkan tanda-tanda Laravel
(misalnya header `Set-Cookie: XSRF-TOKEN`).

Lihat log mana yang terisi saat domainnya dibuka dari HP:

```bash
sudo tail -f /var/log/nginx/ikhvara.access.log
```

Lalu buka `https://ikhvara.my.id` di browser.

| Gejala | Penyebab biasanya |
|---|---|
| Muncul website skrining TB | Blok skriningtb masih `default_server` atau `server_name _` (Langkah 4) |
| Muncul "Welcome to nginx" | `sites-enabled/default` masih aktif |
| 404 | `root` salah, atau `index.html` tidak ada di `/var/www/ultah24` |
| 403 Forbidden | Izin berkas — ulangi `chown`/`chmod` di Langkah 2 |
| Foto tidak muncul, halaman tampil | Folder `assets/img` tidak ikut terunggah |
| Certbot gagal | DNS `ikhvara.my.id` belum mengarah ke IP VPS (Langkah 1) |
| Sudah benar tapi masih lama | Cache browser/DNS — coba mode penyamaran atau `ipconfig /flushdns` |

---

## Memperbarui isi website nanti

```bash
cd /var/www/ultah24
sudo git pull
```

Tidak perlu reload Nginx — berkas statis langsung terbaca. Kalau perubahan belum
kelihatan di browser, tunggu 10 menit (sesuai `expires` untuk html/css/js) atau
muat ulang paksa dengan Ctrl+F5.

---

## Catatan soal hitung mundur

Hitung mundur mengambil waktu dari header `Date` balasan server, bukan jam HP
pengunjung. Nginx mengirim header itu secara bawaan, jadi tidak ada yang perlu
diatur — tapi pastikan jam VPS benar:

```bash
timedatectl
```

Kalau melenceng:

```bash
sudo timedatectl set-ntp true
```

Zona waktu VPS tidak harus WIB; yang dipakai adalah waktu UTC dari header, dan
tanggal targetnya sudah tertulis lengkap dengan `+07:00` di `assets/js/data.js`.

---

## Kalau pakai Apache

Konsepnya sama, istilahnya saja yang beda: `VirtualHost` + `ServerName`.

```bash
sudo nano /etc/apache2/sites-available/ikhvara.conf
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

    ErrorLog  ${APACHE_LOG_DIR}/ikhvara.error.log
    CustomLog ${APACHE_LOG_DIR}/ikhvara.access.log combined
</VirtualHost>
```

```bash
sudo a2ensite ikhvara
sudo apache2ctl configtest
sudo systemctl reload apache2
sudo certbot --apache -d ikhvara.my.id -d www.ikhvara.my.id
```

Di Apache, VirtualHost **pertama** yang ter-load menjadi penangkap bawaan. Kalau
`ikhvara.my.id` nyasar ke skrining TB, periksa urutannya:

```bash
sudo apache2ctl -S
```

Baris `default server` di keluaran itu menunjukkan siapa yang jadi penangkap.
