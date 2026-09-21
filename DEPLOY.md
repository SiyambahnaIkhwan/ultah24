# Pasang di VPS yang sudah menjalankan SkriningTB

VPS ini menjalankan SkriningTB dengan Docker, dan **Caddy** yang memegang port 80 dan
443. Jadi website ulang tahun tidak dipasang sebagai server baru — ia **menumpang di
Caddy yang sudah ada**, cukup ditambah satu blok situs.

| Domain | Dilayani oleh | Status |
|---|---|---|
| `skriningtb.my.id` | Caddy → container `app` (Laravel) | sudah jalan |
| `ikhvara.my.id` | Caddy → berkas statis di disk | yang akan ditambahkan |

> **Jangan memasang Nginx atau Apache di VPS ini.** Keduanya akan berebut port 80/443
> dengan container Caddy. Yang gagal start bisa Caddy-nya, dan SkriningTB ikut mati.

Blok Caddy di panduan ini sudah diuji dengan `caddy validate` (kedua versi, biasa dan
Cloudflare) dan dijalankan sungguhan memakai `caddy:2-alpine` untuk memastikan berkas
website benar-benar tersaji beserta header cache-nya.

---

## Kenapa muncul "sent an invalid response"

Isi `docker/prod/Caddyfile` sekarang cuma satu blok:

```
{$APP_DOMAIN} { … }     # = skriningtb.my.id
```

Waktu browser membuka `https://ikhvara.my.id`, Caddy menerima jabat tangan TLS dengan
nama itu, tidak menemukan situs yang cocok, lalu memutus sambungan. Browser
menampilkannya sebagai **ERR_SSL_PROTOCOL_ERROR** / *"sent an invalid response"*.

Artinya DNS-nya justru **sudah benar** — permintaannya sampai ke VPS. Yang kurang cuma
blok situs untuk domain itu.

Memastikannya dari komputer sendiri:

```bash
openssl s_client -connect ikhvara.my.id:443 -servername ikhvara.my.id < /dev/null
```

Kalau balasannya `no application protocol` / `handshake failure` / putus begitu saja,
memang inilah penyebabnya.

---

## Langkah 0 — Kumpulkan dulu keadaan sekarang

Di VPS, masuk ke folder project SkriningTB:

```bash
cd ~/skriningtb
```

**a. Caddyfile mana yang sedang dipakai** (biasa atau versi Cloudflare):

```bash
docker inspect $(docker compose -f docker-compose.prod.yml ps -q caddy) \
  --format '{{range .Mounts}}{{.Source}} -> {{.Destination}}{{"\n"}}{{end}}'
```

