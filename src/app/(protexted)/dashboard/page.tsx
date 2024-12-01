"use client";

import useGetProjects from "@/hooks/use-get-projects";
import { ExternalLinkIcon, GithubIcon } from "lucide-react";
import Link from "next/link";

const Dashboard = () => {
  const { project } = useGetProjects();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-y-4">
        {/* Github Link */}
        <div className="bg-primary w-fit rounded-md px-4 py-3">
          <div className="flex items-center">
            <GithubIcon className="size-5 text-white" />
            <div className="ml-2">
              <p className="text-sm font-medium text-white">
                This project is linked to{" "}
                <Link
                  href={project?.githubUrl ?? "#"}
                  className="inline-flex items-center text-white/80 hover:underline"
                >
                  {project?.githubUrl ?? "GitHub"}
                  <ExternalLinkIcon className="ml-1 size-4" />
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4">
          Team Member Invite Button Archive Button
        </div>
      </div>

      <div className="mt-4">
        <div className="fap-4 grid grid-cols-4 sm:grid-cols-5">
          Ask a Question Card Meeting Card
        </div>
      </div>

      <div className="mt-8">Commit Logs</div>
    </div>
  );
};

export default Dashboard;
