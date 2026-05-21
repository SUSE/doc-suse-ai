const fs = require('fs');
const path = require('path');

/**
 * Parses a diff to find the best block of added lines to anchor a suggestion.
 * It prefers larger blocks of text, assuming the introduction rewrite is more substantial than other minor changes like a title update.
 * @param {string} diffText - The full diff text for the pull request.
 * @param {string} filePath - The path of the file to search for within the diff.
 * @returns {{start: number, end: number}|null} An object with start and end line numbers for the best block.
 */
function findBestChangedBlock(diffText, filePath) {
  const lines = diffText.split('\n');
  let fileFound = false;
  let hunkStartLine = 0;
  let currentLineInFile = 0;
  let currentBlock = null;
  const allBlocks = [];

  for (const line of lines) {
    if (line.startsWith(`+++ b/${filePath}`)) {
      fileFound = true;
      continue;
    }
    if (line.startsWith('--- a/')) {
      if (fileFound) break;
      fileFound = false;
    }

    if (fileFound) {
      if (line.startsWith('@@')) {
        if (currentBlock) allBlocks.push(currentBlock);
        currentBlock = null;
        const match = line.match(/\+([0-9]+)/);
        hunkStartLine = match ? parseInt(match[1], 10) : 0;
        currentLineInFile = hunkStartLine;
      } else if (line.startsWith('+')) {
        if (!currentBlock) {
          currentBlock = { start: currentLineInFile, end: 0, lines: [] };
        }
        currentBlock.lines.push(line.substring(1));
        currentLineInFile++;
      } else if (!line.startsWith('-')) {
        if (currentBlock) {
          currentBlock.end = currentLineInFile - 1;
          allBlocks.push(currentBlock);
          currentBlock = null;
        }
        currentLineInFile++;
      }
    }
  }
  if (currentBlock) {
    currentBlock.end = currentLineInFile - 1;
    allBlocks.push(currentBlock);
  }

  if (allBlocks.length === 0) return null;
  if (allBlocks.length === 1) return { start: allBlocks[0].start, end: allBlocks[0].end };

  // Heuristic: Filter out blocks that are likely just title changes (single line starting with '=')
  // and then pick the block with the most characters, assuming it's the introduction.
  const filteredBlocks = allBlocks.filter(b => !(b.lines.length === 1 && b.lines[0].trim().startsWith('=')));
  const blocksToConsider = filteredBlocks.length > 0 ? filteredBlocks : allBlocks;

  blocksToConsider.sort((a, b) => b.lines.join('\n').length - a.lines.join('\n').length);
  const bestBlock = blocksToConsider[0];
  return { start: bestBlock.start, end: bestBlock.end };
}


