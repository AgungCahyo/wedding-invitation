"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Invitation = {
  id: string;
  slug: string;
  template: string;
  meta: {
    title: string;
    description: string;
    url: string;
    ogImage: string;
  };
  cover: {
    image: string;
    label: string;
  };
  couple: {
    groom: {
      name: string;
      fullName: string;
      parents: string[];
      photo: string;
      socialLinks: { instagram?: string };
    };
    bride: {
      name: string;
      fullName: string;
      parents: string[];
      photo: string;
      socialLinks: { instagram?: string };
    };
  };
  wedding: {
    date: string;
    displayDate: string;
    timezone: string;
  };
  breather: {
    image: string;
    caption: string;
  };
  events: {
    akad: {
      date: string;
      dayName: string;
      time: string;
      venue: string;
      address: string;
      mapsUrl: string;
    };
    reception: {
      date: string;
      dayName: string;
      time: string;
      venue: string;
      address: string;
      mapsUrl: string;
    };
  };
  quote: {
    quranic: string;
    quranicTranslation: string;
    quranicReference: string;
  };
  story: Array<{
    title: string;
    date: string;
    description: string;
  }>;
  gallery: Array<{
    id: number;
    src: string;
    alt: string;
    aspect: "tall" | "square" | "wide";
  }>;
  rsvp: {
    deadline: string;
    deadlineNote: string;
    waNumber: string;
  };
  gift: {
    note: string;
    methods: Array<{
      id: string;
      owner: "groom" | "bride";
      type: "bank" | "ewallet";
      label: string;
      accountNumber: string;
      accountHolder: string;
    }>;
  };
  maker: {
    name: string;
    url: string;
  };
  audio: {
    src: string;
    lyricsSrc: string;
  };
};

interface EditInvitationFormProps {
  invitationId: string;
  invitation: Invitation;
}

export default function EditInvitationForm({
  invitationId,
  invitation,
}: EditInvitationFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(invitation.meta.title);
  const [description, setDescription] = useState(invitation.meta.description);
  const [url, setUrl] = useState(invitation.meta.url);
  const [ogImage, setOgImage] = useState(invitation.meta.ogImage);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    startTransition(() => {
      setIsLoading(true);
    });

    try {
      const response = await fetch(
        `/api/admin/invitations/${invitationId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            meta: {
              title,
              description,
              url,
              ogImage,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update: ${response.statusText}`);
      }

      // Optionally, refetch the invitation to get the latest data?
      // For now, we'll show a success message and redirect after a short delay.
      setError("Invitation updated successfully!");
      setIsLoading(false);

      // Redirect to the view page after a short delay
      setTimeout(() => {
        router.push(`/admin/invitations/${invitationId}`);
      }, 1500);
    } catch (err: any) {
      console.error("Error updating invitation:", err);
      setError("Failed to update invitation: " + (err.message || "Unknown error"));
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle((e.currentTarget as HTMLInputElement).value);
            setError(null);
          }}
          className="input-editorial w-full"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => {
            setDescription((e.currentTarget as HTMLTextAreaElement).value);
            setError(null);
          }}
          className="textarea-editorial w-full"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          URL
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => {
            setUrl((e.currentTarget as HTMLInputElement).value);
            setError(null);
          }}
          className="input-editorial w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          OG Image URL
        </label>
        <input
          type="url"
          value={ogImage}
          onChange={(e) => {
            setOgImage((e.currentTarget as HTMLInputElement).value);
            setError(null);
          }}
          className="input-editorial w-full"
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            // Reset to original values
            setTitle(invitation.meta.title);
            setDescription(invitation.meta.description);
            setUrl(invitation.meta.url);
            setOgImage(invitation.meta.ogImage);
            setError(null);
          }}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={`inline-flex items-center px-4 py-2 bg-[var(--accent)] text-[var(--bg-primary)] font-medium rounded-md hover:bg-[var(--accent)/90] transition-colors ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Updating..." : "Update Invitation"}
        </button>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      )}
    </form>
  );
}
