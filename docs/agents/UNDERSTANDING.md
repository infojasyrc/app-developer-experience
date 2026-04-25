CLAUDE.md
│  "qué es el proyecto, qué soluciones tiene, convenciones"
│  → referencia a monorepo-paths.md para rutas exactas
│
agents/shared/context/monorepo-paths.md
│  "dónde está exactamente cada cosa — paths resolvibles"
│  → leído por todos los agentes al inicio de cada tarea
│
AGENTS.md
   "qué agentes existen, cómo orquestarlos"
   → leído por Claude Code cuando necesita delegar una tarea

Regla de mantenimiento: si mueves un directorio en el repo, solo tocas monorepo-paths.md y añades una línea en CLAUDE.md si el cambio es estructural. Nunca tocas los SKILL.md individuales.