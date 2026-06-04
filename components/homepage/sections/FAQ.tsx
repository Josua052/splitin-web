"use client";

import {
  Accordion,
  Badge,
  Box,
  Button,
  Container,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  IconArrowRight,
  IconCamera,
  IconCircleCheck,
  IconHelpCircle,
  IconReceipt,
  IconShieldCheck,
  IconTarget,
} from "@tabler/icons-react";
import Link from "next/link";

const faqData = [
  {
    icon: IconCamera,
    question: "Apakah scan struk harus selalu akurat?",
    answer:
      "Tidak harus langsung sempurna. Setelah struk dibaca, kamu tetap bisa mengubah nama item, kuantitas, harga satuan, pajak, dan service sebelum lanjut membagi tagihan.",
  },
  {
    icon: IconTarget,
    question: "Bagaimana kalau tiap orang pesan minuman berbeda, tapi snack sharing?",
    answer:
      "Pakai mode Per Item. Centang satu orang untuk item yang dibayar sendiri, lalu centang beberapa orang untuk item sharing seperti snack atau dessert bersama.",
  },
  {
    icon: IconReceipt,
    question: "Apakah bisa menambahkan pajak dan service?",
    answer:
      "Bisa. Pajak diisi sebagai persentase dari subtotal menu, sedangkan biaya service bisa dimasukkan manual sebagai nominal rupiah.",
  },
  {
    icon: IconShieldCheck,
    question: "Apakah data struk saya disimpan?",
    answer:
      "Tidak. Flow yang dibuat berjalan di browser dan tidak mengirim data tagihan ke database. Kamu bisa menghitung dan membagikan hasil tanpa membuat akun.",
  },
  {
    icon: IconCircleCheck,
    question: "Apakah harus membuat akun dulu?",
    answer:
      "Tidak perlu. Kamu bisa langsung membuka halaman split, scan atau input tagihan, lalu membagikan hasilnya ke teman-teman.",
  },
];

const quickNotes = [
  "Scan struk atau input manual",
  "Edit item sebelum dihitung",
  "Split sama rata, per item, atau custom %",
  "Share hasil tanpa database",
];

export function FAQ() {
  return (
    <Box component="section" id="faq" className="bg-[#F7FAF9] py-24">
      <Container size="lg" className="px-4">
        <Box className="grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <Stack gap="lg" className="lg:sticky lg:top-28">
            <Badge
              color="emerald"
              variant="light"
              radius="xl"
              className="w-fit bg-primary-light px-5 py-3 font-extrabold text-primary"
            >
              FAQ
            </Badge>
            <Title order={2} className="max-w-md text-4xl font-extrabold tracking-tight text-zinc-950">
              Pertanyaan yang biasanya muncul sebelum mulai split.
            </Title>
            <Text size="lg" c="dimmed" className="max-w-md leading-relaxed">
              Jawaban singkat tentang scan struk, pembagian per item, pajak,
              service, dan privasi data.
            </Text>

            <Paper radius={28} p="lg" className="border border-emerald-100 bg-white shadow-sm">
              <Stack gap="sm">
                {quickNotes.map((note) => (
                  <Group key={note} gap="sm" wrap="nowrap">
                    <Box className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-primary">
                      <IconCircleCheck size={16} stroke={3} />
                    </Box>
                    <Text size="sm" fw={700} className="text-zinc-700">
                      {note}
                    </Text>
                  </Group>
                ))}
              </Stack>
            </Paper>

            <Group gap="sm">
              <Button
                component={Link}
                href="/split"
                radius="xl"
                className="bg-primary px-6 font-bold hover:bg-primary-dark"
                rightSection={<IconArrowRight size={18} />}
              >
                Coba Split
              </Button>
              <Button
                component={Link}
                href="/cara-kerja"
                variant="light"
                color="emerald"
                radius="xl"
                className="font-bold"
              >
                Lihat Cara Kerja
              </Button>
            </Group>
          </Stack>

          <Paper radius={32} p={{ base: 16, sm: 24 }} className="border border-zinc-100 bg-white shadow-[0_20px_70px_rgb(15,23,42,0.06)]">
            <Accordion
              variant="contained"
              radius="xl"
              defaultValue={faqData[0].question}
              chevronPosition="right"
              classNames={{
                root: "space-y-3",
                item: "overflow-hidden rounded-3xl border border-zinc-100 bg-zinc-50/70 transition hover:border-emerald-200",
                control: "px-5 py-4 hover:bg-white",
                content: "px-5 pb-5 pt-0",
                chevron: "text-primary",
              }}
            >
              {faqData.map((item) => {
                const Icon = item.icon;

                return (
                  <Accordion.Item key={item.question} value={item.question}>
                    <Accordion.Control>
                      <Group gap="md" wrap="nowrap">
                        <Box className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                          <Icon size={22} stroke={2.3} />
                        </Box>
                        <Text fw={900} size="md" className="text-left text-zinc-950">
                          {item.question}
                        </Text>
                      </Group>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <Text size="sm" c="dimmed" className="ml-[60px] max-w-2xl leading-relaxed">
                        {item.answer}
                      </Text>
                    </Accordion.Panel>
                  </Accordion.Item>
                );
              })}
            </Accordion>

            <Box className="mt-5 rounded-3xl bg-zinc-950 p-5 text-white">
              <Group justify="space-between" align="center" gap="lg">
                <Group gap="md" wrap="nowrap">
                  <Box className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-emerald-200">
                    <IconHelpCircle size={24} />
                  </Box>
                  <Stack gap={2}>
                    <Text fw={900}>Masih ragu dengan flow-nya?</Text>
                    <Text size="sm" className="text-white/60">
                      Tonton demo otomatis di halaman cara kerja.
                    </Text>
                  </Stack>
                </Group>
                <Button
                  component={Link}
                  href="/cara-kerja"
                  radius="xl"
                  variant="white"
                  color="dark"
                  className="shrink-0 font-bold"
                >
                  Buka Demo
                </Button>
              </Group>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}
