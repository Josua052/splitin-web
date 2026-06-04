"use client";

import { Button, Container, Title, Text, Stack, Box, SimpleGrid } from "@mantine/core";
import {
  IconArrowRight,
  IconCamera,
  IconReceipt,
  IconShare,
  IconTarget,
} from "@tabler/icons-react";
import Link from "next/link";

const steps = [
  {
    icon: <IconCamera size={32} />,
    title: "Scan Struk",
    description: "Foto struk atau input item manual, lalu cek hasil OCR.",
    color: "emerald",
  },
  {
    icon: <IconReceipt size={32} />,
    title: "Rapikan Detail",
    description: "Atur kuantitas, harga satuan, pajak persen, dan service.",
    color: "blue",
  },
  {
    icon: <IconTarget size={32} />,
    title: "Pilih Mode Split",
    description: "Sama rata, per item, atau custom persen sesuai situasi.",
    color: "emerald",
  },
  {
    icon: <IconShare size={32} />,
    title: "Bagikan Hasil",
    description: "Cek total tiap orang dan kirim ke teman-temanmu.",
    color: "emerald",
  },
];

export function HowItWorks() {
  return (
    <Box component="section" id="how-it-works" className="py-24 bg-white">
      <Container size="lg">
        <Stack gap="xl" align="center" className="text-center mb-16">
          <Title order={2} className="text-4xl font-bold tracking-tight text-zinc-900">
            Cara Kerja
          </Title>
          <Text size="lg" c="dimmed" className="max-w-xl">
            Alurnya mengikuti flow split asli: dari struk sampai hasil patungan.
          </Text>
        </Stack>

        <Box className="relative">
          {/* Connecting Dotted Line (Desktop only) */}
          <Box 
            className="absolute top-12 left-0 right-0 h-0.5 border-t-2 border-dotted border-zinc-200 hidden md:block" 
            style={{ zIndex: 0 }}
          />
          
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing={28} className="relative z-10">
            {steps.map((step, index) => (
              <Stack key={index} align="center" className="text-center">
                <Box 
                  className={`w-24 h-24 rounded-3xl flex items-center justify-center bg-white border-2 border-zinc-50 shadow-sm mb-4`}
                  style={{ 
                    color: step.color === "emerald" ? "var(--color-primary)" : "#3b82f6",
                  }}
                >
                  <Box className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-zinc-50`}>
                    {step.icon}
                  </Box>
                </Box>
                <Title order={3} size="h4" className="font-bold text-zinc-900 mb-2">
                  {step.title}
                </Title>
                <Text size="sm" c="dimmed" className="max-w-[240px] leading-relaxed">
                  {step.description}
                </Text>
              </Stack>
            ))}
          </SimpleGrid>
        </Box>

        <Stack align="center" mt={48}>
          <Button
            component={Link}
            href="/cara-kerja"
            radius="xl"
            size="lg"
            className="bg-primary px-8 font-bold hover:bg-primary-dark"
            rightSection={<IconArrowRight size={20} />}
          >
            Lihat Panduan Interaktif
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
