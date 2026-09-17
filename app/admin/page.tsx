import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Root Admin Dashboard</h1>
      <p className="mb-6">
        Welcome to the Root Admin dashboard. From here you can manage invitations globally.
      </p>
      <Link href="/admin/invitations" className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90">
        Manage Invitations
      </Link>
    </div>
  );
}