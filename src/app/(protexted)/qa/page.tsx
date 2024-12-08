"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useSelectedProject } from "@/hooks/use-selected-project";
import { api } from "@/trpc/react";
import MDEditor from "@uiw/react-md-editor";
import React, { useState } from "react";
import CodeReference from "../dashboard/_components/code-references";
import AskQuestionCard from "../dashboard/_components/ask-question-card";

type Props = {};

const Qa = (props: Props) => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const { projectId } = useSelectedProject();
  if (!projectId) return null;

  const { data: questions } = api.projects.getQuestions.useQuery(
    {
      projectId,
    },
    {
      enabled: !!projectId,
      placeholderData: [],
    },
  );

  const question = questions?.[questionIndex];

  return (
    <Sheet>
      <AskQuestionCard />
      <div className="h-4"></div>
      <div className="text-cl font-semibold">Saved Questions</div>
      <div className="h-2"></div>
      <div className="flex flex-col gap-2">
        {questions?.map((question, index) => (
          <React.Fragment key={question.id}>
            <SheetTrigger onClick={() => setQuestionIndex(index)}>
              <div className="flex items-center gap-4 rounded-lg border bg-white p-4 shadow">
                <img
                  src={question.user.imageUrl!}
                  alt="user-profile"
                  className="rounded-md"
                  height={30}
                  width={30}
                />
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-2">
                    <p className="line-clamp-1 text-lg font-medium text-gray-700">
                      {question.question}
                    </p>
                    <span className="whitespace-nowrap text-xs text-gray-400">
                      {question.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  <p className="line-clamp-1 text-sm text-gray-500">
                    {question.answer}
                  </p>
                </div>
              </div>
            </SheetTrigger>
          </React.Fragment>
        ))}
      </div>

      {question && (
        <SheetContent className="sm:max-w-[80vw]">
          <SheetHeader>
            <SheetTitle>{question.question}</SheetTitle>
            <div
              data-color-mode="light"
              className="rounded-lg border bg-gray-50 p-4"
            >
              <MDEditor.Markdown
                source={question.answer}
                className="prose prose-sm max-h-[50vh] overflow-y-auto"
              />
            </div>
            <CodeReference
              fileReferences={question.fileReference ?? ([] as any)}
              className="max-h-[40vh]"
            />
          </SheetHeader>
        </SheetContent>
      )}
    </Sheet>
  );
};

export default Qa;
