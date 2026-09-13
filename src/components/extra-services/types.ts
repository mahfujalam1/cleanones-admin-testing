import type { ExtraServiceRequest } from "@/services/actions/extraServices";
import type { PendingAdditionalTask } from "@/services/actions/cleaningPlans";
import type { AdditionalTask } from "@/redux/api/endpoints/additionalTasks.api";

export type UnifiedServiceRequest = {
  id: string;
  taskId?: string;
  taskIds?: string[];
  planId?: string;
  title: string;
  description: string;
  status: string;
  priority?: string;
  preferred_date?: string;
  date_submitted?: string;
  client_name?: string;
  location_id?: string;
  location_name?: string;
  room_name?: string;
  rejection_reason?: string;
  rawExtraService?: ExtraServiceRequest;
  rawPendingTask?: PendingAdditionalTask;
  /** Present when the row came from `/additional-task/all-additional-tasks`. */
  rawAdditionalTask?: AdditionalTask;
  isCleaningPlanTask: boolean;
};

export interface ExtraServiceModalProps {
  request: UnifiedServiceRequest;
  onClose: () => void;
  onDone: () => void;
  onError: (msg: string) => void;
}
