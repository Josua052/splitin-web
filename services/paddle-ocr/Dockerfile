FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV FLAGS_enable_pir_api=0
ENV FLAGS_enable_mkldnn=0
ENV FLAGS_use_mkldnn=0
ENV FLAGS_use_onednn=0
ENV OMP_NUM_THREADS=1
ENV PADDLEOCR_LANG=en
ENV PADDLEOCR_CACHE_HOME=/app/.paddle-cache
ENV PADDLE_PDX_CACHE_HOME=/app/.paddlex-cache

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends libgl1 libglib2.0-0 libgomp1 \
  && rm -rf /var/lib/apt/lists/*

COPY services/paddle-ocr/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY services/paddle-ocr/app.py ./app.py

EXPOSE 10000

CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port ${PORT:-10000}"]
