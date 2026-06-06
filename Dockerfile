FROM python:3.11-slim

WORKDIR /app

COPY pyproject.toml ./
COPY python_app ./python_app

RUN pip install --no-cache-dir .

EXPOSE 8000

CMD ["uvicorn", "python_app.main:app", "--host", "0.0.0.0", "--port", "8000"]
