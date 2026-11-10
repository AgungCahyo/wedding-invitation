"use client";

import { useState } from "react";
import { AdminLayout } from "./layout/AdminLayout";
import { AdminHeader } from "./layout/AdminHeader";
import { AdminNavigation } from "./layout/AdminNavigation";
import { GuestLinkGenerator } from "./guests/GuestLinkGenerator";
import { RSVPManagement } from "./rsvp/RSVPManagement";
import { WishesManagement } from "./wishes/WishesManagement";
import { PhotoManagement } from "./photos/PhotoManagement";
import type { AdminTab } from "@/src/types/admin";

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>("guest-links");

  return (
    <AdminLayout>
      <AdminHeader />
      <AdminNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "guest-links" ? (
        <GuestLinkGenerator />
      ) : activeTab === "rsvp" ? (
        <RSVPManagement />
      ) : activeTab === "photos" ? (
        <PhotoManagement />
      ) : (
        <WishesManagement />
      )}
    </AdminLayout>
  );
}