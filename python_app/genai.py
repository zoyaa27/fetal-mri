"""Optional Bio.Entrez agentic-search planning for SPEC §4.11.3.

This module builds the PubMed query and retrieval plan for the optional GenAI
fallback. It intentionally does not execute network calls; callers that enable
the optional backend can use the returned plan with Entrez.efetch.
"""

from collections.abc import Sequence
from dataclasses import dataclass

from Bio import Entrez


@dataclass(frozen=True)
class PubMedSearchPlan:
    query: str
    max_abstracts: int = 3
    context_injection: str = "temporary abstracts only"
    transparency_source: str = "PMID hyperlink required for every agentic claim"
    efetch_hook: str = "Entrez.efetch"


def _normalize_finding(finding: str) -> str:
    return " ".join(finding.strip().split())


def build_pubmed_query(findings: Sequence[str]) -> str:
    normalized_findings = [
        normalized
        for finding in findings
        if (normalized := _normalize_finding(finding))
    ]
    if not normalized_findings:
        raise ValueError("at least one abnormal finding is required")

    return (
        " AND ".join(normalized_findings)
        + " AND fetal MRI AND differential diagnosis"
    )


def build_pubmed_search_plan(findings: Sequence[str]) -> PubMedSearchPlan:
    # Keep a concrete Bio.Entrez hook in the backend without issuing requests.
    _ = Entrez.efetch
    return PubMedSearchPlan(query=build_pubmed_query(findings))
