"use client";

import { useState } from "react";

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

const formSchema = z.object({
  question: z.string().min(1, { message: "Question is required" }),
});

type FormInputProps = z.infer<typeof formSchema>;

const AskQuestionCard = () => {
  const { project } = useGetProjects();
  const [question, setQuestion] = useState("");

  const form = useForm<FormInputProps>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: "",
    },
  });

  const onSubmit = (data: FormInputProps) => {
    console.log(data);
  };
  return (
    <>
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
              <Button type="submit" className="mt-4">
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
