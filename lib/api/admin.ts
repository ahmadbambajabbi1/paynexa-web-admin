import { adminApiFetch } from "@/lib/api/client";

export type AdminUserSummary = {
  id: string;
  email: string;
  displayName: string | null;
  active: boolean;
  createdAt: string;
};

export type LoginResponse = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    displayName: string | null;
  };
};

export async function loginRequest(
  email: string,
  password: string,
): Promise<LoginResponse> {
  return adminApiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function fetchAdminMe(token: string) {
  return adminApiFetch<{ user: LoginResponse["user"] }>("/auth/me", {
    token,
  });
}

export async function listAdminUsers(token: string) {
  return adminApiFetch<{ users: AdminUserSummary[] }>("/admin/users", {
    token,
  });
}

export async function createAdminUser(
  token: string,
  body: { email: string; password: string; displayName?: string },
) {
  return adminApiFetch<{ user: AdminUserSummary }>("/admin/users", {
    method: "POST",
    token,
    body: JSON.stringify(body),
  });
}
