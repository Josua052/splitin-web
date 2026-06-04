import { getItemTotal } from "./receiptParser";
import {
  BillData,
  CustomShares,
  ItemAssignments,
  Participant,
  SplitMode,
} from "./types";

export interface ParticipantSplit {
  participant: Participant;
  base: number;
  fee: number;
  total: number;
  items: Array<{
    name: string;
    amount: number;
  }>;
  percent: number;
}

export function createDefaultAssignments(
  bill: BillData,
  participants: Participant[],
  current: ItemAssignments
) {
  const participantIds = participants.map((participant) => participant.id);

  return bill.items.reduce<ItemAssignments>((assignments, item) => {
    const existing = current[item.id]?.filter((id) => participantIds.includes(id));

    assignments[item.id] = existing?.length ? existing : participantIds;
    return assignments;
  }, {});
}

export function createDefaultCustomShares(
  participants: Participant[],
  current: CustomShares
) {
  if (!participants.length) {
    return {};
  }

  const existingTotal = participants.reduce(
    (sum, participant) => sum + (current[participant.id] || 0),
    0
  );

  if (existingTotal > 0) {
    return participants.reduce<CustomShares>((shares, participant) => {
      shares[participant.id] = current[participant.id] || 0;
      return shares;
    }, {});
  }

  const equalShare = roundToTwo(100 / participants.length);

  return participants.reduce<CustomShares>((shares, participant, index) => {
    shares[participant.id] =
      index === participants.length - 1
        ? roundToTwo(100 - equalShare * (participants.length - 1))
        : equalShare;

    return shares;
  }, {});
}

export function calculateSplits({
  bill,
  participants,
  splitMode,
  itemAssignments,
  customShares,
}: {
  bill: BillData;
  participants: Participant[];
  splitMode: SplitMode;
  itemAssignments: ItemAssignments;
  customShares: CustomShares;
}) {
  if (!participants.length) {
    return [];
  }

  const defaultAssignments = createDefaultAssignments(
    bill,
    participants,
    itemAssignments
  );
  const defaultCustomShares = createDefaultCustomShares(participants, customShares);
  const baseByParticipant = new Map<string, number>();
  const itemsByParticipant = new Map<string, ParticipantSplit["items"]>();

  participants.forEach((participant) => {
    baseByParticipant.set(participant.id, 0);
    itemsByParticipant.set(participant.id, []);
  });

  if (splitMode === "equal") {
    const baseShare = bill.subtotal / participants.length;

    participants.forEach((participant) => {
      baseByParticipant.set(participant.id, baseShare);
      itemsByParticipant.set(
        participant.id,
        bill.items.map((item) => ({
          name: item.name,
          amount: getItemTotal(item) / participants.length,
        }))
      );
    });
  }

  if (splitMode === "item") {
    bill.items.forEach((item) => {
      const assignedIds = defaultAssignments[item.id]?.length
        ? defaultAssignments[item.id]
        : participants.map((participant) => participant.id);
      const itemShare = getItemTotal(item) / assignedIds.length;

      assignedIds.forEach((participantId) => {
        baseByParticipant.set(
          participantId,
          (baseByParticipant.get(participantId) || 0) + itemShare
        );
        itemsByParticipant.get(participantId)?.push({
          name: item.name,
          amount: itemShare,
        });
      });
    });
  }

  if (splitMode === "custom") {
    participants.forEach((participant) => {
      const percent = defaultCustomShares[participant.id] || 0;
      const base = (bill.subtotal * percent) / 100;

      baseByParticipant.set(participant.id, base);
      itemsByParticipant.set(participant.id, [
        {
          name: `Custom ${formatPercent(percent)}`,
          amount: base,
        },
      ]);
    });
  }

  const totalFees = bill.tax + bill.service;
  const baseTotal = Array.from(baseByParticipant.values()).reduce(
    (sum, value) => sum + value,
    0
  );

  return participants.map((participant) => {
    const base = baseByParticipant.get(participant.id) || 0;
    const fee =
      baseTotal > 0 ? (totalFees * base) / baseTotal : totalFees / participants.length;
    const total = base + fee;

    return {
      participant,
      base,
      fee,
      total,
      items: itemsByParticipant.get(participant.id) || [],
      percent: bill.total > 0 ? (total / bill.total) * 100 : 0,
    };
  });
}

export function getCustomShareTotal(customShares: CustomShares) {
  return roundToTwo(
    Object.values(customShares).reduce((sum, value) => sum + (Number(value) || 0), 0)
  );
}

function roundToTwo(value: number) {
  return Math.round(value * 100) / 100;
}

function formatPercent(value: number) {
  return `${roundToTwo(value)}%`;
}
