# LLM Wars API

FastAPI-based backend for LLM battles and experiments. Designed for deployment to Railway or Render.

## Local Development

### Setup

1. **Navigate to project:**
   ```bash
   cd src/tech/llm-projects/1-llm-wars
   ```

2. **Activate virtual environment:**
   ```bash
   source .venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   uv pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env and add your API keys
   ```

### Run Locally

**Development server with auto-reload:**
```bash
uvicorn src.main:app --reload --port 8000
```

**Visit:**
- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc

### API Endpoints

- `GET /` - Root endpoint
- `GET /health` - Health check
- `POST /api/battle/` - Create LLM battle (example endpoint)
- `GET /api/battle/history` - Get battle history

## Deployment

### Option 1: Railway (Recommended)

1. **Install Railway CLI:**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login:**
   ```bash
   railway login
   ```

3. **Initialize project:**
   ```bash
   railway init
   ```

4. **Add environment variables:**
   ```bash
   railway variables set OPENAI_API_KEY=your-key-here
   railway variables set ANTHROPIC_API_KEY=your-key-here
   ```

5. **Deploy:**
   ```bash
   railway up
   ```

6. **Get URL:**
   ```bash
   railway domain
   ```

### Option 2: Render

1. **Push code to GitHub**

2. **Create new Web Service on Render:**
   - Connect your GitHub repo
   - Set root directory: `src/tech/llm-projects/1-llm-wars`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn src.main:app --host 0.0.0.0 --port $PORT`

3. **Add environment variables in Render dashboard:**
   - `OPENAI_API_KEY`
   - `ANTHROPIC_API_KEY`

4. **Deploy** - Render auto-deploys on git push

### Environment Variables

Required for deployment:
- `OPENAI_API_KEY` - Your OpenAI API key
- `ANTHROPIC_API_KEY` - Your Anthropic API key
- `PORT` - Auto-set by Railway/Render

## Connecting to Frontend

Update your Astro frontend to call this API:

```typescript
// In your Astro project
const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:8000';

const response = await fetch(`${API_URL}/api/battle/`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'What is consciousness?',
    model1: 'gpt-4',
    model2: 'claude-3-sonnet',
  }),
});
```

## Development Commands

- **Format code:** `black src/`
- **Lint code:** `ruff check src/`
- **Fix lint issues:** `ruff check --fix src/`
- **Run tests:** `pytest tests/`
- **Type check:** `mypy src/`

## Project Structure

```
1-llm-wars/
├── .venv/              # Virtual environment (gitignored)
├── src/
│   ├── __init__.py
│   ├── main.py         # FastAPI app & setup
│   ├── config.py       # Configuration & settings
│   └── routes/
│       ├── __init__.py
│       └── battle.py   # Battle endpoints
├── tests/              # Test files
├── .env.example        # Environment variables template
├── .env                # Your API keys (gitignored)
├── Procfile            # Railway/Render startup
├── railway.json        # Railway config
├── render.yaml         # Render config
├── runtime.txt         # Python version
├── requirements.txt    # Python dependencies
└── README.md           # This file
```

## Architecture

```
┌─────────────────────┐
│  Astro Frontend     │  (GitHub Pages)
│  formatkaka.github  │
└──────────┬──────────┘
           │ HTTP/Fetch
           ▼
┌─────────────────────┐
│  FastAPI Backend    │  (Railway/Render)
│  LLM Wars API       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  LLM APIs           │
│  OpenAI, Anthropic  │
└─────────────────────┘
```

## Next Steps

1. Implement actual LLM battle logic in `src/routes/battle.py`
2. Add database for storing battle results
3. Add authentication if needed
4. Add rate limiting
5. Deploy to Railway or Render
6. Update frontend to call deployed API
