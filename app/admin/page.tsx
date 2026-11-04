"use client";

import { AdminAuth } from "@/src/components/AdminAuth";
import { AdminDashboard } from "@/src/components/admin/AdminDashboard";

export default function AdminPage() {
  return (
    <AdminAuth>
      <AdminDashboard />
    </AdminAuth>
  );
}
