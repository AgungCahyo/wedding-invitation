import Link from "next/link";

interface AdminPageHeaderProps {
  title: string;
  backHref?: string;
}

export default function AdminPageHeader({ title, backHref }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
      <h1 className="text-2xl font-bold mb-2 sm:mb-0">{title}</h1>
      {backHref && (
        <Link href={backHref} className="text-sm text-muted-foreground hover:underline">
          ← Back
        </Link>
      )}
    </div>
  );
}