Lihat berkas mana yang dipetakan ke `/etc/caddy/Caddyfile`:
`Caddyfile` (Let's Encrypt) atau `Caddyfile.cloudflare` (Origin Certificate).

**b. Firewall dikunci ke Cloudflare atau tidak:**

```bash
sudo ufw status
```

Kalau port 80/443 hanya diizinkan dari rentang IP Cloudflare, `ikhvara.my.id` **wajib**
lewat Cloudflare juga — kalau tidak, permintaannya akan diblokir firewall.

**c. `ikhvara.my.id` sekarang mengarah ke mana:**

```bash
nslookup ikhvara.my.id
```

IP `104.x` / `172.6x.x` berarti sudah diproksi Cloudflare. IP VPS langsung berarti
DNS-only.

---

## Pilih jalurnya

**Jalur A — `ikhvara.my.id` ikut lewat Cloudflare (dianjurkan)**

Ini yang sejalan dengan susunan sekarang. IP VPS tetap tersembunyi, firewall tidak
perlu diubah, dan tidak bergantung pada port 80 untuk sertifikat.

**Jalur B — `ikhvara.my.id` langsung ke VPS (DNS only)**

Lebih sedikit langkah, tapi ada konsekuensi yang perlu kamu tahu: **IP VPS jadi
terekspos**. SkriningTB sengaja disembunyikan di balik Cloudflare; begitu ada domain
lain yang menunjuk IP aslinya, siapa pun bisa menemukan alamat origin SkriningTB dari
situ. Dan kalau firewall sudah dikunci ke IP Cloudflare (Langkah 0b), jalur ini tidak
akan jalan sama sekali.

Kalau ragu, pilih **Jalur A**.

---

## Langkah 1 — DNS

### Jalur A (lewat Cloudflare)

1. Tambahkan `ikhvara.my.id` sebagai site baru di Cloudflare, ikuti proses ganti
   nameserver di tempat kamu beli domain.
2. Buat record — **ikon awan harus oranye (Proxied)**:

   | Type | Name | Content | Proxy |
   |---|---|---|---|
   | A | `@` | IP VPS | Proxied (oranye) |
   | A | `www` | IP VPS | Proxied (oranye) |

3. **SSL/TLS → Overview → Full (Strict)**.
4. **SSL/TLS → Origin Server → Create Certificate** untuk zona `ikhvara.my.id`.
   Simpan *Origin Certificate* dan *Private Key* — dipakai di Langkah 4.

   > Origin Certificate milik `skriningtb.my.id` **tidak** berlaku untuk
   > `ikhvara.my.id`. Zona berbeda, sertifikatnya harus baru.

### Jalur B (langsung)

| Type | Name | Content |
|---|---|---|
| A | `@` | IP VPS |
| A | `www` | IP VPS |

Pastikan port 80 terbuka untuk umum, karena Caddy memakainya untuk tantangan
Let's Encrypt.

---

## Langkah 2 — Taruh berkas website di VPS

```bash
cd ~
git clone https://github.com/SiyambahnaIkhwan/ultah24.git
```

Repo-nya privat, jadi pakai deploy key seperti waktu memasang SkriningTB. VPS sudah
punya `~/.ssh/id_ed25519`, tapi kunci itu terdaftar untuk repo `skriningtb` saja —
satu deploy key hanya bisa dipakai satu repo. Buat kunci kedua:

```bash
ssh-keygen -t ed25519 -C "vps-ultah24" -f ~/.ssh/id_ultah24 -N ""
cat ~/.ssh/id_ultah24.pub
```

Tempel isinya ke GitHub: repo `ultah24` → **Settings → Deploy keys → Add deploy key**,
judul `VPS produksi`, **"Allow write access" jangan dicentang**.

Daftarkan kuncinya lalu clone:

```bash
printf 'Host github-ultah24\n  HostName github.com\n  User git\n  IdentityFile ~/.ssh/id_ultah24\n' >> ~/.ssh/config
git clone github-ultah24:SiyambahnaIkhwan/ultah24.git ~/ultah24
```

Pastikan berkasnya ada:

```bash
ls ~/ultah24/index.html ~/ultah24/assets/img | head
```

---

## Langkah 3 — Sambungkan foldernya ke container Caddy

Container Caddy belum bisa melihat folder itu. Tambahkan lewat berkas override baru,
supaya `docker-compose.prod.yml` yang sudah jalan tidak perlu diubah:

```bash
cd ~/skriningtb
```

```bash
cat > docker-compose.ultah.yml <<'EOF'
# Menyambungkan folder website ulang tahun ke container Caddy.
# Jalankan bersama berkas compose yang lain.
services:
  caddy:
    volumes:
      - /home/deploy/ultah24:/srv/ultah24:ro
EOF
```

> Sesuaikan `/home/deploy/ultah24` kalau nama penggunamu bukan `deploy`.
> Cek dengan `echo $HOME`. Harus jalur absolut, bukan `~`.

---

## Langkah 4 — Tambahkan blok situs di Caddyfile

Berkasnya ada di repo SkriningTB, jadi sebaiknya diubah **dari komputer sendiri lalu
di-push**, supaya tidak hilang saat `git pull` berikutnya.

Buka berkas yang tadi ketahuan sedang dipakai di Langkah 0a.

### Kalau yang dipakai `docker/prod/Caddyfile` (Let's Encrypt — Jalur B)

Tambahkan blok ini **di bawah** blok `{$APP_DOMAIN}` yang sudah ada:

```
ikhvara.my.id, www.ikhvara.my.id {
	encode gzip

	root * /srv/ultah24
	file_server

	@aset path *.jpg *.jpeg *.png *.gif *.webp *.svg *.ico *.woff *.woff2
	header @aset Cache-Control "public, max-age=2592000, immutable"

	@halaman path *.html *.css *.js /
	header @halaman Cache-Control "public, max-age=600, must-revalidate"

	header {
		X-Content-Type-Options "nosniff"
		Referrer-Policy "same-origin"
		-Server
	}
}
```

### Kalau yang dipakai `docker/prod/Caddyfile.cloudflare` (Jalur A)

Sama, hanya ditambah baris `tls` yang menunjuk sertifikat origin **milik zona
ikhvara.my.id**:

```
ikhvara.my.id, www.ikhvara.my.id {
	tls /etc/caddy/certs/ikhvara.pem /etc/caddy/certs/ikhvara.key

	encode gzip

	root * /srv/ultah24
	file_server

	@aset path *.jpg *.jpeg *.png *.gif *.webp *.svg *.ico *.woff *.woff2
	header @aset Cache-Control "public, max-age=2592000, immutable"

	@halaman path *.html *.css *.js /
	header @halaman Cache-Control "public, max-age=600, must-revalidate"

	header {
		X-Content-Type-Options "nosniff"
		Referrer-Policy "same-origin"
		-Server
	}
}
```

Lalu simpan sertifikat dari Langkah 1 di VPS:

```bash
cd ~/skriningtb
nano docker/prod/certs/ikhvara.pem    # tempel Origin Certificate
nano docker/prod/certs/ikhvara.key    # tempel Private Key
chmod 600 docker/prod/certs/ikhvara.key
```

Folder `docker/prod/certs` sudah masuk `.gitignore`, jadi kunci privatnya tidak akan
ikut ter-commit. Biarkan begitu.

Setelah blok ditambahkan dan di-push dari komputer:

```bash
cd ~/skriningtb && git pull
```

---

## Langkah 5 — Periksa sintaks dulu, baru jalankan ulang

**Lakukan ini sebelum menyentuh container.** Caddy yang sedang jalan memakai konfigurasi
yang sudah ada di memorinya, sementara berkas di disk sudah berubah oleh `git pull`.
Jadi perintah di bawah memeriksa berkas **baru** tanpa mengganggu yang sedang melayani:

```bash
cd ~/skriningtb
docker compose -f docker-compose.prod.yml exec caddy \
  caddy validate --config /etc/caddy/Caddyfile
```

Harus muncul `Valid configuration` di baris terakhir. Kalau ada pesan `Error:`,
perbaiki dulu tulisan di Caddyfile — **jangan lanjut**. Salah ketik satu tanda kurung
saja membuat Caddy gagal start, dan SkriningTB ikut tidak bisa diakses.

Dua peringatan ini **normal** dan memang sudah ada sejak awal, bukan dari blok baru:

```
warn  Unnecessary header_up X-Forwarded-Proto: ...
warn  Unnecessary header_up X-Forwarded-For: ...
```

Kalau muncul `open /etc/caddy/certs/ikhvara.pem: no such file or directory`, berarti
sertifikat origin di Langkah 4 belum disimpan — `validate` memang ikut memeriksa
keberadaan berkas sertifikatnya.

Setelah valid, pakai rangkaian `-f` yang sama seperti biasanya, **ditambah** berkas
baru tadi.

Jalur A (Cloudflare):

```bash
cd ~/skriningtb
docker compose \
  -f docker-compose.prod.yml \
  -f docker-compose.cloudflare.yml \
  -f docker-compose.ultah.yml \
  up -d
```

Jalur B (Let's Encrypt):

```bash
cd ~/skriningtb
docker compose \
  -f docker-compose.prod.yml \
  -f docker-compose.ultah.yml \
  up -d
```

Tidak perlu `--build` — yang berubah cuma Caddy, bukan image aplikasi. SkriningTB tidak
ikut dibangun ulang dan praktis tidak terganggu.

Pantau Caddy:

```bash
docker compose -f docker-compose.prod.yml logs -f caddy
```

Di Jalur B, tunggu baris `certificate obtained successfully` untuk `ikhvara.my.id`.

---

## Langkah 6 — Verifikasi

```bash
curl -I https://ikhvara.my.id/
curl -I https://skriningtb.my.id/login
```

Keduanya harus `200`. Balasan `ikhvara.my.id` tidak boleh mengandung tanda-tanda
Laravel seperti `Set-Cookie: XSRF-TOKEN`.

Daftar periksa:

- [ ] `https://ikhvara.my.id` terbuka, gembok hijau, tanpa peringatan
- [ ] `https://www.ikhvara.my.id` juga terbuka
- [ ] `http://ikhvara.my.id` otomatis dialihkan ke `https://`
- [ ] Foto-fotonya muncul (bukan kotak kosong)
- [ ] **`https://skriningtb.my.id` masih normal dan bisa login**

---

## Kalau masih bermasalah

| Gejala | Penyebab biasanya |
|---|---|
| Masih "invalid response" / ERR_SSL_PROTOCOL_ERROR | Blok situs belum termuat — Caddyfile belum ter-`git pull`, atau lupa `-f docker-compose.ultah.yml` |
| Error 521 dari Cloudflare | Firewall memblokir, atau container Caddy mati |
| Error 526 dari Cloudflare | Mode SSL bukan Full (Strict), atau sertifikat origin salah zona |
| 404 di semua halaman | Volume tidak tersambung — cek jalur absolut di `docker-compose.ultah.yml` |
| Halaman tampil tapi foto kosong | Folder `assets/img` tidak ikut ter-clone |
| Caddy gagal start, SkriningTB ikut mati | Salah tulis di Caddyfile — lihat `docker compose logs caddy`, perbaiki, jalankan lagi |
| Let's Encrypt gagal (Jalur B) | Port 80 tertutup, atau DNS belum menunjuk VPS |

Cek isi konfigurasi yang benar-benar dibaca Caddy:

```bash
docker compose -f docker-compose.prod.yml exec caddy cat /etc/caddy/Caddyfile
```

Cek folder websitenya benar-benar terlihat dari dalam container:

```bash
docker compose -f docker-compose.prod.yml exec caddy ls /srv/ultah24
```

Kalau Caddy menolak start karena salah ketik, SkriningTB ikut tidak bisa diakses.
Kembalikan Caddyfile ke keadaan semula lalu jalankan lagi perintah di Langkah 5 —
container `app` dan `db` tidak tersentuh, data aman.

---

## Memperbarui isi website nanti

```bash
cd ~/ultah24 && git pull
```

Selesai. Tidak perlu menyentuh Docker sama sekali — Caddy membaca berkasnya langsung
dari disk. Kalau perubahan belum kelihatan di browser, tunggu 10 menit (sesuai
`Cache-Control`) atau muat ulang paksa dengan Ctrl+F5.

Kalau `ikhvara.my.id` diproksi Cloudflare, bersihkan juga cache-nya:
**Cloudflare → Caching → Configuration → Purge Everything**.

---

## Hal yang tidak boleh dilakukan

- **Jangan** memasang Nginx/Apache di host — bentrok port dengan Caddy.
- **Jangan** menambahkan `-v` pada `docker compose down` — itu menghapus volume
  `dbdata` dan `appstorage`, berarti seluruh data pasien dan foto rontgen hilang.
- **Jangan** mengubah blok `{$APP_DOMAIN}`, `reverse_proxy app:80`, atau
  `header_up X-Forwarded-For` milik SkriningTB. Blok baru ditambahkan **di bawahnya**,
  bukan menggantikannya.
- **Jangan** membuka port 80/443 untuk umum kalau firewall sudah dikunci ke IP
  Cloudflare — itu membatalkan perlindungan pembatas laju skrining mandiri, karena
  header `CF-Connecting-IP` jadi bisa dipalsukan siapa saja.

---

## Catatan soal hitung mundur

Hitung mundur mengambil waktu dari header `Date` balasan server, bukan jam HP
pengunjung. Caddy mengirimnya secara bawaan. Pastikan jam VPS benar:

```bash
timedatectl
```

Kalau melenceng:

```bash
sudo timedatectl set-ntp true
```

Zona waktu VPS tidak harus WIB — yang dibandingkan adalah waktu UTC, dan tanggal
targetnya sudah lengkap dengan `+07:00` di `assets/js/data.js`.
