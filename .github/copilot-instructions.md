# Repository Instructions for AI Documentation Review

This repository contains SUSE technical documentation written in:
- AsciiDoc (`*.adoc`)
- DocBook XML (`*.xml`)

AI review prompts are stored in:
- `ai-prompts/suse-style-guide/`

The `ai-prompts/suse-style-guide/` directory is a Git submodule.
Ensure the submodule is available before attempting to read prompt files.

Prompt files are Markdown (`*.md`) documents.

Prompt file names begin with numeric prefixes that define execution order.

Apply prompts sequentially in ascending numeric order.

Example execution order:
1. `00-general.md`
2. `01-grammar.md`
3. `02-tone.md`

Treat each prompt file as a modular ruleset.

When reviewing or modifying documentation:
- apply all relevant prompts consistently
- preserve compatibility between prompts
- avoid conflicting rewrites
- prefer minimal targeted edits
- preserve technical accuracy

Review only documentation files:
- `*.adoc`
- `*.xml`

Do not review or modify:
- scripts
- workflow files
- helper utilities
- non-documentation assets

Suggestions must:
- follow the SUSE Style Guide rules defined in the prompt files
- be actionable and specific
- preserve document meaning
- improve clarity, consistency, structure, or readability

Prefer:
- concise rewrites
- deterministic wording
- modular documentation structure
- globally understandable English

Avoid:
- marketing language
- unnecessary rewrites
- subjective stylistic changes
- altering technical intent