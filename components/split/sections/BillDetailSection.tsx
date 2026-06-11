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
  getItemDiscountAmount,
  getItemGrossTotal,
  getItemTotal,
  parseReceiptText,
} from "../receiptParser";
import { BillData, BillItem } from "../types";

type ScanRole = "name" | "price" | "quantity" | "discount";

interface DraftItem {
  name: string;
  price: number;
  quantity: number;
  discountType: "amount" | "percent";
  discountValue: number;
}

interface OcrResult {
  text: string;
  lines: string[];
}

interface ScanResult {
  lines: string[];
  preview: string;
  text: string;
  title: string;
}

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
  const [ocrLines, setOcrLines] = useState<string[]>([]);
  const [scanRole, setScanRole] = useState<ScanRole>("name");
  const [draftItem, setDraftItem] = useState<DraftItem>({
    name: "",
    price: 0,
    quantity: 1,
    discountType: "amount",
    discountValue: 0,
  });
  const [selectedTextByRole, setSelectedTextByRole] = useState<
    Partial<Record<ScanRole, string>>
  >({});
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);

  const canContinue = bill.items.length > 0 && bill.total > 0;
  const canAddDraftItem = draftItem.name.trim().length > 0 && draftItem.price > 0;
  const activeScan = scanResults.find(
    (scan) => scan.preview === bill.imagePreview
  );
  const visibleOcrLines = activeScan?.lines || ocrLines;

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";

    if (!files.length) {
      return;
    }

    setScanError("");
    setIsScanning(true);
    setScanProgress(5);

    const successfulScans: ScanResult[] = [];
    let failedScans = 0;

    for (const [index, file] of files.entries()) {
      const imagePreview = URL.createObjectURL(file);

      try {
        const ocrResult = await recognizeReceipt(file, (progress) =>
          setScanProgress(
            Math.min(99, Math.round(((index + progress / 100) / files.length) * 100))
          )
        );
        const text = ocrResult.text;
        const parsedBill = parseReceiptText(text, imagePreview);
        const selectableLines = ocrResult.lines.length
          ? ocrResult.lines
          : extractSelectableLines(text);

        successfulScans.push({
          lines: selectableLines,
          preview: imagePreview,
          text,
          title: parsedBill.title,
        });
      } catch (error) {
        console.error(error);
        URL.revokeObjectURL(imagePreview);
        failedScans += 1;
      }
    }

    try {
      if (!successfulScans.length) {
        throw new Error("No receipt images could be read.");
      }

      const nextText = [bill.rawText, ...successfulScans.map((scan) => scan.text)]
        .filter(Boolean)
        .join("\n");
      const nextPreview = successfulScans[successfulScans.length - 1].preview;
      const nextVisibleLines = successfulScans[successfulScans.length - 1].lines;
      const totals = calculateBillTotals(
        bill.items,
        bill.taxType ?? "percent",
        bill.taxRate,
        bill.service
      );

      if (!nextVisibleLines.length) {
        setScanError(
          "Struk berhasil dibaca, tapi teksnya belum jelas. Coba foto lebih terang atau pilih item manual."
        );
      } else if (failedScans) {
        setScanError(
          `${successfulScans.length} gambar berhasil dibaca, ${failedScans} gambar gagal. Item dan harga yang sudah masuk tetap disimpan.`
        );
      }

      setOcrLines(nextVisibleLines);
      setScanResults((current) => [
        ...current,
        ...successfulScans,
      ]);
      setSelectedTextByRole({});
      onBillChange({
        ...bill,
        title:
          bill.title === "Tagihan Baru"
            ? successfulScans[0].title
            : bill.title,
        rawText: nextText.trim(),
        imagePreview: nextPreview,
        ...totals,
      });
      setMode("manual");
    } catch (error) {
      console.error(error);
      setScanError(
        "Scan struk gagal. Pastikan gambar jelas, lalu coba lagi atau masukkan item manual. Item yang sudah masuk tetap disimpan."
      );
    } finally {
      setScanProgress(100);
      setIsScanning(false);
    }
  };

  const updateItems = (items: BillItem[]) => {
    const totals = calculateBillTotals(
      items,
      bill.taxType ?? "percent",
      bill.taxRate,
      bill.service
    );

    onBillChange({
      ...bill,
      items,
      ...totals,
    });
  };

  const updateCharges = (
    patch: Partial<Pick<BillData, "taxType" | "taxRate" | "service">>
  ) => {
    const nextTaxType = patch.taxType ?? bill.taxType ?? "percent";
    const nextTaxRate = patch.taxRate ?? bill.taxRate;
    const nextService = patch.service ?? bill.service;
    const totals = calculateBillTotals(
      bill.items,
      nextTaxType,
      nextTaxRate,
      nextService
    );

    onBillChange({
      ...bill,
      taxType: nextTaxType,
      taxRate: nextTaxRate,
      ...totals,
    });
  };

  const changeTaxType = (taxType: "percent" | "amount") => {
    const currentTax = bill.tax;
    const nextTaxRate =
      taxType === "amount"
        ? currentTax
        : bill.subtotal
          ? Math.round((currentTax / bill.subtotal) * 10000) / 100
          : 0;

    updateCharges({ taxType, taxRate: nextTaxRate });
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

  const selectOcrLine = (line: string) => {
    setSelectedTextByRole((current) => ({
      ...current,
      [scanRole]: line,
    }));

    if (scanRole === "name") {
      setDraftItem((current) => ({
        ...current,
        name: extractItemNameFromOcrLine(line) || line,
      }));
    }

    if (scanRole === "price") {
      setDraftItem((current) => ({
        ...current,
        price: extractAmountFromOcrLine(line),
      }));
    }

    if (scanRole === "quantity") {
      setDraftItem((current) => ({
        ...current,
        quantity: extractQuantityFromOcrLine(line),
      }));
    }

    if (scanRole === "discount") {
      const discount = extractDiscountFromOcrLine(line);

      setDraftItem((current) => ({
        ...current,
        discountType: discount.type,
        discountValue: discount.value,
      }));
    }
  };

  const addDraftItem = () => {
    if (!canAddDraftItem) {
      return;
    }

    updateItems([
      ...bill.items,
      {
        id: crypto.randomUUID(),
        name: draftItem.name.trim(),
        quantity: Math.max(1, draftItem.quantity),
        price: Math.max(0, draftItem.price),
        discountType: draftItem.discountType,
        discountValue: Math.max(0, draftItem.discountValue),
      },
    ]);
    setDraftItem({
      name: "",
      price: 0,
      quantity: 1,
      discountType: "amount",
      discountValue: 0,
    });
    setSelectedTextByRole({});
    setScanRole("name");
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
          multiple
          hidden
          onChange={handleImageChange}
        />

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
          <Paper p={{ base: "md", sm: "lg" }} radius={24} withBorder className="border-zinc-100 bg-white mb-8">
            <Stack gap="lg">
              <Group justify="space-between" align="flex-start">
                <Stack gap={4}>
                  <Text fw={900} size="lg" className="text-zinc-900">
                    Pilih teks dari struk
                  </Text>
                  <Text size="sm" c="dimmed" className="max-w-md leading-relaxed">
                    Pilih role, lalu tap teks OCR yang sesuai. Setelah barang dan harga terisi, ceklis untuk masuk ke daftar item.
                  </Text>
                </Stack>
                <Stack gap="xs" align="flex-end">
                  <Badge color="emerald" variant="light" radius="md" className="px-3 py-2 font-bold">
                    {visibleOcrLines.length} teks
                  </Badge>
                  <Group gap="xs" justify="flex-end">
                    <Button
                      size="xs"
                      radius="xl"
                      variant="light"
                      color="emerald"
                      leftSection={<IconCamera size={14} />}
                      disabled={isScanning}
                      onClick={() => cameraInputRef.current?.click()}
                      className="font-bold"
                    >
                      Tambah Foto
                    </Button>
                    <Button
                      size="xs"
                      radius="xl"
                      variant="outline"
                      color="gray"
                      leftSection={<IconPhoto size={14} />}
                      disabled={isScanning}
                      onClick={() => galleryInputRef.current?.click()}
                      className="font-bold"
                    >
                      Tambah Galeri
                    </Button>
                  </Group>
                </Stack>
              </Group>

              <Box className="grid grid-cols-1 gap-5 md:grid-cols-[0.85fr_1.15fr]">
                <Box className="overflow-hidden rounded-3xl border border-zinc-100 bg-zinc-50">
                  <Image
                    src={bill.imagePreview}
                    alt="Preview struk yang discan"
                    radius={0}
                    className="max-h-[420px] w-full object-contain"
                  />
                  {scanResults.length > 1 && (
                    <Group gap="xs" className="border-t border-zinc-100 bg-white p-3" wrap="nowrap">
                      {scanResults.map((scan, index) => {
                        const isActive = bill.imagePreview === scan.preview;

                        return (
                          <button
                            key={`${scan.preview}-${index}`}
                            type="button"
                            onClick={() => {
                              setOcrLines(scan.lines);
                              setSelectedTextByRole({});
                              onBillChange({
                                ...bill,
                                imagePreview: scan.preview,
                              });
                            }}
                            className={`h-12 w-12 shrink-0 overflow-hidden rounded-xl border transition ${
                              isActive
                                ? "border-emerald-400 ring-2 ring-emerald-100"
                                : "border-zinc-200 hover:border-emerald-200"
                            }`}
                            aria-label={`Lihat gambar struk ${index + 1}`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={scan.preview}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          </button>
                        );
                      })}
                    </Group>
                  )}
                </Box>

                <Stack gap="md">
                  <SegmentedControl
                    value={scanRole}
                    onChange={(value) => setScanRole(value as ScanRole)}
                    color="emerald"
                    radius="xl"
                    fullWidth
                    data={[
                      { label: "Barang", value: "name" },
                      { label: "Harga", value: "price" },
                      { label: "Kuantitas", value: "quantity" },
                      { label: "Diskon", value: "discount" },
                    ]}
                    classNames={{
                      label: "font-bold",
                    }}
                  />

                  <Box className="max-h-[260px] overflow-y-auto rounded-3xl border border-zinc-100 bg-zinc-50 p-3">
                    {visibleOcrLines.length ? (
                      <Group gap="xs">
                        {visibleOcrLines.map((line, index) => {
                          const isSelected = Object.values(selectedTextByRole).includes(line);

                          return (
                            <button
                              key={`${line}-${index}`}
                              type="button"
                              onClick={() => selectOcrLine(line)}
                              className={`rounded-2xl border px-3 py-2 text-left text-sm font-bold transition ${
                                isSelected
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                                  : "border-zinc-200 bg-white text-zinc-700 hover:border-emerald-200 hover:text-primary"
                              }`}
                            >
                              {line}
                            </button>
                          );
                        })}
                      </Group>
                    ) : (
                      <Stack align="center" gap="xs" className="py-8 text-center">
                        <IconReceipt size={32} className="text-zinc-300" />
                        <Text fw={800} className="text-zinc-700">
                          Belum ada teks OCR
                        </Text>
                        <Text size="sm" c="dimmed">
                          Coba ambil foto ulang dengan cahaya lebih terang.
                        </Text>
                      </Stack>
                    )}
                  </Box>

                  <Paper radius={20} p="md" className="border border-emerald-100 bg-emerald-50/50">
                    <Stack gap="sm">
                      <Group justify="space-between">
                        <Text fw={900} className="text-zinc-900">
                          Draft item
                        </Text>
                        <Badge color={canAddDraftItem ? "emerald" : "gray"} variant="light" radius="md">
                          {canAddDraftItem ? "Siap masuk list" : "Pilih barang & harga"}
                        </Badge>
                      </Group>

                      <Box className="grid grid-cols-1 gap-3 sm:grid-cols-[1.2fr_0.7fr_0.7fr]">
                        <TextInput
                          label="Barang"
                          value={draftItem.name}
                          onChange={(event) => {
                            const value = event.currentTarget.value;

                            setDraftItem((current) => ({
                              ...current,
                              name: value,
                            }));
                          }}
                          classNames={{
                            label: "text-xs font-bold text-zinc-500",
                            input: "rounded-xl border-zinc-200 bg-white font-bold",
                          }}
                        />
                        <NumberInput
                          label="Harga"
                          value={draftItem.price}
                          min={0}
                          allowDecimal={false}
                          thousandSeparator="."
                          decimalSeparator=","
                          prefix="Rp "
                          onChange={(value) =>
                            setDraftItem((current) => ({
                              ...current,
                              price: Number(value) || 0,
                            }))
                          }
                          classNames={{
                            label: "text-xs font-bold text-zinc-500",
                            input: "rounded-xl border-zinc-200 bg-white font-bold",
                          }}
                        />
                        <NumberInput
                          label="Qty"
                          value={draftItem.quantity}
                          min={1}
                          allowDecimal={false}
                          onChange={(value) =>
                            setDraftItem((current) => ({
                              ...current,
                              quantity: Number(value) || 1,
                            }))
                          }
                          classNames={{
                            label: "text-xs font-bold text-zinc-500",
                            input: "rounded-xl border-zinc-200 bg-white font-bold",
                          }}
                        />
                      </Box>

                      <Box className="grid grid-cols-1 gap-3 rounded-2xl bg-white/70 p-3 sm:grid-cols-[0.8fr_1fr_auto] sm:items-end">
                        <SegmentedControl
                          value={draftItem.discountType}
                          onChange={(value) =>
                            setDraftItem((current) => ({
                              ...current,
                              discountType: value as "amount" | "percent",
                            }))
                          }
                          color="emerald"
                          radius="xl"
                          data={[
                            { label: "Rp", value: "amount" },
                            { label: "%", value: "percent" },
                          ]}
                          classNames={{ label: "font-bold" }}
                        />
                        <NumberInput
                          label="Diskon item"
                          value={draftItem.discountValue}
                          min={0}
                          max={draftItem.discountType === "percent" ? 100 : undefined}
                          allowDecimal={draftItem.discountType === "percent"}
                          thousandSeparator="."
                          decimalSeparator=","
                          prefix={draftItem.discountType === "amount" ? "Rp " : undefined}
                          suffix={draftItem.discountType === "percent" ? "%" : undefined}
                          onChange={(value) =>
                            setDraftItem((current) => ({
                              ...current,
                              discountValue: Number(value) || 0,
                            }))
                          }
                          classNames={{
                            label: "text-xs font-bold text-zinc-500",
                            input: "rounded-xl border-zinc-200 bg-white font-bold",
                          }}
                        />
                        <Box className="rounded-xl bg-white px-4 py-2 text-right ring-1 ring-emerald-100">
                          <Text size="xs" fw={700} className="text-zinc-500">
                            Setelah diskon
                          </Text>
                          <Text fw={900} className="text-primary">
                            {formatRupiah(
                              getItemTotal({
                                id: "draft",
                                name: draftItem.name,
                                quantity: draftItem.quantity,
                                price: draftItem.price,
                                discountType: draftItem.discountType,
                                discountValue: draftItem.discountValue,
                              })
                            )}
                          </Text>
                        </Box>
                      </Box>

                      <Group grow>
                        <Button
                          radius="xl"
                          disabled={!canAddDraftItem}
                          leftSection={<IconCircleCheck size={18} />}
                          onClick={addDraftItem}
                          className="bg-primary font-bold hover:bg-primary-dark disabled:bg-zinc-200 disabled:text-zinc-500"
                        >
                          Ceklis & Masukkan ke List
                        </Button>
                      </Group>
                    </Stack>
                  </Paper>
                </Stack>
              </Box>
            </Stack>
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
                          Sebelum diskon
                        </Text>
                        <Text fw={800} size="sm" className="text-zinc-500">
                          {formatRupiah(getItemGrossTotal(item))}
                        </Text>
                        <Text size="xs" fw={700} className="mt-2 text-zinc-500">
                          Total item
                        </Text>
                        <Text fw={900} size="lg" className="text-primary tracking-tight">
                          {formatRupiah(getItemTotal(item))}
                        </Text>
                      </Box>
                    </Box>

                    <Box className="grid grid-cols-1 gap-3 rounded-2xl bg-emerald-50/50 p-3 sm:grid-cols-[0.7fr_1fr_auto] sm:items-end">
                      <SegmentedControl
                        value={item.discountType ?? "amount"}
                        onChange={(value) =>
                          updateItem(item.id, {
                            discountType: value as "amount" | "percent",
                          })
                        }
                        color="emerald"
                        radius="xl"
                        data={[
                          { label: "Diskon Rp", value: "amount" },
                          { label: "Diskon %", value: "percent" },
                        ]}
                        classNames={{ label: "font-bold" }}
                      />
                      <NumberInput
                        label="Diskon item"
                        value={item.discountValue}
                        min={0}
                        max={(item.discountType ?? "amount") === "percent" ? 100 : undefined}
                        allowDecimal={(item.discountType ?? "amount") === "percent"}
                        thousandSeparator="."
                        decimalSeparator=","
                        prefix={(item.discountType ?? "amount") === "amount" ? "Rp " : undefined}
                        suffix={(item.discountType ?? "amount") === "percent" ? "%" : undefined}
                        onChange={(value) =>
                          updateItem(item.id, { discountValue: Number(value) || 0 })
                        }
                        classNames={{
                          label: "text-xs font-bold text-zinc-500",
                          input: "h-12 rounded-xl border-zinc-200 bg-white font-extrabold text-zinc-900",
                        }}
                      />
                      <Box className="rounded-xl bg-white px-4 py-3 text-right ring-1 ring-emerald-100">
                        <Text size="xs" fw={700} className="text-zinc-500">
                          Hemat
                        </Text>
                        <Text fw={900} className="text-emerald-700">
                          {formatRupiah(getItemDiscountAmount(item))}
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
                    Pajak bisa persen dari subtotal atau nominal langsung.
                  </Text>
                </Stack>
              </Group>

              <Box className="grid grid-cols-1 gap-3 sm:grid-cols-[auto_1fr_1fr] sm:items-end">
                <Stack gap={6} className="w-fit max-w-full">
                  <Text size="xs" fw={800} className="text-zinc-500">
                    Tipe pajak
                  </Text>
                  <Group
                    gap={4}
                    wrap="nowrap"
                    className="h-12 w-fit rounded-xl border border-zinc-200 bg-white p-1"
                  >
                    {[
                      { label: "%", value: "percent" },
                      { label: "Rp", value: "amount" },
                    ].map((option) => {
                      const isActive = (bill.taxType ?? "percent") === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            changeTaxType(option.value as "percent" | "amount")
                          }
                          className={`h-9 min-w-12 rounded-lg px-4 text-sm font-extrabold transition ${
                            isActive
                              ? "bg-primary text-white shadow-sm"
                              : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </Group>
                </Stack>
                <NumberInput
                  label={(bill.taxType ?? "percent") === "percent" ? "Persen pajak" : "Nominal pajak"}
                  value={bill.taxRate}
                  min={0}
                  max={(bill.taxType ?? "percent") === "percent" ? 100 : undefined}
                  step={(bill.taxType ?? "percent") === "percent" ? 0.5 : 1000}
                  allowDecimal={(bill.taxType ?? "percent") === "percent"}
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix={(bill.taxType ?? "percent") === "amount" ? "Rp " : undefined}
                  suffix={(bill.taxType ?? "percent") === "percent" ? "%" : undefined}
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
                Pajak {(bill.taxType ?? "percent") === "percent" ? `(${bill.taxRate}%)` : "(nominal)"}
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

function extractSelectableLines(text: string) {
  const seen = new Set<string>();

  return text
    .split(/\r?\n/)
    .map((line) => normalizeOcrLine(line))
    .filter((line) => line.length >= 2)
    .filter((line) => isUsefulOcrLine(line))
    .filter((line) => {
      const key = line.toLowerCase();

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .slice(0, 80);
}

function normalizeOcrLine(line: string) {
  return line
    .replace(/[|]/g, " ")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, " ")
    .replace(/\s+([:.,%])/g, "$1")
    .trim();
}

function isUsefulOcrLine(line: string) {
  const cleaned = line.trim();
  const hasAmount = /\d{1,3}(?:[.,]\d{3})+|\d{4,9}/.test(cleaned);
  const hasPercent = /\d{1,3}(?:[.,]\d{1,2})?\s*%/.test(cleaned);
  const alphaNumericCount = (cleaned.match(/[a-zA-Z0-9]/g) || []).length;
  const words = cleaned.match(/[a-zA-Z]{2,}/g) || [];
  const meaningfulWords = words.filter(
    (word) => word.length >= 3 && /[aeiouAEIOU]/.test(word)
  );
  const singleLetterWords = cleaned.match(/\b[a-zA-Z]\b/g)?.length || 0;
  const knownReceiptWord =
    /(total|subtotal|sub total|grand|cash|bayar|kembali|pajak|tax|serv|service|charge|bill|tanggal|kasir|meja|jumlah|telp|bakery|cafe|diskon|discount|ketoprak|telor|teh|tawar|coklat|keju|kacang|pisang|susu|roll|chupa)/i.test(
      cleaned
    );

  if (knownReceiptWord || hasPercent) {
    return true;
  }

  if (hasAmount) {
    return alphaNumericCount >= 4;
  }

  if (singleLetterWords > meaningfulWords.length) {
    return false;
  }

  if (words.length >= 4 && meaningfulWords.length <= 1) {
    return false;
  }

  if (/[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]{5,}/.test(cleaned)) {
    return false;
  }

  if (meaningfulWords.length >= 2 && alphaNumericCount >= 8) {
    return true;
  }

  return false;
}

function extractAmountFromOcrLine(line: string) {
  const matches = line.match(/(?:rp\s*)?-?\d{1,3}(?:[.,]\d{3})+(?:[.,]\d{2})?|(?:rp\s*)?-?\d{4,9}/gi);

  if (!matches?.length) {
    return 0;
  }

  const normalized = matches[matches.length - 1]
    .toLowerCase()
    .replace(/rp/g, "")
    .replace(/([.,]\d{2})$/, "")
    .replace(/[^\d-]/g, "");

  return Math.abs(Number(normalized)) || 0;
}

function extractQuantityFromOcrLine(line: string) {
  const quantityWithXMatch = line.match(/(?:^|\s)(\d{1,2})\s*[xX](?:\s|$)/);

  if (quantityWithXMatch) {
    return Number(quantityWithXMatch[1]);
  }

  const leadingQuantityMatch = line.match(/^(\d{1,2})\s+[A-Za-z]/);
  return leadingQuantityMatch ? Number(leadingQuantityMatch[1]) : 1;
}

function extractDiscountFromOcrLine(line: string): {
  type: "amount" | "percent";
  value: number;
} {
  const percentMatch = line.match(/(\d{1,3}(?:[.,]\d{1,2})?)\s*%/);

  if (percentMatch) {
    return {
      type: "percent",
      value: Math.min(100, Number(percentMatch[1].replace(",", ".")) || 0),
    };
  }

  return {
    type: "amount",
    value: extractAmountFromOcrLine(line),
  };
}

function extractItemNameFromOcrLine(line: string) {
  return line
    .replace(/(?:rp\s*)?-?\d{1,3}(?:[.,]\d{3})+(?:[.,]\d{2})?/gi, "")
    .replace(/(?:rp\s*)?-?\d{4,9}/gi, "")
    .replace(/^\d+\s*[.)-]?\s*/, "")
    .replace(/\s+[xX]\s*\d+$/, "")
    .replace(/[^a-zA-Z0-9\s.'/-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function recognizeReceipt(
  file: File,
  onProgress: (progress: number) => void
): Promise<OcrResult> {
  onProgress(18);
  const lightImage = await preprocessReceiptImage(file, "light");
  const softImage = await preprocessReceiptImage(file, "soft");
  const adaptiveImage = await preprocessReceiptImage(file, "adaptive");
  const binaryImage = await preprocessReceiptImage(file, "binary");
  const invertedImage = await preprocessReceiptImage(file, "inverted");
  onProgress(24);

  const { createWorker, PSM } = await import("tesseract.js");
  const workerOptions = {
    logger: (message: { status?: string; progress: number }) => {
      if (message.status === "recognizing text") {
        onProgress(Math.max(28, Math.round(28 + message.progress * 66)));
      }
    },
  };
  const worker = await createWorker("eng+ind", 1, workerOptions).catch(() =>
    createWorker("eng", 1, workerOptions)
  );

  try {
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
      preserve_interword_spaces: "1",
      user_defined_dpi: "300",
    });

    const lightResult = await worker.recognize(lightImage, {}, {
      text: true,
      blocks: true,
    });
    const lightText = extractStructuredOcrText(lightResult.data);

    if (isUsableReceiptOcrText(lightText)) {
      return {
        text: lightText,
        lines: extractSelectableLines(lightText),
      };
    }

    const softResult = await worker.recognize(softImage, {}, {
      text: true,
      blocks: true,
    });
    const softText = extractStructuredOcrText(softResult.data);

    if (getOcrScore(softText) > getOcrScore(lightText) && isUsableReceiptOcrText(softText)) {
      return {
        text: softText,
        lines: extractSelectableLines(softText),
      };
    }

    await worker.setParameters({
      tessedit_pageseg_mode: PSM.SPARSE_TEXT,
      preserve_interword_spaces: "1",
      user_defined_dpi: "300",
    });

    const adaptiveResult = await worker.recognize(adaptiveImage, {}, {
      text: true,
      blocks: true,
    });
    const adaptiveText = extractStructuredOcrText(adaptiveResult.data);

    if (isUsableReceiptOcrText(adaptiveText)) {
      return {
        text: adaptiveText,
        lines: extractSelectableLines(adaptiveText),
      };
    }

    await worker.setParameters({
      tessedit_pageseg_mode: PSM.SPARSE_TEXT,
      preserve_interword_spaces: "1",
      user_defined_dpi: "300",
      tessedit_char_whitelist:
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:%/-+()= xX",
    });

    const binaryResult = await worker.recognize(binaryImage, {}, {
      text: true,
      blocks: true,
    });
    const binaryText = extractStructuredOcrText(binaryResult.data);

    if (isUsableReceiptOcrText(binaryText)) {
      return {
        text: binaryText,
        lines: extractSelectableLines(binaryText),
      };
    }

    await worker.setParameters({
      tessedit_pageseg_mode: PSM.SINGLE_COLUMN,
      preserve_interword_spaces: "1",
      user_defined_dpi: "300",
    });

    const invertedResult = await worker.recognize(invertedImage, {}, {
      text: true,
      blocks: true,
    });
    const invertedText = extractStructuredOcrText(invertedResult.data);

    if (isUsableReceiptOcrText(invertedText)) {
      return {
        text: invertedText,
        lines: extractSelectableLines(invertedText),
      };
    }

    await worker.setParameters({
      tessedit_pageseg_mode: PSM.AUTO,
      preserve_interword_spaces: "1",
      user_defined_dpi: "300",
    });

    const fallbackResult = await worker.recognize(file, {}, {
      text: true,
      blocks: true,
    });
    const fallbackText = extractStructuredOcrText(fallbackResult.data);
    const bestText = pickBestOcrText([
      lightText,
      softText,
      adaptiveText,
      binaryText,
      invertedText,
      fallbackText,
    ]);

    return {
      text: bestText,
      lines: extractSelectableLines(bestText),
    };
  } finally {
    await worker.terminate();
  }
}

function extractStructuredOcrText(data: {
  text?: string;
  blocks?: Array<{
    paragraphs?: Array<{
      lines?: Array<{
        text?: string;
        confidence?: number;
        words?: Array<{ text?: string; confidence?: number }>;
      }>;
    }>;
  }> | null;
}) {
  const lines =
    data.blocks
      ?.flatMap((block) => block.paragraphs || [])
      .flatMap((paragraph) => paragraph.lines || [])
      .map((line) => {
        const words = (line.words || [])
          .filter((word) => (word.confidence ?? 0) >= 22)
          .map((word) => word.text?.trim())
          .filter(Boolean);
        const text = words.length ? words.join(" ") : line.text || "";

        return {
          text: normalizeOcrLine(text),
          confidence: line.confidence ?? 0,
        };
      })
      .filter((line) => line.text && line.confidence >= 18)
      .map((line) => line.text) || [];

  const structuredText = lines.join("\n");

  if (isUsableReceiptOcrText(structuredText)) {
    return structuredText;
  }

  return data.text || structuredText;
}

function isUsableReceiptOcrText(text: string) {
  const lines = extractSelectableLines(text);
  const amountLikeCount = lines.filter((line) =>
    /\d{1,3}(?:[.,]\d{3})+|\d{4,9}/.test(line)
  ).length;
  const wordLikeCount = lines.filter((line) => /[a-zA-Z]{3,}/.test(line)).length;

  return lines.length >= 5 && amountLikeCount >= 2 && wordLikeCount >= 2;
}

function pickBestOcrText(texts: string[]) {
  return texts.reduce((bestText, text) =>
    getOcrScore(text) > getOcrScore(bestText) ? text : bestText
  );
}

function getOcrScore(text: string) {
  const lines = extractSelectableLines(text);
  const amountLikeCount = lines.filter((line) =>
    /\d{1,3}(?:[.,]\d{3})+|\d{4,9}/.test(line)
  ).length;
  const wordLikeCount = lines.filter((line) => /[a-zA-Z]{3,}/.test(line)).length;

  return lines.length + amountLikeCount * 3 + wordLikeCount * 2;
}

async function preprocessReceiptImage(
  file: File,
  mode: "light" | "soft" | "adaptive" | "binary" | "inverted"
) {
  const image = await createImageBitmap(file);
  const maxSide = 3000;
  const longestSide = Math.max(image.width, image.height);
  const scale = longestSide > maxSide ? maxSide / longestSide : 3;
  const canvas = document.createElement("canvas");
  const width = Math.round(image.width * scale);
  const height = Math.round(image.height * scale);

  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    image.close();
    return file;
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, width, height);
  image.close();

  const imageData = context.getImageData(0, 0, width, height);
  const data = imageData.data;
  const histogram = new Array<number>(256).fill(0);
  const grays = new Uint8ClampedArray(width * height);

  for (let index = 0, pixelIndex = 0; index < data.length; index += 4, pixelIndex += 1) {
    const gray = Math.round(
      data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114
    );

    grays[pixelIndex] = gray;
    histogram[gray] += 1;
  }

  const low = getHistogramPercentile(histogram, grays.length, 0.02);
  const high = getHistogramPercentile(histogram, grays.length, 0.98);
  const range = Math.max(32, high - low);

  if (mode === "adaptive") {
    const normalizedGrays = new Uint8ClampedArray(width * height);

    for (let pixelIndex = 0; pixelIndex < grays.length; pixelIndex += 1) {
      normalizedGrays[pixelIndex] = Math.max(
        0,
        Math.min(255, ((grays[pixelIndex] - low) / range) * 255)
      );
    }

    const integralImage = buildIntegralImage(normalizedGrays, width, height);
    const radius = Math.max(14, Math.round(Math.min(width, height) * 0.018));

    for (let index = 0, pixelIndex = 0; index < data.length; index += 4, pixelIndex += 1) {
      const x = pixelIndex % width;
      const y = Math.floor(pixelIndex / width);
      const mean = getAdaptiveWindowMean(
        integralImage,
        width,
        height,
        x,
        y,
        radius
      );
      const output = normalizedGrays[pixelIndex] < mean - 10 ? 0 : 255;

      data[index] = output;
      data[index + 1] = output;
      data[index + 2] = output;
    }

    context.putImageData(imageData, 0, 0);
    return canvas;
  }

  for (let index = 0, pixelIndex = 0; index < data.length; index += 4, pixelIndex += 1) {
    const normalized = Math.max(
      0,
      Math.min(255, ((grays[pixelIndex] - low) / range) * 255)
    );
    const boosted = Math.max(0, Math.min(255, (normalized - 128) * 1.8 + 148));
    let output = boosted;

    if (mode === "light") {
      output = Math.max(0, Math.min(255, (normalized - 128) * 2.15 + 160));
    }

    if (mode === "soft") {
      output = Math.max(0, Math.min(255, (normalized - 128) * 1.55 + 142));
    }

    if (mode === "binary") {
      output = boosted > 172 ? 255 : boosted < 118 ? 0 : boosted;
    }

    if (mode === "inverted") {
      output = 255 - (boosted > 152 ? 255 : boosted < 96 ? 0 : boosted);
    }

    data[index] = output;
    data[index + 1] = output;
    data[index + 2] = output;
  }

  context.putImageData(imageData, 0, 0);

  return canvas;
}

function buildIntegralImage(
  pixels: Uint8ClampedArray,
  width: number,
  height: number
) {
  const integral = new Float64Array((width + 1) * (height + 1));

  for (let y = 1; y <= height; y += 1) {
    let rowSum = 0;

    for (let x = 1; x <= width; x += 1) {
      rowSum += pixels[(y - 1) * width + (x - 1)];
      integral[y * (width + 1) + x] =
        integral[(y - 1) * (width + 1) + x] + rowSum;
    }
  }

  return integral;
}

function getAdaptiveWindowMean(
  integral: Float64Array,
  width: number,
  height: number,
  x: number,
  y: number,
  radius: number
) {
  const left = Math.max(0, x - radius);
  const top = Math.max(0, y - radius);
  const right = Math.min(width - 1, x + radius);
  const bottom = Math.min(height - 1, y + radius);
  const integralWidth = width + 1;
  const area = (right - left + 1) * (bottom - top + 1);
  const sum =
    integral[(bottom + 1) * integralWidth + (right + 1)] -
    integral[top * integralWidth + (right + 1)] -
    integral[(bottom + 1) * integralWidth + left] +
    integral[top * integralWidth + left];

  return sum / area;
}

function getHistogramPercentile(
  histogram: number[],
  totalPixels: number,
  percentile: number
) {
  const target = Math.max(0, Math.min(totalPixels - 1, totalPixels * percentile));
  let accumulated = 0;

  for (let index = 0; index < histogram.length; index += 1) {
    accumulated += histogram[index];

    if (accumulated >= target) {
      return index;
    }
  }

  return histogram.length - 1;
}
