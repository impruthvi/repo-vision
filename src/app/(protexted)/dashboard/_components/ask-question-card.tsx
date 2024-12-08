"use client";

import { useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import Image from "next/image";

import useGetProjects from "@/hooks/use-get-projects";
import { askQuestion } from "../_server/actions";
import { readStreamableValue } from "ai/rsc";
import { api } from "@/trpc/react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import CodeReference from "./code-references";
import { Loader2, Save, X } from "lucide-react";

// Form Validation Schema
const formSchema = z.object({
  question: z
    .string()
    .min(10, {
      message: "Question must be at least 10 characters long",
    })
    .max(500, {
      message: "Question must be less than 500 characters",
    }),
});

type FormInputProps = z.infer<typeof formSchema>;

interface FileReference {
  fileName: string;
  sourceCode: string;
  summery: string;
}

const AskQuestionCard = () => {
  // State Management
  const { project } = useGetProjects();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileReferences, setFileReferences] = useState<FileReference[]>([]);
  const [answer, setAnswer] = useState("");

  // API Mutation
  const saveAnswer = api.projects.saveAnswer.useMutation();

  // Form Handling
  const form = useForm<FormInputProps>({
    resolver: zodResolver(formSchema),
    defaultValues: { question: "" },
  });

  // Submit Question Handler
  const onSubmit = async (data: FormInputProps) => {
    // Reset previous state
    setAnswer("");
    setFileReferences([]);

    if (!project) {
      toast.error("No project selected");
      return;
    }

    setLoading(true);

    try {
      const { filesReferences, output } = await askQuestion(
        data.question,
        project.id,
      );

      setOpen(true);
      setFileReferences(filesReferences);

      // Stream answer
      for await (const delta of readStreamableValue(output)) {
        if (delta) {
          setAnswer((prev) => prev + delta);
        }
      }
    } catch (error) {
      toast.error("Failed to get answer");
    } finally {
      setLoading(false);
    }
  };

  // Save Answer Handler
  const onAnswerSave = async () => {
    if (!project) return;

    saveAnswer.mutate(
      {
        projectId: project.id,
        question: form.getValues("question"),
        answer,
        fileReference: fileReferences,
      },
      {
        onSuccess: () => {
          toast.success("Answer saved successfully");
          setOpen(false);
          form.reset();
        },
        onError: (err) => {
          toast.error(err.message || "Failed to save answer");
        },
      },
    );
  };

  return (
    <>
      {/* Answer Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[95vh] w-full overflow-y-auto sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw]">
          <DialogHeader className="space-y-2">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-2">
                <Image
                  src="/logo.svg"
                  alt="repo-vision"
                  width={40}
                  height={40}
                  className="shrink-0"
                />
                <DialogTitle className="text-xl">Project Insight</DialogTitle>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={onAnswerSave}
                  disabled={saveAnswer.isPending || !answer}
                  className="w-full sm:w-auto"
                >
                  {saveAnswer.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Answer
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setOpen(false);
                    setAnswer("");
                  }}
                  className="w-full sm:w-auto"
                >
                  <X className="mr-2 h-4 w-4" />
                  Close
                </Button>
              </div>
            </div>
            <DialogDescription className="text-muted-foreground">
              {project?.name || "Project Details"}
            </DialogDescription>
          </DialogHeader>

          {/* Answer Content */}
          <div className="space-y-4">
            <div
              data-color-mode="light"
              className="rounded-lg border bg-gray-50 p-4"
            >
              <MDEditor.Markdown
                source={answer}
                className="prose prose-sm max-h-[50vh] overflow-y-auto"
              />
            </div>

            {/* Code References */}
            {fileReferences.length > 0 && (
              <CodeReference
                fileReferences={fileReferences}
                className="max-h-[40vh]"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Question Input Card */}
      <Card className="col-span-3 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Ask Project Vision</CardTitle>
          <p className="text-sm text-muted-foreground">
            Get insights about your project's structure and files
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Which file should I edit to change the home page?"
                        className="min-h-[120px] resize-y"
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-destructive" />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Ask Project Vision"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
};

export default AskQuestionCard;
