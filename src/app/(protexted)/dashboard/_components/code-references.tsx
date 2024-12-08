"use client";
import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { lucario } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface FileReference {
  fileName: string;
  sourceCode: string;
  summery: string;
}

interface CodeReferenceProps {
  fileReferences: FileReference[];
  defaultTab?: string;
  className?: string;
  maxHeight?: string; // Allow custom max height
}

const CodeReference: React.FC<CodeReferenceProps> = ({
  fileReferences,
  defaultTab,
  className,
  maxHeight = "max-h-[50vh]", // Default max height with option to override
}) => {
  // Handle empty array case
  if (fileReferences.length === 0) {
    return null;
  }

  // Use defaultTab if provided, otherwise use first file's name
  const [activeTab, setActiveTab] = useState(
    defaultTab || fileReferences[0]?.fileName,
  );

  return (
    <div
      className={cn(
        "w-full",
        "max-w-full",
        "rounded-lg",
        "border",
        "border-gray-200",
        "shadow-sm",
        "overflow-hidden",
        className,
      )}
    >
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        orientation="horizontal"
        className="w-full"
      >
        {/* Responsive Tab Navigation */}
        <TabsList
          className={cn(
            "flex",
            "w-full",
            "overflow-x-auto",
            "bg-gray-100",
            "p-1",
            "md:px-2",
            "lg:px-4",
            "space-x-1",
            "md:space-x-2",
          )}
        >
          {fileReferences.map((file) => (
            <TabsTrigger
              key={file.fileName}
              value={file.fileName}
              className={cn(
                "flex-1",
                "whitespace-nowrap",
                "rounded-md",
                "px-2",
                "py-1.5",
                "text-xs",
                "md:text-sm",
                "font-medium",
                "text-muted-foreground",
                "transition-colors",
                "hover:bg-gray-200",
                "data-[state=active]:bg-primary",
                "data-[state=active]:text-primary-foreground",
              )}
            >
              {file.fileName}
            </TabsTrigger>
          ))}
        </TabsList>

        {fileReferences.map((file) => (
          <TabsContent
            key={file.fileName}
            value={file.fileName}
            className={cn(
              "w-full",
              "p-2",
              "md:p-4",
              "space-y-2",
              maxHeight,
              "overflow-auto",
            )}
          >
            {/* Optional Summary with Responsive Typography */}
            {file.summery && (
              <div
                className={cn(
                  "text-xs",
                  "md:text-sm",
                  "text-muted-foreground",
                  "bg-gray-50",
                  "p-2",
                  "rounded-md",
                  "border",
                  "border-gray-100",
                )}
              >
                {file.summery}
              </div>
            )}

            {/* Syntax Highlighter with Responsive Sizing */}
            <div className="w-full overflow-x-auto">
              <SyntaxHighlighter
                language="typescript"
                style={lucario}
                showLineNumbers
                wrapLines
                customStyle={{
                  margin: 0,
                  borderRadius: "0.375rem",
                  fontSize: "0.75rem", // Small text for code
                  overflowX: "auto",
                  width: "100%",
                }}
                codeTagProps={{
                  className: "text-xs md:text-sm",
                }}
              >
                {file.sourceCode}
              </SyntaxHighlighter>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default CodeReference;
