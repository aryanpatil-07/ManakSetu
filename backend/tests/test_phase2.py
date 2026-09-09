"""
Automated Verification Suite for Phase 2: Hybrid Retrieval & Re-ranking Pipeline (AI/ML)
Run via: python tests/test_phase2.py
"""
import sys
import os
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.services.nlp_extractor import ParameterExtractor
from app.services.corpus_builder import CorpusBuilder
from app.services.bm25_search import BM25SearchEngine
from app.services.dense_search import DenseSearchEngine
from app.services.hybrid_retriever import HybridRetriever

def test_phase_2():
    print("\n" + "="*70)
    print("RUNNING PHASE 2 AUTOMATED VERIFICATION SUITE")
    print("="*70)

    # 1. Parameter Extractor Test
    print("\n[1] Testing NLP & Technical Parameter Extractor:")
    extractor = ParameterExtractor()
    query_complex = "Supply of 110mm PE100 HDPE pipes PN10 rating conforming to ASTM D3035 with Havells pressure gauges"
    params = extractor.extract(query_complex)
    print(f"    • Dimensions extracted: {params['dimensions']}")
    print(f"    • Pressure ratings: {params['pressure_ratings']}")
    print(f"    • Material grades: {params['material_grades']}")
    print(f"    • Cited standards: {params['cited_standards']}")
    print(f"    • Detected brands: {params['detected_brands']}")

    assert any("110mm" in d for d in params["dimensions"]), "Must extract 110mm"
    assert any("PN10" in p or "PN 10" in p for p in params["pressure_ratings"]), "Must extract PN10"
    assert any("PE100" in g or "PE-100" in g for g in params["material_grades"]), "Must extract PE100"
    assert any("ASTM D3035" in s for s in params["cited_standards"]), "Must extract ASTM D3035"
    assert any("Havells" in b for b in params["detected_brands"]), "Must extract Havells brand"
    print("    --> PASS: Parameter extraction verified.")

    # 2. Corpus Builder Test
    print("\n[2] Testing Corpus Builder:")
    builder = CorpusBuilder()
    docs = builder.get_corpus()
    standards = builder.get_standards()
    print(f"    • Total standards in corpus: {len(standards)}")
    print(f"    • Sample document length: {len(docs[0])} chars")
    assert len(standards) >= 25, "Corpus must have >= 25 standards"
    assert len(docs) == len(standards), "Corpus documents must equal standards count"
    assert "Standard Code:" in docs[0], "Documents must contain structured metadata"
    print("    --> PASS: Corpus builder verified.")

    # 3. BM25 Search Engine Test
    print("\n[3] Testing BM25 Lexical Search Engine:")
    bm25 = BM25SearchEngine(builder)
    bm25_res = bm25.search("PE100 HDPE pipe PN10 potable water", top_k=5)
    print(f"    • Top BM25 result: {bm25_res[0]['standard']['is_code']} (Score: {bm25_res[0]['score']})")
    assert "IS 4984" in bm25_res[0]["standard"]["is_code"], "Top BM25 result for HDPE must be IS 4984"
    print("    --> PASS: BM25 search engine verified.")

    # 4. Dense Search Engine Test
    print("\n[4] Testing Dense Semantic Search Engine:")
    dense = DenseSearchEngine(builder)
    dense_res = dense.search("outdoor copper wound transformer for substation", top_k=5)
    print(f"    • Top Dense result: {dense_res[0]['standard']['is_code']} (Score: {dense_res[0]['score']})")
    assert any("IS 1180" in r["standard"]["is_code"] or "IS 2026" in r["standard"]["is_code"] for r in dense_res[:2]), "Transformer must rank top in dense search"
    print("    --> PASS: Dense embedding search verified.")

    # 5. Hybrid Retrieval Benchmark on Golden Test Scenarios
    print("\n[5] Benchmarking Hybrid Retrieval (RRF + Cross-Encoder):")
    retriever = HybridRetriever()

    test_queries = [
        {
            "id": "CASE-A-HDPE-WATER",
            "query": "Supply of 110mm PE100 HDPE pipes conforming to ASTM D3035 with Havells pressure gauges as per IS 4984:1995 for potable water network PN10 rating.",
            "expected_top": "IS 4984",
            "min_confidence": 0.85
        },
        {
            "id": "CASE-B-TRANSFORMER",
            "query": "Procurement of 500 kVA 11kV/433V outdoor copper wound distribution transformer for industrial substation.",
            "expected_top": "IS 1180",
            "min_confidence": 0.85
        },
        {
            "id": "CASE-C-TMT-REBARS",
            "query": "Procurement of 50 MT Tata Tiscon Fe500D TMT rebars 16mm diameter.",
            "expected_top": "IS 1786",
            "min_confidence": 0.85
        },
        {
            "id": "CASE-D-UPVC-PLUMBING",
            "query": "Unplasticized PVC pipes for potable water supplies class 3 6 bar pressure rating.",
            "expected_top": "IS 4985",
            "min_confidence": 0.80
        },
        {
            "id": "CASE-E-SAFETY-SHOES",
            "query": "Personal protective equipment industrial safety shoes steel toe cap 200 joules impact resistant footwear.",
            "expected_top": "IS 15298",
            "min_confidence": 0.80
        },
        {
            "id": "CASE-F-FIRE-EXTINGUISHER",
            "query": "Supply of 6kg portable dry chemical powder ABC fire extinguisher with pressure gauge for commercial building.",
            "expected_top": "IS 15683",
            "min_confidence": 0.80
        },
        {
            "id": "CASE-G-LED-STREET-LIGHT",
            "query": "90W outdoor IP66 LED street light luminaires with 10kV surge protection for municipal roads.",
            "expected_top": "IS 10322",
            "min_confidence": 0.75
        },
        {
            "id": "CASE-H-SUBMERSIBLE-PUMP",
            "query": "Borewell 5 HP submersible pumpset for clear cold drinking water with cast iron casing and bronze impeller.",
            "expected_top": "IS 8034",
            "min_confidence": 0.80
        }
    ]

    correct_top1 = 0
    correct_top3 = 0

    for tc in test_queries:
        results = retriever.search(tc["query"], top_k=3)
        assert len(results) > 0, f"Retriever returned no results for {tc['id']}"
        top1 = results[0]
        top_codes = [r["is_code"] for r in results]

        is_top1 = tc["expected_top"] in top1["is_code"]
        is_top3 = any(tc["expected_top"] in c for c in top_codes)

        if is_top1:
            correct_top1 += 1
        if is_top3:
            correct_top3 += 1

        status_str = "OK" if is_top1 else ("TOP-3 OK" if is_top3 else "FAILED")
        print(f"    • [{tc['id']}] -> Top-1: {top1['is_code']} | Conf: {top1['confidence_score']} | Status: {status_str}")
        assert is_top3, f"Expected {tc['expected_top']} in top 3, got {top_codes}"
        assert top1["confidence_score"] >= tc["min_confidence"], f"Confidence score {top1['confidence_score']} below minimum {tc['min_confidence']}"

    top1_acc = (correct_top1 / len(test_queries)) * 100
    top3_acc = (correct_top3 / len(test_queries)) * 100
    print(f"\n    --> Retrieval Accuracy Benchmark:")
    print(f"        Top-1 Accuracy: {top1_acc:.1f}%")
    print(f"        Top-3 Accuracy: {top3_acc:.1f}%")
    assert top3_acc >= 94.0, f"Top-3 accuracy must be >= 94%, got {top3_acc}%"

    # 6. Test Case TC-07: Zero Hallucination on Vague Query
    print("\n[6] Testing TC-07: Zero Hallucination on Vague Procurement Query:")
    vague_query = "heavy duty industrial equipment"
    vague_results = retriever.search(vague_query, top_k=3)
    if vague_results:
        vague_conf = vague_results[0]["confidence_score"]
        print(f"    • Vague Query Top Result: {vague_results[0]['is_code']} with Confidence: {vague_conf}")
        assert vague_conf < 0.60, f"Confidence for vague query must be < 0.60 to prevent hallucination, got {vague_conf}"
        print("    --> PASS: Confidence score correctly suppressed (< 0.60) on ambiguous input.")
    else:
        print("    --> PASS: No hallucinated standards returned.")

    print("\n" + "="*70)
    print("ALL PHASE 2 TESTS PASSED WITH ZERO ERRORS!")
    print("="*70 + "\n")

if __name__ == "__main__":
    test_phase_2()
