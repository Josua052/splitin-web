"use client";

import {
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  IconBrandWhatsapp,
  IconCircleCheck,
  IconCopy,
  IconDownload,
  IconShare,
} from "@tabler/icons-react";
import {
  formatRupiah,
  getItemDiscountAmount,
  getItemTotal,
} from "../receiptParser";
import { calculateSplits, ParticipantSplit } from "../splitCalculator";
import {
  BillData,
  CustomShares,
  ItemAssignments,
  Participant,
  SplitMode,
} from "../types";

interface FinalResultSectionProps {
  bill: BillData;
  participants: Participant[];
  splitMode: SplitMode;
  itemAssignments: ItemAssignments;
  customShares: CustomShares;
}

export function FinalResultSection({
  bill,
  participants,
  splitMode,
  itemAssignments,
  customShares,
}: FinalResultSectionProps) {
  const splits = calculateSplits({
    bill,
    participants,
    splitMode,
    itemAssignments,
    customShares,
  });
  const shareText = createShareText(bill, splits, splitMode);

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  const shareToWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank", "noopener,noreferrer");
  };

  const shareNative = async () => {
    if (navigator.share) {
      await navigator.share({
        title: bill.title,
        text: shareText,
      });
      return;
    }

    await copyText(shareText);
  };

  return (
    <Box className="pb-24 bg-[#F9FAFB]">
      <Container size="lg" className="px-4 pt-10">
        <Paper p="xl" radius="xl" className="bg-emerald-50 border border-emerald-100 mb-10">
          <Group gap="lg">
            <Box className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <IconCircleCheck size={28} stroke={2.5} />
            </Box>
            <Stack gap={2}>
              <Title order={3} className="text-xl font-extrabold text-emerald-900 tracking-tight">
                Tagihan berhasil dibagi!
              </Title>
              <Text size="sm" className="text-emerald-700 font-medium">
                Bisa langsung di-share ke teman-temanmu. Total tagihan{" "}
                <Text span fw={800}>
                  {formatRupiah(bill.total)}
                </Text>{" "}
                dari {bill.title}.
              </Text>
            </Stack>
          </Group>
        </Paper>

        <Box className="grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_0.9fr]">
          <Stack gap="xl">
            {splits.map((split, index) => (
              <Paper key={split.participant.id} p={32} radius={32} className="bg-white border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                <Group justify="space-between" className="mb-8">
                  <Group gap="md">
                    <Avatar color={index % 2 === 0 ? "emerald" : "blue"} radius="xl" size="lg" className="font-bold shadow-sm">
                      {split.participant.name[0]?.toUpperCase() || "?"}
                    </Avatar>
                    <Text fw={800} size="xl" className="text-zinc-800 tracking-tight">
                      {split.participant.name || "Tanpa nama"}
                    </Text>
                  </Group>
                  <Stack gap={0} align="flex-end">
                    <Text size="xs" c="dimmed" fw={700} className="uppercase tracking-widest">
                      Total Bayar
                    </Text>
                    <Text fw={900} size="1.8rem" className="text-emerald-700 tracking-tighter">
                      {formatRupiah(split.total)}
                    </Text>
                  </Stack>
                </Group>

                <Stack gap="sm" className="mb-8">
                  <Group justify="space-between">
                    <Text size="sm" fw={600} className="text-zinc-500">
                      Porsi menu
                    </Text>
                    <Text size="sm" fw={700} className="text-zinc-800">
                      {formatRupiah(split.base)}
                    </Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" fw={600} className="text-zinc-500">
                      Pajak & service
                    </Text>
                    <Text size="sm" fw={700} className="text-zinc-800">
                      {formatRupiah(split.fee)}
                    </Text>
                  </Group>
                  {split.items.slice(0, 4).map((item) => (
                    <Group key={`${split.participant.id}-${item.name}`} justify="space-between">
                      <Text size="xs" fw={600} className="text-zinc-500">
                        {item.name}
                      </Text>
                      <Text size="xs" fw={700} className="text-zinc-700">
                        {formatRupiah(item.amount)}
                      </Text>
                    </Group>
                  ))}
                  <Text size="xs" c="dimmed">
                    Mode {getModeLabel(splitMode)}. Porsi sekitar {split.percent.toFixed(1)}% dari total.
                  </Text>
                </Stack>

                <Button
                  variant="light"
                  color="emerald"
                  fullWidth
                  radius="xl"
                  size="lg"
                  leftSection={<IconCopy size={18} />}
                  onClick={() => copyText(`${split.participant.name}: ${formatRupiah(split.total)}\n${bill.title}`)}
                  className="bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100 h-14 font-bold"
                >
                  Salin Tagihan {split.participant.name}
                </Button>
              </Paper>
            ))}

            <Paper p={32} radius={32} className="bg-white border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
              <Title order={3} className="text-2xl font-extrabold text-zinc-900 mb-8 tracking-tight">
                Ringkasan Tagihan
              </Title>
              <Stack gap="md" className="mb-8">
                <Group justify="space-between">
                  <Text size="md" fw={600} className="text-zinc-500">
                    Subtotal Menu
                  </Text>
                  <Text size="md" fw={700} className="text-zinc-800">
                    {formatRupiah(bill.subtotal)}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="md" fw={600} className="text-zinc-500">
                    Pajak
                  </Text>
                  <Text size="md" fw={700} className="text-zinc-800">
                    {formatRupiah(bill.tax)}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="md" fw={600} className="text-zinc-500">
                    Layanan
                  </Text>
                  <Text size="md" fw={700} className="text-zinc-800">
                    {formatRupiah(bill.service)}
                  </Text>
                </Group>
              </Stack>
              <Divider className="border-zinc-50 mb-8" />
              <Group justify="space-between">
                <Text fw={900} size="2.2rem" className="text-zinc-900 tracking-tighter">
                  Total Keseluruhan
                </Text>
                <Text fw={900} size="2.5rem" className="text-zinc-900 tracking-tighter">
                  {formatRupiah(bill.total)}
                </Text>
              </Group>
            </Paper>
          </Stack>

          <Paper p={40} radius={32} className="bg-white border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] h-fit lg:sticky lg:top-24">
            <Title order={3} className="text-2xl font-extrabold text-zinc-900 mb-2 text-center tracking-tight">
              Bagikan Tagihan
            </Title>
            <Text c="dimmed" size="sm" className="text-center mb-10 font-medium leading-relaxed">
              Kirim detail pembayaran ke teman-temanmu dengan cepat.
            </Text>

            <Stack gap="md">
              <Button
                fullWidth
                size="xl"
                radius="xl"
                className="bg-[#00523C] hover:bg-[#004230] h-16 font-bold shadow-xl shadow-emerald-100 transition-all hover:-translate-y-1"
                leftSection={<IconBrandWhatsapp size={24} stroke={2} />}
                onClick={shareToWhatsApp}
              >
                Kirim ke WhatsApp
              </Button>

              <Box className="grid grid-cols-2 gap-3">
                <Button
                  variant="filled"
                  fullWidth
                  size="lg"
                  radius="xl"
                  className="bg-zinc-100 text-zinc-800 hover:bg-zinc-200 h-20 flex-col py-2"
                  styles={{ inner: { flexDirection: "column", gap: "4px" } }}
                  onClick={shareNative}
                >
                  <IconShare size={20} stroke={2.5} className="text-emerald-700" />
                  <Text size="xs" fw={800}>
                    Bagikan
                  </Text>
                </Button>
                <Button
                  variant="filled"
                  fullWidth
                  size="lg"
                  radius="xl"
                  className="bg-zinc-100 text-zinc-800 hover:bg-zinc-200 h-20 flex-col py-2"
                  styles={{ inner: { flexDirection: "column", gap: "4px" } }}
                  onClick={() => copyText(shareText)}
                >
                  <IconCopy size={20} stroke={2.5} className="text-emerald-700" />
                  <Text size="xs" fw={800}>
                    Salin Semua
                  </Text>
                </Button>
              </Box>

              <Button
                variant="filled"
                fullWidth
                size="lg"
                radius="xl"
                className="bg-zinc-100 text-zinc-800 hover:bg-zinc-200 h-16 font-bold"
                leftSection={<IconDownload size={22} stroke={2.5} className="text-emerald-700" />}
                onClick={() => copyText(shareText)}
              >
                Salin sebagai Teks
              </Button>

              <Divider my="xl" className="border-zinc-100" />

              <Stack gap="md" align="center">
                <Text fw={800} size="sm" className="text-emerald-700">
                  Data hanya diproses di browser
                </Text>
                <Text fw={700} size="sm" className="text-zinc-600 text-center">
                  Tidak ada data struk yang disimpan ke database.
                </Text>
              </Stack>
            </Stack>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}

function createShareText(
  bill: BillData,
  splits: ParticipantSplit[],
  splitMode: SplitMode
) {
  const participantLines = splits
    .map((split) => `- ${split.participant.name}: ${formatRupiah(split.total)}`)
    .join("\n");

  const itemLines = bill.items
    .map(
      (item) => {
        const discount = getItemDiscountAmount(item);
        const discountText = discount ? ` (diskon ${formatRupiah(discount)})` : "";

        return `- ${item.name} x${item.quantity}: ${formatRupiah(getItemTotal(item))}${discountText}`;
      }
    )
    .join("\n");

  return [
    `Split tagihan: ${bill.title}`,
    `Mode: ${getModeLabel(splitMode)}`,
    `Total: ${formatRupiah(bill.total)}`,
    "",
    "Peserta:",
    participantLines,
    "",
    "Item:",
    itemLines,
  ].join("\n");
}

function getModeLabel(splitMode: SplitMode) {
  if (splitMode === "item") {
    return "Per Item";
  }

  if (splitMode === "custom") {
    return "Custom %";
  }

  return "Sama Rata";
}
