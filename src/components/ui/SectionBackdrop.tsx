import Image from "next/image";

interface SectionBackdropProps {
  src: string;
  /** Position focus of the image, e.g. "center 30%" */
  position?: string;
}

/**
 * Very low-opacity, desaturated background photo used behind text-only
 * sections for a quiet photographic presence — not a visual focal point.
 * Always render inside a `relative` section, before the content, and give
 * the content wrapper `relative z-10`.
 */
export function SectionBackdrop({ src, position = "center" }: SectionBackdropProps) {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <Image
        src={src}
        alt=""
        fill
        className="object-cover grayscale opacity-[0.07] mix-blend-luminosity"
        style={{ objectPosition: position }}
        sizes="100vw"
      />
    </div>
  );
}