const fs = require("fs");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("The GEMINI_API_KEY environment variable is not set. Please add it to your repository secrets.");
}
const genAI = new GoogleGenerativeAI(apiKey);

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

  const systemPrompt = `You are a professional documentation reviewer.
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
}`;

  const userPrompt = `
FILE: ${file}

CONTENT:
${content}

PROMPTS:
${promptBundle}
        `;

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-pro",
    systemInstruction: systemPrompt,
  });

  const generationConfig = {
    temperature: 0,
    responseMimeType: "application/json",
  };

  const result = await model.generateContent(userPrompt, generationConfig);
  const response = result.response;
  const responseText = response.text();

  try {
    return JSON.parse(responseText);
  } catch (err) {
    throw new Error(
      `Failed to parse model response as JSON for ${file}: ${String(err)}\n\nRaw response:\n${responseText}`
    );
  }
}

// -------------------------
// Post PR issue comment
// -------------------------
async function postIssueComment(body) {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  const event = eventPath ? JSON.parse(fs.readFileSync(eventPath, "utf-8")) : {};
  const pullNumber = event.pull_request?.number;
  if (!pullNumber) throw new Error("Missing pull_request.number in GitHub event payload.");

  const url = `https://api.github.com/repos/${owner}/${name}/issues/${pullNumber}/comments`;
  await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${githubToken}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github+json",
    },
    body: JSON.stringify({ body }),
  });
}

// -------------------------
// Main
// -------------------------
(async () => {
  const prompts = loadPrompts();
  const docs = loadDocs();
  const allComments = [];

  if (!docs.length) {
    console.log("No AsciiDoc files changed.");
    return;
  }

  for (const file of docs) {
    console.log(`Reviewing: ${file}`);

    const result = await reviewFile(file, prompts);

    for (const c of result.comments || []) {
      allComments.push({ file, ...c });
    }
  }

  if (allComments.length > 0) {
    const commentsAsMarkdown = allComments
      .map(
        (c) => `**File:** \`${c.file}\`
**Line:** ${c.line}

**Message:** ${c.message}

**Suggestion:**
\`\`\`suggestion
${c.suggestion}
\`\`\``
      )
      .join("\n\n---\n\n");

    const commentBody = `## 🧠 AI Documentation Review

I've reviewed the documentation changes and have the following suggestions:

---

${commentsAsMarkdown}`;

    await postIssueComment(commentBody);
  }
})();