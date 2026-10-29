from dataclasses import dataclass
import os
from pathlib import Path
from urllib.parse import urlparse

PRIMARY_MODEL = "google/gemini-2.5-flash"
DEFAULT_FALLBACKS = ("google/gemini-2.5-pro", "anthropic/claude-sonnet-4.6", "openai/gpt-4.1")


class ConfigurationError(Exception):
    pass


def https_url(value: str) -> str:
    parsed = urlparse(value)
    if parsed.scheme != "https" or not parsed.hostname or parsed.username or parsed.password or parsed.query or parsed.fragment:
        raise ConfigurationError("SUPABASE_URL debe ser una URL HTTPS sin credenciales ni parámetros.")
    return value.rstrip("/")


def integer(name: str, default: int, minimum: int, maximum: int) -> int:
    try:
        value = int(os.getenv(name, str(default)))
    except ValueError as exc:
        raise ConfigurationError(f"{name} debe ser un número entero.") from exc
    if not minimum <= value <= maximum:
        raise ConfigurationError(f"{name} debe estar entre {minimum} y {maximum}.")
    return value


@dataclass(frozen=True)
class Settings:
    input_dir: Path
    api_key: str
    supabase_url: str
    supabase_key: str
    models: tuple[str, ...]
    poll_seconds: int = 15
    timeout: int = 90
    retries: int = 1
    max_attempts: int = 5
    max_mb: int = 20
    max_pages: int = 20
    max_chars: int = 80000
    max_output_tokens: int = 6000
    ocr_language: str = "spa+eng"
    tesseract_cmd: str = ""

    @property
    def lease_seconds(self) -> int:
        # Enough time for every bounded model attempt plus local OCR.
        return max(1800, len(self.models) * (self.retries + 1) * (self.timeout + 35) + self.max_pages * 35 + 180)

    @classmethod
    def from_env(cls):
        api_key = os.getenv("OPENROUTER_API_KEY", "").strip()
        db_key = (os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SECRET_KEY") or "").strip()
        if not api_key or not db_key:
            raise ConfigurationError("Configura OPENROUTER_API_KEY y SUPABASE_SERVICE_ROLE_KEY en el entorno del agente.")
        models = tuple(dict.fromkeys([PRIMARY_MODEL, *[m.strip() for m in os.getenv("FACTURAS_FALLBACK_MODELS", ",".join(DEFAULT_FALLBACKS)).split(",") if m.strip()]]))
        if len(models) > 8 or any("/" not in m or len(m) > 150 for m in models):
            raise ConfigurationError("Configura como máximo siete alternativas con identificadores de OpenRouter.")
        return cls(
            input_dir=Path(os.getenv("FACTURAS_INPUT_DIR", ".data/facturas/entrada")).resolve(),
            api_key=api_key, supabase_key=db_key,
            supabase_url=https_url(os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")),
            models=models, poll_seconds=integer("FACTURAS_POLL_SECONDS", 15, 5, 300),
            timeout=integer("FACTURAS_REQUEST_TIMEOUT", 90, 10, 300),
            retries=integer("FACTURAS_RETRIES_PER_MODEL", 1, 0, 2),
            max_attempts=integer("FACTURAS_MAX_FILE_ATTEMPTS", 5, 1, 20),
            max_mb=integer("FACTURAS_MAX_FILE_MB", 20, 1, 50),
            max_pages=integer("FACTURAS_MAX_PAGES", 20, 1, 50),
            max_chars=integer("FACTURAS_MAX_TEXT_CHARS", 80000, 1000, 200000),
            max_output_tokens=integer("FACTURAS_MAX_OUTPUT_TOKENS", 6000, 1000, 16000),
            ocr_language=os.getenv("FACTURAS_OCR_LANGUAGE", "spa+eng"),
            tesseract_cmd=os.getenv("TESSERACT_CMD", ""),
        )
