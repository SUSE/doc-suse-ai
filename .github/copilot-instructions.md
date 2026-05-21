# Repository Instructions for GitHub Copilot

This repository contains technical documentation in AsciiDoc files.
You must follow the AI prompts provided in the following files:

- ai-prompts/suse-style-guide/00-general.md
- ai-prompts/suse-style-guide/01-grammar.md
- ai-prompts/suse-style-guide/02-tone.md
- ai-prompts/suse-style-guide/03-terminology.md
- ai-prompts/suse-style-guide/04-technical-formatting.md
- ai-prompts/suse-style-guide/05-headings.md
- ai-prompts/suse-style-guide/06-ui-labels.md
- ai-prompts/suse-style-guide/07-inclusive-language.md
- ai-prompts/suse-style-guide/08-web-writing.md
- ai-prompts/suse-style-guide/09-modular-writing.md
- ai-prompts/suse-style-guide/10-geo-content-auditor.md

Do not review files other than AsciiDoc documents.

Treat prompts as modular rulesets, not as unrelated documents.

When generating or reviewing content:
- apply all relevant prompt files consistently
- preserve compatibility between prompts
- avoid conflicting rewrites
- prefer minimal targeted edits

---

# AI Review Behavior

- suggest concrete improvements.
- prefer minimal edits over full rewrites.
- do not remove technical accuracy for brevity.

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