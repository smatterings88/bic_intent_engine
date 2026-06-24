export type AdminMutationBody = {
  contentType: "article" | "landing_page" | "lead_magnet";
  id: string;
};

async function postMutation(
  path: string,
  body: AdminMutationBody,
  idToken: string,
): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    error?: { message?: string };
  };
  if (!res.ok) {
    return {
      ok: false,
      error: json.error?.message ?? res.statusText ?? "Request failed",
    };
  }
  return { ok: true };
}

export async function publishContent(
  args: AdminMutationBody,
  idToken: string,
): Promise<{ ok: boolean; error?: string }> {
  return postMutation("/api/admin/content/publish", args, idToken);
}

export async function unpublishContent(
  args: AdminMutationBody,
  idToken: string,
): Promise<{ ok: boolean; error?: string }> {
  return postMutation("/api/admin/content/unpublish", args, idToken);
}

export async function archiveContent(
  args: AdminMutationBody,
  idToken: string,
): Promise<{ ok: boolean; error?: string }> {
  return postMutation("/api/admin/content/archive", args, idToken);
}
