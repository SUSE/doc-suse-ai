# Repository Instructions for GitHub Copilot

This repository contains technical documentation and AI-assisted review workflows.

---

# AI Prompt Architecture

AI review and transformation prompts are stored in:

```text
ai-prompts/
```

Each file in this directory has a single responsibility.

Examples:

```text
ai-prompts/
├── 00-general.md
├── 01-grammar.md
├── 02-tone.md
├── 03-terminology.md
├── 04-technical-formatting.md
├── 05-headings.md
├── 06-ui-labels.md
├── 07-inclusive-language.md
├── 08-web-writing.md
├── 09-modular-writing.md
└── 10-geo-content-auditor.md
```

Treat prompts as modular rulesets, not as unrelated documents.

When generating or reviewing content:
- apply all relevant prompt files consistently
- preserve compatibility between prompts
- avoid conflicting rewrites
- prefer minimal targeted edits

---

# AI Review Behavior

When reviewing content:
- identify ambiguity
- identify passive voice
- identify redundancy
- identify missing prerequisites
- identify inconsistent terminology
- identify Smart Docs violations

Suggest concrete improvements.

Prefer minimal edits over full rewrites.

Do not remove technical accuracy for brevity.

---

# Pull Request Behavior

When generating PR comments:
- keep feedback actionable
- explain why a change improves clarity
- provide replacement wording where useful

Avoid generic comments like:
- "improve wording"
- "make clearer"

---

# Repository Priorities

Priority order:
1. correctness
2. clarity
3. consistency
4. brevity

Never sacrifice correctness for brevity.