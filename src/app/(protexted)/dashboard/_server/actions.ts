"use server";

import { streamText } from "ai";
import { createStreamableValue } from "ai/rsc";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateEmbedding } from "@/lib/gemini";
import { db } from "@/server/db";
const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const askQuestion = async (question: string, projectId: string) => {
  const stream = createStreamableValue();

  const queryVector = await generateEmbedding(question);

  const vectorQuery = `[${queryVector.join(",")}]`;

  const result = (await db.$queryRaw`
    SELECT "fileName", "sourceCode", "summary",
    1- ("summaryEmbedding" <=> ${vectorQuery}::vector) as similarity
    FROM "SourceCodeEmbedding"
    WHERE 1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) > .5
    AND "projectId" = ${projectId}
    ORDER BY similarity DESC
    LIMIT 10
    `) as {
    fileName: string;
    sourceCode: string;
    summery: string;
  }[];

  let context = "";

  for (const doc of result) {
    context += `source: ${doc.fileName}\ncode content: ${doc.sourceCode}\n summary of file: ${doc.summery}\n\n`;
    console.log(context);
    
  }
  (async () => {
    const { textStream } = await streamText({
      model: google("gemini-1.5-flash"),
      prompt: `You are an expert AI code assistant dedicated to providing comprehensive and precise answers about codebases.
    
    CORE ASSISTANT TRAITS:
    - Possess deep technical expertise
    - Communicate clearly and articulately
    - Provide detailed, actionable insights
    - Maintain a helpful and professional demeanor
    
    RESPONSE GUIDELINES:
    - When asked about code or specific files, deliver:
      1. Precise technical explanations
      2. Contextual understanding
      3. Potential implementation suggestions
      4. Best practices and considerations
    
    START CONTEXT BLOCK
    ${context}
    END OF CONTEXT BLOCK
    
    START QUESTION
    ${question}
    END OF QUESTION
    
    Please analyze the context and question, then provide a comprehensive, well-structured response that directly addresses the query with technical accuracy and clarity.`,
    });

    for await (const delta of textStream) {
      stream.update(delta);
    }

    stream.done();
  })();

  return {
    output: stream.value,
    filesReferences: result,
  };
};
