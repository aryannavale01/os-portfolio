# Smart City Digital Twins — Research Notes

Notes for my final-year B.Tech project (team of 4): a multi-agent AI system
that fuses RAG, live IoT sensor streams, and Digital Twin modelling.

## Architecture

- **IoT ingestion**: live sensor streams from city infrastructure.
- **RAG knowledge layer**: answers grounded in verified domain documents.
- **Digital Twin**: real-time visual model of the physical environment.
- **Agents**: monitor, analyse, and recommend — coordinated handoff between
  focused agents.

## Key Design Choices

- RAG grounds agent outputs in verified knowledge (fewer hallucinations).
- IoT feeds real-time state into the twin so the model stays current.
- Each agent has one responsibility; an orchestrator handles the handoff.

## Open Questions

- Latency budget for near-real-time twin updates.
- Sensor failure and data-gap handling.
