# What If? AI Beta 0.1

What If? is currently in AI Beta. The browser calls a server-side API layer, so the DeepSeek API key is never exposed to frontend code.

## Local Setup

Create a local environment file:

```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

Save it as `.env.local` in the project root. This file is ignored by Git.

## Run Locally

Build the frontend:

```bash
npm run build
```

Start the AI Beta server:

```bash
npm run start:ai
```

Open:

```text
http://127.0.0.1:5173/
```

The local server supports the same function path used in production:

```text
/.netlify/functions/analyze
```

## Deploy To Netlify

Connect the complete project repository to Netlify. Netlify reads `netlify.toml` and uses:

```text
Build command: npm run build
Publish directory: dist
Functions directory: netlify/functions
```

In Netlify, add this environment variable:

```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

Do not upload only the `dist` directory with Netlify Drop. The investigation API is a Netlify Function and must be deployed with the complete project.

## Network Requirement

The machine running `npm run start:ai` must be able to access:

```text
https://api.deepseek.com/chat/completions
```

In the Codex environment, external HTTPS access to DeepSeek may be blocked. If `/api/health/deepseek` reports a network error such as `EACCES`, run the project from a local environment that can access `api.deepseek.com`.

## DeepSeek Health Check

After starting the server, visit:

```text
http://127.0.0.1:5173/api/health/deepseek
```

This sends a minimal `"Hello"` request to DeepSeek and returns whether the connection succeeds.

## Development Mock Mode

For local UI checks in an environment that cannot access DeepSeek, set:

```env
WHAT_IF_USE_MOCK=true
```

Mock mode is only for checking result-page structure. It is not used for Benchmark scoring. The default is real DeepSeek calls.

## Scripts

```bash
npm run build
npm run start:ai
```
