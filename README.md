# AetherBridge

**AetherBridge** is a Gemini-powered application that converts unstructured real-world inputs into structured, life-saving actions using Vertex AI, Cloud Run, Cloud Storage (GCS), and Firestore.

## Overview
AetherBridge operates as a critical intermediary in emergency response workflows. It ingests multi-modal data (audio, video, photos) from the field, processes it through Google's Gemini AI to understand the intent and urgency, and outputs structured, verified action packs that can be relayed directly into legacy systems.

## Key Features
- **Multi-Modal Ingestion**: Safely handles unstructured media inputs representing real-world situations.
- **AI-Driven Reasoning**: Uses Vertex AI and Gemini models to interpret situations and generate intent (e.g., Medical Triage, SOS).
- **Human-in-the-Loop Verifier**: Ensures that all AI-generated actions are reviewed and confirmed prior to execution.
- **Relay Mechanism**: Securely dispatches structured actions downstream via hooks.

## Tech Stack
- Frontend: React / Vite
- Backend API: Node.js / Express
- Database: PostgreSQL (Prisma) & Firestore
- Cloud Services: Google Cloud Platform (Vertex AI, GCS)
