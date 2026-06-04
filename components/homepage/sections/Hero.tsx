"use client";

import {
  Container,
  Grid,
  Title,
  Text,
  Button,
  Group,
  Badge,
  Paper,
  Stack,
  Avatar,
  Box,
} from "@mantine/core";
import {
  IconArrowRight,
  IconPlayerPlay,
  IconCheck,
  IconHeart,
  IconCopy,
} from "@tabler/icons-react";
import Link from "next/link";

export function Hero() {
  return (
    <Box className="relative overflow-hidden bg-[#fff] py-24 lg:py-32">
      {/* Decorative Background Elements */}
      <Box className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <Box className="absolute top-1/2 -left-24 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />

      <Container size="lg">
        <Grid align="center">
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Stack gap="xl">
              <Badge
                variant="light"
                color="emerald"
                size="xl"
                radius="xl"
                className="w-fit px-6 py-4 bg-primary-light text-primary font-bold border border-primary/10"
                leftSection={<IconHeart size={16} fill="currentColor" />}
              >
                Tagihan Bersama, tanpa drama
              </Badge>

              <Title className="text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight text-zinc-900">
                Split tagihan jadi{" "}
                <span className="text-primary">gampang banget.</span>
              </Title>

              <Text
                size="xl"
                className="text-zinc-600 max-w-xl leading-relaxed"
              >
                Masukan total tagihan, tambahkan teman, dan SplitBase hitung
                semuanya otomatis. Tidak perlu kalkulator.
              </Text>

              <Group gap="md">
                <Link href="/split">
                  <Button
                    size="xl"
                    radius="xl"
                    variant="filled"
                    className="bg-primary hover:bg-primary-dark shadow-lg shadow-primary/20 px-8"
                    rightSection={<IconArrowRight size={20} />}
                  >
                    Mulai Split Sekarang
                  </Button>
                </Link>
                <Button
                  size="xl"
                  radius="xl"
                  variant="outline"
                  color="gray"
                  className="border-zinc-200 text-zinc-700 hover:bg-zinc-50 px-8"
                  leftSection={<IconPlayerPlay size={20} />}
                >
                  Lihat Demo
                </Button>
              </Group>

              <Group gap="xl" mt="md">
                <TrustMarker
                  icon={<IconCheck size={16} />}
                  text="Gratis digunakan"
                />
                <TrustMarker
                  icon={<IconCheck size={16} />}
                  text="Tanpa daftar akun"
                />
                <TrustMarker
                  icon={<IconCheck size={16} />}
                  text="Langsung pakai"
                />
              </Group>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 5 }}>
            <AnimatedSplitDemo />
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  );
}

function AnimatedSplitDemo() {
  const participants = ["Ricky", "Sari", "Dimas", "Lina"];

  return (
    <Paper
      shadow="2xl"
      radius="lg"
      p={0}
      className="split-demo-card relative overflow-hidden border border-zinc-100 bg-white scale-105 lg:scale-110 origin-center"
    >
      <Box className="relative min-h-[480px] p-6">
        <Box className="split-demo-cursor" aria-hidden="true" />

        <Box className="split-demo-form">
          <Group justify="space-between" mb="lg" align="flex-start">
            <Group gap="sm">
              <Box className="w-11 h-11 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <IconHeart size={21} fill="currentColor" />
              </Box>
              <Stack gap={4}>
                <Box className="h-6">
                  <Text
                    component="span"
                    fw={800}
                    size="sm"
                    className="split-demo-type split-demo-type-title text-zinc-900"
                  >
                    Makan Malam
                  </Text>
                </Box>
                <Text size="xs" c="dimmed">
                  24 Nov 2024
                </Text>
              </Stack>
            </Group>

            <Stack gap={3} align="flex-end">
              <Text size="xs" c="dimmed">
                Total
              </Text>
              <Box className="h-7">
                <Text
                  component="span"
                  fw={900}
                  size="lg"
                  className="split-demo-type split-demo-type-total text-primary"
                >
                  Rp 480.000
                </Text>
              </Box>
            </Stack>
          </Group>

          <Stack gap="xs">
            {participants.map((name, index) => (
              <ParticipantInput
                key={name}
                name={name}
                amount="Rp 120.000"
                delayClass={`split-demo-person-${index + 1}`}
              />
            ))}
          </Stack>

          <Button
            fullWidth
            mt="xl"
            radius="md"
            size="md"
            className="split-demo-share-btn bg-primary hover:bg-primary-dark"
          >
            Bagikan Patungan
          </Button>
        </Box>

        <Box className="split-demo-result absolute inset-x-4 bottom-4 rounded-2xl border border-primary/10 bg-white p-4 shadow-xl shadow-primary/10">
          <Group justify="space-between" mb="sm">
            <Stack gap={2}>
              <Text fw={900} size="md" className="text-zinc-900">
                Hasil pembagian siap
              </Text>
              <Text size="xs" c="dimmed">
                Link patungan bisa langsung dibagikan
              </Text>
            </Stack>
            <Box className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center">
              <IconCopy size={18} />
            </Box>
          </Group>

          <Stack gap={8}>
            {participants.map((name) => (
              <ResultRow key={name} name={name} amount="Rp 120.000" />
            ))}
          </Stack>

          <Box className="mt-4 rounded-xl bg-primary px-4 py-3 text-center text-sm font-bold text-white">
            Link berhasil dibuat
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}

function TrustMarker({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <Group gap={6} align="center">
      <Box className="text-primary flex items-center">{icon}</Box>
      <Text
        size="xs"
        fw={600}
        className="text-zinc-500 uppercase tracking-tight"
      >
        {text}
      </Text>
    </Group>
  );
}

function ParticipantInput({
  name,
  amount,
  delayClass,
}: {
  name: string;
  amount: string;
  delayClass: string;
}) {
  return (
    <Paper
      withBorder
      p="sm"
      radius="md"
      className={`split-demo-person ${delayClass} bg-zinc-50/50 border-zinc-100`}
    >
      <Group justify="space-between">
        <Group gap="sm">
          <Avatar size="sm" radius="xl" color="emerald" variant="light">
            {name[0]}
          </Avatar>
          <Text fw={600} size="sm">
            {name}
          </Text>
        </Group>
        <Text fw={700} size="sm">
          {amount}
        </Text>
      </Group>
    </Paper>
  );
}

function ResultRow({ name, amount }: { name: string; amount: string }) {
  return (
    <Group justify="space-between" className="rounded-xl bg-zinc-50 px-3 py-2">
      <Group gap="sm">
        <Avatar size="sm" radius="xl" color="emerald" variant="filled">
          {name[0]}
        </Avatar>
        <Text fw={700} size="sm">
          {name}
        </Text>
      </Group>
      <Text fw={900} size="sm" className="text-primary">
        {amount}
      </Text>
    </Group>
  );
}
