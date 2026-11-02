# CLAUDE.md — ASAF Trading Pro

Follow [AGENTS.md](AGENTS.md) as the single shared contributor policy for Claude Code and ChatGPT.

Repository: `asaf91504-del/Asaf-trading-pro`; primary branch: `main`; existing site code is static HTML/JS with Netlify Functions, not a guaranteed React/FastAPI deployment. **Inspect actual repo contents, do not rely on old planning documents or assume features exist.**

## First steps for every task
1. Read `README.md`, `AGENTS.md`, the relevant source files, and the existing test suite.
2. Confirm what is implemented versus just requested. State assumptions.
3. Write a concise issue-to-PR plan and code on a feature branch.
4. Run the offline tests: `node --test tests/*.test.mjs`. For relevant functions use `node --check`.
5. Open a draft PR; attach test evidence and a clear list of external steps that need owner approval.

## High-priority topics (not unconditional instructions to implement)
- Original candlestick chart UX, MA20/MA150 overlays, mobile interaction and accessibility.
- Stock-only AI answers grounded in the *same* actual OHLCV bars as the displayed chart.
- Correct data provenance/timestamps/licensing, positive scanner rules and robust empty/error states.
- Authentication, rate limits and provider usage limits *before* public AI endpoints.

## Never do automatically
Do not run or enable monetized AI/data APIs, connect brokers, buy services, publish to production, modify secrets or DNS, alter billing, merge PRs, or turn on `ASAF_CHAT_ENABLED` / `ASAF_MARKET_ENABLED`. These require separate owner approval and security/data-licensing review.

Handoff: communicate via an Issue and a draft Pull Request. ChatGPT and Claude do not share chat history automatically.
