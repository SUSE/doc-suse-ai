const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const githubToken = process.env.GITHUB_TOKEN;
const repo = process.env.GITHUB_REPOSITORY;
const [owner, name] = repo.split("/");

// -------------------------
// Load prompt files
// -------------------------
function loadPrompts() {
  const dir = "ai-prompts/suse-style-guide";
  return fs
    .readdirSync(dir)
    .filter(f => f.endsWith(".md"))
    .map(f => ({
      name: f,
      content: fs.readFileSync(path.join(dir, f), "utf-8"),
    }));
}

// -------------------------
// Load changed docs
// -------------------------
function loadDocs() {
  if (!fs.existsSync("docs.txt")) return [];
  return fs
    .readFileSync("docs.txt", "utf-8")
    .split("\n")
    .filter(Boolean);
}

// -------------------------
// Call LLM
// -------------------------
async function reviewFile(file, prompts) {
  const content = fs.readFileSync(file, "utf-8");

  const promptBundle = prompts
    .map(p => `### ${p.name}\n${p.content}`)
    .join("\n\n");

  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content: `
You are a strict AsciiDoc documentation reviewer.

Apply all rules from the provided prompts.

Return ONLY JSON in this format:
{
  "comments": [
    {
      "line": number,
      "message": string,
      "suggestion": string
    }
  ]
}
        `,
      },
      {
        role: "user",
        content: `
FILE: ${file}

CONTENT:
${content}

PROMPTS:
${promptBundle}
        `,
      },
    ],
  });

  return JSON.parse(response.choices[0].message.content);
}

// -------------------------
// Post PR comment
// -------------------------
async function postComment(file, comment) {
  const url = `https://api.github.com/repos/${owner}/${name}/pulls/comments`;

  await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${githubToken}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github+json",
    },
    body: JSON.stringify({
      body: `🧠 AI Doc Review:\n\n${comment.message}\n\n💡 Suggestion:\n${comment.suggestion}`,
      commit_id: process.env.GITHUB_SHA,
      path: file,
      line: comment.line,
      side: "RIGHT",
    }),
  });
}

// -------------------------
// Main
// -------------------------
(async () => {
  const prompts = loadPrompts();
  const docs = loadDocs();

  if (!docs.length) {
    console.log("No AsciiDoc files changed.");
    return;
  }

  for (const file of docs) {
    console.log(`Reviewing: ${file}`);

    const result = await reviewFile(file, prompts);

    for (const c of result.comments || []) {
      await postComment(file, c);
    }
  }
})();