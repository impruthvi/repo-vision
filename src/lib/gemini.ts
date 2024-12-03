import { GoogleGenerativeAI } from "@google/generative-ai";
import { Document } from "@langchain/core/documents";

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

export const aiSummarizeCode = async (doc: Document) => {
  const code = doc.pageContent.slice(0, 1000); // Limit to 1000 characters
  const prompt = [
    `You are an experienced senior software engineer specializing in onboarding junior engineers to new codebases.`,
    `Your task is to explain the purpose and functionality of the following code snippet from the file "${doc.metadata.source}" to a junior engineer in simple terms.`,
    `Here is the code snippet:
    ---
    ${code}
    ---
    Provide a concise summary (no more than 100 words) explaining what the code does and its purpose in the context of the codebase. Focus on clarity and simplicity.`,
  ];

  try {
    const response = await model.generateContent(prompt);
    return response.response.text();
  } catch (error) {
    console.error("Error summarizing the code snippet:", error);
    throw new Error("Failed to generate a code summary.");
  }
};

export const generateEmbedding = async (summery: string) => {
  const model = gemini.getGenerativeModel({
    model: "text-embedding-004",
  });
  const result = await model.embedContent(summery);
  const embedding = result.embedding;
  return embedding.values;
};
