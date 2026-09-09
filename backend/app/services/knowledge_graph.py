import json
import networkx as nx
from typing import Dict, Any, List
from app.core.config import settings

class StandardsKnowledgeGraph:
    """
    NetworkX graph linking Indian Standards, obsolete revisions,
    mandatory Quality Control Orders (QCOs), and foreign equivalents.
    """
    def __init__(self):
        self.graph = nx.DiGraph()
        self._build_graph()

    def _build_graph(self):
        # Load standards
        if settings.STANDARDS_MASTER_PATH.exists():
            with open(settings.STANDARDS_MASTER_PATH, "r", encoding="utf-8") as f:
                standards = json.load(f)
                for s in standards:
                    code = s["is_code"]
                    self.graph.add_node(
                        code,
                        label=code,
                        type="standard",
                        status=s.get("status", "ACTIVE"),
                        title=s.get("title", "")
                    )
                    # Supersedes relationships
                    for sup in s.get("supersedes", []):
                        self.graph.add_node(sup, label=sup, type="standard", status="OBSOLETE", title=f"Obsolete: {sup}")
                        self.graph.add_edge(code, sup, label="supersedes")

        # Load QCOs
        if settings.QCO_MASTER_PATH.exists():
            with open(settings.QCO_MASTER_PATH, "r", encoding="utf-8") as f:
                qcos = json.load(f)
                for q in qcos:
                    qid = q["order_id"]
                    self.graph.add_node(
                        qid,
                        label=q["order_title"],
                        type="qco",
                        status="MANDATORY",
                        title=f"{q['ministry']} Order"
                    )
                    for std_num in q.get("covered_standards", []):
                        for node in list(self.graph.nodes):
                            if std_num in node and self.graph.nodes[node].get("type") == "standard":
                                self.graph.add_edge(qid, node, label="mandates")

        # Load Foreign Mappings
        if settings.FOREIGN_MAPPING_PATH.exists():
            with open(settings.FOREIGN_MAPPING_PATH, "r", encoding="utf-8") as f:
                mappings = json.load(f)
                for foreign_std, info in mappings.items():
                    self.graph.add_node(
                        foreign_std,
                        label=foreign_std,
                        type="foreign",
                        status="FOREIGN_EQUIVALENT",
                        title=info.get("title", "")
                    )
                    target_is = info.get("equivalent_is")
                    if target_is:
                        self.graph.add_edge(foreign_std, target_is, label="equivalent_to")

    def get_serialized_graph(self) -> Dict[str, List[Dict[str, Any]]]:
        nodes = []
        for n, d in self.graph.nodes(data=True):
            nodes.append({
                "id": n,
                "label": d.get("label", n),
                "type": d.get("type", "unknown"),
                "status": d.get("status", ""),
                "title": d.get("title", "")
            })

        edges = []
        for u, v, d in self.graph.edges(data=True):
            edges.append({
                "source": u,
                "target": v,
                "label": d.get("label", "relates_to")
            })

        return {"nodes": nodes, "edges": edges}

    def find_lineage(self, standard_code: str) -> Dict[str, Any]:
        """Find active replacements or dependencies for a standard."""
        replacements = []
        for u, v, d in self.graph.in_edges(standard_code, data=True):
            if d.get("label") == "supersedes":
                replacements.append(u)
        equivalents = []
        for u, v, d in self.graph.out_edges(standard_code, data=True):
            if d.get("label") == "equivalent_to":
                equivalents.append(v)
        return {
            "standard": standard_code,
            "replaced_by": replacements,
            "equivalent_to": equivalents
        }
