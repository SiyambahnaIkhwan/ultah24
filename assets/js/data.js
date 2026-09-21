/* =========================================================================
   data.js — SEMUA TEKS & FOTO DIATUR DI SINI
   Ubah file ini kalau mau ganti kata-kata, caption, atau urutan foto.
   ========================================================================= */

window.SITE = {

  /* --- Identitas -------------------------------------------------------- */
  nama: 'Vanessa Aurora',
  panggilan: 'Vanessa',
  usia: 24,
  dariSiapa: 'Ikhwan',

  /* --- Kapan website boleh dibuka --------------------------------------- */
  /* Format ISO + zona waktu. +07:00 = WIB. */
  bukaPada: '2026-09-23T00:00:00+07:00',

  /* Sakelar untuk mematikan hitung mundur sementara, supaya isi website
     bisa dicek sebelum tanggalnya.
     PENTING: kembalikan ke false sebelum 23 September, kalau tidak
     websitenya sudah terbuka duluan dan kejutannya hilang. */
  matikanHitungMundur: true,

  /* --- Layar countdown (sebelum waktunya) ------------------------------- */
  gate: {
    untuk: 'Untuk Vanessa Aurora',
    judul: 'Belum Waktunya',
    sub: 'Ada sesuatu yang sedang disiapkan untukmu.',
    catatan: 'Halaman ini akan terbuka sendiri, tepat tengah malam.'
  },

  /* --- Hero ------------------------------------------------------------- */
  hero: {
    baris1: 'Happy',
    baris2: 'Birthday',
    baris3: 'Vanessa Aurora',
    meta: '23 September &middot; 24 Tahun',
    scrollHint: 'geser ke bawah'
  },

  /* --- Ucapan pembuka --------------------------------------------------- */
  ucapan: {
    label: 'Untukmu, hari ini',
    kalimat: 'Selamat ulang tahun yang ke-24, istriku.',
    paragraf: [
      'Dua puluh empat tahun lalu dunia kedatangan seseorang yang, tanpa dia tahu, akan jadi rumah buat aku pulang.',
      'Hari ini bukan cuma soal umur yang bertambah. Ini soal syukur, karena kamu masih di sini, masih memilih aku, dan masih bikin hari-hari biasa terasa layak dirayakan.'
    ]
  },

  /* --- Section kenangan ------------------------------------------------- */
  kenangan: {
    label: 'Kenangan Kita',
    judul: 'Momen yang Tidak Mau Aku Lupakan',
    sub: 'Setiap foto punya ceritanya sendiri. Ketuk untuk melihat lebih dekat.'
  },

  /* --- Surat ------------------------------------------------------------ */
  surat: {
    label: 'Surat Untukmu',
    judul: 'Ditulis Pelan-pelan, dari Hati',
    pembuka: 'Vanessa Sayang',
    isi: [
      'surat ini kutulis untukmu, sebagai ganti diriku yang tak bisa menemanimu',
      'semoga hari-harimu dipenuhi kebahagiaan dan selalu dikelilingi oleh keberuntungan',
      'maafkan aku yang tak selalu ada dan tak selalu bisa untuk membahagiakanmu',
      'semoga hadiah kecil ini dapat mengobati lara dan membawa tawa'
    ],
    ttdLabel: 'Suamimu',
    ttd: 'Siyambahna Ikhwan'
  },

  /* --- Harapan ---------------------------------------------------------- */
  harapan: {
    label: 'Doa & Harapan',
    judul: 'Empat Hal yang Aku Titipkan ke Semesta',
    item: [
      { ikon: '❤', judul: 'Sehat selalu', teks: 'Semoga badanmu kuat, hatimu tenang, dan tidurmu nyenyak setiap malam.' },
      { ikon: '★', judul: 'Mimpi-mimpimu', teks: 'Semoga satu per satu terwujud, dan aku selalu dapat tempat di barisan paling depan.' },
      { ikon: '☕', judul: 'Hari-hari ringan', teks: 'Semoga lebih banyak tawa daripada lelah, lebih banyak syukur daripada keluh.' },
      { ikon: '∞', judul: 'Kita', teks: 'Semoga sampai tua, masih tangan yang sama yang aku genggam.' }
    ]
  },

  /* --- Penutup ---------------------------------------------------------- */
  penutup: {
    label: 'Satu Hal Terakhir',
    judul: 'Tiup Lilinnya',
    sub: 'Pejamkan mata, ucapkan permintaanmu, lalu ketuk tombolnya.',
    tombol: 'Tiup Lilin',
    setelah: 'Semoga semua yang kamu minta barusan dikabulkan.',
    salam: 'Selamat ulang tahun ke-24, Vanessa Aurora.',
    footer: 'Dibuat dengan sepenuh hati oleh Ikhwan'
  },

  /* --- Navigasi bawah --------------------------------------------------- */
  nav: [
    { id: 'ucapan', label: 'Ucapan', ikon: '❤' },
    { id: 'kenangan', label: 'Kenangan', ikon: '▣' },
    { id: 'surat', label: 'Surat', ikon: '✉' },
    { id: 'penutup', label: 'Selalu', ikon: '∞' }
  ],

  /* --- FOTO UTAMA (hero + kolase parallax) ------------------------------ */
  /* Item pertama = foto hero utama. Sisanya jadi kolase di sekelilingnya.  */
  utama: [
    { src: 'assets/img/utama-01.jpg', cap: 'Kamu, dan caramu bikin aku kehabisan kata' },
    { src: 'assets/img/utama-02.jpg', cap: 'Hari saat semua doa akhirnya terjawab' },
    { src: 'assets/img/utama-03.jpg', cap: 'Sederhana, tapi paling berkesan' },
    { src: 'assets/img/utama-08.jpg', cap: 'Malam terbaik selalu yang ada kamunya' },
    { src: 'assets/img/utama-04.jpg', cap: 'Pulang ke rumah, bareng kamu' },
    { src: 'assets/img/utama-05.jpg', cap: 'Selalu tahu cara mencuri perhatianku' },
    { src: 'assets/img/utama-07.jpg', cap: '2.868 mdpl, dan kamu tetap yang paling tinggi' },
    { src: 'assets/img/utama-06.jpg', cap: 'Wajah yang paling aku rindukan' }
  ],

  /* --- FOTO KENANGAN (galeri polaroid) ---------------------------------- */
  galeri: [
    { src: 'assets/img/kenangan-29.jpg', cap: 'Hari kita mengikat janji' },
    { src: 'assets/img/kenangan-30.jpg', cap: 'Awal dari segalanya' },
    { src: 'assets/img/kenangan-15.jpg', cap: 'Hari wisudamu, aku yang paling bangga' },
    { src: 'assets/img/kenangan-09.jpg', cap: 'Perjuanganmu yang jarang orang lihat' },
    { src: 'assets/img/kenangan-23.jpg', cap: 'Duduk berdua, memandangi Bromo' },
    { src: 'assets/img/kenangan-16.jpg', cap: 'Malam di Jogja, jalan pelan-pelan' },
    { src: 'assets/img/kenangan-02.jpg', cap: 'Sampai puncak, bareng' },
    { src: 'assets/img/kenangan-20.jpg', cap: 'Kamu dan ketangguhan yang diam-diam' },
    { src: 'assets/img/kenangan-24.jpg', cap: 'Dingin di tenda, hangat di obrolan' },
    { src: 'assets/img/kenangan-03.jpg', cap: 'Subuh di jalur pendakian' },
    { src: 'assets/img/kenangan-21.jpg', cap: 'Satu lagi puncak yang kita taklukkan' },
    { src: 'assets/img/kenangan-10.jpg', cap: 'Berhenti sebentar, menikmati pemandangan' },
    { src: 'assets/img/kenangan-27.jpg', cap: 'Capek, tapi ketawa terus' },
    { src: 'assets/img/kenangan-07.jpg', cap: 'Menyusuri hutan, tangan tidak lepas' },
    { src: 'assets/img/kenangan-11.jpg', cap: 'Sore di bukit, kota di bawah sana' },
    { src: 'assets/img/kenangan-06.jpg', cap: 'Bergandengan, seperti biasanya' },
    { src: 'assets/img/kenangan-18.jpg', cap: 'Jalan-jalan tanpa rencana' },
    { src: 'assets/img/kenangan-08.jpg', cap: 'Senyum yang tidak pernah bosan aku lihat' },
    { src: 'assets/img/kenangan-22.jpg', cap: 'Asal jepret, hasilnya paling jujur' },
    { src: 'assets/img/kenangan-25.jpg', cap: 'Sedekat ini, senyaman ini' },
    { src: 'assets/img/kenangan-13.jpg', cap: 'Malam yang panjang dan menyenangkan' },
    { src: 'assets/img/kenangan-17.jpg', cap: 'Konyol berdua, tidak peduli orang lihat' },
    { src: 'assets/img/kenangan-01.jpg', cap: 'Apa adanya, tanpa filter' },
    { src: 'assets/img/kenangan-12.jpg', cap: 'Pulang malam, masih sempat foto' },
    { src: 'assets/img/kenangan-05.jpg', cap: 'Gaya dulu sebelum jalan' },
    { src: 'assets/img/kenangan-04.jpg', cap: 'Kompakan tanpa janjian' },
    { src: 'assets/img/kenangan-26.jpg', cap: 'Dandan rapi, cantiknya keterlaluan' },
    { src: 'assets/img/kenangan-14.jpg', cap: 'Duduk tenang, menikmati hari' },
    { src: 'assets/img/kenangan-19.jpg', cap: 'Menunggu di depan rumah' },
    { src: 'assets/img/kenangan-28.jpg', cap: 'Sibuk, tapi tetap sempat senyum' }
  ]
};
