"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { invitation } from "@/src/data/invitation";
import { ModernSection } from "@/src/designs/modern/layout/ModernSection";
import { SectionLabel } from "@/src/designs/modern/layout/SectionLabel";
import { fadeUpModern, viewportOnce } from "@/src/designs/modern/motion";
import { saveRSVPResponse, type RSVPFormData } from "@/src/lib/rsvp-service";

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

export function RSVP({ guestName = "" }: { guestName?: string }) {
  const [formData, setFormData] = useState<RSVPFormData>({ ...initialForm, name: guestName });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = "Nama harus diisi";
    if (!formData.attendance) newErrors.attendance = "Pilih status kehadiran";
    if (
      formData.attendance === "attending" &&
      (!formData.guestCount || parseInt(formData.guestCount, 10) < 1)
    ) {
      newErrors.guestCount = "Jumlah tamu tidak valid";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      }, 6000);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Gagal menyimpan konfirmasi. Silakan coba lagi."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModernSection id="rsvp">
      <SectionLabel index="05">Konfirmasi Kehadiran</SectionLabel>
      <p className="font-body text-xs text-[var(--text-tertiary)] -mt-4 mb-10">
        {invitation.rsvp.deadlineNote} — {invitation.rsvp.deadline}
      </p>

      <motion.form
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={fadeUpModern}
        onSubmit={handleSubmit}
        noValidate
        className="space-y-8 max-w-md"
      >
        <div>
          <label
            htmlFor="rsvp-name-modern"
            className="block text-[11px] font-body tracking-[0.14em] uppercase mb-2 text-[var(--text-tertiary)]"
          >
            Nama Lengkap
          </label>
          <input
            id="rsvp-name-modern"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Masukkan nama Anda"
            className="w-full bg-transparent border-0 border-b border-[var(--border)] py-2.5 font-body text-sm capitalize focus:outline-none focus:border-[var(--accent)]"
            aria-invalid={!!errors.name}
          />
          {errors.name && <p className="text-red-600/80 text-xs mt-2 font-body">{errors.name}</p>}
        </div>

        <div>
          <p className="text-[11px] font-body tracking-[0.14em] uppercase mb-3 text-[var(--text-tertiary)]">
            Kehadiran
          </p>
          <div role="radiogroup" className="flex items-center gap-2">
            {(
              [
                { value: "attending", label: "Hadir" },
                { value: "not-attending", label: "Berhalangan" },
              ] as const
            ).map((option) => {
              const isActive = formData.attendance === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, attendance: option.value }));
                    setErrors((prev) => ({ ...prev, attendance: undefined }));
                  }}
                  className={`px-4 py-2 text-[11px] font-body tracking-[0.08em] uppercase border transition-colors ${
                    isActive
                      ? "border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--bg-primary)]"
                      : "border-[var(--border)] text-[var(--text-primary)]"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          {errors.attendance && (
            <p className="text-red-600/80 text-xs mt-2 font-body">{errors.attendance}</p>
          )}
        </div>

        {formData.attendance === "attending" && (
          <div>
            <p className="text-[11px] font-body tracking-[0.14em] uppercase mb-3 text-[var(--text-tertiary)]">
              Jumlah Tamu
            </p>
            <div role="radiogroup" className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }, (_, i) => String(i + 1)).map((count) => {
                const isActive = formData.guestCount === count;
                return (
                  <button
                    key={count}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, guestCount: count }));
                      setErrors((prev) => ({ ...prev, guestCount: undefined }));
                    }}
                    className={`w-9 h-9 text-xs font-body tabular-nums border transition-colors ${
                      isActive
                        ? "border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--bg-primary)]"
                        : "border-[var(--border)]"
                    }`}
                  >
                    {count}
                  </button>
                );
              })}
            </div>
            {errors.guestCount && (
              <p className="text-red-600/80 text-xs mt-2 font-body">{errors.guestCount}</p>
            )}
          </div>
        )}

        <div>
          <label
            htmlFor="rsvp-message-modern"
            className="block text-[11px] font-body tracking-[0.14em] uppercase mb-2 text-[var(--text-tertiary)]"
          >
            Pesan (opsional)
          </label>
          <textarea
            id="rsvp-message-modern"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Tulis pesan untuk mempelai..."
            rows={3}
            className="w-full bg-transparent border-0 border-b border-[var(--border)] py-2.5 font-body text-sm resize-none focus:outline-none focus:border-[var(--accent)]"
          />
        </div>

        <button
          type="submit"
          disabled={submitted || isLoading}
          className="w-full py-3.5 text-[11px] font-body font-medium tracking-[0.18em] uppercase text-white bg-[var(--accent)] hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {isLoading ? "Mengirim..." : submitted ? "Terima kasih" : "Kirim Konfirmasi"}
        </button>

        {submitError && (
          <p className="text-center text-red-600/80 text-sm font-body">{submitError}</p>
        )}
      </motion.form>
    </ModernSection>
  );
}
