import { randomUUID } from "crypto";
import { mkdir, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { spawn } from "child_process";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

interface PaddleOcrPayload {
  text?: string;
  lines?: string[];
  error?: string;
}

export async function POST(request: NextRequest) {
  const tempDir = path.join(tmpdir(), `splitin-ocr-${randomUUID()}`);

  try {
    const formData = await request.formData();
    const file = formData.get("image");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Image file is required." },
        { status: 400 }
      );
    }

    const lang = process.env.PADDLEOCR_LANG || "en";
    const serviceUrl = process.env.PADDLEOCR_SERVICE_URL?.trim();

    if (serviceUrl) {
      const payload = await runRemotePaddleOcr(serviceUrl, file, lang);

      if (payload.error) {
        return NextResponse.json({ error: payload.error }, { status: 422 });
      }

      return NextResponse.json(normalizePaddlePayload(payload));
    }

    await mkdir(tempDir, { recursive: true });

    const extension = getSafeImageExtension(file);
    const imagePath = path.join(tempDir, `receipt.${extension}`);
    await writeFile(imagePath, Buffer.from(await file.arrayBuffer()));

    const scriptPath = path.join(process.cwd(), "scripts", "paddle_ocr.py");
    const pythonCommand = process.env.PADDLEOCR_PYTHON_COMMAND || "python";
    const payload = await runPaddleOcr(pythonCommand, scriptPath, imagePath, lang);

    if (payload.error) {
      return NextResponse.json({ error: payload.error }, { status: 422 });
    }

    return NextResponse.json(normalizePaddlePayload(payload));
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "PaddleOCR gagal membaca gambar.",
      },
      { status: 500 }
    );
  } finally {
    await rm(tempDir, { recursive: true, force: true }).catch(() => undefined);
  }
}

async function runRemotePaddleOcr(
  serviceUrl: string,
  file: File,
  lang: string
) {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("lang", lang);

  const response = await fetch(`${serviceUrl.replace(/\/$/, "")}/ocr`, {
    method: "POST",
    body: formData,
  });
  const payload = (await response.json().catch(() => null)) as
    | PaddleOcrPayload
    | null;

  if (!response.ok) {
    const detail = (payload as { detail?: unknown } | null)?.detail;
    return {
      error:
        payload?.error ||
        (typeof detail === "string" ? detail : undefined) ||
        `PaddleOCR Render service gagal dengan status ${response.status}.`,
    };
  }

  return payload || { error: "PaddleOCR Render service tidak mengembalikan JSON." };
}

function normalizePaddlePayload(payload: PaddleOcrPayload) {
  const text = payload.text || (payload.lines || []).join("\n");

  return {
    text,
    lines: normalizeOcrLines(
      payload.lines?.length ? payload.lines : text.split(/\r?\n/)
    ),
    engine: "paddle",
  };
}

function getSafeImageExtension(file: File) {
  const mimeExtension = file.type.split("/")[1]?.toLowerCase();

  if (mimeExtension && ["jpg", "jpeg", "png", "webp"].includes(mimeExtension)) {
    return mimeExtension === "jpeg" ? "jpg" : mimeExtension;
  }

  return "jpg";
}

function runPaddleOcr(
  pythonCommand: string,
  scriptPath: string,
  imagePath: string,
  lang: string
) {
  return new Promise<PaddleOcrPayload>((resolve) => {
    const paddleCacheHome =
      process.env.PADDLE_PDX_CACHE_HOME ||
      path.join(process.cwd(), ".paddlex-cache");
    const paddleUserHome =
      process.env.PADDLEOCR_CACHE_HOME ||
      path.join(process.cwd(), ".paddle-cache");
    const child = spawn(pythonCommand, [scriptPath, imagePath, lang], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        HOME: paddleUserHome,
        FLAGS_enable_pir_api: "0",
        FLAGS_enable_mkldnn: "0",
        FLAGS_use_mkldnn: "0",
        FLAGS_use_onednn: "0",
        OMP_NUM_THREADS: "1",
        PADDLE_PDX_CACHE_HOME: paddleCacheHome,
        USERPROFILE: paddleUserHome,
        XDG_CACHE_HOME: path.join(paddleUserHome, ".cache"),
      },
      windowsHide: true,
    });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", (error) => {
      resolve({
        error: `PaddleOCR tidak bisa dijalankan. Cek PADDLEOCR_PYTHON_COMMAND. Detail: ${error.message}`,
      });
    });
    child.on("close", (code) => {
      if (code !== 0) {
        resolve({
          error:
            parsePaddleError(stdout) ||
            parsePaddleError(stderr) ||
            "PaddleOCR gagal. Pastikan package paddleocr dan paddlepaddle sudah terinstall di Python environment.",
        });
        return;
      }

      try {
        resolve(JSON.parse(stdout) as PaddleOcrPayload);
      } catch {
        resolve({
          error: "Output PaddleOCR tidak valid.",
        });
      }
    });
  });
}

function parsePaddleError(output: string) {
  const trimmed = output.trim();

  if (!trimmed) {
    return "";
  }

  try {
    const payload = JSON.parse(trimmed) as PaddleOcrPayload;
    return typeof payload.error === "string" ? payload.error : "";
  } catch {
    return trimmed.split(/\r?\n/).slice(-3).join(" ");
  }
}

function normalizeOcrLines(lines: string[]) {
  const seen = new Set<string>();

  return lines
    .map((line) =>
      line
        .replace(/[|]/g, " ")
        .replace(/[\u201c\u201d]/g, '"')
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/\s+/g, " ")
        .replace(/\s+([:.,%])/g, "$1")
        .trim()
    )
    .filter((line) => line.length >= 2)
    .filter((line) => {
      const key = line.toLowerCase();

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
}
