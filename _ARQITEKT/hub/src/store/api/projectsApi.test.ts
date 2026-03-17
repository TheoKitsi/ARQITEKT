import {
  projectsApi,
  useGetProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useImportProjectMutation,
  useUpdateProjectMetaMutation,
  useRenameProjectMutation,
  useGetRegistryQuery,
  useUpdateRegistryEntryMutation,
} from './projectsApi';

describe('projectsApi', () => {
  it('has expected endpoints defined', () => {
    const endpoints = projectsApi.endpoints;
    expect(endpoints.getProjects).toBeDefined();
    expect(endpoints.getProject).toBeDefined();
    expect(endpoints.createProject).toBeDefined();
    expect(endpoints.deleteProject).toBeDefined();
    expect(endpoints.importProject).toBeDefined();
    expect(endpoints.updateProjectMeta).toBeDefined();
    expect(endpoints.renameProject).toBeDefined();
    expect(endpoints.getRegistry).toBeDefined();
    expect(endpoints.updateRegistryEntry).toBeDefined();
  });

  it('exports generated hooks', () => {
    expect(useGetProjectsQuery).toBeDefined();
    expect(useGetProjectQuery).toBeDefined();
    expect(useCreateProjectMutation).toBeDefined();
    expect(useDeleteProjectMutation).toBeDefined();
    expect(useImportProjectMutation).toBeDefined();
    expect(useUpdateProjectMetaMutation).toBeDefined();
    expect(useRenameProjectMutation).toBeDefined();
    expect(useGetRegistryQuery).toBeDefined();
    expect(useUpdateRegistryEntryMutation).toBeDefined();
  });

  it('exports hooks as functions', () => {
    expect(typeof useGetProjectsQuery).toBe('function');
    expect(typeof useCreateProjectMutation).toBe('function');
    expect(typeof useGetRegistryQuery).toBe('function');
  });

  it('uses the base api with correct reducer path', () => {
    expect(projectsApi.reducerPath).toBe('api');
  });
});
