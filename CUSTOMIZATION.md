# Undangan Pernikahan Digital Premium

Website undangan pernikahan digital yang dirancang dengan aesthetic "Editorial Luxury Wedding" menggunakan Next.js, TypeScript, Tailwind CSS, dan Motion.

## 🎯 Fitur

- ✨ **Opening Screen** - Hero section dengan transisi smooth
- 👫 **Couple Section** - Tampilan elegan untuk kedua mempelai dengan foto dan info orang tua
- 📝 **Quote Section** - Pesan pembuka dan kutipan Al-Qur'an
- 📅 **Event Details** - Informasi Akad Nikah dan Resepsi dengan link Google Maps
- ⏳ **Countdown** - Hitung mundur real-time menuju hari H (timezone: Asia/Jakarta)
- 📖 **Story** - Timeline singkat perjalanan pasangan
- 🖼️ **Gallery** - Galeri foto masonry dengan lightbox fullscreen
- 💌 **RSVP** - Form konfirmasi kehadiran dengan validasi
- 🎉 **Wishes** - Koleksi ucapan dari tamu undangan
- 🎁 **Digital Gift** - Informasi rekening untuk hadiah digital
- 🎵 **Music Player** - Floating button untuk control musik background
- 🎬 **Closing** - Penutup elegan dengan pesan terima kasih

## 🛠️ Tech Stack

- **Framework**: Next.js 16 dengan App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **Animations**: Motion (Framer Motion)
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Fonts**: Cormorant Garamond (Display) + DM Sans (Body)

## 📋 Struktur Project

```
undangan/
├── app/
│   ├── layout.tsx          # Root layout dengan metadata
│   ├── globals.css         # Global styles & typography
│   └── page.tsx            # Main page yang mengkombinasi semua komponen
├── src/
│   ├── components/         # Reusable components
│   │   ├── Opening.tsx
│   │   ├── Couple.tsx
│   │   ├── Quote.tsx
│   │   ├── EventDetails.tsx
│   │   ├── Countdown.tsx
│   │   ├── Story.tsx
│   │   ├── Gallery.tsx
│   │   ├── RSVP.tsx
│   │   ├── Wishes.tsx
│   │   ├── DigitalGift.tsx
│   │   ├── Closing.tsx
│   │   └── MusicPlayer.tsx
│   └── data/
│       └── invitation.ts   # Konfigurasi data undangan
├── public/
│   ├── images/            # Foto mempelai & galeri
│   ├── audio/             # Background music (wedding.mp3)
│   └── og-image.jpg       # Open Graph image
└── ...config files
```

## 🎨 Customization Guide

### 1. Edit Data Undangan

File utama untuk customization: `src/data/invitation.ts`

```typescript
export const invitation = {
  couple: {
    groom: {
      name: "Nama Pengantin Pria",
      fullName: "Nama Lengkap Pengantin Pria",
      parents: ["Nama Ayah", "Nama Ibu"],
      photo: "/images/groom.jpg",
      socialLinks: {
        instagram: "https://instagram.com/username",
      },
    },
    bride: {
      name: "Nama Pengantin Wanita",
      fullName: "Nama Lengkap Pengantin Wanita",
      parents: ["Nama Ayah", "Nama Ibu"],
      photo: "/images/bride.jpg",
      socialLinks: {
        instagram: "https://instagram.com/username",
      },
    },
  },

  wedding: {
    date: "YYYY-MM-DD", // Format ISO
    timezone: "Asia/Jakarta",
  },

  events: {
    akad: {
      date: "DD Bulan YYYY",
      dayName: "Hari",
      time: "HH:MM - HH:MM WIB",
      venue: "Nama Tempat",
      address: "Alamat Lengkap",
      mapsUrl: "https://maps.google.com/?q=...",
    },
    reception: {
      // Sama seperti akad
    },
  },

  quote: {
    main: "Pesan pembuka Anda",
    quranic: "Ayat Al-Qur'an (opsional)",
    quranicTranslation: "Terjemahan ayat",
  },

  story: [
    {
      title: "Milestone 1",
      date: "YYYY",
      description: "Deskripsi singkat",
    },
    // ...
  ],

  gallery: [
    { id: 1, src: "/images/gallery-1.jpg", alt: "Deskripsi foto" },
    // ...
  ],

  gift: {
    bank: "Nama Bank",
    accountNumber: "1234567890",
    accountHolder: "Nama Rekening",
  },

  closing: {
    message: "Pesan penutup",
    couple: "Nama Pasangan",
  },
};
```

### 2. Ganti Foto

Letakkan foto di folder `public/images/`:

