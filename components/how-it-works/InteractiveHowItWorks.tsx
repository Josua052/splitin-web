"use client";

import {
  Badge,
  Box,
  Button,
  Container,
  Group,
  NumberInput,
  Paper,
  Progress,
  SegmentedControl,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  IconBrandWhatsapp,
  IconCamera,
  IconChevronRight,
  IconCircleCheck,
  IconEdit,
  IconMinus,
  IconPercentage,
  IconPlus,
  IconShare,
  IconTarget,
  IconUsers,
} from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const steps = [
  {
    title: "Scan atau input struk",
    label: "Input Tagihan",
    description:
      "Ambil foto struk, pilih dari galeri, atau masukkan item secara manual.",
    icon: IconCamera,
  },
  {
    title: "Rapikan item dan biaya",
    label: "Item & Biaya",
    description:
      "Cek nama item, kuantitas, harga satuan, pajak persen, dan biaya service.",
    icon: IconPercentage,
  },
  {
    title: "Tambah peserta",
    label: "Peserta",
    description: "Masukkan siapa saja yang ikut patungan sebelum memilih cara bagi.",
    icon: IconUsers,
  },
  {
    title: "Pilih mode pembagian",
    label: "Mode Split",
    description:
      "Gunakan sama rata, per item untuk kasus minuman masing-masing, atau custom persen.",
    icon: IconTarget,
  },
  {
    title: "Cek dan bagikan hasil",
    label: "Bagikan",
    description:
      "Lihat total tiap orang, lalu salin atau kirim tagihan ke WhatsApp.",
    icon: IconShare,
  },
];

const baseItems = [
  { name: "Black Yuzu", quantity: 2, price: 35000, assigned: ["Marya", "Zahra", "Bintan"] },
  { name: "Canelle", quantity: 1, price: 19000, assigned: ["Marya", "Zahra"] },
  { name: "Coffee Milk", quantity: 1, price: 32000, assigned: ["Bintan"] },
];

const participants = ["Marya", "Zahra", "Bintan"];

