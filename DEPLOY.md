# Pasang di VPS yang sudah menjalankan SkriningTB

VPS ini menjalankan SkriningTB dengan Docker, dan **Caddy** yang memegang port 80 dan
443. Jadi website ulang tahun tidak dipasang sebagai server baru — ia **menumpang di
Caddy yang sudah ada**, cukup ditambah satu blok situs.

| Domain | Dilayani oleh | Status |
|---|---|---|
| `skriningtb.my.id` | Caddy → container `app` (Laravel) | sudah jalan |
| `ikhvara.my.id` | Caddy → berkas statis di disk | yang akan ditambahkan |

Sertifikat HTTPS diterbitkan sendiri oleh **Caddy lewat Let's Encrypt**, otomatis,
tanpa perlu menyiapkan apa pun di Cloudflare.

> **Jangan memasang Nginx atau Apache di VPS ini.** Keduanya akan berebut port 80/443
> dengan container Caddy. Yang gagal start bisa Caddy-nya, dan SkriningTB ikut mati.

Blok Caddy di panduan ini sudah diuji dengan `caddy validate` dan dijalankan sungguhan
memakai `caddy:2-alpine` untuk memastikan berkas website benar-benar tersaji beserta
header cache-nya.

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

Kalau balasannya `handshake failure` atau putus begitu saja, memang inilah penyebabnya.

---

## Langkah 0 — Periksa dulu keadaan sekarang

Di VPS, masuk ke folder project SkriningTB:

```bash
cd ~/skriningtb
```

**a. Pastikan yang dipakai memang Caddyfile biasa** (bukan versi Cloudflare):

```bash
docker inspect $(docker compose -f docker-compose.prod.yml ps -q caddy) \
  --format '{{range .Mounts}}{{.Source}} -> {{.Destination}}{{"\n"}}{{end}}'
```

