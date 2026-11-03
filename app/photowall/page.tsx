import type { Metadata } from "next";
import { PhotoWall } from "@/src/components/photobooth/PhotoWall";

export const metadata: Metadata = {
  title: "Photo Wall",
  robots: { index: false, follow: false },
};

export default function PhotoWallPage() {
  return <PhotoWall />;
}
