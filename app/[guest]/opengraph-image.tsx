import React from "react";
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { invitation } from "@/src/data/invitation";

export const runtime = "nodejs";
export const alt = "Wedding Invitation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadFont(fileName: string): Promise<ArrayBuffer | null> {
  try {
    const filePath = path.join(process.cwd(), "public", fileName);
    const buffer = await readFile(filePath);
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  } catch {
    // Falls back to the system serif font if the local font file can't be read
    // (e.g. on a runtime without filesystem access to /public).
    return null;
  }
}

export default async function OpengraphImage({
  params,
}: {
  params: { guest: string };
}) {
  const guestName = params?.guest ? decodeURIComponent(params.guest) : "";
  const { groom, bride } = invitation.couple;
  const monogram = `${groom.name.charAt(0)}${bride.name.charAt(0)}`;

  const [maellenFont, cormorantFont] = await Promise.all([
    loadFont("Maellen-e9j06.otf"),
    // DM Sans / Cormorant are loaded via next/font at runtime elsewhere in the
    // app, but next/og needs raw font bytes — Maellen is the one local file
    // we ship, so we reuse it for both the monogram and the couple names.
    loadFont("Maellen-e9j06.otf"),
  ]);

  const fonts = maellenFont
    ? [{ name: "Maellen", data: maellenFont, style: "normal" as const, weight: 400 as const }]
    : [];
  const displayFontFamily = maellenFont ? "Maellen" : "Georgia, serif";
  void cormorantFont;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#faf8f3",
          position: "relative",
        }}
      >
        {/* Corner ornaments */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 40,
            width: 48,
            height: 48,
            borderTop: "1px solid #b89a72",
            borderLeft: "1px solid #b89a72",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 40,
            right: 40,
            width: 48,
            height: 48,
            borderBottom: "1px solid #b89a72",
            borderRight: "1px solid #b89a72",
          }}
        />

        {/* Monogram */}
        <div
          style={{
            fontSize: 40,
            color: "#b89a72",
            marginBottom: 20,
            fontFamily: displayFontFamily,
            display: "flex",
          }}
        >
          {monogram}
        </div>

        {/* Eyebrow */}
        <div
          style={{
            fontSize: 16,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "#8b7f76",
            marginBottom: 28,
            display: "flex",
          }}
        >
          Wedding Invitation
        </div>

        {/* Couple names */}
        <div
          style={{
            fontSize: 68,
            color: "#2b2520",
            fontFamily: displayFontFamily,
            display: "flex",
            alignItems: "center",
            gap: 24,
          }}
        >
          <span>{groom.name.split(" ")[0]}</span>
          <span style={{ color: "#b89a72", fontSize: 40 }}>&amp;</span>
          <span>{bride.name.split(" ")[0]}</span>
        </div>

        <div
          style={{
            width: 80,
            height: 1,
            backgroundColor: "#d4c4b0",
            marginTop: 28,
            marginBottom: 28,
            display: "flex",
          }}
        />

        <div
          style={{
            fontSize: 18,
            color: "#5a524a",
            marginBottom: guestName ? 20 : 0,
            display: "flex",
          }}
        >
          {invitation.wedding.displayDate}
        </div>

        {/* Guest name */}
        {guestName && (
          <div
            style={{
              fontSize: 22,
              color: "#2b2520",
              padding: "10px 32px",
              border: "1px solid #e3ddd5",
              display: "flex",
            }}
          >
            Khusus Untuk: {guestName}
          </div>
        )}
      </div>
    ),
    {
      ...size,
      fonts,
    }
  );
}
