# Retrieval-Augmented Generation (RAG)

Notes on building production-style RAG pipelines — explored hands-on in the RAG System project, a document chatbot that answers questions across PDFs, Word, CSV, Excel, Markdown, HTML, XML, JSON, and PowerPoint files.

## What RAG Solves

LLMs trained on static corpora hallucinate on private or recent documents and cannot "remember" user-specific data. RAG grounds generation in a retrievable knowledge base: instead of re-training, the model is given the relevant chunks of the user's documents as context at query time. This gives fresh, verifiable, domain-specific answers without fine-tuning.

## The Pipeline

1. **Ingestion** — load documents with type-specific parsers (LangChain loaders / PyMuPDF).
2. **Chunking** — split text into overlapping windows (e.g. 500 tokens, 50 overlap) so each chunk is self-contained enough for retrieval.
3. **Embedding** — encode chunks into dense vectors with Sentence Transformers (all-MiniLM-L6-v2, 384-dim).
4. **Indexing** — store vectors in a FAISS index and the raw chunks for BM25.
5. **Retrieval** — at query time, find the most relevant chunks.
6. **Generation** — send the retrieved context plus the user question to an LLM, which answers with source references.

## Hybrid Retrieval: Why BM25 + FAISS

Dense vector search captures *meaning* but can miss exact matches; sparse keyword search (BM25) is exact but blind to paraphrase.

| Retriever | Type | Strengths |
|-----------|------|-----------|
| BM25 | Sparse, probabilistic | Exact terms, names, IDs |
| FAISS | Dense, similarity | Semantics, intent, synonyms |

The project combines them with an `EnsembleRetriever` using configurable weights (0.3 BM25 / 0.7 FAISS, `k=5` / `k=3`). This catches both keyword-identical and conceptually-related content, and degrades gracefully if one index is unavailable.

## Key Configuration

- `CHUNK_SIZE=500`, `CHUNK_OVERLAP=50` — chunking trade-off between context richness and retrieval precision.
- `FAISS_SEARCH_K=3`, `BM25_SEARCH_K=5` — how many candidates each retriever contributes.
- `LLM_TEMPERATURE=0.5` — lower temperature keeps answers grounded.

## Design Trade-offs

- **Embedding model choice**: `all-MiniLM-L6-v2` trades some quality for fast, low-memory inference — the right call for a local-first tool.
- **Weighted fusion**: tuning the BM25/FAISS ratio changes behavior on exact-match queries; 0.3/0.7 is a sane default.
- **Per-document indexes**: the vectorstore is rebuilt per document set, keeping the knowledge base small and fast for a single user.

## Future Directions

Conversation memory, OCR for scanned PDFs, cloud deployment, authentication, and multi-user support. Each moves the system from a single-user tool toward a production document assistant.