export function InteractiveHowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const [scanMode, setScanMode] = useState("scan");
  const [demoQuantity, setDemoQuantity] = useState(2);
  const [taxRate, setTaxRate] = useState(10);
  const [service, setService] = useState(5000);
  const [splitMode, setSplitMode] = useState("item");
  const [selectedNames, setSelectedNames] = useState(["Marya", "Zahra"]);

  const subtotal = useMemo(() => {
    const demoItemSubtotal = demoQuantity * 35000;
    const otherItemsSubtotal = 19000 + 32000;
    return demoItemSubtotal + otherItemsSubtotal;
  }, [demoQuantity]);
  const tax = Math.round((subtotal * taxRate) / 100);
  const total = subtotal + tax + service;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveStep((current) => (current + 1) % steps.length);
    }, 3600);

    return () => window.clearInterval(timer);
  }, []);

  const goToStep = (step: number) => {
    setActiveStep(Math.min(steps.length - 1, Math.max(0, step)));
  };

  const toggleName = (name: string) => {
    setSelectedNames((current) => {
      if (current.includes(name)) {
        return current.length === 1 ? current : current.filter((item) => item !== name);
      }

      return [...current, name];
    });
  };

  return (
    <Box component="section" id="how-it-works" className="bg-[#F9FAFB] py-20">
      <Container size="lg" className="px-4">
        <Stack gap="lg" align="center" className="mb-12 text-center">
          <Badge
            variant="light"
            color="emerald"
            radius="xl"
            className="bg-primary-light px-5 py-3 font-extrabold text-primary"
          >
            Flow SplitBase
          </Badge>
          <Title className="max-w-3xl text-4xl font-extrabold tracking-tight text-zinc-950 md:text-5xl">
            Dari struk sampai hasil patungan, semua bisa dicek sebelum dibagikan.
          </Title>
          <Text size="lg" c="dimmed" className="max-w-2xl leading-relaxed">
            Ikuti alur yang sama dengan halaman split: scan, koreksi detail,
            pilih cara bagi, lalu share hasilnya tanpa menyimpan data ke database.
          </Text>
          <Badge
            color="gray"
            variant="light"
            radius="xl"
            className="bg-white px-4 py-2 font-bold text-zinc-600 shadow-sm"
          >
            Demo otomatis berjalan
          </Badge>
        </Stack>

        <Box className="grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.25fr]">
          <Stack gap="sm" className="how-guide-steps relative overflow-visible">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = activeStep === index;

              return (
                <button
                  key={step.title}
                  type="button"
                  onClick={() => goToStep(index)}
                  className={`how-guide-step-card rounded-3xl border p-5 text-left transition ${
                    isActive
                      ? "how-guide-step-card-active border-emerald-200 bg-white shadow-xl shadow-emerald-950/[0.06]"
                      : "border-zinc-200 bg-white/70 hover:border-emerald-200 hover:bg-white"
                  }`}
                >
                  <Group gap="md" wrap="nowrap" align="flex-start">
                    <Box
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                        isActive
                          ? "bg-primary text-white"
                          : "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      <Icon size={24} stroke={2.2} />
                    </Box>
                    <Stack gap={4} className="min-w-0">
                      <Group gap="xs">
                        <Text size="xs" fw={900} className="text-primary">
                          STEP {index + 1}
                        </Text>
                        <Text size="xs" fw={800} className="text-zinc-400">
                          {step.label}
                        </Text>
                      </Group>
                      <Text fw={900} size="lg" className="text-zinc-950">
                        {step.title}
                      </Text>
                      <Text size="sm" c="dimmed" className="leading-relaxed">
                        {step.description}
                      </Text>
                    </Stack>
                  </Group>
                </button>
              );
            })}
            <Box
              key={activeStep}
              aria-hidden="true"
              className={`how-guide-cursor how-guide-cursor-${activeStep}`}
            />
          </Stack>

          <Paper
            radius={32}
            p={{ base: 20, sm: 28 }}
            className="min-h-[620px] border border-zinc-100 bg-white shadow-[0_20px_70px_rgb(15,23,42,0.08)]"
          >
            <Group justify="space-between" mb="xl" align="flex-start">
              <Stack gap={4}>
                <Text fw={900} size="xl" className="text-zinc-950">
                  {steps[activeStep].title}
                </Text>
                <Text size="sm" c="dimmed">
                  Preview interaktif mengikuti pilihan di bawah.
                </Text>
              </Stack>
              <Badge color="emerald" variant="light" radius="lg" className="px-4 py-3 font-extrabold">
                {activeStep + 1} / {steps.length}
              </Badge>
            </Group>

            <Progress
              value={((activeStep + 1) / steps.length) * 100}
              color="emerald"
              radius="xl"
              mb="xl"
            />

            {activeStep === 0 && (
              <ScanPreview scanMode={scanMode} onScanModeChange={setScanMode} />
            )}

            {activeStep === 1 && (
              <ItemPreview
                quantity={demoQuantity}
                taxRate={taxRate}
                service={service}
                subtotal={subtotal}
                tax={tax}
                total={total}
                onQuantityChange={setDemoQuantity}
                onTaxRateChange={setTaxRate}
                onServiceChange={setService}
              />
            )}

            {activeStep === 2 && <ParticipantsPreview />}

            {activeStep === 3 && (
              <SplitModePreview
                splitMode={splitMode}
                selectedNames={selectedNames}
                total={total}
                onSplitModeChange={setSplitMode}
                onToggleName={toggleName}
              />
            )}

            {activeStep === 4 && (
              <SharePreview total={total} splitMode={splitMode} selectedNames={selectedNames} />
            )}

            <Group justify="space-between" mt="xl">
              <Button
                variant="light"
                color="gray"
                radius="xl"
                disabled={activeStep === 0}
                onClick={() => goToStep(activeStep - 1)}
                className="font-bold"
              >
                Sebelumnya
              </Button>
              {activeStep < steps.length - 1 ? (
                <Button
                  radius="xl"
                  className="bg-primary px-6 font-bold hover:bg-primary-dark"
                  rightSection={<IconChevronRight size={18} />}
                  onClick={() => goToStep(activeStep + 1)}
                >
                  Lanjut
                </Button>
              ) : (
                <Button
                  component={Link}
                  href="/split"
                  radius="xl"
                  className="bg-primary px-6 font-bold hover:bg-primary-dark"
                  rightSection={<IconChevronRight size={18} />}
                >
                  Coba Sekarang
                </Button>
              )}
            </Group>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}

function ScanPreview({
  scanMode,
  onScanModeChange,
}: {
  scanMode: string;
  onScanModeChange: (value: string) => void;
}) {
  return (
    <Stack gap="lg">
      <SegmentedControl
        value={scanMode}
        onChange={onScanModeChange}
        radius="xl"
        color="emerald"
        data={[
          { label: "Scan Struk", value: "scan" },
          { label: "Input Manual", value: "manual" },
        ]}
      />

      <Box className="rounded-3xl border-2 border-dashed border-emerald-100 bg-emerald-50/40 p-10 text-center">
        <Box className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white text-primary shadow-sm">
          {scanMode === "scan" ? <IconCamera size={36} /> : <IconEdit size={36} />}
        </Box>
        <Title order={3} className="mb-2 text-zinc-950">
          {scanMode === "scan" ? "Foto struk yang jelas" : "Masukkan item satu per satu"}
        </Title>
        <Text c="dimmed" className="mx-auto max-w-sm">
          {scanMode === "scan"
            ? "OCR membaca nama item dan angka harga dari gambar struk."
            : "Manual tetap bisa dipakai saat struk buram atau item perlu dikoreksi dari awal."}
        </Text>
      </Box>

      <Paper radius="xl" p="md" className="border border-zinc-100 bg-zinc-50">
        <Stack gap="xs">
          {baseItems.map((item) => (
            <Group key={item.name} justify="space-between" className="rounded-2xl bg-white px-4 py-3">
              <Text fw={800}>{item.name}</Text>
              <Text fw={900} className="text-primary">
                Rp {new Intl.NumberFormat("id-ID").format(item.price)}
              </Text>
            </Group>
          ))}
        </Stack>
      </Paper>
    </Stack>
  );
}

