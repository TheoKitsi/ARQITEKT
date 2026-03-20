import { baseApi } from './baseApi';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface FileEntry {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  modifiedAt?: string;
  children?: FileEntry[];
}

export interface FileContent {
  path: string;
  content: string;
  language?: string;
  size: number;
}

export interface WriteFileRequest {
  projectId: string;
  path: string;
  content: string;
}

export interface WriteFileResult {
  success: boolean;
  path: string;
  size: number;
}

/* ------------------------------------------------------------------ */
/*  API                                                                */
/* ------------------------------------------------------------------ */

const filesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listFiles: builder.query<FileEntry[], string>({
      query: (projectId) => `/projects/${projectId}/files`,
      providesTags: (_result, _error, projectId) => [
        { type: 'Project', id: `${projectId}-files` },
      ],
    }),

    readFile: builder.query<FileContent, { projectId: string; path: string }>({
      query: ({ projectId, path }) =>
        `/projects/${projectId}/files/read?path=${encodeURIComponent(path)}`,
    }),

    writeFile: builder.mutation<WriteFileResult, WriteFileRequest>({
      query: ({ projectId, ...body }) => ({
        url: `/projects/${projectId}/files/write`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'Project', id: `${projectId}-files` },
      ],
    }),

    deleteFile: builder.mutation<{ success: boolean }, { projectId: string; path: string }>({
      query: ({ projectId, path }) => ({
        url: `/projects/${projectId}/files`,
        method: 'DELETE',
        body: { path },
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'Project', id: `${projectId}-files` },
      ],
    }),

    renameFile: builder.mutation<{ success: boolean; path: string }, { projectId: string; oldPath: string; newPath: string }>({
      query: ({ projectId, oldPath, newPath }) => ({
        url: `/projects/${projectId}/files/rename`,
        method: 'PATCH',
        body: { oldPath, newPath },
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'Project', id: `${projectId}-files` },
      ],
    }),

    createDirectory: builder.mutation<{ success: boolean; path: string }, { projectId: string; path: string }>({
      query: ({ projectId, path }) => ({
        url: `/projects/${projectId}/files/mkdir`,
        method: 'POST',
        body: { path },
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'Project', id: `${projectId}-files` },
      ],
    }),
  }),
});

export const {
  useListFilesQuery,
  useReadFileQuery,
  useWriteFileMutation,
  useDeleteFileMutation,
  useRenameFileMutation,
  useCreateDirectoryMutation,
} = filesApi;
