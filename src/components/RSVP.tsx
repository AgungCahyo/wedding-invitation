"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { invitation } from "@/src/data/invitation";
import { SectionHeader } from "@/src/components/ui/SectionHeader";
import { easeOut, fadeUp, viewportOnce } from "@/src/lib/motion";
import { saveRSVPResponse } from "@/src/lib/rsvp-service";

export interface RSVPFormData {
  name: string;
  attendance: "attending" | "not-attending" | "";
  guestCount: string;
  message: string;
}

interface FormErrors {
  name?: string;
  attendance?: string;
  guestCount?: string;
}

const initialForm: RSVPFormData = {
  name: "",
  attendance: "",
  guestCount: "1",
  message: "",
};

export function RSVP() {
  const [formData, setFormData] = useState<RSVPFormData>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nama harus diisi";
    }
    if (!formData.attendance) {
      newErrors.attendance = "Pilih status kehadiran";
    }
    if (
      formData.attendance === "attending" &&
      (!formData.guestCount || parseInt(formData.guestCount, 10) < 1)
    ) {
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
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setSubmitError(null);

    try {
      await saveRSVPResponse(formData);
      setSubmitted(true);

      setTimeout(() => {
        setFormData(initialForm);
        setSubmitted(false);
      }, 4000);
    } catch (error) {
      console.error("Error submitting RSVP:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan konfirmasi. Silakan coba lagi."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "w-full bg-transparent border-b border-[var(--border)] py-3 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] transition-colors font-body text-sm md:text-base";

  return (
    <section id="rsvp" className="section bg-[var(--bg-primary)]">
      <div className="section-inner max-w-xl">
        <SectionHeader
          label="RSVP"
          subtitle={`${invitation.rsvp.deadlineNote} — ${invitation.rsvp.deadline}`}
        />

        <motion.form
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          transition={easeOut}
          onSubmit={handleSubmit}
          noValidate
          className="space-y-8 md:space-y-10"
        >
          <div>
            <label htmlFor="rsvp-name" className="block text-[10px] tracking-[0.3em] uppercase font-body text-[var(--text-tertiary)] mb-2">
              Nama Lengkap
            </label>
            <input
              id="rsvp-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Masukkan nama Anda"
              className={inputClass}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "rsvp-name-error" : undefined}
            />
            {errors.name && (
              <p id="rsvp-name-error" className="text-red-600/80 text-xs mt-2 font-body">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="rsvp-attendance" className="block text-[10px] tracking-[0.3em] uppercase font-body text-[var(--text-tertiary)] mb-2">
              Kehadiran
            </label>
            <select
              id="rsvp-attendance"
              name="attendance"
              value={formData.attendance}
              onChange={handleChange}
              className={`${inputClass} cursor-pointer`}
              aria-invalid={!!errors.attendance}
            >
              <option value="">— Pilih —</option>
              <option value="attending">Akan Hadir</option>
              <option value="not-attending">Tidak Dapat Hadir</option>
            </select>
            {errors.attendance && (
              <p className="text-red-600/80 text-xs mt-2 font-body">{errors.attendance}</p>
            )}
          </div>

          {formData.attendance === "attending" && (
            <div>
              <label htmlFor="rsvp-guests" className="block text-[10px] tracking-[0.3em] uppercase font-body text-[var(--text-tertiary)] mb-2">
                Jumlah Tamu
              </label>
              <input
                id="rsvp-guests"
                type="number"
                name="guestCount"
                value={formData.guestCount}
                onChange={handleChange}
                min={1}
                max={10}
                className={inputClass}
                aria-invalid={!!errors.guestCount}
              />
              {errors.guestCount && (
                <p className="text-red-600/80 text-xs mt-2 font-body">{errors.guestCount}</p>
              )}
            </div>
          )}

          <div>
            <label htmlFor="rsvp-message" className="block text-[10px] tracking-[0.3em] uppercase font-body text-[var(--text-tertiary)] mb-2">
              Pesan <span className="normal-case tracking-normal">(opsional)</span>
            </label>
            <textarea
              id="rsvp-message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Tulis pesan untuk mempelai..."
              rows={4}
              className={`${inputClass} resize-none`}
            />
          </div>

          <motion.button
            type="submit"
            whileTap={{ scale: 0.98 }}
            disabled={submitted || isLoading}
            className="w-full py-4 border border-[var(--text-primary)] text-[var(--text-primary)] text-[11px] tracking-[0.25em] uppercase font-body hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors duration-500 disabled:opacity-60"
          >
            {isLoading
              ? "Mengirim..."
              : submitted
                ? "Terima Kasih"
                : "Kirim Konfirmasi"}
          </motion.button>

          {submitted && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-[var(--accent)] text-sm font-body"
            >
              Konfirmasi Anda telah diterima.
            </motion.p>
          )}

          {submitError && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-red-600/80 text-sm font-body"
            >
              {submitError}
            </motion.p>
          )}
        </motion.form>
      </div>
    </section>
  );
}
