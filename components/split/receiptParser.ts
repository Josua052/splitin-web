import { BillData, BillItem } from "./types";

const SUMMARY_KEYWORDS = [
  "subtotal",
  "sub total",
  "total",
  "grand total",
  "jumlah",
  "pajak",
  "tax",
  "ppn",
  "service",
  "layanan",
  "diskon",
  "discount",
  "cash",
  "tunai",
  "bayar",
  "paid",
  "kembali",
  "change",
  "balance",
];

const TOTAL_KEYWORDS = ["grand total", "total", "jumlah"];
const TAX_KEYWORDS = ["pajak", "tax", "ppn"];
const SERVICE_KEYWORDS = ["service", "layanan"];

export function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(value)));
}

export function getItemTotal(item: BillItem) {
  return Math.max(0, item.quantity) * Math.max(0, item.price);
}

export function calculateSubtotal(items: BillItem[]) {
  return items.reduce((sum, item) => sum + getItemTotal(item), 0);
}

export function calculateBillTotals(
  items: BillItem[],
  taxRate: number,
  service: number
) {
  const subtotal = calculateSubtotal(items);
  const tax = Math.round((subtotal * Math.max(0, taxRate)) / 100);
  const normalizedService = Math.max(0, Math.round(service));

  return {
    subtotal,
    tax,
    service: normalizedService,
    total: subtotal + tax + normalizedService,
  };
}

export function parseReceiptText(text: string, imagePreview: string | null): BillData {
  const lines = text
    .split(/\r?\n/)
    .map((line) => cleanLine(line))
    .filter(Boolean);

  const items: BillItem[] = [];
  let detectedTotal = 0;
  let detectedTax = 0;
  let detectedService = 0;

  for (const line of lines) {
    const amount = extractLastAmount(line);

    if (!amount) {
      continue;
    }

    const lowerLine = line.toLowerCase();

    if (hasKeyword(lowerLine, TOTAL_KEYWORDS)) {
      detectedTotal = Math.max(detectedTotal, amount);
      continue;
    }

    if (hasKeyword(lowerLine, TAX_KEYWORDS)) {
      detectedTax += amount;
      continue;
    }

    if (hasKeyword(lowerLine, SERVICE_KEYWORDS)) {
      detectedService += amount;
      continue;
    }

    if (hasKeyword(lowerLine, SUMMARY_KEYWORDS)) {
      continue;
    }

    const name = extractItemName(line);

    if (!name || amount < 500) {
      continue;
    }

    items.push({
      id: crypto.randomUUID(),
      name,
      quantity: extractQuantity(line),
      price: amount,
    });
  }

  const subtotal = calculateSubtotal(items);
  const remainingFee = detectedTotal - subtotal - detectedTax - detectedService;

  if (!detectedTax && !detectedService && remainingFee > 0) {
    detectedService = remainingFee;
  }

  const taxRate = subtotal && detectedTax ? roundToTwo((detectedTax / subtotal) * 100) : 0;
  const totals = calculateBillTotals(items, taxRate, detectedService);

  return {
    title: detectReceiptTitle(lines),
    items,
    taxRate,
    ...totals,
    rawText: text.trim(),
    imagePreview,
  };
}

export function createManualItem(name = "Item Baru", price = 0): BillItem {
  return {
    id: crypto.randomUUID(),
    name,
    quantity: 1,
    price,
  };
}

function cleanLine(line: string) {
  return line
    .replace(/[|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasKeyword(line: string, keywords: string[]) {
  return keywords.some((keyword) => line.includes(keyword));
}

function extractLastAmount(line: string) {
  const matches = line.match(/(?:rp\s*)?-?\d{1,3}(?:[.,]\d{3})+(?:[.,]\d{2})?|(?:rp\s*)?-?\d{4,9}/gi);

  if (!matches?.length) {
    return 0;
  }

  return parseAmount(matches[matches.length - 1]);
}

function parseAmount(value: string) {
  const normalized = value
    .toLowerCase()
    .replace(/rp/g, "")
    .replace(/[^\d,.-]/g, "")
    .trim();

  if (!normalized) {
    return 0;
  }

  const withoutDecimals = normalized.replace(/([.,]\d{2})$/, "");
  const numberOnly = withoutDecimals.replace(/[^\d-]/g, "");

  return Math.abs(Number(numberOnly)) || 0;
}

function extractItemName(line: string) {
  return line
    .replace(/(?:rp\s*)?-?\d{1,3}(?:[.,]\d{3})+(?:[.,]\d{2})?/gi, "")
    .replace(/(?:rp\s*)?-?\d{4,9}/gi, "")
    .replace(/^\d+\s*[xX]?\s*/, "")
    .replace(/\s+[xX]\s*\d+$/, "")
    .replace(/[^a-zA-Z0-9\s.'/-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractQuantity(line: string) {
  const quantityWithXMatch = line.match(/(?:^|\s)(\d{1,2})\s*[xX](?:\s|$)/);

  if (quantityWithXMatch) {
    return Number(quantityWithXMatch[1]);
  }

  const leadingQuantityMatch = line.match(/^(\d{1,2})\s+[A-Za-z]/);
  return leadingQuantityMatch ? Number(leadingQuantityMatch[1]) : 1;
}

function detectReceiptTitle(lines: string[]) {
  const title = lines.find((line) => {
    const lowerLine = line.toLowerCase();
    return line.length >= 4 && !extractLastAmount(line) && !hasKeyword(lowerLine, SUMMARY_KEYWORDS);
  });

  return title || "Tagihan dari Struk";
}

function roundToTwo(value: number) {
  return Math.round(value * 100) / 100;
}
