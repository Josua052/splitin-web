"use client";

import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Group,
  Image,
  NumberInput,
  Paper,
  Progress,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import {
  IconCamera,
  IconChevronRight,
  IconCircleCheck,
  IconEdit,
  IconMinus,
  IconPercentage,
  IconPhoto,
  IconPlus,
  IconReceipt,
  IconTrash,
} from "@tabler/icons-react";
import { ChangeEvent, useRef, useState } from "react";
import {
  calculateBillTotals,
  createManualItem,
  formatRupiah,
  getItemTotal,
  parseReceiptText,
} from "../receiptParser";
import { BillData, BillItem } from "../types";

interface BillDetailSectionProps {
  bill: BillData;
  onBillChange: (bill: BillData) => void;
  onNext: () => void;
}

export function BillDetailSection({
  bill,
  onBillChange,
  onNext,
}: BillDetailSectionProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState("scan");
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanError, setScanError] = useState("");

  const canContinue = bill.items.length > 0 && bill.total > 0;

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setScanError("");
    setIsScanning(true);
    setScanProgress(5);

    const imagePreview = URL.createObjectURL(file);

    try {
      const text = await recognizeReceipt(file, setScanProgress);
      const parsedBill = parseReceiptText(text, imagePreview);

      if (!parsedBill.items.length) {
        setScanError(
          "Struk berhasil dibaca, tapi belum ada item harga yang jelas. Coba foto lebih terang atau tambah item manual."
        );
      }

      onBillChange(parsedBill);
      setMode("manual");
    } catch (error) {
      console.error(error);
      URL.revokeObjectURL(imagePreview);
      setScanError(
        "Scan struk gagal. Pastikan gambar jelas, lalu coba lagi atau masukkan item manual."
      );
    } finally {
      setScanProgress(100);
      setIsScanning(false);
    }
  };

  const updateItems = (items: BillItem[]) => {
    const totals = calculateBillTotals(items, bill.taxRate, bill.service);

    onBillChange({
      ...bill,
      items,
      ...totals,
    });
  };

  const updateCharges = (patch: Partial<Pick<BillData, "taxRate" | "service">>) => {
    const nextTaxRate = patch.taxRate ?? bill.taxRate;
    const nextService = patch.service ?? bill.service;
    const totals = calculateBillTotals(bill.items, nextTaxRate, nextService);

    onBillChange({
      ...bill,
      taxRate: nextTaxRate,
      ...totals,
    });
  };

  const updateItem = (id: string, patch: Partial<BillItem>) => {
    updateItems(
      bill.items.map((item) =>
        item.id === id
          ? {
              ...item,
              ...patch,
            }
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    updateItems(bill.items.filter((item) => item.id !== id));
  };

  const addManualItem = () => {
    setMode("manual");
    updateItems([...bill.items, createManualItem()]);
  };

  return (
    <Box className="pb-24 bg-[#F9FAFB]">
      <Container size="sm" className="px-4">
        <Stack gap="xs" align="center" className="text-center pt-12 mb-10">
          <Title order={1} className="text-4xl font-extrabold text-zinc-900 tracking-tight">
            Masukan Detail Tagihan
          </Title>
          <Text c="dimmed" size="md" className="max-w-xs leading-relaxed font-medium">
            Unggah foto struk atau masukkan manual untuk mulai membagi.
          </Text>

          <Box className="mt-8 p-1.5 bg-zinc-100 rounded-full inline-block">
            <SegmentedControl
              value={mode}
              onChange={setMode}
              radius="xl"
              size="md"
              color="emerald"
              transitionDuration={300}
              classNames={{
                root: "bg-transparent border-0",
                indicator: "shadow-md",
                label: "px-8 py-2",
              }}
              data={[
                {
                  label: (
                    <Group gap="xs" wrap="nowrap" justify="center" align="center">
                      <IconCamera size={18} stroke={2.5} className="shrink-0" />
                      <Text size="sm" fw={700} className="whitespace-nowrap">
                        Foto / Scan Struk
                      </Text>
                    </Group>
                  ),
                  value: "scan",
                },
                {
                  label: (
                    <Group gap="xs" wrap="nowrap" justify="center" align="center">
                      <IconEdit size={18} stroke={2.5} className="shrink-0" />
                      <Text size="sm" fw={700} className="whitespace-nowrap">
                        Input Manual
                      </Text>
                    </Group>
                  ),
                  value: "manual",
                },
              ]}
            />
          </Box>
        </Stack>

        {mode === "scan" && (
          <Paper
            p={{ base: 28, sm: 60 }}
            radius={24}
            className="bg-white border-2 border-dashed border-emerald-100 mb-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden"
          >
            <Stack align="center" justify="center" gap={0} className="w-full">
              <Box className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 text-primary">
                <IconCamera size={36} stroke={1.5} />
              </Box>

              <Title order={3} className="text-xl font-bold text-zinc-800 mb-2 text-center w-full">
                Pindai Struk Anda
              </Title>

              <Text size="sm" c="dimmed" className="mb-8 font-medium max-w-xs mx-auto text-center w-full">
                Foto struk yang terang dan lurus akan membuat harga lebih mudah terbaca.
              </Text>

              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                hidden
                onChange={handleImageChange}
              />
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageChange}
              />

              <Group gap="md" justify="center" className="w-full">
                <Button
                  leftSection={<IconCamera size={20} stroke={2} />}
                  radius="xl"
                  size="lg"
                  loading={isScanning}
                  onClick={() => cameraInputRef.current?.click()}
                  className="bg-primary hover:bg-emerald-700 px-8 h-14 font-bold shadow-lg shadow-emerald-200"
                >
                  Buka Kamera
                </Button>
                <Button
                  variant="outline"
                  leftSection={<IconPhoto size={20} stroke={2} />}
                  radius="xl"
                  size="lg"
                  disabled={isScanning}
                  onClick={() => galleryInputRef.current?.click()}
                  className="border-zinc-200 text-zinc-600 hover:bg-zinc-50 px-8 h-14 font-bold"
                >
                  Pilih dari Galeri
                </Button>
              </Group>

              {isScanning && (
                <Stack gap="xs" className="w-full max-w-sm mt-8">
                  <Progress value={scanProgress} color="emerald" radius="xl" />
                  <Text size="xs" c="dimmed" ta="center" fw={600}>
                    Membaca teks struk... {Math.round(scanProgress)}%
                  </Text>
                </Stack>
              )}
            </Stack>
          </Paper>
        )}

        {scanError && (
          <Alert color="yellow" radius="lg" className="mb-8">
            {scanError}
          </Alert>
        )}

        {bill.imagePreview && (
          <Paper p="md" radius={20} withBorder className="border-zinc-100 bg-white mb-8">
            <Group align="flex-start" wrap="nowrap">
              <Image
                src={bill.imagePreview}
                alt="Preview struk yang discan"
                radius="md"
                className="w-24 max-h-32 object-cover"
              />
              <Stack gap={4} className="min-w-0">
                <Text fw={800} className="text-zinc-900">
                  {bill.title}
                </Text>
                <Text size="sm" c="dimmed" lineClamp={2}>
                  {bill.rawText || "Belum ada teks yang terbaca."}
                </Text>
              </Stack>
            </Group>
          </Paper>
        )}

        <Stack gap="lg" className="mb-12">
          <Group justify="space-between" align="center" className="px-1">
            <Text fw={800} size="lg" className="text-zinc-900 tracking-tight">
              Item Terdeteksi
            </Text>
            <Badge
              variant="light"
              color="emerald"
              radius="md"
              className="bg-emerald-50 text-emerald-700 px-4 py-4 font-bold"
            >
              {bill.items.length} Items
            </Badge>
          </Group>

          <Stack gap="sm">
            {bill.items.length === 0 ? (
              <Paper p="xl" radius={20} withBorder className="border-zinc-100 bg-white text-center">
                <IconReceipt size={36} className="mx-auto mb-3 text-zinc-300" />
                <Text fw={800} className="text-zinc-700">
                  Belum ada item
                </Text>
                <Text size="sm" c="dimmed">
                  Scan struk atau tambah item manual untuk mulai menghitung.
                </Text>
              </Paper>
            ) : (
              bill.items.map((item) => (
                <Paper
                  key={item.id}
                  p={{ base: "md", sm: "lg" }}
                  radius={20}
                  withBorder
                  className="border-zinc-100 shadow-sm hover:border-emerald-200 transition-colors bg-white"
                >
                  <Stack gap="md">
                    <Group justify="space-between" align="flex-start" wrap="nowrap">
                      <Group gap="md" align="flex-start" className="min-w-0 flex-1">
                      <Box className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                        <IconCircleCheck size={24} stroke={2} />
                      </Box>
                      <Stack gap={8} className="min-w-0 flex-1">
                        <TextInput
                          value={item.name}
                          onChange={(event) => updateItem(item.id, { name: event.currentTarget.value })}
                          variant="unstyled"
                          classNames={{ input: "font-bold text-zinc-800 text-base" }}
                        />
                        <Group gap="xs" wrap="nowrap">
                          <Text size="xs" fw={700} className="text-zinc-500">
                            Kuantitas
                          </Text>
                          <Group gap={4} wrap="nowrap" className="rounded-full border border-zinc-200 bg-zinc-50 p-1">
                            <ActionIcon
                              variant="subtle"
                              color="gray"
                              radius="xl"
                              size="sm"
                              disabled={item.quantity <= 1}
                              onClick={() => updateItem(item.id, { quantity: Math.max(1, item.quantity - 1) })}
                              aria-label={`Kurangi kuantitas ${item.name}`}
                            >
                              <IconMinus size={14} />
                            </ActionIcon>
                            <NumberInput
                              value={item.quantity}
                              min={1}
                              allowDecimal={false}
                              hideControls
                              onChange={(value) => updateItem(item.id, { quantity: Number(value) || 1 })}
                              className="w-12"
                              classNames={{
                                input: "h-7 border-0 bg-transparent p-0 text-center text-sm font-extrabold text-zinc-900",
                              }}
                            />
                            <ActionIcon
                              variant="subtle"
                              color="emerald"
                              radius="xl"
                              size="sm"
                              onClick={() => updateItem(item.id, { quantity: item.quantity + 1 })}
                              aria-label={`Tambah kuantitas ${item.name}`}
                            >
                              <IconPlus size={14} />
                            </ActionIcon>
                          </Group>
                        </Group>
                      </Stack>
                    </Group>

                      <ActionIcon
                        variant="subtle"
                        color="red"
                        radius="md"
                        size="lg"
                        className="hover:bg-red-50"
                        onClick={() => removeItem(item.id)}
                        aria-label={`Hapus ${item.name}`}
                      >
                        <IconTrash size={20} />
                      </ActionIcon>
                    </Group>

                    <Box className="grid grid-cols-1 gap-3 rounded-2xl bg-zinc-50 p-3 sm:grid-cols-[1fr_auto] sm:items-end">
                      <NumberInput
                        label="Harga satuan"
                        value={item.price}
                        min={0}
                        allowDecimal={false}
                        thousandSeparator="."
                        decimalSeparator=","
                        prefix="Rp "
                        onChange={(value) => updateItem(item.id, { price: Number(value) || 0 })}
                        classNames={{
                          label: "text-xs font-bold text-zinc-500",
                          input: "h-12 rounded-xl border-zinc-200 bg-white font-extrabold text-zinc-900",
                        }}
                      />
                      <Box className="rounded-xl bg-white px-4 py-3 text-right ring-1 ring-zinc-200">
                        <Text size="xs" fw={700} className="text-zinc-500">
                          Total item
                        </Text>
                        <Text fw={900} size="lg" className="text-primary tracking-tight">
                          {formatRupiah(getItemTotal(item))}
                        </Text>
                      </Box>
                    </Box>
                  </Stack>
                </Paper>
              ))
            )}
          </Stack>

          <Button
            variant="subtle"
            leftSection={<IconPlus size={20} stroke={2.5} />}
            radius={20}
            size="xl"
            onClick={addManualItem}
            className="w-full border-2 border-dashed border-zinc-200 text-zinc-400 hover:text-primary hover:border-primary hover:bg-emerald-50/30 py-10 transition-all font-bold"
          >
            Tambah Item Manual
          </Button>
        </Stack>

        <Paper p={32} radius={28} className="bg-white border border-zinc-100 shadow-[0_10px_40px_rgb(0,0,0,0.04)]">
          <Stack gap="md">
            <Group justify="space-between">
              <Text size="sm" fw={600} className="text-zinc-500">
                Subtotal menu
              </Text>
              <Text size="sm" fw={700} className="text-zinc-800">
                {formatRupiah(bill.subtotal)}
              </Text>
            </Group>

            <Box className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
              <Group gap="xs" mb="md">
                <Box className="w-8 h-8 rounded-full bg-emerald-50 text-primary flex items-center justify-center">
                  <IconPercentage size={18} />
                </Box>
                <Stack gap={0}>
                  <Text fw={800} size="sm" className="text-zinc-900">
                    Biaya tambahan
                  </Text>
                  <Text size="xs" c="dimmed">
                    Pajak dihitung dari subtotal, service diisi manual.
                  </Text>
                </Stack>
              </Group>

              <Box className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <NumberInput
                  label="Pajak"
                  value={bill.taxRate}
                  min={0}
                  max={100}
                  step={0.5}
                  suffix="%"
                  onChange={(value) => updateCharges({ taxRate: Number(value) || 0 })}
                  classNames={{
                    label: "text-xs font-bold text-zinc-500",
                    input: "h-12 rounded-xl border-zinc-200 bg-white font-extrabold text-zinc-900",
                  }}
                />
                <NumberInput
                  label="Biaya service"
                  value={bill.service}
                  min={0}
                  allowDecimal={false}
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="Rp "
                  onChange={(value) => updateCharges({ service: Number(value) || 0 })}
                  classNames={{
                    label: "text-xs font-bold text-zinc-500",
                    input: "h-12 rounded-xl border-zinc-200 bg-white font-extrabold text-zinc-900",
                  }}
                />
              </Box>
            </Box>

            <Group justify="space-between">
              <Text size="sm" fw={600} className="text-zinc-500">
                Pajak ({bill.taxRate}%)
              </Text>
              <Text size="sm" fw={700} className="text-zinc-800">
                {formatRupiah(bill.tax)}
              </Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm" fw={600} className="text-zinc-500">
                Service
              </Text>
              <Text size="sm" fw={700} className="text-zinc-800">
                {formatRupiah(bill.service)}
              </Text>
            </Group>
            <Divider my="md" className="border-zinc-50" />
            <Group justify="space-between" className="mb-8">
              <Text fw={800} size="xl" className="text-zinc-900 tracking-tight">
                Total Tagihan
              </Text>
              <Text fw={900} size="2rem" className="text-primary tracking-tighter">
                {formatRupiah(bill.total)}
              </Text>
            </Group>
            <Button
              fullWidth
              size="xl"
              radius="xl"
              disabled={!canContinue}
              className="bg-primary hover:bg-emerald-700 h-16 text-lg font-bold shadow-xl shadow-emerald-100 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:bg-zinc-200 disabled:text-zinc-500"
              rightSection={<IconChevronRight size={22} stroke={3} />}
              onClick={onNext}
            >
              Lanjut - Tambah Peserta
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}

async function recognizeReceipt(
  file: File,
  onProgress: (progress: number) => void
) {
  const nativeText = await recognizeWithNativeTextDetector(file);

  if (nativeText) {
    onProgress(100);
    return nativeText;
  }

  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng", 1, {
    logger: (message) => {
      if (message.status === "recognizing text") {
        onProgress(Math.max(10, Math.round(message.progress * 100)));
      }
    },
  });

  try {
    const result = await worker.recognize(file);
    return result.data.text;
  } finally {
    await worker.terminate();
  }
}

async function recognizeWithNativeTextDetector(file: File) {
  const maybeWindow = window as typeof window & {
    TextDetector?: new () => {
      detect: (image: ImageBitmap) => Promise<Array<{ rawValue?: string }>>;
    };
  };

  if (!maybeWindow.TextDetector || !("createImageBitmap" in window)) {
    return "";
  }

  try {
    const image = await createImageBitmap(file);
    const detector = new maybeWindow.TextDetector();
    const detections = await detector.detect(image);
    image.close();

    return detections
      .map((detection) => detection.rawValue)
      .filter(Boolean)
      .join("\n");
  } catch {
    return "";
  }
}
