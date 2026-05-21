# Repository Instructions for GitHub Copilot

This repository contains technical documentation in AsciiDoc files.
You must follow the AI prompts provided in the `ai-prompts/suse-style-guide/` directory to suggest improvements to the modified document files.
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