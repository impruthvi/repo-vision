"use client";

import { useState } from "react";
import MDEditor from "@uiw/react-md-editor";

import useGetProjects from "@/hooks/use-get-projects";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { askQuestion } from "../_server/actions";
import { readStreamableValue } from "ai/rsc";

const formSchema = z.object({
  question: z.string().min(1, { message: "Question is required" }),
});

type FormInputProps = z.infer<typeof formSchema>;

const AskQuestionCard = () => {
  const { project } = useGetProjects();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [fileReferences, setFileReferences] = useState<
    {
      fileName: string;
      sourceCode: string;
      summery: string;
    }[]
  >([]);
  const [answer, setAnswer] = useState("");

  const form = useForm<FormInputProps>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: "",
    },
  });

  const onSubmit = async (data: FormInputProps) => {
    setAnswer("");
    setFileReferences([]);
    if (!project) return;
    console.log(data);
    setLoading(true);

    const { filesReferences, output } = await askQuestion(
      data.question,
      project.id,
    );

    setOpen(true);

    setFileReferences(filesReferences);

    for await (const delta of readStreamableValue(output)) {
      if (delta) {
        setAnswer((ans) => ans + delta);
      }
    }

    setLoading(false);
  };
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[70vw]">
          <DialogHeader>
            <DialogTitle>
              <Image src="/logo.svg" alt="repo-vision" width={40} height={40} />
            </DialogTitle>
          </DialogHeader>
          <div className="" data-color-mode="light">
            <MDEditor.Markdown
              source={answer}
              className="h-full max-h-[40vh] max-w-[70vw] overflow-y-auto"
            />
          </div>
          {/* Close Button */}
          <Button
            onClick={() => {
              setOpen(false);
              setAnswer("");
            }}
            className="mt-4"
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>
      <Card className="relative col-span-3">
        <CardHeader>
          <CardTitle>Ask a question</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Witch file should I edit ti change tge hone page?"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="mt-4" disabled={loading}>
                Ask Repo Vision
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
};

export default AskQuestionCard;