function ItemPreview({
  quantity,
  taxRate,
  service,
  subtotal,
  tax,
  total,
  onQuantityChange,
  onTaxRateChange,
  onServiceChange,
}: {
  quantity: number;
  taxRate: number;
  service: number;
  subtotal: number;
  tax: number;
  total: number;
  onQuantityChange: (value: number) => void;
  onTaxRateChange: (value: number) => void;
  onServiceChange: (value: number) => void;
}) {
  return (
    <Stack gap="lg">
      <Paper radius="xl" p="lg" className="border border-zinc-100 bg-zinc-50">
        <Group justify="space-between" mb="md">
          <Stack gap={2}>
            <Text fw={900} className="text-zinc-950">
              Black Yuzu
            </Text>
            <Text size="xs" c="dimmed">
              Harga satuan Rp 35.000
            </Text>
          </Stack>
          <Group gap={6} className="rounded-full bg-white p-1 ring-1 ring-zinc-200">
            <Button
              variant="subtle"
              color="gray"
              radius="xl"
              size="xs"
              disabled={quantity <= 1}
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            >
              <IconMinus size={16} />
            </Button>
            <Text fw={900} className="min-w-8 text-center">
              {quantity}
            </Text>
            <Button
              variant="subtle"
              color="emerald"
              radius="xl"
              size="xs"
              onClick={() => onQuantityChange(quantity + 1)}
            >
              <IconPlus size={16} />
            </Button>
          </Group>
        </Group>
        <Group justify="space-between" className="rounded-2xl bg-white px-4 py-3">
          <Text fw={700} c="dimmed">
            Total item
          </Text>
          <Text fw={900} className="text-primary">
            Rp {new Intl.NumberFormat("id-ID").format(quantity * 35000)}
          </Text>
        </Group>
      </Paper>

      <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberInput
          label="Pajak"
          value={taxRate}
          min={0}
          max={100}
          suffix="%"
          onChange={(value) => onTaxRateChange(Number(value) || 0)}
          classNames={{ input: "font-extrabold", label: "font-bold text-zinc-600" }}
        />
        <NumberInput
          label="Biaya service"
          value={service}
          min={0}
          thousandSeparator="."
          decimalSeparator=","
          prefix="Rp "
          onChange={(value) => onServiceChange(Number(value) || 0)}
          classNames={{ input: "font-extrabold", label: "font-bold text-zinc-600" }}
        />
      </Box>

      <Stack gap="sm" className="rounded-3xl bg-zinc-950 p-5 text-white">
        <SummaryRow label="Subtotal" value={subtotal} />
        <SummaryRow label={`Pajak ${taxRate}%`} value={tax} />
        <SummaryRow label="Service" value={service} />
        <Group justify="space-between" className="border-t border-white/10 pt-4">
          <Text fw={900}>Total Tagihan</Text>
          <Text fw={900} size="xl">
            Rp {new Intl.NumberFormat("id-ID").format(total)}
          </Text>
        </Group>
      </Stack>
    </Stack>
  );
}

function ParticipantsPreview() {
  return (
    <Stack gap="lg">
      {participants.map((name, index) => (
        <Paper key={name} radius="xl" p="md" className="border border-zinc-100 bg-zinc-50">
          <Group justify="space-between">
            <Group gap="md">
              <Box className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-sm font-black text-white">
                {name[0]}
              </Box>
              <Text fw={900}>{name}</Text>
            </Group>
            <Badge color={index === 0 ? "emerald" : "blue"} variant="light" radius="md">
              Peserta
            </Badge>
          </Group>
        </Paper>
      ))}
      <Button
        variant="light"
        color="emerald"
        radius="xl"
        leftSection={<IconUsers size={18} />}
        className="h-14 font-bold"
      >
        Tambah Orang
      </Button>
    </Stack>
  );
}