Yang dipetakan ke `/etc/caddy/Caddyfile` seharusnya `docker/prod/Caddyfile`.
Kalau ternyata `Caddyfile.cloudflare`, lompat ke
[Kalau memakai Cloudflare Origin Certificate](#kalau-memakai-cloudflare-origin-certificate)
di bagian akhir.

**b. Port 80 terbuka atau tidak** — Let's Encrypt membutuhkannya:

```bash
sudo ufw status
```

Harus ada `80/tcp ALLOW`. Kalau port 80 hanya diizinkan dari rentang IP Cloudflare,
berarti `ikhvara.my.id` juga harus diproksi Cloudflare supaya tantangan sertifikatnya
bisa lewat.

**c. `ikhvara.my.id` mengarah ke mana:**

```bash
nslookup ikhvara.my.id
```

Harus menghasilkan IP VPS ini (atau IP Cloudflare `104.x`/`172.6x.x` kalau diproksi).

---

## Langkah 1 — DNS

| Type | Name | Content |
|---|---|---|
| A | `@` | IP VPS |
| A | `www` | IP VPS |

Kalau domainnya kamu taruh di Cloudflare dan awannya **oranye** (Proxied), tambahkan
dua syarat ini supaya Let's Encrypt tetap bisa jalan:

- **SSL/TLS → Full (Strict)**. Jangan *Flexible* — mode itu membuat Cloudflare
  menghubungi VPS lewat HTTP polos dan biasanya menghasilkan redirect berulang.
- Port 80 tetap harus bisa dihubungi Cloudflare. Path
  `/.well-known/acme-challenge/` otomatis dikecualikan Cloudflare dari
  "Always Use HTTPS", jadi tantangannya lolos.

Kalau awannya abu-abu (DNS only), cukup pastikan port 80 terbuka untuk umum.

> Catatan: kalau `skriningtb.my.id` kamu proksi lewat Cloudflare tapi `ikhvara.my.id`
> tidak, IP asli VPS jadi terlihat dari `ikhvara.my.id` — dan itu membatalkan
> penyembunyian IP untuk SkriningTB. Samakan perlakuannya untuk kedua domain.

Tunggu sampai DNS benar-benar menyebar sebelum lanjut, kalau tidak penerbitan
sertifikatnya gagal.

---

## Langkah 2 — Taruh berkas website di VPS

Repo `ultah24` privat, jadi butuh deploy key. VPS sudah punya `~/.ssh/id_ed25519`,
tapi kunci itu terdaftar untuk repo `skriningtb` saja — **satu deploy key hanya bisa
dipakai satu repo**. Buat kunci kedua:

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
ls ~/ultah24/index.html && ls ~/ultah24/assets/img | head -3
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
# Jalankan bersama docker-compose.prod.yml.
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

Buka `docker/prod/Caddyfile`, lalu tambahkan blok ini **di bawah** blok
`{$APP_DOMAIN}` yang sudah ada — jangan menggantikannya:

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

Tidak ada baris `tls` — itu memang disengaja. Tanpa baris itu Caddy otomatis mengurus
sertifikat Let's Encrypt sendiri, termasuk perpanjangannya, dan otomatis mengalihkan
`http://` ke `https://`.

Setelah di-push dari komputer:

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

Setelah valid, jalankan:

```bash
docker compose \
  -f docker-compose.prod.yml \
  -f docker-compose.ultah.yml \
  up -d
```

Tidak perlu `--build` — yang berubah cuma Caddy, bukan image aplikasi. SkriningTB tidak
ikut dibangun ulang.

Pantau penerbitan sertifikatnya:

```bash
docker compose -f docker-compose.prod.yml logs -f caddy
```

Tunggu baris `certificate obtained successfully` untuk `ikhvara.my.id`. Biasanya
beberapa detik sampai satu menit.

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
| Log Caddy: `could not get certificate` | Port 80 tertutup, atau DNS belum menunjuk ke VPS |
| Log Caddy: `too many failed authorizations` | Batas percobaan Let's Encrypt — tunggu sekitar satu jam, jangan diulang-ulang |
| 404 di semua halaman | Volume tidak tersambung — cek jalur absolut di `docker-compose.ultah.yml` |
| Halaman tampil tapi foto kosong | Folder `assets/img` tidak ikut ter-clone |
| Redirect berulang (ERR_TOO_MANY_REDIRECTS) | Mode SSL Cloudflare masih *Flexible*, ganti ke Full (Strict) |
| Caddy gagal start, SkriningTB ikut mati | Salah tulis di Caddyfile — lihat `docker compose logs caddy`, perbaiki, jalankan lagi |

Cek isi konfigurasi yang benar-benar dibaca Caddy:

```bash
docker compose -f docker-compose.prod.yml exec caddy cat /etc/caddy/Caddyfile
```

Cek folder websitenya terlihat dari dalam container:

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

Kalau domainnya diproksi Cloudflare, bersihkan juga cache-nya:
**Cloudflare → Caching → Configuration → Purge Everything**.

---

## Hal yang tidak boleh dilakukan

- **Jangan** memasang Nginx/Apache di host — bentrok port dengan Caddy.
- **Jangan** menambahkan `-v` pada `docker compose down` — itu menghapus volume
  `dbdata` dan `appstorage`, berarti seluruh data pasien dan foto rontgen hilang.
- **Jangan** mengubah blok `{$APP_DOMAIN}`, `reverse_proxy app:80`, atau
  `header_up X-Forwarded-For` milik SkriningTB. Blok baru ditambahkan **di bawahnya**.
- **Jangan** menutup port 80 setelah sertifikat terbit — Caddy memakainya lagi saat
  memperpanjang sertifikat tiap 60 hari.

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

---

## Kalau memakai Cloudflare Origin Certificate

Bagian ini **hanya** berlaku kalau Langkah 0a menunjukkan yang terpasang adalah
`docker/prod/Caddyfile.cloudflare`. Kalau tidak, lewati saja.

Pada mode itu Caddy tidak menerbitkan sertifikat sendiri, jadi blok situsnya butuh
baris `tls`. Sertifikat origin bersifat per-zona: **milik `skriningtb.my.id` tidak
berlaku untuk `ikhvara.my.id`**, harus menerbitkan yang baru di
**Cloudflare → SSL/TLS → Origin Server → Create Certificate** untuk zona
`ikhvara.my.id`.

Simpan di VPS:

```bash
cd ~/skriningtb
nano docker/prod/certs/ikhvara.pem    # tempel Origin Certificate
nano docker/prod/certs/ikhvara.key    # tempel Private Key
chmod 600 docker/prod/certs/ikhvara.key
```

Blok situsnya sama persis seperti Langkah 4, hanya ditambah satu baris di paling atas:

```
	tls /etc/caddy/certs/ikhvara.pem /etc/caddy/certs/ikhvara.key
```

Lalu jalankan dengan ketiga berkas compose:

```bash
docker compose \
  -f docker-compose.prod.yml \
  -f docker-compose.cloudflare.yml \
  -f docker-compose.ultah.yml \
  up -d
```

Pada mode ini `caddy validate` ikut memeriksa keberadaan berkas sertifikat — kalau
muncul `open /etc/caddy/certs/ikhvara.pem: no such file or directory`, berarti
sertifikatnya belum disimpan.
