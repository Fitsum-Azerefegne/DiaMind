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

The simplest production path is a single Docker container that serves both the API and the built frontend.

### Docker deploy

```bash
docker build -t diamind .
docker run -p 8000:8000 \
	-e DATABASE_URL=postgresql+psycopg://user:password@host:5432/diamind \
	-e GOOGLE_CLIENT_ID=your-google-client-id \
	-e FRONTEND_ORIGINS=http://localhost:8000 \
	diamind
```

For production, set these environment variables in your hosting platform:

- `DATABASE_URL` on the backend, pointing to your managed Postgres database
- `GOOGLE_CLIENT_ID` on the backend
- `VITE_GOOGLE_CLIENT_ID` on the frontend if you deploy the frontend separately
- `VITE_API_BASE` on the frontend if you deploy the frontend separately
- `FRONTEND_ORIGINS` on the backend, as a comma-separated list of your deployed frontend URLs, or `http://localhost:8000` for the single-container Docker setup above

Example:

```bash
DATABASE_URL=postgresql+psycopg://user:password@host:5432/diamind
GOOGLE_CLIENT_ID=your-google-client-id
FRONTEND_ORIGINS=https://your-app.com,https://www.your-app.com
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_API_BASE=https://api.your-app.com
```

## Notes

This project includes an ML-based text analysis component for supporting emotional wellbeing insights. It is intended for educational and supportive use, not medical diagnosis.
