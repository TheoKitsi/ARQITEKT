import { baseApi } from './baseApi';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type NotificationType =
  | 'gate_failed'
  | 'gate_passed'
  | 'drift_detected'
  | 'feedback_received'
  | 'build_complete'
  | 'build_failed'
  | 'baseline_created'
  | 'validation_error'
  | 'info';

export type NotificationSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface Notification {
  id: string;
  projectId: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  read: boolean;
  artifactId?: string;
  createdAt: string;
}

interface NotificationsResponse {
  items: Notification[];
  total: number;
  unread: number;
}

interface UnreadCountResponse {
  unread: number;
}

/* ------------------------------------------------------------------ */
/*  API                                                                */
/* ------------------------------------------------------------------ */

const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationsResponse, { projectId: string; unreadOnly?: boolean }>({
      query: ({ projectId, unreadOnly }) =>
        `/projects/${projectId}/notifications${unreadOnly ? '?unreadOnly=true' : ''}`,
      providesTags: (_result, _error, { projectId }) => [
        { type: 'Notifications' as const, id: `${projectId}-LIST` },
      ],
    }),

    getUnreadCount: builder.query<UnreadCountResponse, string>({
      query: (projectId) => `/projects/${projectId}/notifications/unread-count`,
      providesTags: (_result, _error, projectId) => [
        { type: 'Notifications' as const, id: `${projectId}-UNREAD` },
      ],
    }),

    markNotificationRead: builder.mutation<void, { projectId: string; notificationId: string }>({
      query: ({ projectId, notificationId }) => ({
        url: `/projects/${projectId}/notifications/${notificationId}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'Notifications' as const, id: `${projectId}-LIST` },
        { type: 'Notifications' as const, id: `${projectId}-UNREAD` },
      ],
    }),

    markAllRead: builder.mutation<void, string>({
      query: (projectId) => ({
        url: `/projects/${projectId}/notifications/mark-all-read`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, projectId) => [
        { type: 'Notifications' as const, id: `${projectId}-LIST` },
        { type: 'Notifications' as const, id: `${projectId}-UNREAD` },
      ],
    }),

    deleteNotification: builder.mutation<void, { projectId: string; notificationId: string }>({
      query: ({ projectId, notificationId }) => ({
        url: `/projects/${projectId}/notifications/${notificationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: 'Notifications' as const, id: `${projectId}-LIST` },
        { type: 'Notifications' as const, id: `${projectId}-UNREAD` },
      ],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllReadMutation,
  useDeleteNotificationMutation,
} = notificationsApi;
