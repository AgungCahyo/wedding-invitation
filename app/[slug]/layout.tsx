import { getInvitationBySlug } from "@/src/lib/invitation-service";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export default async function SlotLayout(
  props: {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
  }
) {
  const { children, params } = props;
  const paramsObj = await params;
  const { slug } = paramsObj;
  const invitationData = await getInvitationBySlug(slug);

  if (!invitationData) {
    notFound();
  }

  let fontDisplayVar: string = "";
  let fontBodyVar: string = "";

  if (invitationData.template === "ayutika") {
    const { ayutikaDisplayFont, ayutikaBodyFont } = await import(
      "@/src/templates/ayutika/fonts"
    );
    fontDisplayVar = ayutikaDisplayFont.variable;
    fontBodyVar = ayutikaBodyFont.variable;
    await import("@/src/templates/ayutika/styles");
  } else if (invitationData.template === "template02") {
    const { template02DisplayFont, template02BodyFont } = await import(
      "@/src/templates/template02/fonts"
    );
    fontDisplayVar = template02DisplayFont.variable;
    fontBodyVar = template02BodyFont.variable;
    await import("@/src/templates/template02/styles");
  }

  const fontStyle =
    fontDisplayVar && fontBodyVar
      ? `
        :root {
          --font-display: ${fontDisplayVar};
          --font-body: ${fontBodyVar};
        }
      `
      : "";

  return (
    <>
      {fontStyle && <style dangerouslySetInnerHTML={{ __html: fontStyle }} />}
      <div data-template={invitationData.template}>
        {children}
      </div>
    </>
  );
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const paramsObj = await params;
  const { slug } = paramsObj;
  const invitationData = await getInvitationBySlug(slug);
  if (!invitationData) {
    return {
      title: "Undangan Digital",
      description: "Platform undangan digital modern dan responsif.",
    };
  }

  return {
    title: `${invitationData.meta.title} | ${invitationData.wedding.displayDate}`,
    description: invitationData.meta.description,
    openGraph: {
      title: `${invitationData.meta.title} | ${invitationData.wedding.displayDate}`,
      description: invitationData.meta.description,
      url: invitationData.meta.url,
      images: [
        {
          url: invitationData.meta.ogImage,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${invitationData.meta.title} | ${invitationData.wedding.displayDate}`,
      description: invitationData.meta.description,
      images: [invitationData.meta.ogImage],
    },
  };
}