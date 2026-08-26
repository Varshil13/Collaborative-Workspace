# WorkPulse

Your workspace, alive and in sync. A real-time collaborative Kanban board built with Turborepo. Create, manage, and track issues across board columns with live synchronization via WebSockets.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4 |
| Backend | Express 5, TypeScript |
| WebSockets | `ws` library, TypeScript |
| Database | PostgreSQL, Prisma ORM (with `@prisma/adapter-pg`) |
| Monorepo | Turborepo, Bun |

## Project Structure

```
workpulse/
├── apps/
│   ├── frontend/          # React + Vite + Tailwind CSS
│   │   └── src/App.tsx    # Board UI with real-time WebSocket integration
│   ├── backend/           # Express REST API
│   │   └── index.ts       # User signup endpoint
│   └── ws/                # WebSocket server (port 3002)
│       └── index.ts       # Room management, issue CRUD, user tracking
├── packages/
│   ├── db/                # Prisma client + PostgreSQL connection
│   ├── ui/                # Shared React components (Button, Card, Code)
│   ├── eslint-config/     # Shared ESLint configs
│   └── typescript-config/ # Shared TypeScript configs
├── package.json
├── turbo.json
└── bun.lock
```

## Features

- **Real-time collaboration** — Multiple users can join the same board and see changes instantly
- **Kanban board** — Three columns: Backlog, Working, and Done
- **Issue management** — Add and delete issues within any column
- **Live user presence** — See how many users are active on the board
- **WebSocket-based sync** — All board state updates are broadcast to connected clients

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) >= 1.3
- Node.js >= 18
- PostgreSQL database

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd workpulse

# Install dependencies
bun install
```

### Environment Setup

Create a `.env` file in the root directory:

```
DATABASE_URL=postgresql://user:password@localhost:5432/workpulse
```

### Database

```bash
# Run Prisma migrations
cd packages/db
bunx prisma migrate dev
```

### Development

```bash
# Start all apps in development mode
bun dev
```

This will start:

| App | URL |
|-----|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| WebSocket Server | ws://localhost:3002 |

### Build

```bash
bun run build
```

## Scripts

| Command | Description |
|---------|-------------|
| `bun dev` | Start all apps in development mode |
| `bun run build` | Build all apps |
| `bun run lint` | Lint all packages |
| `bun run check-types` | Run TypeScript type checking across all packages |
| `bun run format` | Format code with Prettier |

