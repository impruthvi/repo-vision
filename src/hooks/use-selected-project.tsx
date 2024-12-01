import { useQueryState, parseAsString } from "nuqs";

export const useSelectedProject = () => {
  const [projectId, setProjectId] = useQueryState("projectId", parseAsString);

  return {
    projectId,
    setProjectId,
  };
};
