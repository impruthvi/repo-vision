import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { Document } from "@langchain/core/documents";
import { aiSummarizeCode, generateEmbedding } from "./gemini";
import { db } from "@/server/db";

export const loadGithubRepo = async (
  githubUrl: string,
  accessToken?: string,
) => {
  const loader = new GithubRepoLoader(githubUrl, {
    accessToken: accessToken || "",
    branch: "main",
    ignoreFiles: [
      "package.json",
      "package-lock.json",
      "composer.json",
      "composer.lock",
      "yarn.lock",
      "pnpm-lock.yaml",
      "bun.lockb",
    ],
    recursive: true,
    unknown: "warn",
    maxConcurrency: 5,
  });

  const docs = await loader.load();

  return docs;
};

export const indexGithubRepo = async (
  projectId: string,
  githubUrl: string,
  githubToken?: string,
): Promise<void> => {
  if (!projectId || !githubUrl) {
    throw new Error("Both projectId and githubUrl are required.");
  }

  try {
    // Load and process the repository
    const docs = await loadGithubRepo(githubUrl, githubToken);

    if (!docs || docs.length === 0) {
      throw new Error("No documents retrieved from the repository.");
    }

    const allEmbeddings = await generateEmbeddings(docs);

    // Use transaction to ensure atomicity
    const results = await Promise.allSettled(
      allEmbeddings.map(async (embedding, index) => {
        if (!embedding) return;

        const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
          data: {
            projectId,
            sourceCode: embedding.sourceCode,
            fileName: embedding.fileName,
            summary: embedding.summary,
          },
        });

        await db.$executeRaw`UPDATE "SourceCodeEmbedding" SET "summaryEmbedding" = ${embedding.embedding}::vector WHERE "id" = ${sourceCodeEmbedding.id}`;
      }),
    );

    // Log errors for debugging purposes
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(`Error processing embedding ${index}:`, result.reason);
      }
    });

    console.log("Repository indexed successfully.");
  } catch (error) {
    console.error("Failed to index GitHub repository:", error);
    throw error;
  }
};

export const generateEmbeddings = async (docs: Document[]) => {
  const allEmbedding = await Promise.all(
    docs.map(async (doc) => {
      const summary = await aiSummarizeCode(doc);
      const embedding = await generateEmbedding(summary);

      return {
        summary,
        embedding,
        sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
        fileName: doc.metadata.source,
      };
    }),
  );

  return allEmbedding;
};
