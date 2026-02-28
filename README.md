# CareerSync AI 🚀

CareerSync AI is an advanced AI-powered Career Intelligence and Resume–Job Matchmaking System. It analyzes resumes and job descriptions intelligently to calculate compatibility, detect skill gaps, and provide structured career guidance.

## 🌟 Features

- **Resume Analysis**: Extract skills, education, experience, and achievements.
- **Job Description Analysis**: Extract required skills, responsibilities, and role levels.
- **Skill Matching Engine**: Categorize matches and calculate compatibility scores.
- **ATS Optimization**: Get suggestions for keywords, metrics, and formatting.
- **Skill Gap Intelligence**: personalized learning roadmaps and project ideas.
- **Interview Preparation**: Role-specific technical and behavioral questions.
- **Cover Letter Generation**: Personalized and professional cover letters.

## 🏗️ Architecture

- **Backend**: FastAPI (Python)
- **Frontend**: Next.js (React + Tailwind CSS)
- **AI Model**: Mixtral-8x7B-Instruct (via Mistral AI or Together AI)

## 🚀 Getting Started

### Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Add your `OPENAI_API_KEY` (Mistral or Together AI key)
5. Run the server:
   ```bash
   python main.py
   ```

### Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📄 License

MIT
