# DiaMind

DiaMind is a web app for people living with diabetes to journal their experiences, reflect on emotional distress, and explore helpful facts and games.

## Features

- Journal entry tracking and history
- Distress-aware insights based on text analysis
- Helpful diabetes-related facts and resources
- Lightweight games and onboarding experience

## Tech Stack

- Frontend: React + Vite
- Backend: FastAPI
- Machine learning: scikit-learn, transformers, PyTorch

## Run locally

### Backend

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn backend.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Deployment notes

For production, set these environment variables in your hosting platform:

- `GOOGLE_CLIENT_ID` on the backend
- `VITE_GOOGLE_CLIENT_ID` and `VITE_API_BASE` on the frontend
- `FRONTEND_ORIGINS` on the backend, as a comma-separated list of your deployed frontend URLs

Example:

```bash
GOOGLE_CLIENT_ID=your-google-client-id
FRONTEND_ORIGINS=https://your-app.com,https://www.your-app.com
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_API_BASE=https://api.your-app.com
```

## Notes

This project includes an ML-based text analysis component for supporting emotional wellbeing insights. It is intended for educational and supportive use, not medical diagnosis.
