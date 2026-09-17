"use client";
import { useState } from "react";
import type {
  Invitation,
  TemplateKey,
  StoryEntry,
  GalleryImage,
  GiftMethod,
} from "@/src/types/invitation";
import { createDefaultInvitation, NEUTRAL_IMAGE } from "@/src/lib/default-invitation";
import { formatDateID, isValidURL } from "./invitation-form/validation";
import MetaSection from "@/src/components/admin/invitation-form/MetaSection";
import TemplateSelector from "@/src/components/admin/invitation-form/TemplateSelector";
import CoverSection from "@/src/components/admin/invitation-form/CoverSection";
import CoupleSection from "@/src/components/admin/invitation-form/CoupleSection";
import WeddingSection from "@/src/components/admin/invitation-form/WeddingSection";
import BreatherSection from "@/src/components/admin/invitation-form/BreatherSection";
import EventsSection from "@/src/components/admin/invitation-form/EventsSection";
import QuoteSection from "@/src/components/admin/invitation-form/QuoteSection";
import StorySection from "@/src/components/admin/invitation-form/StorySection";
import GallerySection from "@/src/components/admin/invitation-form/GallerySection";
import RsvpSection from "@/src/components/admin/invitation-form/RsvpSection";
import GiftSection from "@/src/components/admin/invitation-form/GiftSection";
import ClosingSection from "@/src/components/admin/invitation-form/ClosingSection";
import MakerSection from "@/src/components/admin/invitation-form/MakerSection";
import AudioSection from "@/src/components/admin/invitation-form/AudioSection";


type FormInvitation = Omit<Invitation, "id" | "slug">;

type InvitationFormProps = {
  invitationId?: string; // If provided, we are editing
  initialData?: Partial<Invitation>;
  onSuccess: (invitationId: string) => void;
};

