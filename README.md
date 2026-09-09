# ManakSetu (मानक सेतु) 🇮🇳
### AI-Powered BIS Compliance, Tender Scrutiny & BoQ Auditing Platform

ManakSetu is an intelligent procurement intelligence and tender scrutiny engine built for Indian public procurement agencies, Municipal Corporations, CPWD, State PWDs, and PSU undertakings. It cross-references tender specifications, RFP documents, and Bill of Quantities (BoQ) schedules against the **Bureau of Indian Standards (BIS)** repository, statutory **Quality Control Orders (QCOs)**, and **Central Vigilance Commission (CVC)** anti-tailoring guidelines.

---

## 🚀 Key Capabilities

1. **Automated BIS Lifecycle Validation:**
   - Detects obsolete, superseded, or withdrawn Indian Standards (e.g., flagging `IS 4984:1995` and automatically substituting with `IS 4984:2016`).
   - Identifies missing revision years and amendment numbers.

2. **Statutory QCO Enforcement Engine:**
   - Enforces mandatory BIS Standard Mark (**ISI Mark**) compliance under Ministerial Quality Control Orders (Steel QCO, Pipes & Fittings QCO, Transformers QCO, Cables QCO, etc.).
   - Prevents illegal procurement of non-certified products.

3. **CVC Anti-Tailoring & Brand Bias Linter:**
   - Flags proprietary brand-specific bias (e.g. *"Only ABB / Siemens / Supreme / Astral"*).
   - Flags unjustified citations of foreign standards (ASTM, DIN, ISO, BS) without explicit Indian Standard equivalence.
   - Highlights disproportionate turnover criteria that restrict competitive bidding.

4. **Batch BoQ Schedule Auditor:**
   - Processes multi-item Excel spreadsheets (`.xlsx`) row-by-row.
   - Categorizes each line item as `PASS`, `WARN`, or `FAIL` with suggested rectifications.
   - One-click export of audited schedules.

5. **Knowledge Graph Visualizer:**
   - Cytoscape.js and NetworkX graph mapping relationships across active standards, obsolete predecessors, mandatory ministerial QCOs, and international equivalents.

6. **Bid-Ready Clause Synthesizer:**
   - Generates legally compliant, CVC-safe technical clauses with inspection, NABL testing, and BIS certification mandates.

---

## 📁 Repository Structure

```text
manaksetu/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                     # FastAPI routes & lifespan
│   │   ├── core/
│   │   │   ├── config.py               # App configuration & paths
│   │   │   └── security.py             # Rate limiting & CORS
│   │   ├── data/
│   │   │   ├── standards_master.json   # 1,500 curated BIS standards
│   │   │   ├── qco_master.json         # 679+ QCO mandatory orders
│   │   │   ├── foreign_mapping.json    # ASTM/DIN/ISO to IS mappings
│   │   │   └── cvc_rules.json          # Anti-tailoring regex patterns
│   │   ├── services/
│   │   │   ├── hybrid_retriever.py     # BM25 + BGE Dense + Cross-Encoder
│   │   │   ├── knowledge_graph.py      # NetworkX dependency graph
│   │   │   ├── regulatory_engine.py    # QCO & lifecycle validator
│   │   │   ├── cvc_linter.py           # Brand bias & foreign standard scanner
│   │   │   ├── document_parser.py      # PyMuPDF PDF tender scraper
│   │   │   ├── boq_processor.py        # Pandas Excel BoQ batch auditor
│   │   │   └── clause_generator.py     # Jinja2 + LLM clause synthesiser
│   │   └── schemas/
│   │       ├── request_schemas.py      # Pydantic input models
│   │       └── response_schemas.py     # Pydantic output models
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                # Main audit dashboard
│   │   │   ├── rfp-scanner/page.tsx    # PDF tender scrutinizer page
│   │   │   └── boq-auditor/page.tsx    # Excel batch processing page
│   │   ├── components/
│   │   │   ├── AuditScorecard.tsx      # Badges & status indicators
│   │   │   ├── StandardsGraph.tsx      # Cytoscape.js network visualizer
│   │   │   ├── DiffViewer.tsx          # Side-by-side specification diff
│   │   │   ├── ClausePreview.tsx       # Bid-ready copy-paste clause
│   │   │   └── FileUploader.tsx        # Drag-and-drop file component
│   │   └── lib/
│   │       └── api.ts                  # Axios client for FastAPI backend
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── test_samples/                       # Curated files for live demonstration
│   ├── sample_flawed_water_tender.pdf  # Cites obsolete IS 4984:1995 & ASTM
│   ├── sample_transformer_tender.txt   # Cites brand names & missing testing
│   └── municipal_procurement_boq.xlsx  # 25-item Excel schedule with errors
└── README.md
```

---

## 🛠️ Quick Start Guide

### 1. Backend Setup (FastAPI)

```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
# source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

API documentation will be accessible at:
- **Interactive Swagger Docs:** `http://localhost:8000/docs`
- **Health Check:** `http://localhost:8000/health`

### 2. Frontend Setup (Next.js 14 App Router)

```bash
cd frontend
npm install
npm run dev
```

The web dashboard will be available at:
- **Dashboard:** `http://localhost:3000`
- **RFP PDF Scrutinizer:** `http://localhost:3000/rfp-scanner`
- **BoQ Batch Auditor:** `http://localhost:3000/boq-auditor`

### 3. Docker Deployment

```bash
cd backend
docker build -t manaksetu-backend .
docker run -p 8000:8000 manaksetu-backend
```

---

## 🧪 Included Test Samples

In `test_samples/`:
- **`sample_flawed_water_tender.pdf`**: Real-world municipal pipeline tender citing obsolete `IS 4984:1995`, `ASTM D3035` without Indian Standard equivalence, proprietary brand restrictions (`Supreme/Astral only`), and omitted QCO certification mandates.
- **`sample_transformer_tender.txt`**: Electrical substation NIT specifying `IS 1180:1989`, brand mandates (`ABB/Siemens only`), excessive turnover thresholds (`Rs 650 Cr`), and omitted BEE star labeling.
- **`municipal_procurement_boq.xlsx`**: Comprehensive 25-item Bill of Quantities schedule containing a mix of compliant standards, obsolete revisions, foreign standards, and brand bias.

---

## ⚖️ Regulatory Precedents & Legal Framework

- **Bureau of Indian Standards Act, 2016** (Act No. 11 of 2016)
- **General Financial Rules (GFR 2017)** - Rule 144 (Fundamental principles of public buying)
- **CVC Anti-Tailoring Directives** (Office Memorandum No. 03-05-1-CTE-9)
- **Public Procurement (Preference to Make in India) Order 2017** (DPIIT)
- **Statutory Quality Control Orders (QCOs)** issued by Ministry of Steel, DPIIT, and Ministry of Chemicals & Fertilizers.
