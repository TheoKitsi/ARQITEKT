import { baseApi } from './baseApi';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type LifecycleStage = 'planning' | 'ready' | 'building' | 'built' | 'running' | 'deployed';

export interface ProjectBranding {
  primaryColor?: string;
  secondaryColor?: string;
  logo?: string;
  mode?: string;
}

export interface ProjectConfig {
  name: string;
  codename: string;
  description?: string;
  lifecycle: LifecycleStage;
  github?: string;
  url?: string;
  tags?: string[];
  branding?: ProjectBranding;
}

export interface ProjectStats {
  bc: number; sol: number; us: number; cmp: number; fn: number;
  inf: number; adr: number; ntf: number; conv: number; fbk: number;
}

export interface ProjectReadiness {
  authored: number;
  approved: number;
}

export interface Project {
  id: string;
  path: string;
  config: ProjectConfig;
  stats: ProjectStats;
  readiness: ProjectReadiness;
}

export interface ImportProjectRequest {
  path: string;
  name?: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  template?: string;
}

export interface RenameProjectRequest {
  id: string;
  name: string;
}

export interface UpdateProjectMetaRequest {
  id: string;
  config: Partial<ProjectConfig>;
}

export interface RegistryEntry {
  id: string;
  name: string;
  codename: string;
  mode: 'local' | 'external';
  path: string;
  github?: string;
  description?: string;
}

export interface RegistryResponse {
  projects: RegistryEntry[];
}

export interface UpdateRegistryEntryRequest {
  id: string;
  updates: Partial<Omit<RegistryEntry, 'id'>>;
}

export type ProjectRole = 'owner' | 'editor' | 'viewer';

export interface ProjectMember {
  userId: string;
  username: string;
  role: ProjectRole;
  addedAt: string;
}

export interface AddMemberRequest {
  projectId: string;
  userId: string;
  username: string;
  role: ProjectRole;
}

export interface UpdateMemberRoleRequest {
  projectId: string;
  userId: string;
  role: ProjectRole;
}

export interface RemoveMemberRequest {
  projectId: string;
  userId: string;
}

export interface ProjectInvite {
  token: string;
  projectId: string;
  role: ProjectRole;
  createdBy: string;
  createdAt: string;
  expiresAt: string;
}

export interface CreateInviteRequest {
  projectId: string;
  role: ProjectRole;
}

/* ------------------------------------------------------------------ */
/*  API                                                                */
/* ------------------------------------------------------------------ */

export const projectsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProjects: builder.query<Project[], void>({
      query: () => '/projects',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Project' as const, id })),
              { type: 'Project', id: 'LIST' },
            ]
          : [{ type: 'Project', id: 'LIST' }],
    }),

    getProject: builder.query<Project, string>({
      query: (id) => `/projects/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Project', id }],
    }),

    createProject: builder.mutation<Project, CreateProjectRequest>({
      query: (body) => ({
        url: '/projects',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Project', id: 'LIST' }],
    }),

    deleteProject: builder.mutation<void, string>({
      query: (id) => ({
        url: `/projects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Project', id },
        { type: 'Project', id: 'LIST' },
      ],
    }),

    importProject: builder.mutation<Project, ImportProjectRequest>({
      query: (body) => ({
        url: '/projects/import',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Project', id: 'LIST' }],
    }),

    updateProjectMeta: builder.mutation<Project, UpdateProjectMetaRequest>({
      query: ({ id, config }) => ({
        url: `/projects/${id}/meta`,
        method: 'PUT',
        body: config,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Project', id }],
    }),

    renameProject: builder.mutation<Project, RenameProjectRequest>({
      query: ({ id, name }) => ({
        url: `/projects/${id}/rename`,
        method: 'PUT',
        body: { name },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Project', id },
        { type: 'Project', id: 'LIST' },
      ],
    }),

    /* ---- Registry endpoints ---- */

    getRegistry: builder.query<RegistryResponse, void>({
      query: () => '/projects/registry',
      providesTags: ['Registry'],
    }),

    updateRegistryEntry: builder.mutation<RegistryEntry, UpdateRegistryEntryRequest>({
      query: ({ id, updates }) => ({
        url: `/projects/registry/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['Registry', { type: 'Project', id: 'LIST' }],
    }),

    /* ---- Member management ---- */

    getMembers: builder.query<{ members: ProjectMember[] }, string>({
      query: (projectId) => `/projects/${projectId}/members`,
      providesTags: (_result, _error, projectId) => [{ type: 'Project', id: `${projectId}-members` }],
    }),

    addMember: builder.mutation<ProjectMember, AddMemberRequest>({
      query: ({ projectId, ...body }) => ({
        url: `/projects/${projectId}/members`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { projectId }) => [{ type: 'Project', id: `${projectId}-members` }],
    }),

    updateMemberRole: builder.mutation<ProjectMember, UpdateMemberRoleRequest>({
      query: ({ projectId, userId, role }) => ({
        url: `/projects/${projectId}/members/${userId}`,
        method: 'PUT',
        body: { role },
      }),
      invalidatesTags: (_result, _error, { projectId }) => [{ type: 'Project', id: `${projectId}-members` }],
    }),

    removeMember: builder.mutation<void, RemoveMemberRequest>({
      query: ({ projectId, userId }) => ({
        url: `/projects/${projectId}/members/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { projectId }) => [{ type: 'Project', id: `${projectId}-members` }],
    }),

    /* ---- Invitations ---- */

    getInvites: builder.query<{ invites: ProjectInvite[] }, string>({
      query: (projectId) => `/projects/${projectId}/invites`,
      providesTags: (_result, _error, projectId) => [{ type: 'Project', id: `${projectId}-invites` }],
    }),

    createInvite: builder.mutation<ProjectInvite, CreateInviteRequest>({
      query: ({ projectId, role }) => ({
        url: `/projects/${projectId}/invites`,
        method: 'POST',
        body: { role },
      }),
      invalidatesTags: (_result, _error, { projectId }) => [{ type: 'Project', id: `${projectId}-invites` }],
    }),

    revokeInvite: builder.mutation<void, { projectId: string; token: string }>({
      query: ({ projectId, token }) => ({
        url: `/projects/${projectId}/invites/${token}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { projectId }) => [{ type: 'Project', id: `${projectId}-invites` }],
    }),

    acceptInvite: builder.mutation<{ projectId: string; role: ProjectRole }, { token: string }>({
      query: (body) => ({
        url: '/projects/invite/accept',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Project', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useImportProjectMutation,
  useUpdateProjectMetaMutation,
  useRenameProjectMutation,
  useGetRegistryQuery,
  useUpdateRegistryEntryMutation,
  useGetMembersQuery,
  useAddMemberMutation,
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation,
} = projectsApi;
