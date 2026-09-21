import { baseApi } from "../baseApi";
import { listQuery, type ListParams, type Paginated, type Ref } from "../types";
import { tagTypes } from "../../tagTypes";
import type { Room } from "./rooms.api";

export const FREQUENCY_TYPES = ["daily", "weekly", "monthly"] as const;
export type FrequencyType = (typeof FREQUENCY_TYPES)[number];

export const WEEK_DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type WeekDay = (typeof WEEK_DAYS)[number];

export type PhotoRequirement = {
  title: string;
  photo_url?: string | null;
  is_uploaded?: boolean;
  description?: string;
  reference_image_url?: string;
};

export type Task = {
  _id: string;
  room: Ref<Room>;
  
  client?: string;
  location?: string;
  name: string;
  frequency_type: FrequencyType;
  is_photo_required?: boolean;
  photo_requirements?: PhotoRequirement[];
  
  required_photo_count?: number;
  duration_minutes?: number;
  days_of_week?: WeekDay[];
  days_of_month?: number[];
  is_active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateTaskInput = {
  room: string;
  name: string;
  frequency_type: FrequencyType;
  is_photo_required?: boolean;
  photo_requirements?: PhotoRequirement[];
  required_photo_count?: number;
  duration_minutes?: number;
  days_of_week?: WeekDay[];
  days_of_month?: number[];
  is_active?: boolean;
  description?: string;
  reference_image_url?: string;
};

export type UpdateTaskInput = Partial<Omit<CreateTaskInput, "room">>;



export function scheduleProblem(input: {
  frequency_type?: FrequencyType;
  days_of_week?: WeekDay[];
  days_of_month?: number[];
}): string | null {
  if (input.frequency_type === "weekly" && !input.days_of_week?.length) {
    return "Pick at least one day of the week.";
  }
  if (input.frequency_type === "monthly" && !input.days_of_month?.length) {
    return "Pick at least one day of the month.";
  }
  return null;
}

type ScheduleFields = {
  frequency_type?: FrequencyType;
  days_of_week?: WeekDay[];
  days_of_month?: number[];
};



export function withSchedule<T extends ScheduleFields>(input: T): T {
  const body = { ...input };
  if (body.frequency_type === "daily" || body.frequency_type === "monthly") delete body.days_of_week;
  if (body.frequency_type === "daily" || body.frequency_type === "weekly") delete body.days_of_month;
  return body;
}


function withEmptyPhotoStrings<T extends {
  description?: string | null;
  reference_image_url?: string | null;
  photo_requirements?: PhotoRequirement[];
}>(input: T): T {
  return {
    ...input,
    description: input.description ?? "",
    reference_image_url: input.reference_image_url ?? "",
    photo_requirements: input.photo_requirements?.map((photo) => ({
      title: photo.title,
      photo_url: photo.photo_url ?? "",
      is_uploaded: Boolean(photo.is_uploaded),
      description: photo.description ?? "",
      reference_image_url: photo.reference_image_url ?? "",
    })),
  };
}

export const tasksApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    
    getTasks: builder.query<Paginated<Task>, { roomId: string } & ListParams>({
      query: ({ roomId, ...params }) =>
        `/task/all-tasks/${encodeURIComponent(roomId)}?${listQuery(params)}`,
      providesTags: (response, _error, { roomId }) => [
        { type: tagTypes.tasks, id: `ROOM-${roomId}` },
        ...(response?.result ?? []).map(({ _id }) => ({ type: tagTypes.tasks, id: _id })),
      ],
    }),

    getTask: builder.query<Task, string>({
      query: (id) => `/task/single-task/${encodeURIComponent(id)}`,
      providesTags: (_response, _error, id) => [{ type: tagTypes.tasks, id }],
    }),

    createTask: builder.mutation<Task, CreateTaskInput>({
      query: (body) => ({
        url: "/task/create-task",
        method: "POST",
        body: withEmptyPhotoStrings(withSchedule(body)),
      }),
      invalidatesTags: (_result, _error, { room }) => [
        { type: tagTypes.tasks, id: `ROOM-${room}` },
        
        { type: tagTypes.rooms, id: room },
      ],
    }),

    updateTask: builder.mutation<Task, { id: string; roomId: string; body: UpdateTaskInput }>({
      query: ({ id, body }) => ({
        url: `/task/update-task/${encodeURIComponent(id)}`,
        method: "PATCH",
        body: withEmptyPhotoStrings(withSchedule(body)),
      }),
      invalidatesTags: (_result, _error, { id, roomId }) => [
        { type: tagTypes.tasks, id },
        { type: tagTypes.tasks, id: `ROOM-${roomId}` },
      ],
    }),

    deleteTask: builder.mutation<Task, { id: string; roomId: string }>({
      query: ({ id }) => ({ url: `/task/delete-task/${encodeURIComponent(id)}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, { id, roomId }) => [
        { type: tagTypes.tasks, id },
        { type: tagTypes.tasks, id: `ROOM-${roomId}` },
        { type: tagTypes.rooms, id: roomId },
      ],
    }),
    getMyTasks: builder.query<Paginated<Task>, { roomId: string } & ListParams>({
      query: ({ roomId, ...params }) =>
        `/task/my-tasks/${encodeURIComponent(roomId)}?${listQuery(params)}`,
      providesTags: (response, _error, { roomId }) => [
        { type: tagTypes.tasks, id: `ROOM-${roomId}` },
        ...(response?.result ?? []).map(({ _id }) => ({ type: tagTypes.tasks, id: _id })),
      ],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useGetMyTasksQuery,
  useGetTaskQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = tasksApi;
