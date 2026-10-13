# Obelisk by TechXodia — All your knowledge, assembled.
> **Enterprise Knowledge Base & Autonomous Support Copilot | Flagship Applied AI Showcase by TechXodia**

**Obelisk by TechXodia** is a production-grade, showroom-quality enterprise copilot and autonomous customer support intelligence platform. Built to demonstrate **TechXodia's capability in architecting applied AI agents, hybrid Retrieval-Augmented Generation (RAG) systems, and self-orchestrating support workflows**, Obelisk combines high-performance vector grounding with automated tool execution and graceful human specialist handoffs.

---

## 🎨 Color System & Visual Identity

Obelisk features a bespoke, high-contrast dark aesthetic tailored for autonomous AI agents:

| Token | Hex Code | Visual Character & Usage |
| :--- | :--- | :--- |
| **Obsidian Base** | `#0C0B0B` | Deep ultra-black surface background for maximum optical contrast and depth. |
| **Electric Cyan** | `#00E5FF` | The ultimate futuristic AI blue. Provides massive contrast against Obsidian, making buttons, tool execution pills, streaming cursors, and highlighted text practically glow off the screen. |
| **Cobalt Blue** | `#2979FF` | Saturated enterprise blue for secondary accents, active navigation indicators, and autonomous copilot UI states. |
| **Hyper-Indigo** | `#536DFE` | Sharp, purple-leaning technical blue for gradient boundaries, card glass borders, and exclusive enterprise badges. |

---

## 🌟 Key Architecture & Capabilities

```
                  ┌───────────────────────────────────────────────┐
                  │           User Inquiry / Query Stream          │
                  └───────────────────────┬───────────────────────┘
                                          │
                                          ▼
                       ┌──────────────────────────────────────┐
                       │   Obelisk Intent Dispatcher Engine   │
                       └──────┬───────────────────────┬───────┘
                              │                       │
      [Commercial / Sales / Human Escalation]         │ [Technical / SLA / Policy Inquiry]
                              ▼                       ▼
            ┌────────────────────────────┐ ┌────────────────────────────────────────┐
            │ Autonomous Tool:           │ │ Autonomous Tool:                       │
            │ CRM Lead Dispatcher        │ │ Hybrid Dense-Sparse Vector Search      │
            └─────────────┬──────────────┘ └───────────────────┬────────────────────┘
                          │                                    │
                          ▼                                    ▼
            ┌────────────────────────────┐ ┌────────────────────────────────────────┐
            │ Interactive Lead Card      │ │ Cross-Encoder Reranker & Guardrails    │
            │ Injected into Chat Thread  │ │ (Cosine Similarity > 0.65)             │
            └─────────────┬──────────────┘ └───────────────────┬────────────────────┘
                          │                                    │
                          ▼                                    ▼
            ┌────────────────────────────┐ ┌────────────────────────────────────────┐
            │ Real-time Ticket #OB-XXXX  │ │ Grounded Synthesis Engine              │
            │ Dispatched to CRM Queue    │ │ Citing Exact §Sections & Confidence %  │
            └────────────────────────────┘ └────────────────────────────────────────┘
```

### 1. Hybrid RAG Vector Engine
- **Multi-domain Knowledge Bases:**
  - **SaaS Cloud Platform (TechXodia Cloud Engine):** Microservices, OAuth 2.1 token rotation, rate limiting, multi-region Spanner, and webhook exponential backoff.
  - **Fintech & Billing API (FinCore Pay):** Second-by-second linear proration formulas, dispute & chargeback protocol (Visa/Mastercard 7-day rebuttals), and cross-border FX settlements.
  - **E-Commerce Logistics & Global Returns (OmniShip Global):** 30-day return policies, DDP vs DDU customs VAT classification, and IoT cold-chain temperature telemetry.
- **Dynamic On-the-Fly Ingestion:**
  - Real-time text chunker using recursive token windowing (512 tokens with 64 overlap).
  - Simulates 1536-dimensional dense embeddings (`text-embedding-3-small`) upserted into an HNSW vector index (`obelisk-prod-enterprise-v1`).
  - Newly added documents become immediately queryable in the chat workspace.

### 2. Autonomous Agent Tool Calling
- Visible execution pipeline displaying step-by-step tool operations in real-time:
  - `🔍 vector_db_search({ top_k: 3, filter: active_kb })`
  - `⚡ rerank_and_cross_encode({ threshold: 0.65 })`
  - `💳 calculate_billing_delta({ model: 'proration' })`
  - `👤 crm_lead_dispatch({ priority: 'urgent' })`

### 3. RAG Source Citations & Anti-Hallucination Guardrails
- Every agent response cites verified source files: `[Source: document_name.md §x.x - 98% Match]`.
- Interactive citation pills open the **Vector Chunk Inspector** modal, revealing the exact indexed text segment, vector ID, token count, and extracted keywords.
- Response confidence badges quantify grounding level (`99.4% Grounded`, `97.8% High Confidence`).

### 4. Human-in-the-Loop & Lead Capture Workflow
- When users request human assistance, custom quotes, or enterprise contracts, the copilot executes the `crm_lead_dispatch` tool.
- An interactive **Priority Human Specialist Dispatch** card is rendered directly within the chat message.
- Submissions create real-time lead tickets (`#OB-XXXX`) with a guaranteed `< 15 Min SLA` logged to the Admin Studio queue.

### 5. Admin Knowledge Studio & Telemetry
- **Executive KPIs:** Total Inquiries Handled (14,892+), Automated Resolution Rate (94.8%), Average Latency (218ms), and Grounded CSAT (4.92 / 5.0).
- **Interactive SVG Visualizations:** 24-hour inquiry traffic curve and intent category distribution styled with the Electric Cyan / Cobalt Blue / Hyper-Indigo gradient.
- **Live Vector Memory Inspector:** Topology metrics, HNSW parameters, and memory footprint.
- **Live LLM Toggle:** Seamlessly switch between the **Zero-Config Smart Offline Simulation Engine** and live **OpenAI (GPT-4o / GPT-4o-mini)** or **Google Gemini (1.5 Flash / Pro)** with browser-stored API keys.

---

## 🚀 Running Locally

The application is self-contained and requires **no complex build steps**:

```bash
# Option 1: Run with npx serve
npx serve -s . -l 3000

# Option 2: Python simple HTTP server
python -m http.server 3000
```
Then visit `http://localhost:3000` in any modern web browser.

---

## ☁️ Deploying to Vercel

Obelisk is pre-configured with `vercel.json` for instant zero-configuration static deployment:

1. Push this repository to GitHub or GitLab.
2. Import the project in your [Vercel Dashboard](https://vercel.com).
3. Leave build settings as default (Static / Other).
4. Click **Deploy**. Your showroom is live in seconds.

---

## 🛠️ Tech Stack & Design System
- **Core:** HTML5, Modular ECMAScript (ES6+ Modules)
- **Styling:** Vanilla CSS3 with Custom Properties, Glassmorphism, CSS Grid & Flexbox
- **Palette:** Obsidian (`#0C0B0B`), Electric Cyan (`#00E5FF`), Cobalt Blue (`#2979FF`), Hyper-Indigo (`#536DFE`)
- **Typography:** Plus Jakarta Sans, Inter, JetBrains Mono (Google Fonts)
- **Audio Feedback:** Web Audio API synthesized chimes (zero external media assets)
- **Vectors & Grounding:** BM25 lexical + semantic keyword scoring, cosine distance model

---

© 2026 **TechXodia AI Labs**. Built for showroom presentation and production deployment.
