import React from "react";
import { ImageResponse } from "next/og";
import { invitation } from "@/src/data/invitation";
import { readFile } from "fs/promises";
import { join } from "path";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
  const maellenFont = await readFile(
    join(process.cwd(), "public/Maellen-e9j06.otf")
  );

  const { groom, bride } = invitation.couple;
  const monogram = `${groom.name.charAt(0)}${bride.name.charAt(0)}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#faf8f3",
          borderRadius: "50%",
          position: "relative",
        }}
      >
        {/* Outer border ring */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "1px solid #d4c4b0",
            display: "flex",
          }}
        />
        {/* Inner border ring */}
        <div
          style={{
            position: "absolute",
            inset: "2px",
            borderRadius: "50%",
            border: "1px solid #e3ddd5",
            display: "flex",
          }}
        />
        {/* Monogram text */}
        <div
          style={{
            fontFamily: "Maellen",
            fontSize: "15px",
            color: "#b89a72",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
          }}
        >
          {monogram}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Maellen",
          data: maellenFont,
          style: "normal",
          weight: 400,
        },
      ],
    }
  );
}
