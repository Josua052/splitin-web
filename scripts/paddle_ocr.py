import json
import os
import sys
from contextlib import redirect_stdout


ORIGINAL_STDOUT = sys.stdout
os.environ.setdefault("FLAGS_enable_pir_api", "0")
os.environ.setdefault("FLAGS_enable_mkldnn", "0")
os.environ.setdefault("FLAGS_use_mkldnn", "0")
os.environ.setdefault("FLAGS_use_onednn", "0")
os.environ.setdefault("OMP_NUM_THREADS", "1")


def emit(payload):
    print(json.dumps(payload, ensure_ascii=False), file=ORIGINAL_STDOUT)


def normalize_line(value):
    return " ".join(str(value).replace("|", " ").split()).strip()


def collect_lines_from_legacy(result):
    lines = []

    for page in result or []:
        if not page:
            continue

        for item in page:
            if not item or len(item) < 2:
                continue

            text_data = item[1]
            text = text_data[0] if isinstance(text_data, (list, tuple)) else text_data
            line = normalize_line(text)

            if line:
                lines.append(line)

    return lines


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


def main():
    if len(sys.argv) < 2:
        emit({"error": "Image path is required."})
        sys.exit(1)

    image_path = sys.argv[1]
    lang = sys.argv[2] if len(sys.argv) > 2 else "en"

    try:
        with redirect_stdout(sys.stderr):
            from paddleocr import PaddleOCR
    except Exception as exc:
        emit(
            {
                "error": (
                    "Package PaddleOCR belum terinstall di Python environment. "
                    "Install dengan: python -m pip install paddleocr paddlepaddle. "
                    f"Detail: {exc}"
                )
            }
        )
        sys.exit(2)

    try:
        try:
            with redirect_stdout(sys.stderr):
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
                result = ocr.predict(image_path)
            lines = collect_lines_from_predict(result)
        except TypeError:
            with redirect_stdout(sys.stderr):
                ocr = PaddleOCR(use_angle_cls=True, lang=lang, show_log=False)
                result = ocr.ocr(image_path, cls=True)
            lines = collect_lines_from_legacy(result)

        if not lines:
            emit({"error": "PaddleOCR tidak menemukan teks pada gambar."})
            sys.exit(3)

        emit({"text": "\n".join(lines), "lines": lines})
    except Exception as exc:
        emit({"error": f"PaddleOCR gagal memproses gambar. Detail: {exc}"})
        sys.exit(4)


if __name__ == "__main__":
    main()