function SplitModePreview({
  splitMode,
  selectedNames,
  total,
  onSplitModeChange,
  onToggleName,
}: {
  splitMode: string;
  selectedNames: string[];
  total: number;
  onSplitModeChange: (value: string) => void;
  onToggleName: (name: string) => void;
}) {
  return (
    <Stack gap="lg">
      <SegmentedControl
        value={splitMode}
        onChange={onSplitModeChange}
        radius="xl"
        color="emerald"
        data={[
          { label: "Sama Rata", value: "equal" },
          { label: "Per Item", value: "item" },
          { label: "Custom %", value: "custom" },
        ]}
      />

      {splitMode === "item" ? (
        <Paper radius="xl" p="lg" className="border border-zinc-100 bg-zinc-50">
          <Group justify="space-between" mb="md">
            <Stack gap={2}>
              <Text fw={900}>Canelle</Text>
              <Text size="xs" c="dimmed">
                Snack sharing - Rp 19.000
              </Text>
            </Stack>
            <Badge color="emerald" variant="light" radius="md">
              Rp {new Intl.NumberFormat("id-ID").format(19000 / selectedNames.length)} / orang
            </Badge>
          </Group>
          <Group gap="xs">
            {participants.map((name) => {
              const isSelected = selectedNames.includes(name);

              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => onToggleName(name)}
                  className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-3 py-2 text-sm font-extrabold transition ${
                    isSelected
                      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                      : "border-zinc-200 bg-white text-zinc-700"
                  }`}
                >
                  <IconCircleCheck
                    size={18}
                    className={isSelected ? "text-emerald-500" : "text-zinc-300"}
                  />
                  {name}
                </button>
              );
            })}
          </Group>
        </Paper>
      ) : splitMode === "custom" ? (
        <Stack gap="sm">
          {[
            ["Marya", 50],
            ["Zahra", 30],
            ["Bintan", 20],
          ].map(([name, percent]) => (
            <Group key={name} justify="space-between" className="rounded-2xl bg-zinc-50 px-4 py-3">
              <Text fw={900}>{name}</Text>
              <Badge color="emerald" variant="light" radius="md">
                {percent}%
              </Badge>
            </Group>
          ))}
        </Stack>
      ) : (
        <Box className="rounded-3xl bg-emerald-50 p-8 text-center">
          <Text fw={700} c="dimmed">
            Tiap orang bayar
          </Text>
          <Text fw={900} size="2rem" className="text-primary">
            Rp {new Intl.NumberFormat("id-ID").format(total / participants.length)}
          </Text>
        </Box>
      )}
    </Stack>
  );
}

function SharePreview({
  total,
  splitMode,
  selectedNames,
}: {
  total: number;
  splitMode: string;
  selectedNames: string[];
}) {
  return (
    <Stack gap="lg">
      <Paper radius="xl" p="lg" className="border border-emerald-100 bg-emerald-50">
        <Group gap="md">
          <Box className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white">
            <IconCircleCheck size={28} />
          </Box>
          <Stack gap={2}>
            <Text fw={900} className="text-emerald-950">
              Tagihan siap dibagikan
            </Text>
            <Text size="sm" className="text-emerald-700">
              Mode {splitMode === "item" ? "Per Item" : splitMode === "custom" ? "Custom %" : "Sama Rata"}
            </Text>
          </Stack>
        </Group>
      </Paper>

      <Stack gap="sm">
        {participants.map((name, index) => (
          <Group key={name} justify="space-between" className="rounded-2xl border border-zinc-100 px-4 py-3">
            <Text fw={900}>{name}</Text>
            <Text fw={900} className="text-primary">
              Rp{" "}
              {new Intl.NumberFormat("id-ID").format(
                splitMode === "item"
                  ? index === 2
                    ? total * 0.38
                    : total * 0.31
                  : total / participants.length
              )}
            </Text>
          </Group>
        ))}
      </Stack>

      <Group grow>
        <Button
          radius="xl"
          className="h-14 bg-[#00523C] font-bold hover:bg-[#004230]"
          leftSection={<IconBrandWhatsapp size={20} />}
        >
          WhatsApp
        </Button>
        <Button
          radius="xl"
          variant="light"
          color="emerald"
          className="h-14 font-bold"
          leftSection={<IconShare size={20} />}
        >
          Salin
        </Button>
      </Group>

      <Text size="xs" c="dimmed" ta="center">
        {selectedNames.length} orang sedang dipilih pada contoh item sharing.
      </Text>
    </Stack>
  );
}

function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <Group justify="space-between">
      <Text size="sm" className="text-white/70">
        {label}
      </Text>
      <Text size="sm" fw={800}>
        Rp {new Intl.NumberFormat("id-ID").format(value)}
      </Text>
    </Group>
  );
}
