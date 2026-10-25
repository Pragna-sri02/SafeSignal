# 🛡️ SafeSignal — AI-Powered Women's Safety Platform

SafeSignal is an AI-powered women's safety platform that brings **physical safety, digital threat protection, and AI-assisted guidance** together in one application.

It helps users access emergency resources, manage trusted contacts, explore digital safety guidance, organize incident information, and ask safety-related questions through an AI assistant powered by Retrieval-Augmented Generation (RAG).

## 🎯 Problem Statement

Physical safety concerns and digital threats such as cyberbullying, online harassment, account hacking, impersonation, and misuse of personal images require timely information and appropriate action.

However, safety resources are often scattered across different platforms. SafeSignal aims to make these resources more accessible through a unified, user-friendly application.

## ✨ Key Features

### 🚨 Physical Safety
- SOS interface with a countdown to reduce accidental activation.
- Permission-based browser location access.
- Trusted contact management.
- Journey safety and check-in workflows.
- Quick access to India's emergency number, 112.

### 🛡️ Digital Protection Centre
- Guidance for hacked social media accounts.
- Cyberbullying and online harassment resources.
- Fake profiles, impersonation, and deepfake guidance.
- Support for understanding phishing, threats, and privacy breaches.
- Evidence preservation recommendations and official reporting resources.

### 🤖 AI Safety Assistant
- Answers safety-related questions using a RAG pipeline.
- Retrieves relevant information from a curated knowledge base.
- Uses Sentence Transformers to generate text embeddings.
- Uses FAISS for semantic similarity search.
- Integrates Gemini for AI-generated responses.
- Displays source references where supported by the implementation.

### 🗂️ Evidence Organizer
- Organizes incident details and notes.
- Supports structured incident records.
- Helps users prepare incident summaries for reporting.

### 👥 Trusted Contacts and Help Directory
- Access to safety-related contact information.
- Quick access to official emergency and cybercrime reporting resources.

## ⚙️ How SafeSignal Works

SafeSignal uses a frontend-backend architecture.

1. **User Interface:** Users interact with the application through a React frontend.
2. **API Communication:** The frontend communicates with the Python FastAPI backend.
3. **Application Processing:** The backend processes requests and executes the relevant application logic.
4. **Database Operations:** Supabase provides configured database and authentication services.
5. **AI Processing:** For safety-related questions, the RAG system retrieves relevant documents and uses the configured Gemini model to generate a response.
6. **Results:** The backend returns the response, which the frontend displays to the user.

### 🧠 AI and RAG Workflow

```text
Safety Knowledge Documents
          ↓
Text Processing and Chunking
          ↓
Sentence Transformers
          ↓
Text Embeddings
          ↓
FAISS Vector Index
          ↓
User Question
          ↓
Relevant Document Retrieval
          ↓
Retrieved Context + Gemini
          ↓
AI-Generated Response
```

**Why RAG?**

RAG combines information retrieval with language generation. It helps the assistant use relevant content from the project's knowledge base instead of relying only on the language model's general knowledge.

AI-generated answers can still contain errors, so important safety information should be verified using official sources.

## 🏗️ System Architecture

```text
           User
            |
            v
     React + Vite
       Frontend
            |
            v
      FastAPI Backend
            |
      +-----+------+
      |            |
      v            v
   Supabase      AI / RAG
   Database      Pipeline
   and Auth      |
                 +-- Sentence Transformers
                 +-- FAISS
                 +-- Gemini
```

## 🧰 Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React, JavaScript, Vite |
| Routing | React Router |
| Styling | CSS, CSS Variables |
| Backend | Python, FastAPI, Uvicorn |
| Validation | Pydantic |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth |
| Database Security | Row Level Security (RLS) |
| AI Model | Google Gemini |
| Embeddings | Sentence Transformers |
| Vector Search | FAISS |
| Testing | Python unittest, pytest, Node.js |
| Version Control | Git, GitHub |

## 📁 Project Structure

```text
SafeSignal/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── i18n/
│   │   ├── pages/
│   │   ├── services/
│   │   └── styles/
│   ├── tests/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── routers/
│   │   └── services/
│   ├── rag/
│   │   ├── documents/
│   │   ├── ingest.py
│   │   └── retriever.py
│   ├── tests/
│   └── requirements.txt
│
├── supabase/
│   └── migrations/
│
├── .gitignore
└── README.md
```

## 💻 Installation and Setup

### Prerequisites

Install:
- Python 3.12 or a compatible version.
- Node.js and npm.
- Git.
- A Supabase project.
- A Gemini API key for Gemini-powered responses.

### 1. Clone the repository

```bash
git clone https://github.com/Pragna-sri02/SafeSignal.git
cd SafeSignal
```

### 2. Set up the backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Configure the required backend environment variables in `backend/.env`.

### 3. Set up the frontend

Open a second terminal from the project root.

```powershell
cd frontend
npm install
Copy-Item .env.example .env.local
```

Configure the required frontend environment variables in `frontend/.env.local`.

**Security:** Never commit real `.env` files or expose private API keys in frontend code.

### 4. Configure Supabase

1. Create a project in Supabase.
2. Open the SQL Editor.
3. Run `supabase/migrations/001_initial_schema.sql`.
4. Run `supabase/migrations/002_rls_policies.sql`.
5. Configure the storage bucket and access permissions required by the application.

### 5. Build the RAG index

From the `backend` directory, run:

```powershell
python rag/ingest.py
```

Ensure the ingestion and retrieval components use the same configured index location.

### 6. Start the backend

From the `backend` directory:

```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Backend API: `http://localhost:8000`

API documentation: `http://localhost:8000/docs`

### 7. Start the frontend

From the `frontend` directory, in a separate terminal:

```powershell
npm run dev
```

Open `http://localhost:5173` in your browser.

## 🔒 Security and Limitations

- Location access depends on user permission and browser support.
- Database security depends on correctly configured authentication and access policies.
- AI responses may be inaccurate and should not replace official safety guidance.
- Emergency notification delivery requires appropriate integrations and successful delivery confirmation.
- Production deployment requires secure environment variables, correct API URLs, and appropriate database and storage permissions.

**Emergency notice:** SafeSignal is a safety-support application, not an emergency response service. If you are in immediate danger in India, contact **112** directly.

## 🚀 Future Enhancements

- Production deployment and monitoring.
- Improved AI response evaluation.
- Expanded multilingual support.
- Additional automated and integration tests.
- Enhanced notification integrations.
- Further privacy and security improvements.

## 👩‍💻 Project Information

**Project Name:** SafeSignal

**Category:** Artificial Intelligence | Women's Safety | Cybersecurity

**Repository:** [GitHub — SafeSignal](https://github.com/Pragna-sri02/SafeSignal)

**Core Technologies:** React, Vite, Python, FastAPI, Supabase, Sentence Transformers, FAISS, and Gemini.

---

*SafeSignal aims to make physical safety resources, digital protection guidance, and AI-assisted information more accessible through a unified platform.*
