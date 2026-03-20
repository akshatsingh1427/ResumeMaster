<div align="center">

# ⚡ ResumeMaster

### AI-Powered Resume Intelligence & Adaptive Onboarding Engine

[![Groq](https://img.shields.io/badge/Powered%20by-Groq%20AI-00D4AA?style=for-the-badge&logo=lightning&logoColor=white)](https://console.groq.com)
[![LLaMA](https://img.shields.io/badge/Model-LLaMA%203.3%2070B-7C3AED?style=for-the-badge)](https://ai.meta.com)
[![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Node](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)

> Upload your resume. Discover your gaps. Get your roadmap. Land the role.

**🏆 Built for ArtPark CodeForge Hackathon 2026 · IISc Bangalore**

</div>

---

## 🚀 What is ResumeMaster?

ResumeMaster eliminates the guesswork from career growth. By comparing your resume against any job description, it pinpoints **exactly** what you know, what you're missing, and **what to learn next** — then builds a personalized training roadmap to get you there faster than generic onboarding ever could.

No fluff. No wasted hours. Just precision.

---

## ✨ Features

| | Feature | Description |
|---|---|---|
| 🧠 | **Skill Gap Analysis** | Scores every skill gap between your resume and target role |
| 🗺️ | **Adaptive Learning Pathway** | Prerequisite-aware training roadmap, unique to you |
| 📊 | **ATS Score** | Know exactly how ATS-friendly your resume is before you apply |
| ✍️ | **Resume Rewriter** | Full AI rewrite optimized for ATS — download as `.txt` or `.html` |
| 💼 | **Job Matching** | Top role recommendations ranked by your skill overlap |
| ✉️ | **Cover Letter Generator** | One-click personalized cover letter for any job listing |
| 🎯 | **AI Career Coach** | Chat with an AI that knows your resume — anytime |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite |
| **Backend** | Node.js + Express |
| **AI Inference** | Groq Cloud — LLaMA 3.3 70B Versatile |
| **File Parsing** | `pdf-parse` · `mammoth` |
| **Auth & Storage** | localStorage (per-user sessions) |

---

## ⚙️ Setup

> **Requirements:** Node.js v18+ · Free Groq API key from [console.groq.com](https://console.groq.com)

```bash
# Clone & install
git clone https://github.com/your-username/resumemaster.git
cd resumemaster
npm install
cd frontend && npm install && cd ..

# Configure
mv _env .env
# → Add your GROQ_API_KEY inside .env

# Launch 🚀
npm start
```

🌐 Open **http://localhost:5173**

---

## 📁 Project Structure

```
resumemaster/
├── server.js        # Express API — file parsing + Groq proxy
├── .env             # 🔑 GROQ_API_KEY (never commit)
├── package.json
└── frontend/
    └── src/
        └── App.jsx  # Full React application
```

---

## 🔌 API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/parse-resume` | `POST` | Accepts PDF / DOCX / TXT → returns extracted text |
| `/api/chat` | `POST` | Proxies messages to Groq LLaMA 3.3 70B |
| `/health` | `GET` | Server health check |

---

## 📚 Datasets Referenced

- 🔗 [O*NET Skill Database](https://www.onetcenter.org/db_releases.html) — skill taxonomy reference
- 🔗 [Kaggle Resume Dataset](https://www.kaggle.com/datasets/snehaanbhawal/resume-dataset/data)
- 🔗 [Kaggle Jobs & Descriptions](https://www.kaggle.com/datasets/kshitizregmi/jobs-and-job-description)

---

<div align="center">

**Made with ⚡ at ArtPark CodeForge Hackathon 2026 · IISc Bangalore**

*Smarter onboarding. Zero wasted hours.*

</div>
