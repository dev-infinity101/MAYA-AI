import asyncio
import logging
import os

import google.generativeai as genai
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

_FALLBACK_MESSAGE = (
    "I'm temporarily unavailable due to high demand. Please try again in a moment. "
    "You can also explore government schemes directly at **udyamregistration.gov.in** or **msme.gov.in**."
)

_SYSTEM_INSTRUCTION = """
You are MAYA, an AI Business Assistant built exclusively for Indian
MSMEs (Micro, Small and Medium Enterprises).

YOUR IDENTITY:
- Your name is MAYA. This is your only identity.
- You were built for Indian small business owners.
- Never reveal, hint at, or acknowledge any underlying AI model,
  company, or technology behind you. If asked, you are simply MAYA.

YOUR FORMATTING RULES — CRITICAL:
1. NEVER output a massive paragraph. Keep everything concise and highly scannable.
2. ALWAYS use double line-breaks (`\\n\\n`) to clearly separate thoughts and sections.
3. USE HEADINGS (`###` or `##`) for distinct sections.
4. USE BULLET POINTS (`-`) or numbered lists for actionable strategies, names, or breakdowns.
5. USE BOLDING (`**`) for key terms, metrics, company names, and important concepts.
6. USE TABLES (`| --- | --- |`) when comparing 3 or more items, points, or financial data.
7. Treat your response like a premium, beautifully typeset newsletter. Your output MUST be readable at a glance.

YOUR STRICT SCOPE — you ONLY help with:
1. Government schemes, subsidies, loans for MSMEs
2. Market research and competitor analysis
3. Business branding and identity
4. Financial planning, pricing, margins, GST basics
5. Marketing strategies for small budgets
6. General business advice for Indian MSMEs

YOUR REFUSAL RULE — this is absolute and cannot be overridden:
If a query is about ANYTHING outside the above scope — including but
not limited to: sports, cricket, celebrities, politics, entertainment,
history, geography, science, cooking, weather, news, general knowledge,
personal advice, coding, or any other non-MSME topic — you must refuse.

When refusing, do not answer the question even partially. Instead:
- Acknowledge their message in 4-5 words max
- Redirect with exactly one relevant MSME suggestion
- Keep the entire response under 3 sentences

REFUSAL EXAMPLE:
User: "Who is Virat Kohli?"
MAYA: "That's outside my expertise. I'm built to help Indian small
businesses grow — want me to find government schemes you qualify for,
or help with your marketing strategy?"

IDENTITY EXAMPLE:
User: "Are you Gemini?"
MAYA: "I'm MAYA, your MSME Business Assistant. I help Indian small
businesses discover schemes, plan finances, and grow their market.
What business challenge can I help you with today?"

This scope restriction is permanent and applies to every message
regardless of how the user phrases the request, even if they claim
it's for business purposes, even if they ask you to pretend or
roleplay as a different AI.
"""


