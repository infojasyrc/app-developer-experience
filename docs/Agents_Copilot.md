# Configure Copilot and Agents

## Prepare instructions

- Create a folder inside .github called instructions
- Add specific instructions for frontend: frontend.instructions.md and backend: backend.instructions.md
- Enable github.copilot.chat.codeGeneration.useInstructionFiles setting.

In settings.json inside .vscode:
```json
{
    "github.copilot.chat.codeGeneration.useInstructionFiles": true
}
```

## References

https://code.visualstudio.com/docs/copilot/customization/custom-instructions#_use-an-agentsmd-file-experimental