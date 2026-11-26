import { cache } from "react";
import type { TaskHistoryItem } from "../components/TaskHistoryTable";
import { requestBackend } from "./backend";

export type ShiftKey = {
    date: string;
    name: "morning" | "evening" | "night";
};

type ShiftTask = {
    id: number;
    name: string;
    notes: string | null;
    status: "Pending" | "Completed";
    carriedOver: number;
    completedAtDhaka: string | null;
};

type ShiftReportTask = {
    id: number;
    name: string;
    notes: string | null;
    reportStatus: "Pending" | "Completed" | "Handed over";
    carriedIn: number;
    completedAtDhaka: string | null;
    nextShiftDate: string | null;
    nextShiftName: ShiftKey["name"] | null;
};

type ReportDelivery = {
    deliveryStatus: "Pending" | "Sending" | "Sent" | "Failed" | "Uncertain";
    requestedByName: string | null;
    requestedAtDhaka: string | null;
    sentAtDhaka: string | null;
    recipientEmails: string;
    reportSubject: string;
    reportBody: string;
};

type TaskTemplate = {
    id: number;
    name: string;
    shift_name: ShiftKey["name"];
    is_active: number;
};

type ApprovedUser = {
    email: string;
    role: "admin" | "operator";
    is_active: number;
};

type Handover = {
    id: number;
    task_id: number;
    task_name: string;
    from_date: string;
    from_shift_name: string;
    to_date: string;
    to_shift_name: string;
};

type RecentActivity = Pick<TaskHistoryItem,
    "id" | "taskId" | "taskName" | "newStatus" | "changedByName" | "changedAtDhaka">;

function shiftQuery(date: string, shift: ShiftKey["name"]) {
    return new URLSearchParams({ date, shift });
}

export const getCurrentShiftKey = cache(() => requestBackend<ShiftKey>("/shifts/current"));

export function getShiftTasks(date: string, name: ShiftKey["name"]) {
    return requestBackend<ShiftTask[]>(`/tasks?${shiftQuery(date, name)}`);
}

export function getShiftReport(shift: ShiftKey) {
    return requestBackend<ShiftReportTask[]>(`/reports?${shiftQuery(shift.date, shift.name)}`);
}

export function getReportDeliveryStatus(shift: ShiftKey) {
    return requestBackend<ReportDelivery | null>(`/reports/delivery?${shiftQuery(shift.date, shift.name)}`);
}

export function getTaskTemplates() {
    return requestBackend<TaskTemplate[]>("/templates");
}

export function getEmailReportSettings() {
    return requestBackend<{ enabled: boolean; recipientEmails: string }>("/settings/email");
}

export function getApprovedUsers() {
    return requestBackend<ApprovedUser[]>("/users");
}

export function getHandovers() {
    return requestBackend<Handover[]>("/handovers");
}

export function getTaskHistory() {
    return requestBackend<TaskHistoryItem[]>("/task-history");
}

export function getRecentTaskActivity() {
    return requestBackend<RecentActivity[]>("/recent-activity");
}
