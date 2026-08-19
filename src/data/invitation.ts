export const fonts = {
  display: "Cormorant Garamond",
  body: "DM Sans",
} as const;

export const colors = {
  bgPrimary: "#faf8f3",
  bgSecondary: "#f3f0eb",
  textPrimary: "#2b2520",
  textSecondary: "#5a524a",
  textTertiary: "#8b7f76",
  accent: "#b89a72",
  accentMuted: "#d4c4b0",
  border: "#e3ddd5",
} as const;

export const invitation = {
  meta: {
    title: "Agung & Ayu Wedding",
    description:
      "Kami dengan bahagia mengundang Anda untuk merayakan hari istimewa kami. Pernikahan Agung Cahyo Prasetyo dan Ayu Cahya Tika.",
    url: "https://undangan.example.com",
    ogImage: "/og-image.jpg",
  },

  cover: {
    image: "/images/gallery-1.jpg",
    label: "THE WEDDING OF",
  },

  couple: {
    groom: {
      name: "Agung Cahyo Prasetyo",
      fullName: "Agung Cahyo Prasetyo, S.T.",
      parents: ["Bp. Joko Priyono", "Ibu Surtini"],
      photo: "/images/groom.jpg",
      socialLinks: {
        instagram: "https://instagram.com",
      },
    },
    bride: {
      name: "Ayu Cahya Tika",
      fullName: "Ayu Cahya Tika, S.E.",
      parents: ["Bp. Suwarto", "Ibu Siti Mahmudah"],
      photo: "/images/bride.jpg",
      socialLinks: {
        instagram: "https://instagram.com",
      },
    },
  },

  wedding: {
    date: "2026-12-04",
    displayDate: "04 Desember 2026",
    timezone: "Asia/Jakarta",
  },

  breather: {
    image: "/images/gallery-3.jpg",
    caption: "Every love story is beautiful, but ours is my favorite.",
  },

  events: {
    akad: {
      date: "04 Desember 2026",
      dayName: "Jum'at",
      time: "09:00 – 11:00 WIB",
      venue: "Rumah Mempelai Wanita",
      address:
        "Ngembal Kulon, Gg. Juwet 2, RT.01/RW.03, Krasak, belok kanan, Kec. Jati, Kabupaten Kudus",
      mapsUrl: "https://maps.app.goo.gl/bDvNSsKY8uW9VrG79",
    },
    reception: {
      date: "04 Desember 2026",
      dayName: "Jum'at",
      time: "19:00 – 23:00 WIB",
      venue: "Rumah Mempelai Wanita",
      address:
        "Ngembal Kulon, Gg. Juwet 2, RT.01/RW.03, Krasak, belok kanan, Kec. Jati, Kabupaten Kudus",
      mapsUrl: "https://maps.app.goo.gl/bDvNSsKY8uW9VrG79",
    },
  },

  quote: {
    main: "With love, we invite you to celebrate the beginning of our forever.",
    quranic: "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا",
    quranicTranslation:
      "And of His signs is that He created for you from yourselves mates",
    quranicReference: "Ar-Rum: 21",
  },

  story: [
    {
      title: "First Meet",
      date: "2020",
      description: "Bertemu di tempat kerja saat covid melanda",
    },
    {
      title: "First Date",
      date: "2020",
      description: "Kencan pertama yang tak terlupakan di pegunungan Semarang",
    },
    {
      title: "Engagement",
      date: "2025",
      description: "Lamaran istimewa dengan keluarga besar",
    },
    {
      title: "Wedding Day",
      date: "2026",
      description: "Hari istimewa dimulai perjalanan selamanya",
    },
  ],

  gallery: [
    { id: 1, src: "/images/gallery-1.jpg", alt: "Couple photo 1", aspect: "tall" as const },
    { id: 2, src: "/images/gallery-2.jpg", alt: "Couple photo 2", aspect: "square" as const },
    { id: 3, src: "/images/gallery-3.jpg", alt: "Couple photo 3", aspect: "wide" as const },
    { id: 4, src: "/images/gallery-4.jpg", alt: "Couple photo 4", aspect: "square" as const },
    { id: 5, src: "/images/gallery-5.jpg", alt: "Couple photo 5", aspect: "tall" as const },
    { id: 6, src: "/images/gallery-6.jpg", alt: "Couple photo 6", aspect: "square" as const },
  ],

  rsvp: {
    deadline: "27 November 2026",
    deadlineNote: "Silakan konfirmasi kehadiran Anda sebelum tanggal tersebut",
    /** Nomor WA panitia — format: 628xxxxxxxxxx (tanpa + atau spasi) */
    waNumber: "628156906607",
  },

  // Seed/reference data only — no longer used as a fallback in the Wishes
  // section (real guests should only ever see real submissions or the
  // genuine "no wishes yet" empty state). Useful if you want to pre-seed
  // the Supabase `wishes` table via SQL insert.
  wishes: [
    {
      id: 1,
      name: "Budi Santoso",
      message:
        "Selamat atas pernikahan kalian. Semoga lancar dan bahagia selamanya!",
      date: "2026-11-01",
    },
    {
      id: 2,
      name: "Siti Nurhaliza",
      message:
        "Alhamdulillah, penantian panjang akhirnya tiba. Doa terbaik untuk kalian berdua.",
      date: "2026-11-02",
    },
    {
      id: 3,
      name: "Riyanto Wijaya",
      message: "Wishing you a lifetime of love and happiness. Congratulations!",
      date: "2026-11-03",
    },
    {
      id: 4,
      name: "Dewi Kusuma",
      message:
        "Semoga rumah tangga kalian dipenuhi dengan cinta, kasih sayang, dan keberuntungan.",
      date: "2026-11-04",
    },
  ],

  gift: {
    note: "Kehadiran Anda adalah hadiah terbesar bagi kami.",
    methods: [
      {
        id: "bca-groom",
        owner: "groom" as const,
        type: "bank" as const,
        label: "Bank Central Asia (BCA)",
        accountNumber: "1234567890",
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
        id: "ovo-groom",
        owner: "groom" as const,
        type: "ewallet" as const,
        label: "OVO",
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
        label: "Bank Central Asia (BCA)",
        accountNumber: "0987654321",
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
        id: "ovo-bride",
        owner: "bride" as const,
        type: "ewallet" as const,
        label: "OVO",
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
    message: "Thank you for being part of our special day.",
    couple: "Agung & Ayu",
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