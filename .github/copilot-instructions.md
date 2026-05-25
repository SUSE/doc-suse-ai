# Repository Instructions for GitHub Copilot

This repository contains SUSE technical documentation written in AsciiDoc (\*.adoc) or DocBook (\*.xml) files.
This repository includes an `ai-prompts` subdirectory which is a submodule.
You must checkout the `ai-prompts` submodule first to access the AI prompts.
You must follow the AI prompts provided in the `ai-prompts/suse-style-guide` directory to make suggestions to improve the documentation.
The AI promtps file names start with a nuber, follow the AI prompts sequentially in ascending order.
Review only documentation files, not scripts or other helper files in this repository.
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