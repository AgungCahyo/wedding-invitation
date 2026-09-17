"use client";
import { useState } from "react";

interface Invitation {
  id: string;
  slug: string;
  template: string;
  meta: {
    title: string;
    description: string;
    url: string;
    ogImage: string;
  };
  created_at: string;
  updated_at: string;
}

interface InvitationTableProps {
  invitations: Invitation[];
  onDelete: (id: string) => Promise<void>;
}

export default function InvitationTable({ invitations, onDelete }: InvitationTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredInvitations = invitations.filter((inv) =>
    inv.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.meta.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by slug or title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded px-3 py-2 w-full max-w-xs"
        />
      </div>

      {filteredInvitations.length === 0 ? (
        <p className="text-center text-muted-foreground">No invitations found.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Slug</th>
              <th className="text-left p-2">Template</th>
              <th className="text-left p-2">Title</th>
              <th className="text-left p-2">Created</th>
              <th className="text-left p-2">Updated</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvitations.map((inv) => (
              <tr key={inv.id} className="border-b hover:bg-muted">
                <td className="p-2">{inv.slug}</td>
                <td className="p-2">{inv.template}</td>
                <td className="p-2">{inv.meta.title}</td>
                <td className="p-2">{new Date(inv.created_at).toLocaleDateString()}</td>
                <td className="p-2">{new Date(inv.updated_at).toLocaleDateString()}</td>
                <td className="p-2 space-x-2">
                  {/* View link */}
                  <a href={`/admin/invitations/${inv.id}`} className="text-primary hover:underline">
                    View
                  </a>
                  {/* Edit link */}
                  <a href={`/admin/invitations/${inv.id}/edit`} className="text-primary hover:underline">
                    Edit
                  </a>
                  {/* Delete button */}
                  <button
                    onClick={async () => {
                      if (window.confirm("Are you sure you want to delete this invitation?")) {
                        await onDelete(inv.id);
                        // Note: In a real app, we would refetch or update state optimistically.
                        // For simplicity, we rely on the parent to refetch after deletion.
                      }
                    }}
                    className="text-destructive hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}