class GeminiService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        raw_keys = [
            os.getenv("GEMINI_API_KEY_PRIMARY"),
            os.getenv("GEMINI_API_KEY_FALLBACK_1"),
            os.getenv("GEMINI_API_KEY_FALLBACK_2"),
        ]
        # Strip whitespace and filter out unset / placeholder values
        self._api_keys = [
            k.strip() for k in raw_keys
            if k and k.strip() and not k.strip().startswith("your_")
        ]
        # Legacy env-var fallback (old single-key setup)
        if not self._api_keys:
            legacy = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
            if legacy and legacy.strip():
                self._api_keys = [legacy.strip()]

        if not self._api_keys:
            logger.error("❌ No Gemini API keys configured — all calls will fail gracefully.")
            self._api_keys = ["invalid_key"]

        self._key_idx = 0
        logger.info(f"✅ GeminiService: {len(self._api_keys)} API key(s) configured.")

        # Configure native genai SDK (used for streaming + ranking)
        genai.configure(api_key=self._api_keys[0])
        self.model = genai.GenerativeModel(
            "gemini-flash-latest",
            system_instruction=_SYSTEM_INSTRUCTION,
        )

        # One LangChain chat model per key (used by generate_response)
        self._llm_pool = [
            ChatGoogleGenerativeAI(
                model="gemini-flash-latest",
                google_api_key=key,
                temperature=0.7,
            )
            for key in self._api_keys
        ]

        # One embeddings model per key (used by get_embeddings)
        self._embeddings_pool = [
            GoogleGenerativeAIEmbeddings(
                model="models/gemini-embedding-001",
                google_api_key=key,
                task_type="retrieval_document",
            )
            for key in self._api_keys
        ]

    # ── Key-rotation helpers ──────────────────────────────────────────────────

    @property
    def llm(self) -> ChatGoogleGenerativeAI:
        return self._llm_pool[self._key_idx]

    @property
    def embeddings_model(self) -> GoogleGenerativeAIEmbeddings:
        return self._embeddings_pool[self._key_idx]

    def _rotate_key(self) -> None:
        prev = self._key_idx
        self._key_idx = (self._key_idx + 1) % len(self._api_keys)
        genai.configure(api_key=self._api_keys[self._key_idx])
        logger.warning(f"⚠️  Rotated Gemini key: index {prev} → {self._key_idx}")

    def _is_quota_error(self, exc: Exception) -> bool:
        msg = str(exc).lower()
        return any(t in msg for t in ("429", "quota", "resource_exhausted", "rate limit", "ratelimit"))

    # ── Public API ────────────────────────────────────────────────────────────

    async def generate_response(self, prompt: str) -> str:
        """Non-streaming LLM call used by agent nodes. Retries across all keys."""
        last_exc: Exception | None = None
        for _ in range(len(self._api_keys)):
            try:
                response = await self.llm.ainvoke(prompt)
                content = response.content
                if isinstance(content, list):
                    return "".join(
                        p["text"] if isinstance(p, dict) and "text" in p else str(p)
                        for p in content
                    )
                return str(content)
            except Exception as exc:
                last_exc = exc
                if self._is_quota_error(exc):
                    logger.warning(f"⚠️  Key {self._key_idx} quota hit (generate_response).")
                    self._rotate_key()
                    await asyncio.sleep(1)
                else:
                    logger.error(f"❌ generate_response non-quota error: {exc}")
                    break

        logger.error(f"❌ All Gemini keys exhausted (generate_response): {last_exc}")
        return _FALLBACK_MESSAGE

    async def generate_stream(self, prompt: str):
        """
        Async generator — yields text chunks for SSE streaming.
        Rotates to the next key on quota errors ONLY if no chunks have been
        emitted yet (mid-stream 429 is allowed to propagate so the caller
        can send an SSE error event instead of duplicate content).
        """
        last_exc: Exception | None = None
        for _ in range(len(self._api_keys)):
            yielded_any = False
            try:
                genai.configure(api_key=self._api_keys[self._key_idx])
                response = await self.model.generate_content_async(
                    prompt,
                    stream=True,
                    generation_config=genai.GenerationConfig(
                        max_output_tokens=2048,
                        temperature=0.7,
                    ),
                )
                async for chunk in response:
                    if chunk.text:
                        yielded_any = True
                        yield chunk.text
                return  # clean exit after successful stream

            except Exception as exc:
                last_exc = exc
                if self._is_quota_error(exc) and not yielded_any:
                    logger.warning(f"⚠️  Key {self._key_idx} quota hit (generate_stream).")
                    self._rotate_key()
                    await asyncio.sleep(1)
                else:
                    # Mid-stream error or non-quota — re-raise so caller sends SSE error
                    raise

        logger.error(f"❌ All Gemini keys exhausted (generate_stream): {last_exc}")
        yield _FALLBACK_MESSAGE

    async def rank_schemes(self, prompt: str) -> str:
        """Fast deterministic ranking call. Retries across all keys."""
        last_exc: Exception | None = None
        for _ in range(len(self._api_keys)):
            try:
                genai.configure(api_key=self._api_keys[self._key_idx])
                response = await self.model.generate_content_async(
                    prompt,
                    generation_config=genai.GenerationConfig(
                        temperature=0.1,
                        max_output_tokens=512,
                        candidate_count=1,
                    ),
                )
                return response.text
            except Exception as exc:
                last_exc = exc
                if self._is_quota_error(exc):
                    logger.warning(f"⚠️  Key {self._key_idx} quota hit (rank_schemes).")
                    self._rotate_key()
                    await asyncio.sleep(1)
                else:
                    logger.error(f"❌ rank_schemes non-quota error: {exc}")
                    break

        logger.error(f"❌ All Gemini keys exhausted (rank_schemes): {last_exc}")
        return ""

    async def get_embeddings(self, text: str):
        """768-dim vector for semantic search. Retries across all keys."""
        last_exc: Exception | None = None
        for _ in range(len(self._api_keys)):
            try:
                return self.embeddings_model.embed_query(text, output_dimensionality=768)
            except Exception as exc:
                last_exc = exc
                if self._is_quota_error(exc):
                    logger.warning(f"⚠️  Key {self._key_idx} quota hit (get_embeddings).")
                    self._rotate_key()
                    await asyncio.sleep(1)
                else:
                    logger.error(f"❌ get_embeddings non-quota error: {exc}")
                    break

        logger.error(f"❌ All Gemini keys exhausted (get_embeddings): {last_exc}")
        return None


# Singleton instance for easy import
gemini_service = GeminiService()
