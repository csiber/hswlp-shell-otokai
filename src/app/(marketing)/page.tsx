import { Metadata } from "next";
import { MusicLanding } from "@/components/landing/MusicLanding";
import { SITE_NAME, SITE_DESCRIPTION } from "@/constants";

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
};

export default function Home() {
  return (
    <main>
      <MusicLanding />
    </main>
  );
}
