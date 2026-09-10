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
│   │   │   ├── layout.tsx              # Elevated header & announcement strip
│   │   │   ├── page.tsx                # Main audit studio & Accuris-style landing
│   │   │   ├── rfp-scanner/page.tsx    # PDF tender scrutinizer page
│   │   │   └── boq-auditor/page.tsx    # Excel batch processing page
│   │   ├── components/
│   │   │   ├── AuditScorecard.tsx      # Badges & status indicators
│   │   │   ├── StandardsGraph.tsx      # Cytoscape.js network visualizer
│   │   │   ├── DiffViewer.tsx          # Side-by-side specification diff
│   │   │   ├── ClausePreview.tsx       # Bid-ready copy-paste clause
│   │   │   └── FileUploader.tsx        # Drag-and-drop file component
│   │   └── lib/
│   │       ├── api.ts                  # Axios client for FastAPI backend
│   │       └── pdf_export.ts           # CAG Audit Certificate PDF generator
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

## 🛠️ Step-by-Step Guide to Run the App

### Prerequisites
- **Python:** 3.10 or 3.11+
- **Node.js:** 18.x or 20.x+
- **npm:** 9.x or 10.x+

---

### Step 1: Start the Backend (FastAPI on Port 8000)

Open a terminal, navigate to the `backend` directory, install dependencies, and start the server:

#### On Windows (PowerShell / Command Prompt):
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### On Linux / macOS:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The backend will start and be available at:
- **Interactive API Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check Endpoint:** [http://localhost:8000/health](http://localhost:8000/health)

---

### Step 2: Start the Frontend (Next.js 14 on Port 3000)

Open a **second terminal**, navigate to the `frontend` directory, install dependencies, and launch the dev server:

```bash
cd frontend
npm install
npm run dev
```

The web application will be accessible in your browser at:
- **Main Audit Studio & Workbench:** [http://localhost:3000](http://localhost:3000)
- **RFP Tender PDF Scrutinizer:** [http://localhost:3000/rfp-scanner](http://localhost:3000/rfp-scanner)
- **BoQ Batch Schedule Auditor:** [http://localhost:3000/boq-auditor](http://localhost:3000/boq-auditor)

---

### Step 3 (Optional): Run with Docker

To run the entire backend containerized:

```bash
cd backend
docker build -t manaksetu-backend .
docker run -p 8000:8000 manaksetu-backend
```

---

## 🧪 Live Demonstration & Testing Walkthrough

### 1. Interactive Studio (1-Click Evaluation)
1. Open [http://localhost:3000](http://localhost:3000) and navigate to the **Live Interactive Workbench**.
2. Click any of the **1-Click Judge Demonstration Presets**:
   - **Preset A (Municipal Water Pipeline):** Flags obsolete `IS 4984:1995`, `ASTM D3035`, and `Supreme/Astral` brand monopoly.
   - **Preset B (Distribution Transformer):** Flags obsolete `IS 1180:1989`, `ABB/Siemens` bushing lock-in, and missing QCO order.
   - **Preset C (TMT Rebars & Civil Works):** Flags brand bias (`Tata Tiscon/Jindal Panther`) and unmapped `ASTM A615`.
3. Click **"Audit & Harmonize Specification"** to view:
   - Compliance score gauge & metric breakdown
   - Regulatory dossier & mandatory QCO order status
   - Cytoscape knowledge graph
   - Bid-ready clause generator with **"Copy for GeM"** and **"Download CAG Audit Certificate (PDF)"**
   - Side-by-side redline specification diff.

### 2. RFP PDF Scrutinizer
1. Navigate to [http://localhost:3000/rfp-scanner](http://localhost:3000/rfp-scanner).
2. Click **"Load Flawed Sample Tender"** or drag-and-drop `test_samples/sample_flawed_water_tender.pdf`.
3. View parsed document sections, violation rules, and synthesized compliant clauses.

### 3. BoQ Batch Auditor
1. Navigate to [http://localhost:3000/boq-auditor](http://localhost:3000/boq-auditor).
2. Click **"Load 25-Item Municipal BoQ Demo"** or upload `test_samples/municipal_procurement_boq.xlsx`.
3. Filter by `FAIL`, `WARN`, or `PASS`, and export the cleaned schedule as `.csv` or `.xlsx`.

---

## ⚖️ Regulatory Precedents & Legal Framework

- **Bureau of Indian Standards Act, 2016** (Act No. 11 of 2016)
- **General Financial Rules (GFR 2017)** - Rule 144 (Fundamental principles of public buying)
- **CVC Anti-Tailoring Directives** (Office Memorandum No. 03-05-1-CTE-9)
- **Public Procurement (Preference to Make in India) Order 2017** (DPIIT)
- **Statutory Quality Control Orders (QCOs)** issued by Ministry of Steel, DPIIT, and Ministry of Chemicals & Fertilizers.
