# What If? Progress Report

## 1. Project

Project Name: What If?

Current Stage: AI Beta / V1.0 investigation-gating test version

Current Status: Active local test build

Current Product Identity:

遗憾调查员。

Users submit a regret or unresolved story. The system first decides whether the case should be investigated. If it passes the filing threshold, the What If? investigator generates the minimal investigation result.

## 2. Current Scope

Implemented:

- React + Vite + TypeScript frontend
- Node local API server
- DeepSeek Chat API integration path
- `.env.local` based `DEEPSEEK_API_KEY`
- Development-only mock switch: `WHAT_IF_USE_MOCK=true`
- `/api/health/deepseek` diagnostic endpoint
- Step0 filing threshold
- Death-case secondary routing
- Strict story-state enum
- Local rule self-tests

Not implemented:

- Login
- Database
- Community
- Multi-agent system
- Long-term memory
- User history
- Production deployment

## 3. Current User Flow

1. User writes a story.
2. Frontend calls `/api/investigate`.
3. Server runs Step0 filing review.
4. If the case is `00A` / `00B` / `00C` / `00D`, the server stops the case directly.
5. If the case is `S1` / `S2` / `S3`, the server sends the story to DeepSeek with the investigator prompt.
6. Result page shows either:
   - story status + stop-case explanation, or
   - full investigation result.

## 4. Story State Enum

Current allowed states:

```ts
type StoryState =
  | "00A"
  | "00B"
  | "00C"
  | "00D"
  | "S1"
  | "S2"
  | "S3";
```

State meanings:

- `00A` Historical reflection / irreversible memory. Stop case.
- `00B` Closed story. Stop case.
- `00C` Cultural or aesthetic experience. Stop case.
- `00D` Life anecdote or minor regret. Stop case.
- `S1` Investigable, surface-level regret.
- `S2` Investigable, emotion-led.
- `S3` Investigable, already close to the answer.

Deprecated states are no longer accepted by the frontend runtime validator:

- `00D-1`
- `S5`
- `S6`

## 5. Step0 Filing Threshold

Step0 has been added before formal investigation.

Core rule:

Only cases with both continuing impact and an unanswered question should be investigated.

Stop-case categories:

- `00A`: historical reflection, era-level regret, bystander reflection, or irreversible memory without an active unanswered question
- `00B`: closed story, compensation, understanding, acceptance, or reconciliation already completed
- `00C`: cultural, language, art, or aesthetic experience change without life-level impact
- `00D`: minor life anecdote, small accident, short-term regret, or lightweight loss

Only `S1` / `S2` / `S3` enter the formal investigation flow.

## 6. Death Routing V0.3

Death is no longer an automatic stop case.

Old logic removed:

```text
death -> irreversible -> 00A
```

Current logic:

```text
death -> check for unanswered question -> S3 if present, 00A if absent
```

`deathQuestionCheck()` detects six S3 triggers:

- self-blame
- missing goodbye
- survivor responsibility
- medical-choice regret
- future burden
- existence confirmation

If any trigger appears, the case is forced toward `S3` and must not be returned as `00A`.

## 7. API Result Shapes

Stop-case result:

```json
{
  "status": "00A",
  "statusReason": "...",
  "caseType": "historical_reflection"
}
```

Investigated result:

```json
{
  "status": "S2",
  "statusReason": "...",
  "loss": "...",
  "lastingImpact": "...",
  "question": "...",
  "mechanism": "...",
  "reversal": "..."
}
```

For `00A` / `00B` / `00C` / `00D`, the API must not generate:

- loss
- lastingImpact
- question
- mechanism
- reversal

## 8. Frontend Result Page

The UI layout is unchanged.

Result page behavior:

- Stop cases show only story status and stop-case explanation.
- `S1` / `S2` / `S3` show the full investigation fields.

Current displayed sequence for formal cases:

1. Story status
2. True loss
3. Lasting impact
4. Unanswered question
5. Mechanism match
6. Reversal sentence

## 9. DeepSeek Integration Status

The server uses:

```text
https://api.deepseek.com/chat/completions
```

Headers:

```text
Authorization: Bearer ${DEEPSEEK_API_KEY}
Content-Type: application/json
```

API key handling:

- `.env.local` is used locally.
- Full API key is never logged.
- Health endpoint displays only a masked key prefix.

Diagnostics endpoint:

```text
/api/health/deepseek
```

Current known issue:

When the server is started from the Codex environment, outbound HTTPS may fail with `EACCES`. The user should start the server from a normal local terminal:

```powershell
npm.cmd run start:ai
```

## 10. Tests

Current test scripts:

```text
npm run build
npm run test:pre-filing
npm run test:death-routing
npm run benchmark:v1.1
```

Latest verified:

- `npm run build`: passed
- `npm run test:pre-filing`: 5/5 passed
- `npm run test:death-routing`: 10/10 passed

## 11. Current One-Line Summary

What If? is now an AI Beta regret-investigation prototype with a Step0 filing threshold, strict story-state enum, death-case secondary routing, and DeepSeek-backed investigation generation for only the cases that are still carrying an unanswered question.
