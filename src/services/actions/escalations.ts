import { authenticated } from "./auth";
import type { IssueReport } from "@/redux/api/escalationsApi";

export type { IssueReport, EscalationApi } from "@/redux/api/escalationsApi";

export async function getEscalations() {
  return authenticated<IssueReport[]>("/issue-report/all-issue-reports", { method: "GET" });
}

export async function updateIssueReport(
  id: string,
  body: { status?: string; issueType?: string; severity?: string; location?: string; description?: string }
) {
  return authenticated<IssueReport>(`/issue-report/update-issue-report/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteIssueReport(id: string) {
  return authenticated<IssueReport>(`/issue-report/delete-issue-report/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
