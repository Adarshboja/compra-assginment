# Compra AI Layout Agent

A premium AI-powered layout editor for transforming design JSON through natural language. The app combines a modern React dashboard, interactive Konva canvas, Zustand state management, and an Express/OpenAI backend.

## Features

- Chat-based layout editing with OpenAI GPT-4o-mini
- Conversation history for follow-up instructions
- Semantic role detection for headline, product, background, offer badge, discount text, subheadline, and CTA
- Deterministic fallback layout engine for common commands
- Interactive canvas with drag, select, resize, zoom, and PNG export
- Aspect ratio tools for `1:1`, `9:16`, `16:9`, and `4:5`
- Undo/redo, reset, JSON copy, and JSON download
- Live inspector with hierarchy, node properties, color editing, and layout statistics
- Premium dark glassmorphism UI with animation and responsive layout

## Structure

```text
client/
  src/
    components/       UI panels, chat, canvas, inspector
    hooks/            reusable React hooks
    store/            Zustand state
    services/         API client
    utils/            layout helpers and export utilities
    data/             initial layout JSON
server/
  controllers/        Express request handlers
  routes/             API routes
  services/           OpenAI and layout orchestration
  utils/              semantic roles, JSON repair, layout engine
  data/               persisted layout JSON
```

## Install

```bash
cd E:\Movies2025\copra\server
npm install

cd E:\Movies2025\copra\client
npm install --legacy-peer-deps
```

## Environment

Create or update:

```text
E:\Movies2025\copra\server\.env
```

```env
PORT=5000
OPENAI_API_KEY=your_real_key_here
OPENAI_MODEL=gpt-4o-mini
```

## Run

Backend:

```bash
cd E:\Movies2025\copra\server
npm run dev
```

Frontend:

```bash
cd E:\Movies2025\copra\client
npm run dev
```

Open:

```text
http://localhost:5173
```

## Test Prompts

- Convert this design to 9:16
- Keep the product large
- Move the headline to the top
- Move the offer badge higher
- Make the headline smaller
- Change headline color to red
- Center the product

## Debugging

Port already in use:

```bash
netstat -ano | findstr ":5000"
Stop-Process -Id <PID> -Force
```

Frontend compile issue:

```bash
cd E:\Movies2025\copra\client
npm run build
```

Backend import check:

```bash
cd E:\Movies2025\copra
node --input-type=module -e "import('./server/app.js').then(() => console.log('server ok'))"
```

If OpenAI fails, the app uses the local deterministic layout engine where possible.
