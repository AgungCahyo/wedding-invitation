import React from "react";
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { invitation } from "@/src/data/invitation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "Undangan Pernikahan";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadFont(fileName: string): Promise<ArrayBuffer | null> {
  try {
    const filePath = path.join(process.cwd(), "public", fileName);
    const buffer = await readFile(filePath);
    return buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    );
  } catch {
    return null;
  }
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ guest: string }>;
}) {
  const { guest: guestParam } = await params;
  const guestName = guestParam ? decodeURIComponent(guestParam).trim() : "";
  const showGuest = Boolean(guestName && guestName.toLowerCase() !== "tamu");

  const { groom, bride } = invitation.couple;
  const brideShort = bride.name.split(" ")[0];
  const groomShort = groom.name.split(" ")[0];

  const [maellenFont, bodyFont] = await Promise.all([
    loadFont("Maellen-e9j06.otf"),
    loadFont("fonts/DMSans-Regular.ttf"),
  ]);

  const fonts = [
    ...(bodyFont
      ? [
          {
            name: "DM Sans",
            data: bodyFont,
            style: "normal" as const,
            weight: 400 as const,
          },
        ]
      : []),
    ...(maellenFont
      ? [
          {
            name: "Maellen",
            data: maellenFont,
            style: "normal" as const,
            weight: 400 as const,
          },
        ]
      : []),
  ];

  const bodyFamily = bodyFont ? "DM Sans" : "sans-serif";
  const displayFamily = maellenFont ? "Maellen" : bodyFamily;
  const guestSize = guestName.length > 18 ? 44 : guestName.length > 12 ? 52 : 60;

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
          fontFamily: bodyFamily,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 36,
            left: 36,
            width: 72,
            height: 72,
            borderTop: "3px solid #b89a72",
            borderLeft: "3px solid #b89a72",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 36,
            right: 36,
            width: 72,
            height: 72,
            borderBottom: "3px solid #b89a72",
            borderRight: "3px solid #b89a72",
          }}
        />

        <div
          style={{
            fontSize: 28,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "#8b7f76",
            marginBottom: 28,
            display: "flex",
            fontFamily: bodyFamily,
          }}
        >
          Undangan Pernikahan
        </div>

        <div
          style={{
            fontSize: 108,
            color: "#2b2520",
            fontFamily: displayFamily,
            display: "flex",
            alignItems: "center",
            lineHeight: 1,
          }}
        >
          <span>{brideShort}</span>
          <span
            style={{
              color: "#b89a72",
              fontSize: 64,
              marginLeft: 28,
              marginRight: 28,
              fontFamily: displayFamily,
            }}
          >
            &
          </span>
          <span>{groomShort}</span>
        </div>

        <div
          style={{
            width: 120,
            height: 3,
            backgroundColor: "#b89a72",
            marginTop: 36,
            marginBottom: 28,
            display: "flex",
          }}
        />

        <div
          style={{
            fontSize: 36,
            color: "#5a524a",
            letterSpacing: 1,
            display: "flex",
            fontFamily: bodyFamily,
          }}
        >
          {invitation.wedding.displayDate}
        </div>

        {showGuest ? (
          <div
            style={{
              marginTop: 36,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: 22,
                letterSpacing: 6,
                textTransform: "uppercase",
                color: "#8b7f76",
                marginBottom: 12,
                display: "flex",
                fontFamily: bodyFamily,
              }}
            >
              Kepada
            </div>
            <div
              style={{
                fontSize: guestSize,
                color: "#2b2520",
                display: "flex",
                lineHeight: 1.1,
                fontFamily: bodyFamily,
              }}
            >
              {guestName}
            </div>
          </div>
        ) : null}
      </div>
    ),
    {
      ...size,
      fonts,
    }
  );
}
