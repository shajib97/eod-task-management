import { cache } from "react";
import { requestBackend } from "./backend";

type Access = {
    user: { id: string; name: string; email: string };
    role: "admin" | "operator";
};

export const requireOperator = cache(() => requestBackend<Access>("/session"));
export const requireAdmin = cache(() => requestBackend<Access>("/session/admin"));
