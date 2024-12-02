import { db } from "@/server/db";
import { Octokit } from "octokit";
import axios from "axios";
import { aiSummarizeCommit } from "./gemini";

// Precise type definition matching Octokit's actual commit structure
interface CommitResponse {
  hash: string;
  message: string;
  authorName: string;
  authorAvatarUrl: string;
  timestamp: string;
}

export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export const getCommitHash = async (
  githubUrl: string,
  limit: number = 15,
): Promise<CommitResponse[]> => {
  try {
    // Extract owner and repo from the URL
    const [owner, repo] = githubUrl.split("/").slice(-2);

    if (!owner || !repo) {
      throw new Error("Invalid GitHub URL");
    }

    const { data } = await octokit.rest.repos.listCommits({
      owner,
      repo,
    });

    const sortedCommits = [...data].sort(
      (a, b) =>
        new Date(b.commit.author?.date || "").getTime() -
        new Date(a.commit.author?.date || "").getTime(),
    );

    return sortedCommits.slice(0, limit).map((commit) => ({
      hash: commit.sha,
      message: commit.commit.message || "",
      authorName: commit.commit.author?.name || "",
      authorAvatarUrl: commit.author?.avatar_url || "",
      timestamp: commit.commit.author?.date || "",
    }));
  } catch (error) {
    console.error("Error fetching commits:", error);
    return [];
  }
};

/**
 * Polls the commits for a given project and processes unprocessed commits.
 *
 * @param projectId - The ID of the project to poll commits for.
 * @returns A promise that resolves to the created commits or undefined if there are no unprocessed commits.
 *
 * This function performs the following steps:
 * 1. Fetches the GitHub URL of the project using the project ID.
 * 2. Retrieves the commit hashes from the GitHub URL.
 * 3. Filters out the commits that have already been processed.
 * 4. Summarizes the unprocessed commits.
 * 5. Creates new commit records in the database with the summarized information.
 */
export const pollCommits = async (projectId: string) => {
  const { project, githubUrl } = await fetchProjectGithubUrl(projectId);

  const commitsHashes = await getCommitHash(githubUrl);

  const unprocessedCommits = await filterUnprocessedCommits(
    projectId,
    commitsHashes,
  );

  if (unprocessedCommits.length === 0) {
    return;
  }

  const summaryResponse = await Promise.allSettled(
    unprocessedCommits.map(async (commit) => {
      return summarizeCommit(githubUrl, commit.hash);
    }),
  );

  const summaries = summaryResponse.map((response) => {
    if (response.status === "fulfilled") {
      return response.value as string;
    }
    return "";
  });

  const commits = await db.commit.createMany({
    data: summaries.map((summary, index) => ({
      projectId: projectId,
      hash: unprocessedCommits[index]!.hash,
      message: unprocessedCommits[index]!.message,
      authorName: unprocessedCommits[index]!.authorName,
      authorAvatarUrl: unprocessedCommits[index]!.authorAvatarUrl,
      timestamp: unprocessedCommits[index]!.timestamp,
      summary,
    })),
  });

  return commits;
};

const summarizeCommit = async (githubUrl: string, commitHash: string) => {
  // get the diff, then pass the diff into ai
  const { data } = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
    headers: {
      Accept: "application/vnd.github.v3.diff",
    },
  });

  return (await aiSummarizeCommit(data)) || "";
};

export const fetchProjectGithubUrl = async (projectId: string) => {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { id: true, githubUrl: true },
  });

  if (!project || !project.githubUrl) {
    throw new Error("Project not found or missing GitHub URL");
  }

  return { project, githubUrl: project.githubUrl };
};

const filterUnprocessedCommits = async (
  projectId: string,
  commits: CommitResponse[],
) => {
  const processedCommits = await db.commit.findMany({
    where: { projectId },
    select: { hash: true },
  });

  const processedHashes = new Set(
    processedCommits.map((commit) => commit.hash),
  );

  return commits.filter((commit) => !processedHashes.has(commit.hash));
};

pollCommits;
