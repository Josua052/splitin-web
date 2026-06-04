"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/homepage/sections/Hero";
import { HowItWorks } from "@/components/homepage/sections/HowItWorks";
import { Features } from "@/components/homepage/sections/Features";
import { Testimonials } from "@/components/homepage/sections/Testimonials";
import { FAQ } from "@/components/homepage/sections/FAQ";
import { CTA } from "@/components/homepage/sections/CTA";
import { Box } from "@mantine/core";

export default function Home() {
  return (
    <Box className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        <Hero />
        <HowItWorks />
        <Features />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>

      <Footer />
    </Box>
  );
}
