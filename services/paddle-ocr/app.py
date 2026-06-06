import os
import tempfile
from contextlib import redirect_stdout
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile


os.environ.setdefault("FLAGS_enable_pir_api", "0")
os.environ.setdefault("FLAGS_enable_mkldnn", "0")
os.environ.setdefault("FLAGS_use_mkldnn", "0")
os.environ.setdefault("FLAGS_use_onednn", "0")
os.environ.setdefault("OMP_NUM_THREADS", "1")
os.environ.setdefault("PADDLEOCR_CACHE_HOME", "/app/.paddle-cache")
os.environ.setdefault("PADDLE_PDX_CACHE_HOME", "/app/.paddlex-cache")

app = FastAPI(title="SplitBase PaddleOCR Service")
ocr_instances = {}


def normalize_line(value):
    return " ".join(str(value).replace("|", " ").split()).strip()


def collect_lines_from_predict(result):
    lines = []

    for page in result or []:
        json_data = {}

        if hasattr(page, "json"):
            json_data = page.json
        elif isinstance(page, dict):
            json_data = page

        if isinstance(json_data, dict) and "res" in json_data:
            json_data = json_data["res"]

        texts = []

        if isinstance(json_data, dict):
            for key in ("rec_texts", "texts", "text"):
                value = json_data.get(key)

                if isinstance(value, list):
                    texts.extend(value)
                elif isinstance(value, str):
                    texts.append(value)

        for text in texts:
            line = normalize_line(text)

            if line:
                lines.append(line)

    return lines


def get_ocr(lang):
    if lang in ocr_instances:
        return ocr_instances[lang]

    with open(os.devnull, "w", encoding="utf-8") as sink, redirect_stdout(sink):
        from paddleocr import PaddleOCR

        ocr = PaddleOCR(
            device="cpu",
            enable_mkldnn=False,
            cpu_threads=1,
            use_doc_orientation_classify=False,
            use_doc_unwarping=False,
            use_textline_orientation=False,
            text_detection_model_name="PP-OCRv5_mobile_det",
            text_recognition_model_name="en_PP-OCRv5_mobile_rec",
            lang=lang,
        )

    ocr_instances[lang] = ocr
    return ocr


@app.get("/health")
def health():
    return {"ok": True}


@app.get("/")
def root():
    return {"ok": True, "service": "splitbase-paddle-ocr"}


@app.post("/ocr")
async def ocr_image(
    image: UploadFile = File(...),
    lang: str = Form("en"),
):
    suffix = Path(image.filename or "receipt.jpg").suffix or ".jpg"

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_path = temp_file.name
            temp_file.write(await image.read())

        ocr = get_ocr(lang or "en")

        with open(os.devnull, "w", encoding="utf-8") as sink, redirect_stdout(sink):
            result = ocr.predict(temp_path)

        lines = collect_lines_from_predict(result)

        if not lines:
            raise HTTPException(
                status_code=422,
                detail="PaddleOCR tidak menemukan teks pada gambar.",
            )

        return {
            "text": "\n".join(lines),
            "lines": lines,
            "engine": "paddle",
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"PaddleOCR gagal memproses gambar. Detail: {exc}",
        ) from exc
    finally:
        if "temp_path" in locals():
            Path(temp_path).unlink(missing_ok=True)
