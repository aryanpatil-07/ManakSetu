import json
import re
import networkx as nx
from typing import Dict, Any, List, Optional
from app.core.config import settings

class StandardsKnowledgeGraph:
    """
    In-memory NetworkX MultiDiGraph encoding the Bureau of Indian Standards (BIS)
    regulatory ontology, normative testing/material dependencies, Quality Control
    Orders (QCOs), and international standard equivalences.
    """
    def __init__(self):
        self.graph = nx.MultiDiGraph()
        self.standards_by_code: Dict[str, dict] = {}
        self.standards_by_num: Dict[str, dict] = {}
        self.qco_by_id: Dict[str, dict] = {}
        self.foreign_mappings: Dict[str, dict] = {}
        self._build_graph()

    def _normalize_code(self, code: str) -> str:
        """Normalizes standard string (e.g., 'IS:4984-2016' -> 'IS 4984:2016')."""
        c = code.strip()
        c = re.sub(r'[\:\-_]', ' ', c)
        c = re.sub(r'\s+', ' ', c)
        return c.upper()

    def _extract_base_num(self, code: str) -> str:
        """Extracts base standard identifier like 'IS 4984' or 'IS 1180 (Part 1)'."""
        m = re.match(r'(IS\s*\d+(?:\s*\([^\)]+\))?)', code, re.IGNORECASE)
        if m:
            return re.sub(r'\s+', ' ', m.group(1)).strip().upper()
        return code.split(':')[0].strip().upper()

    def _build_graph(self):
        self.graph.clear()
        self.standards_by_code.clear()
        self.standards_by_num.clear()
        self.qco_by_id.clear()
        self.foreign_mappings.clear()

        # 1. Load Standards Master
        if settings.STANDARDS_MASTER_PATH.exists():
            with open(settings.STANDARDS_MASTER_PATH, "r", encoding="utf-8") as f:
                standards_data = json.load(f)
                for s in standards_data:
                    code = s["is_code"]
                    base_num = s.get("standard_number", self._extract_base_num(code))
                    self.standards_by_code[code] = s
                    self.standards_by_num[base_num] = s

                    # Add primary standard node
                    self.graph.add_node(
                        code,
                        id=code,
                        label=code,
                        type="Standard",
                        category=s.get("category", "General"),
                        division=s.get("division", ""),
                        committee=s.get("sectional_committee", ""),
                        title=s.get("title", ""),
                        year=s.get("year"),
                        edition=s.get("edition", ""),
                        status=s.get("status", "CURRENT"),
                        conformity_scheme=s.get("conformity_scheme", "Scheme-I (ISI Mark)"),
                        qco_id=s.get("qco_id"),
                        color="#1e40af" # Navy Blue
                    )

                    # Model SUPERSEDES relationships
                    for sup in s.get("supersedes", []):
                        self.graph.add_node(
                            sup,
                            id=sup,
                            label=sup,
                            type="Obsolete_Standard",
                            title=f"Superseded Edition: {sup}",
                            status="SUPERSEDED",
                            replacement=code,
                            color="#dc2626" # Red
                        )
                        self.graph.add_edge(code, sup, key="SUPERSEDES", relationship="SUPERSEDES", label="supersedes")

                    # Model Normative References: Raw Material
                    normative = s.get("normative_references", {})
                    for mat in normative.get("raw_material", []):
                        mat_id = f"MAT:{mat}"
                        self.graph.add_node(
                            mat_id,
                            id=mat_id,
                            label=mat,
                            type="Material_Standard",
                            title=f"Raw Material Specification: {mat}",
                            color="#d97706" # Amber
                        )
                        self.graph.add_edge(code, mat_id, key="REQUIRES_MATERIAL", relationship="REQUIRES_MATERIAL", label="requires_material")

                    # Model Normative References: Testing Methods
                    for test in normative.get("testing_methods", []):
                        test_id = f"TEST:{test}"
                        self.graph.add_node(
                            test_id,
                            id=test_id,
                            label=test,
                            type="Testing_Standard",
                            title=f"Mandatory Testing Protocol: {test}",
                            color="#0d9488" # Teal
                        )
                        self.graph.add_edge(code, test_id, key="REQUIRES_TEST", relationship="REQUIRES_TEST", label="requires_test")

                    # Model Normative References: Allied Standards / Fittings
                    for allied in normative.get("allied_fittings", []):
                        allied_id = f"ALLIED:{allied}"
                        self.graph.add_node(
                            allied_id,
                            id=allied_id,
                            label=allied,
                            type="Allied_Standard",
                            title=f"Allied Specification: {allied}",
                            color="#6366f1" # Indigo
                        )
                        self.graph.add_edge(code, allied_id, key="ALLIED_WITH", relationship="ALLIED_WITH", label="allied_with")

        # 2. Load QCO Master
        if settings.QCO_MASTER_PATH.exists():
            with open(settings.QCO_MASTER_PATH, "r", encoding="utf-8") as f:
                qco_data = json.load(f)
                for q in qco_data:
                    qid = q.get("qco_id", q.get("order_id"))
                    self.qco_by_id[qid] = q
                    self.graph.add_node(
                        qid,
                        id=qid,
                        label=q.get("order_title", qid),
                        type="QCO",
                        ministry=q.get("notifying_ministry", q.get("ministry", "")),
                        gazette_no=q.get("gazette_notification_no", ""),
                        enforcement_date=q.get("enforcement_date", q.get("date_effective", "")),
                        scheme=q.get("scheme", "Scheme-I (ISI Mark)"),
                        status="MANDATORY_REGULATION",
                        statutory_clause=q.get("statutory_clause", ""),
                        color="#7c3aed" # Purple
                    )
                    # Link covered standards to QCO
                    for covered in q.get("covered_is_codes", q.get("covered_standards", [])):
                        # Match against existing nodes in graph
                        for node in list(self.graph.nodes):
                            if covered in node and self.graph.nodes[node].get("type") == "Standard":
                                self.graph.add_edge(node, qid, key="GOVERNED_BY_QCO", relationship="GOVERNED_BY_QCO", label="governed_by_qco")

        # 3. Load Foreign Mappings
        if settings.FOREIGN_MAPPING_PATH.exists():
            with open(settings.FOREIGN_MAPPING_PATH, "r", encoding="utf-8") as f:
                raw_mappings = json.load(f)
                # Handle either dict of dicts or list of dicts
                if isinstance(raw_mappings, list):
                    for item in raw_mappings:
                        self.foreign_mappings[item["foreign_standard"]] = item
                else:
                    self.foreign_mappings = raw_mappings

                for f_code, info in self.foreign_mappings.items():
                    f_id = f"FOREIGN:{f_code}"
                    target_is = info.get("equivalent_is_code", info.get("equivalent_is"))
                    self.graph.add_node(
                        f_id,
                        id=f_id,
                        label=f_code,
                        type="Foreign_Standard",
                        issuing_body=info.get("issuing_body", ""),
                        title=info.get("title", ""),
                        gfr_citation=info.get("gfr_citation", ""),
                        advisory=info.get("advisory", ""),
                        target_is=target_is,
                        color="#ea580c" # Saffron / Orange
                    )
                    if target_is:
                        # Find exact or base node in graph
                        for node in list(self.graph.nodes):
                            if (target_is == node or target_is.split(':')[0] in node) and self.graph.nodes[node].get("type") == "Standard":
                                self.graph.add_edge(f_id, node, key="EQUIVALENT_TO", relationship="EQUIVALENT_TO", label="equivalent_to")

    def get_standard(self, is_code: str) -> Optional[dict]:
        """Lookup standard by full code (e.g. 'IS 4984:2016') or base number ('IS 4984')."""
        if is_code in self.standards_by_code:
            return self.standards_by_code[is_code]
        base = self._extract_base_num(is_code)
        if base in self.standards_by_num:
            return self.standards_by_num[base]
        # Partial scan
        clean = self._normalize_code(is_code)
        for code, s in self.standards_by_code.items():
            if self._normalize_code(code) == clean or self._normalize_code(s.get("standard_number", "")) == clean:
                return s
        return None

    def get_normative_bundle(self, is_code: str) -> Dict[str, Any]:
        """
        Traverses outgoing graph edges to assemble a complete Normative Compliance Bundle:
        - Primary Standard specifications & amendments
        - Mandatory raw material standards
        - Mandatory destructive and non-destructive testing protocols
        - Allied fittings and jointing standards
        - Governing Quality Control Order (QCO) statutory details
        """
        std = self.get_standard(is_code)
        if not std:
            return {
                "is_code": is_code,
                "found": False,
                "raw_materials": [],
                "testing_methods": [],
                "allied_standards": [],
                "qco_details": None
            }

        node_id = std["is_code"]
        raw_materials = []
        testing_methods = []
        allied_standards = []
        qco_details = None
        superseded = std.get("supersedes", [])

        # Traverse outgoing edges
        if self.graph.has_node(node_id):
            for _, target, edge_data in self.graph.out_edges(node_id, data=True):
                rel = edge_data.get("relationship")
                target_node = self.graph.nodes.get(target, {})

                if rel == "REQUIRES_MATERIAL":
                    raw_materials.append({
                        "code": target_node.get("label", target),
                        "title": target_node.get("title", ""),
                        "mandatory": True
                    })
                elif rel == "REQUIRES_TEST":
                    testing_methods.append({
                        "code": target_node.get("label", target),
                        "title": target_node.get("title", ""),
                        "mandatory": True
                    })
                elif rel == "ALLIED_WITH":
                    allied_standards.append({
                        "code": target_node.get("label", target),
                        "title": target_node.get("title", "")
                    })
                elif rel == "GOVERNED_BY_QCO":
                    qco_details = {
                        "qco_id": target,
                        "order_title": target_node.get("label", ""),
                        "ministry": target_node.get("ministry", ""),
                        "gazette_no": target_node.get("gazette_no", ""),
                        "enforcement_date": target_node.get("enforcement_date", ""),
                        "scheme": target_node.get("scheme", "Scheme-I (ISI Mark)"),
                        "statutory_clause": target_node.get("statutory_clause", "")
                    }

        # Fallback to direct dict data if graph had no outgoing QCO edge
        if not qco_details and std.get("qco_id") and std["qco_id"] in self.qco_by_id:
            q = self.qco_by_id[std["qco_id"]]
            qco_details = {
                "qco_id": std["qco_id"],
                "order_title": q.get("order_title", ""),
                "ministry": q.get("notifying_ministry", q.get("ministry", "")),
                "gazette_no": q.get("gazette_notification_no", ""),
                "enforcement_date": q.get("enforcement_date", ""),
                "scheme": q.get("scheme", "Scheme-I (ISI Mark)"),
                "statutory_clause": q.get("statutory_clause", "")
            }

        return {
            "is_code": std["is_code"],
            "standard_number": std.get("standard_number"),
            "year": std.get("year"),
            "edition": std.get("edition"),
            "title": std.get("title"),
            "status": std.get("status", "CURRENT"),
            "active_amendments": std.get("active_amendments", []),
            "material_grades": std.get("material_grades", []),
            "pressure_ratings": std.get("pressure_ratings", []),
            "conformity_scheme": std.get("conformity_scheme", "Scheme-I (ISI Mark)"),
            "superseded_editions": superseded,
            "raw_materials": raw_materials,
            "testing_methods": testing_methods,
            "allied_standards": allied_standards,
            "qco_details": qco_details,
            "is_qco_mandatory": qco_details is not None
        }

    def get_superseded_info(self, cited_text: str) -> Optional[Dict[str, Any]]:
        """
        Scans cited standard text or code (e.g., 'IS 4984:1995') to determine
        if it has been superseded by a newer revision.
        """
        clean = self._normalize_code(cited_text)
        clean_noparen = re.sub(r'[\(\)]', '', clean).replace(' ', '')
        # Search all standards' supersedes arrays
        for code, std in self.standards_by_code.items():
            for sup in std.get("supersedes", []):
                norm_sup = self._normalize_code(sup)
                sup_noparen = re.sub(r'[\(\)]', '', norm_sup).replace(' ', '')
                if (norm_sup in clean or clean in norm_sup or
                    clean_noparen == sup_noparen or
                    (sup_noparen in clean_noparen and len(sup_noparen) > 6)):
                    return {
                        "is_superseded": True,
                        "cited_edition": sup,
                        "current_standard": std["is_code"],
                        "current_title": std["title"],
                        "current_year": std["year"],
                        "edition": std["edition"],
                        "active_amendments": std.get("active_amendments", []),
                        "message": f"Standard {sup} is SUPERSEDED. Must specify current revision {std['is_code']} ({std['edition']}) with active amendments."
                    }
        return None

    def get_foreign_equivalent(self, foreign_code: str) -> Optional[Dict[str, Any]]:
        """
        Maps a foreign standard (e.g., 'ASTM D3035', 'DIN 8074') to its Indian Standard equivalent.
        """
        clean = foreign_code.strip().upper()
        # Direct lookup
        for f_key, info in self.foreign_mappings.items():
            if f_key.upper() == clean or f_key.upper() in clean:
                target = info.get("equivalent_is_code", info.get("equivalent_is"))
                std_meta = self.get_standard(target) if target else None
                return {
                    "foreign_standard": f_key,
                    "equivalent_is_code": target,
                    "standard_title": std_meta.get("title", "") if std_meta else info.get("title", ""),
                    "issuing_body": info.get("issuing_body", ""),
                    "equivalence_level": info.get("equivalence_level", info.get("equivalence_type", "Equivalent")),
                    "gfr_citation": info.get("gfr_citation", "GFR 2017 Rule 144(vii) mandates use of Indian Standards wherever available."),
                    "advisory": info.get("advisory", f"Replace foreign standard {f_key} with national standard {target}.")
                }
        return None

    def export_subgraph_for_ui(self, is_code: str) -> Dict[str, Any]:
        """
        Generates nodes and edges for React Flow / Cytoscape visualizer for a given standard.
        """
        std = self.get_standard(is_code)
        if not std:
            return {"nodes": [], "edges": []}

        root_id = std["is_code"]
        nodes = []
        edges = []
        visited = set()

        # Add central node
        nodes.append({
            "id": root_id,
            "label": root_id,
            "title": std.get("title", ""),
            "type": "Primary_Standard",
            "category": std.get("category", "Standard"),
            "status": std.get("status", "CURRENT"),
            "color": "#1e40af",
            "is_root": True
        })
        visited.add(root_id)

        # Collect outgoing connections (testing, materials, QCO, supersedes)
        if self.graph.has_node(root_id):
            for _, target, edge_data in self.graph.out_edges(root_id, data=True):
                target_node = self.graph.nodes.get(target, {})
                rel = edge_data.get("relationship", "RELATES_TO")
                if target not in visited:
                    visited.add(target)
                    nodes.append({
                        "id": target,
                        "label": target_node.get("label", target),
                        "title": target_node.get("title", ""),
                        "type": target_node.get("type", "Node"),
                        "status": target_node.get("status", ""),
                        "color": target_node.get("color", "#64748b")
                    })
                edges.append({
                    "id": f"{root_id}->{target}",
                    "source": root_id,
                    "target": target,
                    "label": rel.replace("_", " "),
                    "relationship": rel
                })

        # Collect incoming foreign connections
        if self.graph.has_node(root_id):
            for source, _, edge_data in self.graph.in_edges(root_id, data=True):
                source_node = self.graph.nodes.get(source, {})
                rel = edge_data.get("relationship", "EQUIVALENT_TO")
                if source not in visited:
                    visited.add(source)
                    nodes.append({
                        "id": source,
                        "label": source_node.get("label", source),
                        "title": source_node.get("title", ""),
                        "type": source_node.get("type", "Foreign_Standard"),
                        "status": "FOREIGN_CODE",
                        "color": source_node.get("color", "#ea580c")
                    })
                edges.append({
                    "id": f"{source}->{root_id}",
                    "source": source,
                    "target": root_id,
                    "label": rel.replace("_", " "),
                    "relationship": rel
                })

        return {"nodes": nodes, "edges": edges}

    def get_serialized_graph(self) -> Dict[str, List[Dict[str, Any]]]:
        """Exports complete serialized graph."""
        nodes = []
        for n, d in self.graph.nodes(data=True):
            nodes.append({
                "id": n,
                "label": d.get("label", n),
                "type": d.get("type", "unknown"),
                "status": d.get("status", ""),
                "title": d.get("title", ""),
                "color": d.get("color", "#64748b")
            })
        edges = []
        for u, v, k, d in self.graph.edges(keys=True, data=True):
            edges.append({
                "source": u,
                "target": v,
                "key": k,
                "label": d.get("label", "relates_to"),
                "relationship": d.get("relationship", "RELATES_TO")
            })
        return {"nodes": nodes, "edges": edges}

    def get_graph_stats(self) -> Dict[str, Any]:
        """Summary statistics of the knowledge graph."""
        type_counts = {}
        for _, d in self.graph.nodes(data=True):
            t = d.get("type", "Unknown")
            type_counts[t] = type_counts.get(t, 0) + 1
        return {
            "total_nodes": self.graph.number_of_nodes(),
            "total_edges": self.graph.number_of_edges(),
            "node_types": type_counts,
            "standards_count": len(self.standards_by_code),
            "qco_orders_count": len(self.qco_by_id),
            "foreign_mappings_count": len(self.foreign_mappings)
        }
