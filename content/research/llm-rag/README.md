# LLMs, RAG & Agentic Systems — Research Notes

My working notes on building production LLM features: retrieval-augmented
generation, tool/function calling, and agent orchestration.

## Core Ideas

- **Retrieval**: Chunking strategies, embedding models, vector stores, hybrid
  search (BM25 + dense), and re-ranking.
- **Grounding**: RAG pipelines anchor model answers to verified sources and
  substantially reduce hallucination.
- **Agents**: LLMs that call tools/functions and chain actions toward a goal.
- **Evaluation**: Faithfulness, answer relevance, and context precision/recall.

## Notes

- Function calling is the backbone of agentic apps — schemas must be tight and
  descriptions explicit so the model picks the right tool.
- RAG quality degrades with bad chunk boundaries; overlapping chunks plus
  metadata filters help.
- Streaming UX matters just as much as accuracy for interactive assistants.

## Where I Use This

- **Intelligent AI Assistant** — LLM function calling + Google Vision.
- **SmartCitiManage** — RAG + IoT + Digital Twin (final-year project).
