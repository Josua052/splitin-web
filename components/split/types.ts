export interface BillItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface BillData {
  title: string;
  items: BillItem[];
  subtotal: number;
  taxRate: number;
  tax: number;
  service: number;
  total: number;
  rawText: string;
  imagePreview: string | null;
}

export interface Participant {
  id: string;
  name: string;
}

export type SplitMode = "equal" | "item" | "custom";

export type ItemAssignments = Record<string, string[]>;

export type CustomShares = Record<string, number>;

export function createEmptyBill(): BillData {
  return {
    title: "Tagihan Baru",
    items: [],
    subtotal: 0,
    taxRate: 0,
    tax: 0,
    service: 0,
    total: 0,
    rawText: "",
    imagePreview: null,
  };
}
