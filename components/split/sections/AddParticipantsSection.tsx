"use client";

import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Group,
  NumberInput,
  Paper,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import {
  IconChevronLeft,
  IconChevronRight,
  IconCircleCheck,
  IconEdit,
  IconReceipt,
  IconScale,
  IconTarget,
  IconTrash,
  IconUserPlus,
} from "@tabler/icons-react";
import { formatRupiah, getItemTotal } from "../receiptParser";
import {
  calculateSplits,
  createDefaultCustomShares,
  getCustomShareTotal,
} from "../splitCalculator";
import {
  BillData,
  CustomShares,
  ItemAssignments,
  Participant,
  SplitMode,
} from "../types";

interface AddParticipantsSectionProps {
  bill: BillData;
  participants: Participant[];
  splitMode: SplitMode;
  itemAssignments: ItemAssignments;
  customShares: CustomShares;
  onParticipantsChange: (participants: Participant[]) => void;
  onSplitModeChange: (mode: SplitMode) => void;
  onItemAssignmentsChange: (assignments: ItemAssignments) => void;
  onCustomSharesChange: (shares: CustomShares) => void;
  onBack: () => void;
  onNext: () => void;
}

export function AddParticipantsSection({
  bill,
  participants,
  splitMode,
  itemAssignments,
  customShares,
  onParticipantsChange,
  onSplitModeChange,
  onItemAssignmentsChange,
  onCustomSharesChange,
  onBack,
  onNext,
}: AddParticipantsSectionProps) {
  const participantIds = participants.map((participant) => participant.id);
  const normalizedCustomShares = createDefaultCustomShares(
    participants,
    customShares
  );
  const customShareTotal = getCustomShareTotal(normalizedCustomShares);
  const splits = calculateSplits({
    bill,
    participants,
    splitMode,
    itemAssignments,
    customShares: normalizedCustomShares,
  });
  const canContinue =
    participants.length > 0 &&
    (splitMode !== "custom" || Math.abs(customShareTotal - 100) < 0.01);

  const addParticipant = () => {
    onParticipantsChange([
      ...participants,
      {
        id: crypto.randomUUID(),
        name: `Teman ${participants.length}`,
      },
    ]);
  };

  const updateParticipant = (id: string, name: string) => {
    onParticipantsChange(
      participants.map((participant) =>
        participant.id === id ? { ...participant, name } : participant
      )
    );
  };

  const removeParticipant = (id: string) => {
    onParticipantsChange(participants.filter((participant) => participant.id !== id));
  };

  const updateItemAssignment = (itemId: string, selectedIds: string[]) => {
    onItemAssignmentsChange({
      ...itemAssignments,
      [itemId]: selectedIds.length ? selectedIds : participantIds,
    });
  };

  const toggleItemAssignment = (
    itemId: string,
    selectedIds: string[],
    participantId: string
  ) => {
    const isSelected = selectedIds.includes(participantId);
    const nextSelectedIds = isSelected
      ? selectedIds.filter((id) => id !== participantId)
      : [...selectedIds, participantId];

    updateItemAssignment(
      itemId,
      nextSelectedIds.length ? nextSelectedIds : [participantId]
    );
  };

  const updateCustomShare = (participantId: string, percent: number) => {
    onCustomSharesChange({
      ...normalizedCustomShares,
      [participantId]: percent,
    });
  };

  const distributeCustomSharesEqually = () => {
    onCustomSharesChange(createDefaultCustomShares(participants, {}));
  };

  const activeSummary = getModeSummary(splitMode, bill.total, participants.length);

  return (
    <Box className="pb-24 bg-[#F9FAFB]">
      <Container size="sm" className="px-4 pt-12">
        <Paper p="xl" radius={24} withBorder className="border-zinc-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] mb-10 bg-white">
          <Group justify="space-between" align="flex-start">
            <Group gap="lg" align="flex-start" className="min-w-0">
              <Box className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 shadow-sm border border-orange-100 shrink-0">
                <IconReceipt size={28} stroke={1.5} />
              </Box>
              <Stack gap={2} className="min-w-0">
                <Title order={3} className="text-xl font-extrabold text-zinc-900 tracking-tight">
                  {bill.title}
                </Title>
                <Text size="sm" c="dimmed" fw={600} className="tracking-wide">
                  {bill.items.length} item - Total: {formatRupiah(bill.total)}
                </Text>
              </Stack>
            </Group>
            <Button variant="subtle" color="emerald" size="sm" className="font-bold hover:bg-emerald-50" onClick={onBack}>
              Edit detail
            </Button>
          </Group>
        </Paper>

        <Paper p={32} radius={32} className="bg-white border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] mb-10">
          <Title order={3} className="text-2xl font-extrabold text-zinc-900 mb-8 tracking-tight">
            Siapa saja yang ikut?
          </Title>

          <Stack gap="md" mb="xl">
            {participants.map((participant, index) => (
              <Paper key={participant.id} p="md" radius="xl" className="bg-zinc-50/50 border border-zinc-100 hover:border-emerald-200 transition-colors">
                <Group justify="space-between" wrap="nowrap">
                  <Group gap="md" className="min-w-0 flex-1" wrap="nowrap">
                    <Avatar color={index % 2 === 0 ? "emerald" : "blue"} radius="lg" size="lg" className="font-bold shadow-sm shrink-0">
                      {participant.name[0]?.toUpperCase() || "?"}
                    </Avatar>
                    <TextInput
                      value={participant.name}
                      onChange={(event) => updateParticipant(participant.id, event.currentTarget.value)}
                      variant="unstyled"
                      className="flex-1"
                      classNames={{ input: "font-extrabold text-zinc-800 text-base" }}
                    />
                  </Group>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    radius="md"
                    size="lg"
                    disabled={participants.length <= 1}
                    className="hover:bg-red-50 disabled:opacity-30"
                    onClick={() => removeParticipant(participant.id)}
                    aria-label={`Hapus ${participant.name}`}
                  >
                    <IconTrash size={20} />
                  </ActionIcon>
                </Group>
              </Paper>
            ))}
          </Stack>

          <Group gap="sm">
            <Button
              variant="filled"
              leftSection={<IconUserPlus size={18} stroke={3} />}
              radius="xl"
              size="md"
              onClick={addParticipant}
              className="bg-zinc-200 text-zinc-800 hover:bg-zinc-300 px-6 font-bold"
            >
              Tambah Orang
            </Button>
            <Button variant="light" color="emerald" radius="xl" size="md" onClick={() => onParticipantsChange([{ id: "you", name: "Kamu" }])} className="bg-emerald-50 text-emerald-700 px-5 font-bold hover:bg-emerald-100 border border-emerald-100">
              Reset ke Kamu
            </Button>
          </Group>
        </Paper>

        <Stack gap="lg" className="mb-10">
          <Text fw={800} size="xl" className="text-zinc-900 px-2 tracking-tight">
            Mode Pembagian
          </Text>
          <Box className="p-1.5 bg-zinc-100 rounded-full">
            <SegmentedControl
              fullWidth
              value={splitMode}
              onChange={(value) => onSplitModeChange(value as SplitMode)}
              radius="xl"
              size="md"
              color="emerald"
              transitionDuration={300}
              classNames={{
                root: "bg-transparent border-0",
                indicator: "shadow-lg",
                label: "py-3",
              }}
              data={[
                {
                  label: (
                    <Group gap="xs" justify="center" wrap="nowrap">
                      <IconScale size={20} stroke={2} />
                      <Text size="sm" fw={800} className="whitespace-nowrap">
                        Sama Rata
                      </Text>
                    </Group>
                  ),
                  value: "equal",
                },
                {
                  label: (
                    <Group gap="xs" justify="center" wrap="nowrap">
                      <IconTarget size={20} stroke={2} />
                      <Text size="sm" fw={800} className="whitespace-nowrap">
                        Per Item
                      </Text>
                    </Group>
                  ),
                  value: "item",
                },
                {
                  label: (
                    <Group gap="xs" justify="center" wrap="nowrap">
                      <IconEdit size={20} stroke={2} />
                      <Text size="sm" fw={800} className="whitespace-nowrap">
                        Custom %
                      </Text>
                    </Group>
                  ),
                  value: "custom",
                },
              ]}
            />
          </Box>

          <Paper p="xl" radius={24} className="bg-emerald-50/50 border-2 border-dashed border-emerald-100 text-center shadow-sm">
            <Text size="md" fw={600} className="text-zinc-600">
              {activeSummary}
            </Text>
          </Paper>

          {splitMode === "item" && (
            <Paper p={24} radius={28} className="bg-white border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
              <Group justify="space-between" mb="lg">
                <Stack gap={2}>
                  <Text fw={900} size="lg" className="text-zinc-900">
                    Atur pembayar per item
                  </Text>
                  <Text size="sm" c="dimmed">
                    Pilih satu orang untuk minuman masing-masing, atau beberapa orang untuk sharing snack.
                  </Text>
                </Stack>
              </Group>

              <Stack gap="md">
                {bill.items.map((item) => {
                  const selectedIds = itemAssignments[item.id]?.length
                    ? itemAssignments[item.id].filter((id) => participantIds.includes(id))
                    : participantIds;
                  const selectedCount = selectedIds.length || participants.length;

                  return (
                    <Paper key={item.id} p="md" radius="xl" className="border border-zinc-100 bg-zinc-50/60">
                      <Group justify="space-between" align="flex-start" mb="md">
                        <Stack gap={2}>
                          <Text fw={800} className="text-zinc-900">
                            {item.name}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {item.quantity}x - {formatRupiah(getItemTotal(item))}
                          </Text>
                        </Stack>
                        <Badge color="emerald" variant="light" radius="md">
                          {formatRupiah(getItemTotal(item) / selectedCount)} / orang
                        </Badge>
                      </Group>

                      <Group gap="xs">
                        {participants.map((participant) => {
                          const isSelected = selectedIds.includes(participant.id);

                          return (
                            <button
                              key={participant.id}
                              type="button"
                              onClick={() =>
                                toggleItemAssignment(
                                  item.id,
                                  selectedIds,
                                  participant.id
                                )
                              }
                              className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-3 py-2 text-sm font-extrabold transition ${
                                isSelected
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-900 shadow-sm"
                                  : "border-zinc-200 bg-white text-zinc-700 hover:border-emerald-200 hover:text-emerald-800"
                              }`}
                            >
                              <span
                                className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                                  isSelected
                                    ? "border-emerald-500 bg-emerald-500 text-white"
                                    : "border-zinc-300 bg-white text-transparent"
                                }`}
                              >
                                <IconCircleCheck size={14} stroke={3} />
                              </span>
                              <span>{participant.name || "Tanpa nama"}</span>
                            </button>
                          );
                        })}
                      </Group>
                    </Paper>
                  );
                })}
              </Stack>
            </Paper>
          )}

          {splitMode === "custom" && (
            <Paper p={24} radius={28} className="bg-white border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
              <Group justify="space-between" mb="lg">
                <Stack gap={2}>
                  <Text fw={900} size="lg" className="text-zinc-900">
                    Atur persentase
                  </Text>
                  <Text size="sm" c="dimmed">
                    Total persentase harus 100% sebelum lanjut.
                  </Text>
                </Stack>
                <Button variant="light" color="emerald" radius="xl" onClick={distributeCustomSharesEqually} className="font-bold">
                  Bagi rata
                </Button>
              </Group>

              <Stack gap="sm">
                {participants.map((participant, index) => (
                  <Paper key={participant.id} p="md" radius="xl" className="border border-zinc-100 bg-zinc-50/60">
                    <Group justify="space-between" wrap="nowrap">
                      <Group gap="md" wrap="nowrap" className="min-w-0">
                        <Avatar color={index % 2 === 0 ? "emerald" : "blue"} radius="lg" size="md" className="font-bold">
                          {participant.name[0]?.toUpperCase() || "?"}
                        </Avatar>
                        <Stack gap={0} className="min-w-0">
                          <Text fw={800} className="text-zinc-900">
                            {participant.name || "Tanpa nama"}
                          </Text>
                          <Text size="xs" c="dimmed">
                            Estimasi {formatRupiah((bill.total * (normalizedCustomShares[participant.id] || 0)) / 100)}
                          </Text>
                        </Stack>
                      </Group>
                      <NumberInput
                        value={normalizedCustomShares[participant.id] || 0}
                        min={0}
                        max={100}
                        step={1}
                        suffix="%"
                        className="w-28"
                        onChange={(value) => updateCustomShare(participant.id, Number(value) || 0)}
                        classNames={{ input: "text-right font-extrabold" }}
                      />
                    </Group>
                  </Paper>
                ))}
              </Stack>

              <Group justify="space-between" mt="lg" className={`rounded-2xl px-4 py-3 ${Math.abs(customShareTotal - 100) < 0.01 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                <Text fw={800}>Total persentase</Text>
                <Text fw={900}>{customShareTotal}%</Text>
              </Group>
            </Paper>
          )}
        </Stack>

        <Paper p={32} radius={32} className="bg-white border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] mb-12">
          <Title order={3} className="text-2xl font-extrabold text-zinc-900 mb-8 tracking-tight">
            Ringkasan Sementara
          </Title>
          <Stack gap="xl">
            {splits.map((split, index) => (
              <Stack key={split.participant.id} gap="xl">
                {index > 0 && <Divider className="border-zinc-50" />}
                <Group justify="space-between" align="flex-start">
                  <Group gap="md" align="flex-start">
                    <Avatar color={index % 2 === 0 ? "emerald" : "blue"} radius="lg" size="md" className="font-bold">
                      {split.participant.name[0]?.toUpperCase() || "?"}
                    </Avatar>
                    <Stack gap={3}>
                      <Text fw={700} size="md" className="text-zinc-800">
                        {split.participant.name || "Tanpa nama"}
                      </Text>
                      <Text size="xs" c="dimmed">
                        Menu {formatRupiah(split.base)} + pajak/service {formatRupiah(split.fee)}
                      </Text>
                    </Stack>
                  </Group>
                  <NumberInput
                    value={Math.round(split.total)}
                    readOnly
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="Rp "
                    className="w-40"
                    classNames={{ input: "font-extrabold text-zinc-900 text-right bg-white" }}
                  />
                </Group>
              </Stack>
            ))}
          </Stack>
        </Paper>

        <Group grow gap="xl">
          <Button
            variant="outline"
            size="xl"
            radius="xl"
            leftSection={<IconChevronLeft size={22} stroke={2.5} />}
            className="border-zinc-200 text-zinc-600 hover:bg-zinc-50 h-16 font-bold shadow-sm transition-all hover:border-zinc-300"
            onClick={onBack}
          >
            Kembali
          </Button>
          <Button
            size="xl"
            radius="xl"
            disabled={!canContinue}
            rightSection={<IconChevronRight size={22} stroke={2.5} />}
            className="bg-primary hover:bg-emerald-700 h-16 font-bold shadow-xl shadow-emerald-100 transition-all hover:-translate-y-1 disabled:bg-zinc-200 disabled:text-zinc-500"
            onClick={onNext}
          >
            Lanjut
          </Button>
        </Group>
      </Container>
    </Box>
  );
}

function getModeSummary(mode: SplitMode, total: number, participantCount: number) {
  if (mode === "item") {
    return "Pilih pembayar di tiap item. Item sharing akan dibagi rata ke orang yang dicentang.";
  }

  if (mode === "custom") {
    return "Masukkan persentase tiap orang. Total 100% akan dikalikan ke total tagihan.";
  }

  return `Total: ${formatRupiah(total)} / ${participantCount || 1} orang = tiap orang bayar ${formatRupiah(total / (participantCount || 1))}`;
}
