export const fonts = {
  display: "Cormorant Garamond",
  body: "DM Sans",
} as const;

export const colors = {
  bgPrimary: "#faf8f3",
  bgSecondary: "#f5f3f0",
  textPrimary: "#2b2520",
  textSecondary: "#5a524a",
  textTertiary: "#8b7f76",
  accent: "#c9a876",
  accentMuted: "#dcc9b8",
  border: "#e8e3dd",
} as const;

export const invitation = {
  meta: {
    title: "Agung & Tika Wedding",
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
    deadline: "25 November 2026",
    deadlineNote: "Silakan konfirmasi kehadiran Anda sebelum tanggal tersebut",
  },

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
    bank: "Bank Central Asia (BCA)",
    accountNumber: "1234567890",
    accountHolder: "Agung Cahyo Prasetyo",
    note: "Kehadiran Anda adalah hadiah terbesar bagi kami.",
  },

  closing: {
    message: "Thank you for being part of our special day.",
    couple: "Agung & Tika",
  },

  audio: {
    src: "/audio/wedding.mp3",
  },
};

export type Invitation = typeof invitation;
