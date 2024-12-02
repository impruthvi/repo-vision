import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { pollCommits } from "@/lib/github";

export const projectRouter = createTRPCRouter({
  createProject: protectedProcedure
    .input(
      z.object({
        repoUrl: z.string(),
        projectName: z.string(),
        githubToken: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { repoUrl, projectName, githubToken } = input;

      // do something with the input
      const project = await ctx.db.project.create({
        data: {
          githubUrl: repoUrl,
          name: projectName,
          UserToProjects: {
            create: {
              userId: ctx.user.userId!,
            },
          },
        },
      });

      await pollCommits(project.id);

      return project;
    }),
  getProjects: protectedProcedure.query(async ({ ctx }) => {
    const projects = await ctx.db.project.findMany({
      where: {
        UserToProjects: {
          some: {
            userId: ctx.user.userId!,
          },
        },
        deletedAt: null,
      },
    });

    return projects;
  }),
  getCommits: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { projectId } = input;

      const commits = await ctx.db.commit.findMany({
        where: {
          projectId,
        },
      });

      pollCommits(projectId).then().catch(console.error);

      return commits;
    }),
});
