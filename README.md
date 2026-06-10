# AI Red Team Lab

A local LLM adversarial testing environment for prompt injection, jailbreaking, and constraint bypass research. Runs entirely in your browser using WebGPU — no API calls, no external services, fully offline after initial model download.

---

## Responsible Use

This tool is designed for **authorized security research** against AI systems you own or have explicit permission to test. The techniques implemented are documented in MITRE ATLAS and OWASP LLM Top 10 — publicly available defensive frameworks. Do not use this tool against production AI systems without authorization.

---

## What It Does

- **Local model inference** via WebLLM (WebGPU) — victim model runs on your GPU in the browser
- **Attack payload library** organized by MITRE ATLAS technique (AML.T0051, AML.T0054, AML.T0056, and more)
- **Heuristic evaluation** — automatic detection of injection success, partial disclosure, and failure
- **LLM Judge mode** — swap in a second local model to evaluate attack success semantically
- **Findings tracker** — log successful findings with ATLAS/OWASP tags, export to JSON
- **Model swapping** — test the same attack across different victim models

## ATLAS Techniques Covered

| ID | Technique | OWASP |
|---|---|---|
| AML.T0051 | LLM Prompt Injection (Direct) | LLM01:2025 |
| AML.T0054 | LLM Jailbreaking | LLM01:2025 |
| AML.T0056 | LLM Meta Prompt Extraction | LLM06:2025 |
| AML.T0051.DC | Delimiter Confusion | LLM01:2025 |
| AML.T0048 | Indirect Prompt Injection | LLM01:2025 |

---

## Prerequisites

- **Chrome 113+** or **Edge 113+** (WebGPU required — Firefox not supported)
- **Node.js 18+** for local development
- **GPU with 2GB+ VRAM** (integrated graphics may work for smaller models)

---

## Local Setup

```bash
git clone https://github.com/YOUR_USERNAME/ai-red-team-lab
cd ai-red-team-lab
npm install
npm run dev
```

Open `http://localhost:5173` in Chrome.

---

## GitHub Pages Deployment

```bash
# Build and deploy (base path is already './' — relative, works on project pages,
# so there is NOTHING to change in vite.config.js)
npm run deploy
```

The `deploy` script builds the project and pushes to the `gh-pages` branch. Enable GitHub Pages in your repo settings pointing to the `gh-pages` branch.

**Cross-origin isolation:** WebLLM needs `SharedArrayBuffer`, which requires the COOP/COEP response headers. GitHub Pages **cannot set custom HTTP headers**, so this repo bundles `public/coi-serviceworker.js` (registered in `index.html`) to force isolation client-side. It ships in the build automatically — no extra config needed. If you instead deploy on Netlify or Cloudflare Pages, you can drop the service worker and use a `_headers` file with the COOP/COEP headers shown in `vite.config.js`.

---

## Model Recommendations (by VRAM)

| Model | VRAM | Notes |
|---|---|---|
| TinyLlama 1.1B | ~1 GB | Fastest, useful for rapid iteration |
| Gemma 2 2B | ~2 GB | Good baseline target |
| Phi 3.5 Mini | ~3 GB | Strong instruction following — good judge model |
| Llama 3.2 3B | ~3 GB | Solid general target |
| Mistral 7B | ~5 GB | Recommended for realistic testing |
| Llama 3.1 8B | ~6 GB | Best capability for interesting failures |
| Gemma 2 9B | ~7 GB | Strong safety training — high value target |

Models download to browser cache (IndexedDB) on first use and run fully offline thereafter. Clearing browser cache requires re-downloading.

---

## Judge Mode

Enable Judge Mode before executing an attack. After the victim model responds:

1. The victim model is unloaded from GPU
2. The selected judge model loads
3. The judge evaluates success/failure using technique-specific criteria
4. The victim model reloads for the next attack

Use a smaller model (Phi 3.5 Mini or Llama 3.2 3B) as the judge — the task is classification, not generation.

---

## Adding Payloads

Edit `src/payloads.js` and add entries to the `PAYLOADS` array:

```javascript
{
  id: 'XX-001',               // unique ID
  technique: 'AML.T0051',    // ATLAS technique ID
  difficulty: 'medium',       // low | medium | high
  name: 'Payload Name',
  description: 'What this tests',
  payload: 'The actual injection text',
  note: 'Optional research note',  // optional
}
```

---

## Roadmap

**v2 — Control traceability.** Map each successful finding from attack to governance gap, using ATLAS's own published mitigations as the defensible intermediate hop:

```
technique (AML.T00xx) → ATLAS mitigation (AML.M00xx) → control reference
```

Target control references: **NIST AI RMF Generative AI Profile (NIST-AI-600-1)** and **ISO/IEC 42001 Annex A**. Surface the mapping in the JSON export and the judge's draft report, so a finding reads as "jailbreak succeeded → ATLAS mitigation → ISO 42001 A.x / NIST RMF gap" rather than just "jailbreak succeeded." Mappings are framed as *implicates / informs* — AI RMF is a risk-management framework, not a controls catalog. Implementation is data-only (`technique → mitigations[] → frameworkRefs[]`); no architecture change.

---

## Contributing

Payload submissions welcome via PR. Include:
- ATLAS technique mapping
- Difficulty rating
- Brief description of the mechanism
- Any relevant research notes or CVE/finding references