export default function InvitationForm({
  invitationId,
  initialData = {},
  onSuccess
}: InvitationFormProps) {
  // Helper to get default invitation state (without id and slug)
  const getDefaultState = (): FormInvitation => {
    const dummyInput = {
      slug: "temp-slug",
      template: "ayutika" as TemplateKey,
      title: "Undangan Pernikahan",
      description: "Detail undangan pernikahan akan segera diperbarui.",
      url: "",
      ogImage: "",
    };
    const full = createDefaultInvitation(dummyInput);
    const { slug, ...state } = full;
    return state;
  };

  // Initialize state from initialData (if provided) or default
  const [invitationState, setInvitationState] = useState<FormInvitation>(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      // Remove id and slug from initialData to avoid sending them
      const { id, slug, ...stateWithoutIdSlug } = initialData as Invitation;
      return stateWithoutIdSlug as FormInvitation;
    }
    return getDefaultState();
  });

  // Destructure invitationState for easier access in render
  const {
    meta,
    cover,
    couple,
    wedding,
    breather,
    events,
    quote,
    story,
    gallery,
    rsvp,
    gift,
    closing,
    maker,
    audio,
    template,
  } = invitationState;

  const previewSlug = invitationId ? (initialData?.slug ?? '') : '';

  // --- Loading and error states ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Validation helpers ---
  const isValidDate = (str: string): boolean => {
    // Expects YYYY-MM-DD
    return /^\d{4}-\d{2}-\d{2}$/.test(str);
  };

  // --- Upload status for asset fields ---
  type UploadStatus = 'idle' | 'loading' | 'success' | 'error';
  type UploadState = Record<
    string,
    { status: UploadStatus; error?: string; previewUrl?: string }
  >;
  const [uploadStatus, setUploadStatus] = useState<UploadState>({});

  // Helper to get public URL from storage path
  const getPublicUrl = (storagePath: string | null | undefined): string => {
    if (!storagePath) return '';
    // If it's already a full URL, return as-is
    if (storagePath.startsWith('http')) return storagePath;
    // Otherwise, assume it's a path in the invitation-assets bucket
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/invitation-assets/${storagePath}`;
  };

  // --- Upload handler for asset fields ---
  const handleAssetUpload = async (fieldKey: string, file: File, assetType: string) => {
    // Set upload status to loading
    setUploadStatus(prev => ({
      ...prev,
      [fieldKey]: { status: 'loading', error: undefined, previewUrl: undefined }
    }));

    try {
      // Call the upload endpoint
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', assetType);

      const response = await fetch(`/api/admin/invitations/${invitationId}/asset`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload asset');
      }

      const result = await response.json();
      const storagePath = result.storagePath;

      // Update the invitation state with the new storage path
      if (fieldKey === 'cover.image') {
        setInvitationState(s => ({ ...s, cover: { ...s.cover, image: storagePath } }));
      } else {
        // For other fields, we'll just log a warning.
        console.warn(`Unhandled fieldKey in handleAssetUpload: ${fieldKey}`);
      }

      // Set upload status to success and set preview URL
      const previewUrl = getPublicUrl(storagePath);
      setUploadStatus(prev => ({
        ...prev,
        [fieldKey]: { status: 'success', previewUrl }
      }));
    } catch (err) {
      console.error('Error uploading asset:', err);
      setUploadStatus(prev => ({
        ...prev,
        [fieldKey]: { status: 'error', error: err instanceof Error ? err.message : 'Unknown error' }
      }));
    }
  };

  // --- Handler generators for updating nested state ---
  const updateState = (updater: (state: FormInvitation) => FormInvitation) => {
    setInvitationState(prev => updater(prev));
  };

  // --- Form submission ---
  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Prepare data for API: we need to add a temporary slug and id if creating
      const data: Partial<Invitation> = { ...invitationState };
      if (!invitationId) {
        // Create mode: generate a temporary slug (will be replaced by server)
        data.slug = `temp-${Date.now()}`;
        data.template = invitationState.template;
      }

      const method = invitationId ? "PUT" : "POST";
      const url = invitationId
        ? `/api/admin/invitations/${invitationId}`
        : `/api/admin/invitations`;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save invitation");
      }

      const result = await response.json();
      onSuccess(result.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-bold">{invitationId ? "Edit Undangan" : "Buat Undangan Baru"}</h2>
      {error && <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">{error}</div>}

      <MetaSection
        meta={meta}
        updateState={updateState}
        isValidURL={isValidURL}
        getPublicUrl={getPublicUrl}
        uploadStatus={uploadStatus}
        handleAssetUpload={handleAssetUpload}
      />

      {/* Template Selector */}
      <TemplateSelector
        template={template}
        updateState={updateState}
      />

      {/* Cover */}
      <CoverSection
        cover={cover}
        updateState={updateState}
        getPublicUrl={getPublicUrl}
        uploadStatus={uploadStatus}
        handleAssetUpload={handleAssetUpload}
      />

      {/* Couple */}
      <CoupleSection
        couple={couple}
        updateState={updateState}
        getPublicUrl={getPublicUrl}
        uploadStatus={uploadStatus}
        handleAssetUpload={handleAssetUpload}
      />

      {/* Wedding */}
      <WeddingSection
        wedding={wedding}
        updateState={updateState}
      />

      {/* Breather */}
      <BreatherSection
        breather={breather}
        updateState={updateState}
        getPublicUrl={getPublicUrl}
        uploadStatus={uploadStatus}
        handleAssetUpload={handleAssetUpload}
      />

      {/* Events */}
      <EventsSection
        events={events}
        updateState={updateState}
      />

      {/* Quote */}
      <QuoteSection
        quote={quote}
        updateState={updateState}
      />

      {/* Story */}
      <StorySection
        story={story}
        updateState={updateState}
      />

      {/* Gallery */}
      <GallerySection
        gallery={gallery}
        updateState={updateState}
        getPublicUrl={getPublicUrl}
        uploadStatus={uploadStatus}
        handleAssetUpload={handleAssetUpload}
      />

      {/* RSVP */}
      <RsvpSection
        rsvp={rsvp}
        updateState={updateState}
      />

      {/* Gift */}
      <GiftSection
        gift={gift}
        updateState={updateState}
      />

      {/* Closing */}
      <ClosingSection
        closing={closing}
        updateState={updateState}
      />

      {/* Maker */}
      <MakerSection
        maker={maker}
        updateState={updateState}
      />

      {/* Audio */}
      <AudioSection
        audio={audio}
        updateState={updateState}
        getPublicUrl={getPublicUrl}
        uploadStatus={uploadStatus}
        handleAssetUpload={handleAssetUpload}
      />

      <div className="flex justify-end pt-4">
        {invitationId && (
          <button
            type="button"
            disabled={!previewSlug || loading}
            title={!previewSlug ? 'Preview unavailable: invitation must be saved first' : undefined}
            onClick={() => {
              window.open(`/${previewSlug}`, '_blank', 'noopener,noreferrer');
            }}
            className="mr-4 px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Mengirim pratinjau...' : 'Pratinjau'}
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Menyimpan..." : invitationId ? "Perbarui Undangan" : "Buat Undangan"}
        </button>
      </div>
    </form>
  );
}