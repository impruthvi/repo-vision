import { api } from "@/trpc/react";
import { useSelectedProject } from "./use-selected-project";

const useGetProjects = () => {
  const { projectId } = useSelectedProject();
  const { data: projects } = api.projects.getProjects.useQuery();

  const project = projects?.find((p) => p.id === projectId);

  return { projects, project };
};

export default useGetProjects;
