"use client";

import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { api } from "@/trpc/react";
import useRefetch from "@/hooks/use-refetch";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  repoUrl: z.string().url({ message: "Please enter a valid URL" }),
  projectName: z.string().min(1, { message: "Project name is required" }),
  githubToken: z.string().optional(),
});

type FormInputProps = z.infer<typeof formSchema>;

const CreatePage = () => {
  const form = useForm<FormInputProps>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      repoUrl: "",
      projectName: "",
      githubToken: "",
    },
  });

  const { mutate, isPending } = api.projects.createProject.useMutation();
  const refetch = useRefetch();

  const onSubmit = (data: FormInputProps) => {
    mutate(
      {
        repoUrl: data.repoUrl,
        projectName: data.projectName,
        githubToken: data.githubToken,
      },
      {
        onSuccess: () => {
          toast.success("Project created successfully");
          refetch();
          form.reset();
        },
        onError: (error) => {
          toast.error(
            error.message || "Failed to create project. Please try again.",
          );
        },
      },
    );
  };

  return (
    <div className="flex h-full items-center justify-center gap-12">
      <img
        src="/undraw_github.png"
        alt="undraw_github"
        className="h-56 w-auto"
      />
      <div className="w-full max-w-md">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Link Github Repository</h1>
          <p className="text-muted-foreground text-sm">
            Enter the URL of the repository you want to link.
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="projectName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Project Name"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="repoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Github Repository URL"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="githubToken"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Github Token (Optional)"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Project...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreatePage;
