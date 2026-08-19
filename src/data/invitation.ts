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
    url: "https://ayutika.agungcahyo.my.id",
    ogImage: "/og-image.jpg",
  },

  cover: {
    image: "/images/gallery-0.jpg",
    label: "THE WEDDING OF",
  },

  couple: {
    groom: {
      name: "Agung Cahyo Prasetyo",
      fullName: "Agung Cahyo Prasetyo, S.T.",
      parents: ["Bp. Joko Priyono", "Ibu Surtini"],
      photo: "/images/groom1.jpg",
      socialLinks: {
        instagram: "https://instagram.com",
      },
    },
    bride: {
      name: "Ayu Cahya Tika",
      fullName: "Ayu Cahya Tika, S.E.",
      parents: ["Bp. Suwarto", "Ibu Siti Mahmudah"],
      photo: "/images/bride1.jpg",
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
    caption: "",
  },

  events: {
    akad: {
      date: "04 Desember 2026",
      dayName: "Jum'at",
      time: "07:00 – 08:00 WIB",
      venue: "Rumah Mempelai Wanita",
      address:
        "Ngembal Kulon, Gg. Juwet 2, RT.01/RW.03, Krasak, belok kanan, Kec. Jati, Kabupaten Kudus",
      mapsUrl: "https://maps.app.goo.gl/bDvNSsKY8uW9VrG79",
    },
    reception: {
      date: "04 Desember 2026",
      dayName: "Jum'at",
      time: "09:00 – 12:00 WIB",
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
        "Di tengah riuhnya suasana kerja dan ketidakpastian dunia, takdir mempertemukan tatap mata kami untuk pertama kalinya. Sebuah senyuman sederhana yang tanpa disadari menjadi awal dari kisah indah yang tak terpisahkan.",
    },
    {
      title: "Kencan Pertama",
      date: "2020",
      description:
        "Di antara sejuknya angin pegunungan dan indahnya cakrawala, kami menghabiskan waktu bertukar cerita. Hari itu, dua hati menyadari bahwa mereka telah menemukan tempat paling nyaman untuk pulang.",
    },
    {
      title: "Hari Lamaran",
      date: "2025",
      description:
        "Di hadapan kedua keluarga besar, sebuah janji suci diucapkan. Dengan penuh ketulusan dan restu orang tua, kami menetapkan langkah menuju ikatan perkawinan yang lebih bermakna.",
    },
    {
      title: "Hari Pernikahan",
      date: "2026",
      description:
        "Hari yang paling dinanti pun tiba. Di atas doa dan ikrar suci, kami melangkah bersama. Bukan lagi tentang 'aku' atau 'kamu', melainkan tentang 'kita' yang siap mengarungi masa depan selamanya.",
    },
  ],

  gallery: [
    { id: 1, src: "/images/gallery-0.jpg", alt: "Couple photo 1", aspect: "tall" as const },
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
    message:
      "Merupakan suatu kebahagiaan dan kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.",
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