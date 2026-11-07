"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { invitation } from "@/src/data/invitation";
import { SectionHeader } from "@/src/components/ui/SectionHeader";
import { easeOut, fadeUp, viewportOnce } from "@/src/lib/motion";
import { saveRSVPResponse } from "@/src/lib/rsvp-service";
import { useGuestEvents } from "@/src/hooks/useGuestEvents";
import { formatEventDate } from "@/src/lib/event-date";
import type { EventAttendance } from "@/src/lib/events-types";

export interface RSVPFormData {
  name: string;
  attendance: "attending" | "not-attending" | "";
  guestCount: string;
  message: string;
  /** Per-event answers keyed by event id (only events visible to this guest). */
  eventResponses: Record<string, EventAttendance>;
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
  eventResponses: {},
};

const ATTENDANCE_OPTIONS = [
  { value: "attending", label: "Hadir" },
  { value: "not-attending", label: "Berhalangan" },
] as const;

/** Pilihan Hadir / Berhalangan sebagai satu kontrol bersegmen. */
function AttendanceChoice({
  labelId,
  value,
  onChange,
}: {
  labelId: string;
  value: EventAttendance | "";
  /** `null` = pilihan dikosongkan (klik pilihan aktif sekali lagi). */
  onChange: (next: EventAttendance | null) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-labelledby={labelId}
      className="inline-flex shrink-0 border border-[var(--border)]"
    >
      {ATTENDANCE_OPTIONS.map((option, i) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(active ? null : option.value)}
            className={`px-4 py-2.5 font-body text-[11px] font-medium uppercase tracking-[0.18em] transition-colors ${
              i > 0 ? "border-l border-[var(--border)]" : ""
            } ${
              active
                ? "bg-[var(--text-primary)] text-[var(--bg-primary)]"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function RSVP({ guestName = "" }: { guestName?: string }) {
  const { slug, extraEvents } = useGuestEvents();
  const rsvpEvents = extraEvents.filter((e) => e.rsvp);
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
      // Send answers only for events this guest can see; the server re-checks.
      const visibleIds = new Set(rsvpEvents.map((e) => e.id));
      const eventResponses = Object.fromEntries(
        Object.entries(formData.eventResponses).filter(([id]) => visibleIds.has(id))
      );
      await saveRSVPResponse({ ...formData, eventResponses }, slug);
      setSubmitted(true);

      setTimeout(() => {
        setFormData(initialForm);
        setSubmitted(false);
      }, 6000);
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

  return (
    <section id="rsvp" className="section bg-[var(--bg-primary)]">
      <div className="section-inner max-w-xl">
        <SectionHeader
          label="Konfirmasi"
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
            <label htmlFor="rsvp-name" className="eyebrow block mb-3">
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

          <fieldset>
            <legend className="eyebrow block mb-2">Kehadiran</legend>

            <div className="divide-y divide-[var(--border-subtle)] border-y border-[var(--border-subtle)]">
              {[
                {
                  id: "main",
                  title: "Akad Nikah & Resepsi",
                  date: formatEventDate(invitation.wedding.date, invitation.events.akad.dayName),
                },
                ...rsvpEvents.map((e) => ({
                  id: e.id,
                  title: e.title,
                  date: formatEventDate(e.dateISO, e.dayName),
                })),
              ].map((row) => {
                const isMain = row.id === "main";
                const labelId = `rsvp-${row.id}-label`;
                return (
                  <div
                    key={row.id}
                    className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                  >
                    <div id={labelId}>
                      <p className="font-display text-lg leading-tight text-[var(--text-primary)]">
                        {row.title}
                      </p>
                      <p className="font-body text-xs text-[var(--text-tertiary)] mt-0.5">
                        {row.date}
                      </p>
                    </div>
                    <AttendanceChoice
                      labelId={labelId}
                      value={
                        isMain ? formData.attendance : (formData.eventResponses[row.id] ?? "")
                      }
                      onChange={(next) => {
                        if (isMain) {
                          setFormData((prev) => ({ ...prev, attendance: next ?? "" }));
                          setErrors((prev) => ({ ...prev, attendance: undefined }));
                          return;
                        }
                        setFormData((prev) => {
                          const eventResponses = { ...prev.eventResponses };
                          if (next) eventResponses[row.id] = next;
                          else delete eventResponses[row.id];
                          return { ...prev, eventResponses };
                        });
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {rsvpEvents.length > 0 && (
              <p className="font-body text-xs text-[var(--text-tertiary)] mt-3">
                {rsvpEvents.map((e) => e.title).join(", ")} boleh dikosongkan jika belum pasti.
              </p>
            )}
            {errors.attendance && (
              <p className="text-red-600/80 text-xs mt-2 font-body">{errors.attendance}</p>
            )}
          </fieldset>

          {formData.attendance === "attending" && (
            <div>
              <p className="eyebrow block mb-4" id="rsvp-guests-label">
                Jumlah Tamu
              </p>
              <div
                role="radiogroup"
                aria-labelledby="rsvp-guests-label"
                className="flex flex-wrap gap-x-5 gap-y-3"
              >
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
            <label htmlFor="rsvp-message" className="eyebrow block mb-3">
              Pesan{" "}
              <span className="normal-case tracking-normal text-[var(--text-tertiary)]">
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

          <button
            type="submit"
            disabled={submitted || isLoading}
            className="btn-editorial w-full text-center"
          >
            {isLoading
              ? "Mengirim..."
              : submitted
                ? "Terima kasih"
                : "Kirim konfirmasi"}
          </button>

          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              <p className="text-[var(--accent)] text-sm font-body">
                ✓ Konfirmasi Anda telah diterima.
              </p>
            </motion.div>
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
