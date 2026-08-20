import React from "react";
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { invitation } from "@/src/data/invitation";
import { defaultTheme, resolveTheme, themes } from "@/src/data/theme";

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
  const theme = themes[
    resolveTheme(process.env.NEXT_PUBLIC_DEFAULT_THEME ?? defaultTheme)
  ];

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
          backgroundColor: theme.bgPrimary,
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
            borderTop: `3px solid ${theme.accent}`,
            borderLeft: `3px solid ${theme.accent}`,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 36,
            right: 36,
            width: 72,
            height: 72,
            borderBottom: `3px solid ${theme.accent}`,
            borderRight: `3px solid ${theme.accent}`,
          }}
        />

        <div
          style={{
            fontSize: 28,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: theme.textTertiary,
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
            color: theme.textPrimary,
            fontFamily: displayFamily,
            display: "flex",
            alignItems: "center",
            lineHeight: 1,
          }}
        >
          <span>{brideShort}</span>
          <span
            style={{
              color: theme.accent,
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
            backgroundColor: theme.accent,
            marginTop: 36,
            marginBottom: 28,
            display: "flex",
          }}
        />

        <div
          style={{
            fontSize: 36,
            color: theme.textSecondary,
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
                color: theme.textTertiary,
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
                color: theme.textPrimary,
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
