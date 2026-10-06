# Extracted reference texts

Plain-text copies of the sources listed in `../../vision-factory.md`, for reuse by agents and humans (greppable, no PDF tooling needed).
Extracted on 2026-10-06. These are local copies of third-party material; the originals are authoritative.

- `pdf/` — text extracted with `pdftotext -layout` from the PDFs in `../`
- `web/docs-factory-com/` — selected pages of <https://docs.factory.com/> (welcome, software-factory, harness, missions)
- `web/simonwillison-agentic-engineering-patterns/` — all chapters of <https://simonwillison.net/guides/agentic-engineering-patterns>
- `web/humanlayer-12-factor-agents.txt` — README of <https://github.com/humanlayer/12-factor-agents>
- `web/thoughtworks-agentic-ready-data-strategy.txt` — <https://www.thoughtworks.com/en-us/perspectives/edition39-agentic-ready-data-strategy>

Table cells in the `web/docs-factory-com/` pages are separated by `|`.

## Known gaps

Some source PDFs were clipped at the right page margin when they were printed, so the text is missing in the PDF itself and cannot be recovered by re-extraction. Use the original web page for these passages:

- `pdf/Building-AI-Software-Factory-Top-2027-Guide-to-Agentic-SDLC.txt` — the lifecycle comparison table (for example "Autonomo", "Agent / Dro") and the KPI table. Original: <https://intercode.com/blog/ai-software-factory-agentic-sdlc>
- `pdf/How-Uber-built-an-AI-software-factory-for-agentic-coding-the-MCP-gateway-and-the.txt` — line endings in the introduction (for example "write code w", "You k"). Original: <https://newsletter.port.io/p/how-uber-built-a-software-factory>