async function run() {
  try {
    const core = await import('@actions/core');
    const github = await import('@actions/github');

    // Get inputs from environment variables
    const githubToken = process.env.GITHUB_TOKEN;
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const changedFiles = process.env.CHANGED_FILES.split(' ').filter(f => f);
    const pullRequestNumber = parseInt(process.env.PULL_REQUEST_NUMBER, 10);

    // Validate inputs
    if (!githubToken) {
      core.setFailed('GITHUB_TOKEN is not set.');
      return;
    }
    if (!geminiApiKey) {
      core.setFailed('GEMINI_API_KEY is not set. Please add it to your repository secrets.');
      return;
    }
    if (!pullRequestNumber) {
      core.setFailed('PULL_REQUEST_NUMBER is not set.');
      return;
    }

    if (changedFiles.length === 0) {
      console.log('No relevant files changed.');
      return;
    }

    const octokit = github.getOctokit(githubToken);
    const context = github.context;
    const separator = '---';

    const diff_response = await octokit.rest.pulls.get({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: pullRequestNumber,
      mediaType: {
        format: 'diff',
      },
    });
    const diff_text = diff_response.data;

    const instructionsPrompt = fs.readFileSync('ai-prompts/SUSE Style Guide/_INSTRUCTIONS.prompt', 'utf8');

    const agentPromptsDir = 'ai-prompts/SUSE Style Guide/';
    let allAgentPrompts = '';
    try {
      const allowedExtensions = ['.md', '.agent', '.prompt'];
      const agentFiles = fs.readdirSync(agentPromptsDir)
        .filter(f => allowedExtensions.some(ext => f.endsWith(ext)) && f !== '_INSTRUCTIONS.prompt');

      if (agentFiles.length > 0) {
        console.log(`Found agent prompts: ${agentFiles.join(', ')}`);
        for (const agentFile of agentFiles) {
          const agentFilePath = path.join(agentPromptsDir, agentFile);
          const agentContent = fs.readFileSync(agentFilePath, 'utf8');
          allAgentPrompts += `\n${separator}\nAGENT PROMPT: ${agentFile}\n${separator}\n${agentContent}`;
        }
      }
    } catch (error) {
      console.error(`Error loading agent prompts from ${agentPromptsDir}: ${error.message}`);
    }

    let reviewBody = `### 🤖 AI Content Review\n\nThis review is automatically generated based on the workflow in \`ai-prompts/SUSE Style Guide/_INSTRUCTIONS.prompt\`.\n\n`;
    let reviewComments = [];

    for (const file of changedFiles) {
      console.log(`Analyzing ${file}...`);
      const fileContent = fs.readFileSync(file, 'utf8');

      const finalPrompt = `${instructionsPrompt}${allAgentPrompts}\n${separator}\nFILE TO ANALYZE: ${file}\n${separator}\nFILE CONTENT:\n${fileContent}\n${separator}\nNow, acting as the specified agent(s), please analyze the file content. Synthesize the goals from all agent prompts into a single, coherent review. Your entire response MUST be a single, valid JSON object that strictly adheres to the 'Output Contract' defined in the instructions. Do not include any text, notes, or markdown formatting outside of the JSON object.`;

      let aiResponse;
      try {
        // Using 'gemini-1.5-flash' as it is a known valid and powerful model.
        // The model name 'gemini-2.5-flash' is not a valid Google AI model and will cause an error.
        const model = 'gemini-2.5-flash';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`;
        const options = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: finalPrompt }] }] })
        };

        let response;
        const maxRetries = 3;
        let delay = 2000; // 2 seconds

        for (let i = 0; i < maxRetries; i++) {
          response = await fetch(url, options);
          // If the status is not a transient server error (5xx), break the loop.
          if (response.status < 500 || response.status >= 600) {
            break;
          }
          if (i < maxRetries - 1) {
            console.log(`API returned ${response.status}. Retrying in ${delay / 1000}s... (Attempt ${i + 1}/${maxRetries})`);
            await new Promise(res => setTimeout(res, delay));
            delay *= 2; // Exponential backoff
          } else {
            console.log(`API still returning server errors after ${maxRetries} attempts.`);
          }
        }

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`API call failed with status ${response.status}: ${errorBody}`);
        }

        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        aiResponse = responseText || '*AI analysis completed, but the response was empty or in an unexpected format.*';
        if (!responseText) console.log('Unexpected AI response format:', JSON.stringify(data, null, 2));

      } catch (error) {
        console.error('Error calling AI service:', error);
        aiResponse = `*Error during AI analysis for \`${file}\`: ${error.message}*`;
      }

      let analysisPart;
      try {
        // Clean the response to ensure it's valid JSON, removing markdown code fences if present.
        const cleanedResponse = aiResponse.replace(/^```(json)?\s*/, '').replace(/```\s*$/, '').trim();
        const aiData = JSON.parse(cleanedResponse);

        // Reconstruct the analysis part of the review from the structured data.
        analysisPart = `**Summary**: ${aiData.analysis.summary}\n\n**Details**:\n- ${aiData.analysis.details.join('\n- ')}`;

        const rewrite = aiData.rewrite;
        const changedBlock = findBestChangedBlock(diff_text, file);

        if (rewrite && rewrite.code && changedBlock) {
          console.log('Conditions met. Creating suggestion comment.');
          reviewComments.push({
            path: file,
            side: 'RIGHT',
            start_line: changedBlock.start,
            line: changedBlock.end,
            body: `**🤖 AI Suggestion: ${rewrite.reason}**\n\n\`\`\`suggestion\n${rewrite.code}\n\`\`\``
          });
        } else if (rewrite && rewrite.code) {
          console.log(`Could not find a changed block for file ${file} to anchor the suggestion.`);
        }

      } catch (error) {
        console.error(`Error parsing AI response as JSON for file ${file}:`, error);
        console.log('Raw AI Response:', aiResponse);
        // If JSON parsing fails, post the raw response for debugging.
        analysisPart = `**Error Parsing AI Response**\n\nThe AI returned data that could not be parsed as JSON. Please see the raw output below for debugging.\n\n${separator}\n\n${aiResponse}`;
      }

      reviewBody += `${separator}\n\n#### Review for \`${file}\`\n\n${analysisPart}\n\n`;
    }

    await octokit.rest.pulls.createReview({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: pullRequestNumber,
      body: reviewBody,
      event: 'COMMENT',
      comments: reviewComments,
    });

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();