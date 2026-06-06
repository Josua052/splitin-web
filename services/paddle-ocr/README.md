# SplitBase PaddleOCR Service

Service ini dipakai oleh Next.js/Vercel melalui `PADDLEOCR_SERVICE_URL`.

## Deploy Ke Render Tanpa Docker

Pakai **Git Provider**, bukan **Existing Image**.

Jika service masih berada di monorepo ini:

- Branch: branch yang berisi code PaddleOCR
- Root Directory: `services/paddle-ocr`
- Runtime: `Python 3`
- Build Command:

```bash
pip install -r requirements.txt
```

- Start Command:

```bash
sh start.sh
```

- Health Check Path:

```text
/health
```

Jika nanti kamu push branch terpisah khusus OCR dan isi branch itu hanya file service ini, kosongkan Root Directory.

## Environment Render

```env
PYTHON_VERSION=3.12.13
PADDLEOCR_LANG=en
PADDLEOCR_CACHE_HOME=/opt/render/project/src/.paddle-cache
PADDLE_PDX_CACHE_HOME=/opt/render/project/src/.paddlex-cache
```

Catatan: Render native runtime tidak memberi kontrol OS package sekuat Docker. Jika build gagal karena dependency native OpenCV/Paddle, gunakan Render Docker-based deploy atau service lain yang mendukung OS packages.

## Endpoint

- `GET /`
- `GET /health`
- `POST /ocr`
  - form-data `image`: file gambar
  - form-data `lang`: default `en`

Response:

```json
{
  "text": "1 KOPI SUSU 15000\nTOTAL 15000",
  "lines": ["1 KOPI SUSU 15000", "TOTAL 15000"],
  "engine": "paddle"
}
```

## Vercel Env

Setelah service Render aktif, isi env di Vercel:

```env
PADDLEOCR_SERVICE_URL=https://your-render-service.onrender.com
PADDLEOCR_LANG=en
```
