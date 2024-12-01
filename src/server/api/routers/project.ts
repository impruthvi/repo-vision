import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

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
});
