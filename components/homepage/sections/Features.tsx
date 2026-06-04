"use client";

import { Container, Title, Text, Stack, SimpleGrid, Paper, Box, ThemeIcon } from "@mantine/core";
import { 
  IconPercentage, 
  IconCoin, 
  IconBrandWhatsapp, 
  IconLink, 
  IconHistory, 
  IconLockOpen 
} from "@tabler/icons-react";

const features = [
  {
    icon: <IconPercentage size={24} />,
    title: "Split Tidak Merata",
    description: "Makan lebih banyak? Bayar lebih banyak. Atur porsi setiap orang secara manual.",
  },
  {
    icon: <IconCoin size={24} />,
    title: "Multi-mata Uang",
    description: "Liburan ke luar negeri? Aplikasi kami mendukung berbagai jenis mata uang global.",
  },
  {
    icon: <IconBrandWhatsapp size={24} />,
    title: "Bagikan via WhatsApp",
    description: "Kirim rincian tagihan langsung ke grup chat WhatsApp dalam satu klik.",
  },
  {
    icon: <IconLink size={24} />,
    title: "Link Split Shareable",
    description: "Bagikan link khusus ke temanmu agar mereka bisa cek rinciannya kapan saja.",
  },
  {
    icon: <IconHistory size={24} />,
    title: "Riwayat Tagihan",
    description: "Pantau pengeluaran bersama kamu dari waktu ke waktu dalam satu dashboard.",
  },
  {
    icon: <IconLockOpen size={24} />,
    title: "Bebas Akun",
    description: "Tidak perlu pusing ingat password. Langsung pakai tanpa harus login.",
  },
];

export function Features() {
  return (
    <Box component="section" id="features" className="py-24 bg-white">
      <Container size="lg">
        <Stack gap="xl" align="center" className="text-center mb-16">
          <Title order={2} className="text-4xl font-bold tracking-tight text-zinc-900">
            Fitur Unggulan
          </Title>
          <Text size="lg" c="dimmed" className="max-w-xl">
            Semua yang kamu butuhkan untuk patungan yang transparan.
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
          {features.map((feature, index) => (
            <Paper 
              key={index} 
              p="xl" 
              radius="lg" 
              withBorder 
              className="bg-white hover:shadow-lg transition-shadow duration-300"
            >
              <ThemeIcon 
                variant="light" 
                size={48} 
                radius="md" 
                color="emerald" 
                className="bg-primary-light text-primary mb-6"
              >
                {feature.icon}
              </ThemeIcon>
              <Title order={3} size="h4" className="font-bold text-zinc-900 mb-3">
                {feature.title}
              </Title>
              <Text size="sm" c="dimmed" className="leading-relaxed">
                {feature.description}
              </Text>
            </Paper>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
}
