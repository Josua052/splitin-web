"use client";

import { Container, Grid, Stack, Text, Group, Box, ActionIcon, Divider } from "@mantine/core";
import { IconBrandInstagram, IconBrandTwitter, IconBrandFacebook } from "@tabler/icons-react";
import Link from "next/link";

const footerLinks = [
  {
    title: "SplitBase",
    links: [
      { label: "Tentang Kami", href: "/about" },
      { label: "Kontak", href: "/contact" },
      { label: "Karir", href: "/careers" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Kebijakan Privasi", href: "/privacy" },
      { label: "Syarat & Ketentuan", href: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <Box component="footer" className="bg-zinc-50 pt-20 pb-10 border-t border-zinc-100">
      <Container size="lg">
        <Grid gap="xl">
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Stack gap="md">
              <Group gap="xs">
                <Box className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Text fw={800} c="white" size="xl">S</Text>
                </Box>
                <Text fw={800} size="xl" className="tracking-tight text-primary">
                  SplitBase
                </Text>
              </Group>
              <Text size="sm" c="dimmed" className="max-w-sm leading-relaxed">
                Solusi berbagi tagihan dengan adil dan transparan. Dibuat dengan ❤️ untuk uang yang anti-ribet menghitung uang patungan.
              </Text>
              <Group gap="md">
                <ActionIcon variant="subtle" color="gray" radius="xl" size="lg">
                  <IconBrandInstagram size={20} />
                </ActionIcon>
                <ActionIcon variant="subtle" color="gray" radius="xl" size="lg">
                  <IconBrandTwitter size={20} />
                </ActionIcon>
                <ActionIcon variant="subtle" color="gray" radius="xl" size="lg">
                  <IconBrandFacebook size={20} />
                </ActionIcon>
              </Group>
            </Stack>
          </Grid.Col>

          {footerLinks.map((section) => (
            <Grid.Col key={section.title} span={{ base: 6, md: 3 }}>
              <Stack gap="md">
                <Text fw={700} size="sm" className="uppercase tracking-wider text-zinc-900">
                  {section.title}
                </Text>
                <Stack gap="xs">
                  {section.links.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="text-sm text-zinc-500 hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </Stack>
              </Stack>
            </Grid.Col>
          ))}
        </Grid>

        <Divider my={40} color="zinc.1" />

        <Group justify="space-between" align="center">
          <Text size="xs" c="dimmed">
            © 2026 SplitBase. Dibuat dengan ❤️ untuk yang anti-ribet.
          </Text>
          <Group gap="xs">
            <Box className="w-2 h-2 rounded-full bg-green-500" />
            <Text size="xs" fw={500}>Bahasa Indonesia</Text>
          </Group>
        </Group>
      </Container>
    </Box>
  );
}
