# Example — Sample User Request

**User Request:**
Add a new REST endpoint `/health` in the backend Node.js template under `backend/ms-rest-template` that returns:
```json
{ "status": "ok", "timestamp": "<current iso string>" }
```
Also update the Makefile to include a `make health-check` command.
