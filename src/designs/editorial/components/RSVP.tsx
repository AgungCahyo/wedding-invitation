"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { invitation } from "@/src/data/invitation";
import { SectionHeader } from "@/src/designs/editorial/ui/SectionHeader";
import { editorialEasing, fadeUpEditorial, viewportOnce } from "@/src/designs/editorial/motion";
import { saveRSVPResponse, type RSVPFormData } from "@/src/lib/rsvp-service";

export type { RSVPFormData };

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
  const [formData, setFormData] = useState<RSVPFormData>({
    ...initialForm,
    name: guestName,
  });
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
      }, 6000);
    } catch (error) {
      console.error("Error submitting RSVP:", error);
      setSubmitError(
        error instanceof Error ? error.message : "Gagal menyimpan konfirmasi. Silakan coba lagi."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="rsvp" className="section bg-[var(--bg-primary)]">
      <div className="section-inner max-w-xl">
        <SectionHeader
          index="06"
          label="Konfirmasi"
          subtitle={`${invitation.rsvp.deadlineNote} — ${invitation.rsvp.deadline}`}
        />

        <motion.form
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUpEditorial}
          transition={{ duration: 0.9, ease: editorialEasing }}
          onSubmit={handleSubmit}
          noValidate
          className="space-y-8 md:space-y-10"
        >
          <div>
            <label
              htmlFor="rsvp-name"
              className="block mb-3 text-[0.625rem] font-medium uppercase tracking-[0.25em]"
              style={{ fontFamily: "var(--font-label)", color: "var(--text-tertiary)" }}
            >
              Nama Lengkap
            </label>
            <input
              id="rsvp-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Masukkan nama Anda"
              className="input-editorial capitalize"
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
            <p
              className="block mb-4 text-[0.625rem] font-medium uppercase tracking-[0.25em]"
              id="rsvp-attendance-label"
              style={{ fontFamily: "var(--font-label)", color: "var(--text-tertiary)" }}
            >
              Kehadiran
            </p>
            <div role="radiogroup" aria-labelledby="rsvp-attendance-label" className="flex items-center gap-8">
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
                    className={`btn-editorial ${
                      isActive
                        ? "text-[var(--text-primary)] border-[var(--text-primary)]"
                        : "text-[var(--text-tertiary)] border-[var(--text-tertiary)]"
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
              <p
                className="block mb-4 text-[0.625rem] font-medium uppercase tracking-[0.25em]"
                id="rsvp-guests-label"
                style={{ fontFamily: "var(--font-label)", color: "var(--text-tertiary)" }}
              >
                Jumlah Tamu
              </p>
              <div role="radiogroup" aria-labelledby="rsvp-guests-label" className="flex flex-wrap gap-x-5 gap-y-3">
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
                      className={`font-display text-xl tabular-nums transition-colors ${
                        isActive
                          ? "text-[var(--text-primary)]"
                          : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
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
              htmlFor="rsvp-message"
              className="block mb-3 text-[0.625rem] font-medium uppercase tracking-[0.25em]"
              style={{ fontFamily: "var(--font-label)", color: "var(--text-tertiary)" }}
            >
              Pesan{" "}
              <span className="normal-case tracking-normal" style={{ color: "var(--text-tertiary)" }}>
                (opsional)
              </span>
            </label>
            <textarea
              id="rsvp-message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Tulis pesan untuk mempelai..."
              rows={4}
              className="input-editorial resize-none"
            />
          </div>

          <button type="submit" disabled={submitted || isLoading} className="btn-editorial w-full text-center">
            {isLoading ? "Mengirim..." : submitted ? "Terima kasih" : "Kirim konfirmasi"}
          </button>

          {submitted && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <p className="text-[var(--accent)] text-sm font-body">✓ Konfirmasi Anda telah diterima.</p>
            </motion.div>
          )}

          {submitError && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-600/80 text-sm font-body">
              {submitError}
            </motion.p>
          )}
        </motion.form>
      </div>
    </section>
  );
}
