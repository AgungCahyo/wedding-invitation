"use client";

import { motion } from "motion/react";
import { useState } from "react";

interface Wish {
  id: number;
  name: string;
  message: string;
  date: string;
}

// Dummy wishes for preview
const dummyWishes: Wish[] = [
  {
    id: 1,
    name: "Budi Santoso",
    message: "Selamat atas pernikahan kalian. Semoga lancar dan bahagia selamanya!",
    date: "2024-05-20",
  },
  {
    id: 2,
    name: "Siti Nurhaliza",
    message: "Alhamdulillah, penantian panjang akhirnya tiba. Doa terbaik untuk kalian berdua.",
    date: "2024-05-21",
  },
  {
    id: 3,
    name: "Riyanto Wijaya",
    message: "Wishing you a lifetime of love and happiness. Congratulations!",
    date: "2024-05-22",
  },
  {
    id: 4,
    name: "Dewi Kusuma",
    message: "Semoga rumah tangga kalian dipenuhi dengan cinta, kasih sayang, dan keberuntungan.",
    date: "2024-05-23",
  },
];

export function Wishes() {
  const [wishes, setWishes] = useState<Wish[]>(dummyWishes);
  const [newWish, setNewWish] = useState("");
  const [newName, setNewName] = useState("");

  const handleAddWish = () => {
    if (newName.trim() && newWish.trim()) {
      const wish: Wish = {
        id: wishes.length + 1,
        name: newName,
        message: newWish,
        date: new Date().toISOString().split("T")[0],
      };

      setWishes([wish, ...wishes]);
      setNewWish("");
      setNewName("");
    }
  };

  return (
    <section className="section bg-white">
      <div className="section-inner max-w-2xl">
        {/* Section title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16 md:mb-24"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex-1 h-px bg-[#e8e3dd]" />
            <p className="text-[#8b7f76] text-xs tracking-widest font-body">
              UCAPAN DOA
            </p>
            <div className="flex-1 h-px bg-[#e8e3dd]" />
          </div>
        </motion.div>

        {/* Add wish form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          viewport={{ once: true }}
          className="bg-[#faf8f3] p-6 md:p-8 border border-[#e8e3dd] mb-12"
        >
          <p className="text-[#2b2520] text-sm font-body tracking-widest mb-4">
            TULIS UCAPAN
          </p>

          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nama Anda"
            className="w-full bg-white border border-[#e8e3dd] px-4 py-3 text-[#2b2520] placeholder-[#8b7f76] focus:outline-none focus:border-[#c9a876] transition-colors mb-4"
          />

          <textarea
            value={newWish}
            onChange={(e) => setNewWish(e.target.value)}
            placeholder="Tulis ucapan atau doa Anda..."
            rows={3}
            className="w-full bg-white border border-[#e8e3dd] px-4 py-3 text-[#2b2520] placeholder-[#8b7f76] focus:outline-none focus:border-[#c9a876] transition-colors resize-none mb-4"
          />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddWish}
            className="w-full bg-[#2b2520] text-[#faf8f3] py-3 text-sm font-body tracking-widest hover:bg-[#5a524a] transition-colors"
          >
            KIRIM UCAPAN
          </motion.button>
        </motion.div>

        {/* Wishes list */}
        <div className="space-y-6">
          {wishes.map((wish, index) => (
            <motion.div
              key={wish.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-[#faf8f3] p-6 md:p-8 border border-[#e8e3dd]"
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-[#2b2520] font-display text-lg">
                  {wish.name}
                </h4>
                <span className="text-[#8b7f76] text-xs font-body">
                  {new Date(wish.date).toLocaleDateString("id-ID")}
                </span>
              </div>
              <p className="text-[#5a524a] text-sm md:text-base font-body leading-relaxed">
                "{wish.message}"
              </p>
            </motion.div>
          ))}
        </div>

        {/* Viewing info */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center text-[#8b7f76] text-xs font-body mt-12"
        >
          Menampilkan {wishes.length} ucapan
        </motion.p>
      </div>
    </section>
  );
}
