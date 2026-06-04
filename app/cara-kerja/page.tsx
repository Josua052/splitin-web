"use client";

import { Box } from "@mantine/core";
import { InteractiveHowItWorks } from "@/components/how-it-works/InteractiveHowItWorks";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function CaraKerjaPage() {
  return (
    <Box className="flex min-h-screen flex-col bg-[#F9FAFB]">
      <Header />
      <main className="flex-grow">
        <InteractiveHowItWorks />
      </main>
      <Footer />
    </Box>
  );
}
