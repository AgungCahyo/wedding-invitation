export const fonts = {
  display: "Cormorant Garamond",
  body: "DM Sans",
} as const;

const image = (src: string) => `${src}?v=20260820`;

export const invitation = {
  meta: {
    title: "Agung & Tika Wedding",
    description:
      "Kami dengan bahagia mengundang Anda untuk merayakan hari istimewa kami. Pernikahan Agung Cahyo Prasetyo dan Ayu Cahya Tika.",
    url: "https://ayutika.agungcahyo.my.id",
    ogImage: "/og-image.jpg",
  },

  cover: {
    image: image("/images/gallery-1.jpg"),
    label: "THE WEDDING OF",
  },

  couple: {
    groom: {
      name: "Agung Cahyo Prasetyo",
      fullName: "Agung Cahyo Prasetyo",
      parents: ["Bp. Joko Priyono", "Ibu Surtini"],
      photo: image("/images/groom.jpg"),
      socialLinks: {
        instagram: "https://instagram.com/chyprsty__",
      },
    },
    bride: {
      name: "Ayu Cahya Tika",
      fullName: "Ayu Cahya Tika",
      parents: ["Bp. Suwarto", "Ibu Siti Mahmudah"],
      photo: image("/images/bride.jpg"),
      socialLinks: {
        instagram: "https://instagram.com/_cahyatika_",
      },
    },
  },

  wedding: {
    date: "2026-12-04",
    displayDate: "04 Desember 2026",
    timezone: "Asia/Jakarta",
  },

  breather: {
    image: image("/images/gallery-6.jpg"),
    caption: "",
  },

  events: {
    akad: {
      date: "04 Desember 2026",
      dayName: "Jum'at",
      time: "07:00 WIB",
      venue: "Rumah Mempelai Wanita",
      address:
        "Ngembal Kulon, Gg. Juwet 2, RT.01/RW.03, Krasak, belok kanan, Kec. Jati, Kabupaten Kudus",
      mapsUrl: "https://maps.app.goo.gl/bDvNSsKY8uW9VrG79",
    },
    reception: {
      date: "04 Desember 2026",
      dayName: "Jum'at",
      time: "12:00 – Selesai",
      venue: "Rumah Mempelai Wanita",
      address:
        "Ngembal Kulon, Gg. Juwet 2, RT.01/RW.03, Krasak, belok kanan, Kec. Jati, Kabupaten Kudus",
      mapsUrl: "https://maps.app.goo.gl/bDvNSsKY8uW9VrG79",
    },
  },

  quote: {
    quranic: "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا",
    quranicTranslation:
      "Dan di antara tanda-tanda-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri.",
    quranicReference: "Ar-Rum: 21",
  },

  story: [
    {
      title: "Awal Pertemuan",
      date: "2020",
      description:
        "Pertama kali bertemu di tempat kerja. Sebuah perkenalan sederhana yang menjadi awal dari perjalanan kami.",
    },
    {
      title: "Kencan Pertama",
      date: "2020",
      description:
        "Menghabiskan waktu bersama, berbagi cerita, dan mulai mengenal satu sama lain lebih jauh.",
    },
    {
      title: "Hari Lamaran",
      date: "2025",
      description:
        "Dengan restu kedua keluarga, kami memantapkan hati untuk melangkah ke jenjang pernikahan.",
    },
    {
      title: "Hari Pernikahan",
      date: "2026",
      description:
        "Hari ketika perjalanan kami memasuki babak baru. Memulai kehidupan bersama sebagai keluarga.",
    },
  ],

  gallery: [
    {
      id: 1,
      src: image("/images/gallery-6.jpg"),
      alt: "Couple photo 1",
      aspect: "tall" as const,
    },
    {
      id: 2,
      src: image("/images/gallery-5.jpg"),
      alt: "Couple photo 2",
      aspect: "square" as const,
    },
    {
      id: 3,
      src: image("/images/gallery-4.jpg"),
      alt: "Couple photo 3",
      aspect: "wide" as const,
    },
    {
      id: 4,
      src: image("/images/gallery-3.jpg"),
      alt: "Couple photo 4",
      aspect: "square" as const,
    },
    {
      id: 5,
      src: image("/images/gallery-2.jpg"),
      alt: "Couple photo 5",
      aspect: "tall" as const,
    },
  ],

  rsvp: {
    deadline: "27 November 2026",
    deadlineNote: "Silakan konfirmasi kehadiran Anda sebelum tanggal tersebut",
    /** Nomor WA panitia — format: 628xxxxxxxxxx (tanpa + atau spasi) */
    waNumber: "628156906607",
  },

  gift: {
    note: "Kehadiran Anda adalah hadiah terbesar bagi kami.",
    methods: [
      {
        id: "bca-groom",
        owner: "groom" as const,
        type: "bank" as const,
        label: "Bank Central Asia (BCA)",
        accountNumber: "8365756798",
        accountHolder: "Agung Cahyo Prasetyo",
      },
      {
        id: "gopay-groom",
        owner: "groom" as const,
        type: "ewallet" as const,
        label: "GoPay",
        accountNumber: "0815-6906-607",
        accountHolder: "Agung Cahyo Prasetyo",
      },
      {
        id: "dana-groom",
        owner: "groom" as const,
        type: "ewallet" as const,
        label: "DANA",
        accountNumber: "0815-6906-607",
        accountHolder: "Agung Cahyo Prasetyo",
      },
      {
        id: "bca-bride",
        owner: "bride" as const,
        type: "bank" as const,
        label: "Blu by BCA",
        accountNumber: "001818205984",
        accountHolder: "Ayu Cahya Tika",
      },
      {
        id: "gopay-bride",
        owner: "bride" as const,
        type: "ewallet" as const,
        label: "GoPay",
        accountNumber: "0857-0056-6814",
        accountHolder: "Ayu Cahya Tika",
      },
      {
        id: "dana-bride",
        owner: "bride" as const,
        type: "ewallet" as const,
        label: "DANA",
        accountNumber: "0857-0056-6814",
        accountHolder: "Ayu Cahya Tika",
      },
    ],
  },

  closing: {
    message:
      "Merupakan suatu kebahagiaan dan kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.",
    couple: "Agung & Tika",
  },

  maker: {
    name: "Agung Cahyo",
    url: "https://agungcahyo.my.id",
  },

  audio: {
    src: "/audio/wedding3.mp3",
    lyricsSrc: "/lyrics/wedding3.lrc",
  },
};

export type Invitation = typeof invitation;
