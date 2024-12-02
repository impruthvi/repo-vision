import { GoogleGenerativeAI } from "@google/generative-ai";

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = gemini.getGenerativeModel({
  model: "gemini-1.5-flash",
});

export const aiSummarizeCommit = async (diff: string): Promise<string> => {
  const promptTemplate = `
You are an expert programmer, and you are trying to summarize a git diff.

### Reminders about the git diff format:
1. Metadata:
  - For every file, there are metadata lines such as:
    \`\`\`
    diff --git a/lib/index.js b/lib/index.js
    index aadf691..bfef603 100644
    --- a/lib/index.js
    +++ b/lib/index.js
    \`\`\`
    - This example shows that 'lib/index.js' was modified in this commit.

2. Modifications:
  - A line starting with '+' means it was **added**.
  - A line starting with '-' means it was **deleted**.
  - Lines starting with neither '+' nor '-' are context lines for better understanding.

### Example Comments:
- Raised the amount of returned recordings from '10' to '100' [packages/server/recordings_api.ts], [packages/server/constants.ts]
- Fixed a typo in the GitHub action name [.github/workflows/gpt-commit-summarizer.yml]
- Moved the 'octokit' initialization to a separate file [src/octokit.ts], [src/index.ts]
- Added an OpenAI API for completions [packages/utils/apis/openai.ts]
- Lowered numeric tolerance for test files

### Important:
- Your response must always be in **bullet points**.
- Each bullet point should:
  - Start with a verb summarizing the change (e.g., "Added", "Fixed", "Refactored").
  - Include relevant file names in square brackets where possible.

### Task:
Please summarize the following diff in **bullet points**:

${diff}`;

  try {
    const response = await model.generateContent([promptTemplate]);
    return response.response.text();
} catch (error) {
    console.error("Error summarizing the commit diff:", error);
    throw new Error("Failed to generate a commit summary.");
  }
};
