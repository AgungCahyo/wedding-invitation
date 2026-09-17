import { useState } from "react";

interface DeleteInvitationButtonProps {
  invitationId: string;
  onDelete: (id: string) => Promise<void>;
}

export default function DeleteInvitationButton({ 
  invitationId, 
  onDelete 
}: DeleteInvitationButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    if (!window.confirm("Are you sure you want to delete this invitation? This action cannot be undone.")) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onDelete(invitationId);
      // Note: The parent should handle refetching or redirecting after deletion.
    } catch (err: any) {
      setError(err.message || "Failed to delete invitation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <p className="text-destructive mb-2">{error}</p>}
      <button
        onClick={handleClick}
        disabled={loading}
        className="text-destructive hover:text-destructive/80"
      >
        {loading ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
}