- **Mempelai Pria**: `public/images/groom.jpg` (rasio 3:4 direkomendasikan)
- **Mempelai Wanita**: `public/images/bride.jpg` (rasio 3:4 direkomendasikan)
- **Galeri**: `public/images/gallery-1.jpg` s/d `gallery-6.jpg` (berbagai ukuran untuk masonry)
- **OG Image**: `public/images/og-image.jpg` (1200x630px untuk social sharing)

### 3. Tambah Background Music

Letakkan file audio di `public/audio/wedding.mp3`. Format yang didukung:
- MP3
- WAV
- OGG
- M4A

Jika file tidak ada, button musik akan tetap berfungsi tanpa error.

### 4. Customize Warna

Edit di `app/globals.css` di bagian `:root`:

```css
:root {
  --bg-primary: #faf8f3;           /* Background utama */
  --bg-secondary: #f5f3f0;         /* Background secondary */
  --text-primary: #2b2520;         /* Teks utama */
  --text-secondary: #5a524a;       /* Teks secondary */
  --text-tertiary: #8b7f76;        /* Teks tertiary/muted */
  --accent: #c9a876;               /* Warna accent (gold) */
  --accent-muted: #dcc9b8;         /* Accent yang lebih muted */
  --border: #e8e3dd;               /* Border color */
  --border-light: #ede9e4;         /* Border lebih terang */
}
```

### 5. Customize Font

Edit import di `app/globals.css`:

```css
@import url("https://fonts.googleapis.com/css2?family=YOUR_DISPLAY_FONT&family=YOUR_BODY_FONT&display=swap");
```

Kemudian update selector font:

```css
h1, h2, h3, h4, h5, h6 {
  font-family: "YOUR_DISPLAY_FONT", serif;
}

p {
  font-family: "YOUR_BODY_FONT", sans-serif;
}
```

Rekomendasi font:
- **Display**: Playfair Display, Cormorant Garamond, Lora, Crimson Text
- **Body**: Inter, DM Sans, Work Sans, Poppins

### 6. Customize Metadata

Edit di `app/layout.tsx` untuk mengubah:
- Title
- Description
- Open Graph image
- Social media preview

## 🚀 Cara Menggunakan

### Development

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### Build & Deploy

```bash
npm run build
npm start
```

Deploy ke Vercel (recommended untuk Next.js):

```bash
npm install -g vercel
vercel
```

## 📱 Responsive Design

- **Mobile**: 360px+ (prioritas utama)
- **Tablet**: 768px+
- **Desktop**: 1024px+

Semua komponen telah dioptimalkan untuk mobile-first approach.

## ♿ Accessibility

- Respects `prefers-reduced-motion` untuk pengguna yang sensitif terhadap animasi
- Semantic HTML
- ARIA labels
- Kontras warna yang sufficient

## 🔍 SEO

Sudah dilengkapi dengan:
- Meta tags
- Open Graph
- Twitter Card
- Structured data yang siap untuk preview di social media

## 📊 Performance Tips

1. **Compress images**: Gunakan tools seperti TinyPNG atau ImageOptim
2. **Lazy loading**: Sudah implemented di Gallery dan Images
3. **Minimal JS**: Animasi menggunakan CSS ketika mungkin
4. **Caching**: Next.js sudah handle caching otomatis

## 🎯 Customization Checklist

- [ ] Edit `src/data/invitation.ts` dengan data Anda
- [ ] Ganti foto mempelai di `public/images/`
- [ ] Upload galeri foto ke `public/images/gallery-*.jpg`
- [ ] Tambah background music ke `public/audio/wedding.mp3` (opsional)
- [ ] Customize warna di `app/globals.css`
- [ ] Update font jika diperlukan
- [ ] Customize metadata di `app/layout.tsx`
- [ ] Test di mobile dan desktop
- [ ] Deploy ke hosting pilihan Anda

## 🐛 Troubleshooting

### Build error terkait TypeScript?
```bash
npm run lint
# Fix issues atau
npx tsc --noEmit
```

### Port 3000 sudah digunakan?
```bash
npm run dev -- -p 3001
```

### Image tidak muncul?
- Pastikan file ada di `public/images/`
- Check nama file di `src/data/invitation.ts`
- Clear Next.js cache: `rm -rf .next`

### Audio tidak bekerja?
- Format audio harus MP3, WAV, OGG, atau M4A
- Browser mungkin require user interaction sebelum autoplay
- Check browser console untuk error messages

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Motion Documentation](https://motion.dev)
- [Lucide Icons](https://lucide.dev)

## 📝 License

Dibuat untuk keperluan undangan digital pernikahan. Silakan customize sesuai kebutuhan Anda.

---

**Selamat menggunakan! Semoga acara pernikahan berjalan lancar dan bahagia! 🎉💕**
