import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";

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
