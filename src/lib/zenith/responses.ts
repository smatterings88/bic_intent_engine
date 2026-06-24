import type { ZodIssue } from "zod";

export type ZenithErrorBody = {
  ok: false;
  error: {
    message: string;
    details?: unknown;
  };
};

export function jsonOk(data: unknown, init?: ResponseInit): Response {
  return Response.json(data, { status: 200, ...init });
}

export function jsonError(message: string, status: number, details?: unknown): Response {
  const body: ZenithErrorBody = {
    ok: false,
    error: {
      message,
      ...(details !== undefined ? { details } : {}),
    },
  };
  return Response.json(body, { status });
}

export function zodIssuesToDetails(issues: ZodIssue[]) {
  return issues.map((i) => ({
    path: i.path.join(".") || "(root)",
    message: i.message,
    code: i.code,
  }));
}
