"use client";

import { Container, Title, Text, Stack, SimpleGrid, Paper, Group, Avatar, Box } from "@mantine/core";
import { IconStarFilled } from "@tabler/icons-react";

const testimonials = [
  {
    content: "Dulu ribet banget kalau lagi nongkrong pas makan bareng, sekarang tinggal input total beres!",
    author: "Rizky A.",
    role: "Social Media Manager",
    avatar: "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-1.png",
  },
  {
    content: "Fitur split bill-nya sangat membantu, apalagi bisa langsung share ke WhatsApp. Sangat membantu!",
    author: "Sari M.",
    role: "Travel Blogger",
    avatar: "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-2.png",
  },
  {
    content: "Interface-nya simpel dan langsung ke intinya. Gak perlu buka kalkulator lagi!",
    author: "Dimas P.",
    role: "UI Designer",
    avatar: "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-3.png",
  },
];

export function Testimonials() {
  return (
    <Box component="section" className="py-24 bg-white">
      <Container size="lg">
        <Stack gap="xl" align="center" className="text-center mb-16">
          <Title order={2} className="text-4xl font-bold tracking-tight text-zinc-900">
            Apa Kata Mereka?
          </Title>
          <Text size="lg" c="dimmed" className="max-w-xl">
            Pengguna yang sudah merasakan kemudahan SplitBase.
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
          {testimonials.map((item, index) => (
            <Paper 
              key={index} 
              p="xl" 
              radius="lg" 
              withBorder 
              className="bg-zinc-50/30 border-zinc-100 flex flex-col justify-between"
            >
              <Stack gap="md">
                <Group gap={2}>
                  {[...Array(5)].map((_, i) => (
                    <IconStarFilled key={i} size={16} className="text-yellow-400" />
                  ))}
                </Group>
                <Text size="md" className="italic text-zinc-700 leading-relaxed">
                  &ldquo;{item.content}&rdquo;
                </Text>
              </Stack>
              
              <Group mt="xl" gap="sm">
                <Avatar src={item.avatar} radius="xl" size="md" />
                <Stack gap={0}>
                  <Text fw={700} size="sm">{item.author}</Text>
                  <Text size="xs" c="dimmed">{item.role}</Text>
                </Stack>
              </Group>
            </Paper>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
}
