"use client";
import { useState, useEffect } from "react";
import InvitationTable from "@/src/components/admin/InvitationTable";
import Link from "next/link";

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

interface ApiResponse {
  invitations: Invitation[];
  count: number;
}

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchInvitations();
  }, [search]);

  const fetchInvitations = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL(`/api/admin/invitations`, window.location.origin);
      if (search) {
        url.searchParams.set("search", search);
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      setInvitations(data.invitations);
    } catch (err: any) {
      setError(err.message || "Failed to fetch invitations");
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/invitations/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Refetch after deletion
      fetchInvitations();
    } catch (err: any) {
      setError(err.message || "Failed to delete invitation");
    }
  };

  if (loading) {
    return <p className="text-center py-8">Loading...</p>;
  }

  if (error) {
    return <p className="text-center text-destructive py-8">{error}</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Invitations</h1>
      <div className="flex flex-wrap items-center mb-4 gap-2">
        <Link
          href="/admin/invitations/new"
          className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
        >
          New Invitation
        </Link>
      </div>
      <InvitationTable
        invitations={invitations}
        onDelete={handleDelete}
      />
    </div>
  );
}