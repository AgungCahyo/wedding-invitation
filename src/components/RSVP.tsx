"use client";

import { motion } from "motion/react";
import { useState } from "react";

interface FormData {
  name: string;
  attendance: "attending" | "not-attending" | "";
  guestCount: string;
  message: string;
}

interface FormErrors {
  name?: string;
  attendance?: string;
  guestCount?: string;
  message?: string;
}

export function RSVP() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    attendance: "",
    guestCount: "1",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nama harus diisi";
    }

    if (!formData.attendance) {
      newErrors.attendance = "Pilih status kehadiran";
    }

    if (!formData.guestCount || parseInt(formData.guestCount) < 1) {
      newErrors.guestCount = "Jumlah tamu tidak valid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validateForm()) {
      // Here you would typically send this to a backend/Supabase
      console.log("Form submitted:", formData);
      setSubmitted(true);

      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          name: "",
          attendance: "",
          guestCount: "1",
          message: "",
        });
        setSubmitted(false);
      }, 3000);
    }
  };

  return (
    <section className="section bg-[#faf8f3]">
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
              RSVP
            </p>
            <div className="flex-1 h-px bg-[#e8e3dd]" />
          </div>
          <p className="text-[#5a524a] text-base md:text-lg font-body mt-6">
            Silakan konfirmasi kehadiran Anda sebelum 1 Juni 2024
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          onSubmit={handleSubmit}
          className="bg-white p-8 md:p-12 border border-[#e8e3dd]"
        >
          {/* Name field */}
          <div className="mb-8">
            <label className="block text-[#2b2520] text-sm font-body tracking-widest mb-3">
              Nama Lengkap *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Masukkan nama Anda"
              className="w-full bg-[#faf8f3] border border-[#e8e3dd] px-4 py-3 text-[#2b2520] placeholder-[#8b7f76] focus:outline-none focus:border-[#c9a876] transition-colors"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-2 font-body">
                {errors.name}
              </p>
            )}
          </div>

          {/* Attendance field */}
          <div className="mb-8">
            <label className="block text-[#2b2520] text-sm font-body tracking-widest mb-3">
              Kehadiran *
            </label>
            <select
              name="attendance"
              value={formData.attendance}
              onChange={handleChange}
              className="w-full bg-[#faf8f3] border border-[#e8e3dd] px-4 py-3 text-[#2b2520] focus:outline-none focus:border-[#c9a876] transition-colors"
            >
              <option value="">-- Pilih Status --</option>
              <option value="attending">Akan Hadir</option>
              <option value="not-attending">Tidak Dapat Hadir</option>
            </select>
            {errors.attendance && (
              <p className="text-red-500 text-xs mt-2 font-body">
                {errors.attendance}
              </p>
            )}
          </div>

          {/* Guest count field */}
          <div className="mb-8">
            <label className="block text-[#2b2520] text-sm font-body tracking-widest mb-3">
              Jumlah Tamu *
            </label>
            <input
              type="number"
              name="guestCount"
              value={formData.guestCount}
              onChange={handleChange}
              min="1"
              className="w-full bg-[#faf8f3] border border-[#e8e3dd] px-4 py-3 text-[#2b2520] focus:outline-none focus:border-[#c9a876] transition-colors"
            />
            {errors.guestCount && (
              <p className="text-red-500 text-xs mt-2 font-body">
                {errors.guestCount}
              </p>
            )}
          </div>

          {/* Message field */}
          <div className="mb-8">
            <label className="block text-[#2b2520] text-sm font-body tracking-widest mb-3">
              Pesan (Opsional)
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Tulis ucapan atau pesan Anda..."
              rows={4}
              className="w-full bg-[#faf8f3] border border-[#e8e3dd] px-4 py-3 text-[#2b2520] placeholder-[#8b7f76] focus:outline-none focus:border-[#c9a876] transition-colors resize-none"
            />
          </div>

          {/* Submit button */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-[#2b2520] text-[#faf8f3] py-3 md:py-4 font-body tracking-widest hover:bg-[#5a524a] transition-colors"
          >
            {submitted ? "Terima Kasih!" : "KIRIM KONFIRMASI"}
          </motion.button>

          {submitted && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-[#c9a876] text-sm mt-4 font-body"
            >
              Konfirmasi Anda telah diterima. Terima kasih!
            </motion.p>
          )}
        </motion.form>
      </div>
    </section>
  );
}
