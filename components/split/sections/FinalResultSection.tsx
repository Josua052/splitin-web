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
import { useState } from "react";
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
  const [isExportingImage, setIsExportingImage] = useState(false);
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

  const downloadReceiptImage = async () => {
    setIsExportingImage(true);

    try {
      const dataUrl = await createReceiptImage({
        bill,
        splits,
        splitMode,
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `splitbase-${slugify(bill.title)}.png`;
      link.click();
    } finally {
      setIsExportingImage(false);
    }
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
                loading={isExportingImage}
                onClick={downloadReceiptImage}
              >
                Unduh Gambar Struk
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

async function createReceiptImage({
  bill,
  splits,
  splitMode,
}: {
  bill: BillData;
  splits: ParticipantSplit[];
  splitMode: SplitMode;
}) {
  const width = 900;
  const padding = 56;
  let expectedHeight = 448;

  if (bill.items.length) {
    expectedHeight += 104;
    bill.items.forEach((item) => {
      expectedHeight += 29;
      if (getItemDiscountAmount(item)) {
        expectedHeight += 23;
      }
    });
  }

  expectedHeight += 102;

  const participantBlockHeights = splits.map((split) => {
    const itemCount = Math.min(split.items.length, 8);
    return 156 + itemCount * 28 + (split.items.length > 8 ? 23 : 0);
  });

  expectedHeight += participantBlockHeights.reduce((sum, value) => sum + value, 0);
  expectedHeight += 150;

  const height = expectedHeight;
  const scale = Math.max(2, window.devicePixelRatio || 1);
  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas tidak tersedia.");
  }

  context.scale(scale, scale);
  context.fillStyle = "#f3f4f6";
  context.fillRect(0, 0, width, height);
  drawReceiptPaper(context, 32, 28, width - 64, height - 56);

  let y = 86;
  context.textAlign = "center";
  drawText(context, "SPLITBASE", width / 2, y, {
    size: 32,
    weight: 900,
    color: "#00523C",
  });
  y += 34;
  drawText(context, bill.title || "Tagihan Baru", width / 2, y, {
    size: 17,
    weight: 700,
    color: "#334155",
  });
  y += 26;
  drawText(context, formatReceiptDate(new Date()), width / 2, y, {
    size: 14,
    weight: 600,
    color: "#64748b",
  });

  y += 44;
  drawDashedLine(context, padding, y, width - padding);
  y += 42;

  context.textAlign = "left";
  drawSectionTitle(context, "RINGKASAN TAGIHAN", padding, y);
  y += 36;
  y = drawReceiptRow(context, "Subtotal menu", formatRupiah(bill.subtotal), padding, y);
  y = drawReceiptRow(context, "Pajak", formatRupiah(bill.tax), padding, y);
  y = drawReceiptRow(context, "Service", formatRupiah(bill.service), padding, y);
  y += 12;
  drawSolidLine(context, padding, y, width - padding);
  y += 44;
  y = drawReceiptRow(context, "TOTAL TAGIHAN", formatRupiah(bill.total), padding, y, {
    size: 25,
    weight: 900,
    color: "#00523C",
  });

  if (bill.items.length) {
    y += 28;
    drawDashedLine(context, padding, y, width - padding);
    y += 42;
    drawSectionTitle(context, "ITEM", padding, y);
    y += 34;

    bill.items.forEach((item) => {
      const discount = getItemDiscountAmount(item);
      y = drawReceiptRow(
        context,
        `${item.quantity}x ${item.name}`,
        formatRupiah(getItemTotal(item)),
        padding,
        y
      );

      if (discount) {
        y = drawSubText(
          context,
          `Diskon ${formatRupiah(discount)}`,
          padding + 20,
          y - 3
        );
      }
    });
  }

  y += 22;
  drawDashedLine(context, padding, y, width - padding);
  y += 42;
  drawSectionTitle(context, `HASIL PATUNGAN - ${getModeLabel(splitMode).toUpperCase()}`, padding, y);
  y += 38;

  splits.forEach((split, index) => {
    drawParticipantBadge(context, padding, y - 20, split.participant.name, index);
    y = drawReceiptRow(
      context,
      split.participant.name || "Tanpa nama",
      formatRupiah(split.total),
      padding + 58,
      y,
      {
        size: 24,
        weight: 900,
        color: "#00523C",
      }
    );
    y += 8;
    y = drawReceiptRow(context, "Porsi menu", formatRupiah(split.base), padding + 58, y, {
      size: 16,
    });
    y = drawReceiptRow(context, "Pajak & service", formatRupiah(split.fee), padding + 58, y, {
      size: 16,
    });

    split.items.slice(0, 8).forEach((item) => {
      y = drawReceiptRow(context, item.name, formatRupiah(item.amount), padding + 58, y, {
        size: 14,
        color: "#475569",
      });
    });

    if (split.items.length > 8) {
      y = drawSubText(
        context,
        `+${split.items.length - 8} item lainnya`,
        padding + 58,
        y
      );
    }

    y += 20;
    drawSolidLine(context, padding, y, width - padding, "#e2e8f0");
    y += 36;
  });

  context.textAlign = "center";
  drawText(context, "Data hanya diproses di browser", width / 2, height - 110, {
    size: 15,
    weight: 800,
    color: "#00523C",
  });
  drawText(context, "splitbase.app", width / 2, height - 78, {
    size: 18,
    weight: 900,
    color: "#0f172a",
  });

  return canvas.toDataURL("image/png");
}

function drawReceiptPaper(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) {
  context.save();
  context.fillStyle = "#ffffff";
  context.shadowColor = "rgba(15, 23, 42, 0.12)";
  context.shadowBlur = 30;
  context.shadowOffsetY = 18;
  roundRect(context, x, y, width, height, 30);
  context.fill();
  context.restore();

  context.fillStyle = "#f3f4f6";
  for (let i = x + 18; i < x + width - 18; i += 34) {
    context.beginPath();
    context.arc(i, y, 8, 0, Math.PI * 2);
    context.fill();
    context.beginPath();
    context.arc(i, y + height, 8, 0, Math.PI * 2);
    context.fill();
  }
}

function drawParticipantBadge(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  name: string,
  index: number
) {
  const colors = ["#d1fae5", "#dbeafe", "#fef3c7", "#fce7f3"];
  context.fillStyle = colors[index % colors.length];
  context.beginPath();
  context.arc(x + 24, y + 24, 24, 0, Math.PI * 2);
  context.fill();
  context.textAlign = "center";
  drawText(context, name[0]?.toUpperCase() || "?", x + 24, y + 32, {
    size: 22,
    weight: 900,
    color: "#00523C",
  });
  context.textAlign = "left";
}

function drawSectionTitle(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number
) {
  drawText(context, text, x, y, {
    size: 15,
    weight: 900,
    color: "#64748b",
    family: "Consolas, monospace",
  });
}

function drawReceiptRow(
  context: CanvasRenderingContext2D,
  label: string,
  value: string,
  x: number,
  y: number,
  options: {
    size?: number;
    weight?: number;
    color?: string;
  } = {}
) {
  const size = options.size || 17;
  const weight = options.weight || 700;
  const color = options.color || "#0f172a";
  const rightX = 900 - 56;
  const maxLabelWidth = rightX - x - 230;

  context.textAlign = "left";
  drawText(context, truncateCanvasText(context, label, maxLabelWidth, size, weight), x, y, {
    size,
    weight,
    color,
    family: "Consolas, monospace",
  });
  context.textAlign = "right";
  drawText(context, value, rightX, y, {
    size,
    weight,
    color,
    family: "Consolas, monospace",
  });
  context.textAlign = "left";

  return y + Math.max(28, size + 12);
}

function drawSubText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number
) {
  drawText(context, text, x, y, {
    size: 13,
    weight: 600,
    color: "#94a3b8",
    family: "Consolas, monospace",
  });

  return y + 23;
}

function drawText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options: {
    size: number;
    weight: number;
    color: string;
    family?: string;
  }
) {
  context.fillStyle = options.color;
  context.font = `${options.weight} ${options.size}px ${options.family || "Inter, Arial, sans-serif"}`;
  context.fillText(text, x, y);
}

function drawDashedLine(
  context: CanvasRenderingContext2D,
  x1: number,
  y: number,
  x2: number
) {
  context.save();
  context.strokeStyle = "#cbd5e1";
  context.lineWidth = 2;
  context.setLineDash([10, 9]);
  context.beginPath();
  context.moveTo(x1, y);
  context.lineTo(x2, y);
  context.stroke();
  context.restore();
}

function drawSolidLine(
  context: CanvasRenderingContext2D,
  x1: number,
  y: number,
  x2: number,
  color = "#cbd5e1"
) {
  context.save();
  context.strokeStyle = color;
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(x1, y);
  context.lineTo(x2, y);
  context.stroke();
  context.restore();
}

function roundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}

function truncateCanvasText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  size: number,
  weight: number
) {
  context.font = `${weight} ${size}px Consolas, monospace`;

  if (context.measureText(text).width <= maxWidth) {
    return text;
  }

  let truncated = text;

  while (truncated.length > 3 && context.measureText(`${truncated}...`).width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }

  return `${truncated}...`;
}

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "tagihan"
  );
}

function formatReceiptDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
