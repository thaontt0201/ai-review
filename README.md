# AI Code Review

An intelligent code review application that leverages AI to analyze and provide feedback on code. Users can submit code snippets and receive detailed feedback on functionality, structure, performance optimization, and security considerations.

## Features

- **AI-Powered Code Analysis**: Submit code and receive intelligent feedback using Ollama (LLaMA 3.2 model)
- **Google OAuth Authentication**: Secure login with Google accounts
- **Multi-Language Support**: Support for multiple programming languages (JavaScript and more)
- **Code History**: Store and manage reviewed code submissions
- **Session Management**: Secure session handling with HTTP-only cookies

## Tech Stack

### Backend

- **Framework**: Express.js with TypeScript
- **API**: tRPC for type-safe client-server communication
- **Database**: PostgreSQL with Slonik query builder
- **Authentication**: Passport.js with Google OAuth 2.0
- **AI**: Ollama for local LLM inference
- **Validation**: Zod for runtime schema validation

### Frontend

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: TanStack React Query
- **Markdown Rendering**: React Markdown with GitHub Flavored Markdown support

## Project Structure

```
ai-code-review/
├── server/                 # Backend API
│   ├── src/
│   │   ├── index.ts       # Server entry point
│   │   ├── db.ts          # Database connection pool
│   │   ├── trpc.ts        # tRPC configuration
│   │   ├── auth/          # Authentication setup
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # Database models (review, user, session)
│   │   └── routes/        # API routes (auth)
│   ├── migrations/        # Database migrations
│   └── package.json
│
└── web/                    # Frontend application
    ├── src/
    │   ├── App.tsx        # Main app component
    │   ├── main.tsx       # React entry point
    │   ├── CodeForm.tsx   # Code submission form
    │   ├── FeedbackForm.tsx # Feedback display
    │   ├── contexts/      # React contexts (AuthContext)
    │   ├── utils/         # Utility functions (tRPC client)
    │   └── constants/     # App constants
    └── package.json
```

## Prerequisites

- Node.js 18+
- Docker and Docker Compose (for PostgreSQL database)
- Ollama with LLaMA 3.2 model installed and running
- Google OAuth 2.0 credentials (for authentication)

## Installation

### 0. Clone the repository

```bash
git clone <repository-url>
cd ai-code-review
```

### 1. Setup PostgreSQL Database with Docker

Create a `.env` file in the `server` directory with database credentials:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=ai-code-review
```

Start the PostgreSQL database using Docker Compose:

```bash
cd server
docker-compose up -d
```

This will start a PostgreSQL 13 container on `localhost:5432`. You can verify it's running with:

```bash
docker ps
```

### 2. Setup Environment Variables

Create `.env` file in the `server` directory:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/ai-code-review
PORT=8000
SESSION_DURATION_HOURS=24
SESSION_COOKIE_NAME=session_token

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:8000/auth/google/callback

```

### 3. Install Dependencies

**Backend:**

```bash
cd server
npm install
```

**Frontend:**

```bash
cd web
npm install
```

### 4. Database Setup

Run migrations:

```bash
cd server
npm run migrate:up
```

## Development

### Start Ollama

Ensure Ollama is running with the LLaMA 3.2 model:

```bash
ollama serve
# In another terminal
ollama pull llama3.2
```

### Run Backend Server

```bash
cd server
npm run dev
```

The server will start on `http://localhost:8000`

### Run Frontend Development Server

```bash
cd web
npm run dev
```

The frontend will start on `http://localhost:5173`

## Building for Production

### Build Backend

```bash
cd server
npm run build
```

### Build Frontend

```bash
cd web
npm run build
```

## Database Migrations

Create a new migration:

```bash
cd server
npm run migrate:create <migration-name>
```

Apply migrations:

```bash
cd server
npm run migrate:up
```

Revert migrations:

```bash
cd server
npm run migrate:down
```

## API Endpoints

### Authentication

- `GET /auth/google` - Start Google OAuth flow
- `GET /auth/google/callback` - Google OAuth callback
- `POST /auth/logout` - Logout user

### Code Review (Protected)

- `submitCode` (tRPC mutation) - Submit code for AI review

## Usage

1. Visit the web application at `http://localhost:5173`
2. Click "Login with Google" to authenticate
3. Enter your code in the editor
4. Click "Submit for Review"
5. View the AI-generated feedback
