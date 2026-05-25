import { adminApiFetch } from "@/lib/api/client";

export type KycApplicationListItem = {
  id: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string | null;
    phone: string | null;
    displayName: string | null;
    fullName: string | null;
  };
  kycDocumentCount: number;
  hasSelfie: boolean;
};

export type KycApplicationsListResponse = {
  applications: KycApplicationListItem[];
};

export type KycDocumentDetail = {
  id: string;
  kind: string;
  uploader: string;
  fileKey: string;
  fileUrl: string;
  createdAt: string;
  downloadUrl: string;
};

export type KycApplicationDetailResponse = {
  application: {
    id: string;
    role: string;
    status: string;
    payload: unknown;
    createdAt: string;
    updatedAt: string;
    user: {
      id: string;
      email: string | null;
      phone: string | null;
      displayName: string | null;
      fullName: string | null;
      countryCode: string | null;
    };
    kycDocuments: KycDocumentDetail[];
  };
};

export async function listKycApplications(token: string) {
  return adminApiFetch<KycApplicationsListResponse>(
    "/admin/kyc-applications",
    { token, method: "GET" },
  );
}

export async function getKycApplication(token: string, id: string) {
  return adminApiFetch<KycApplicationDetailResponse>(
    `/admin/kyc-applications/${encodeURIComponent(id)}`,
    { token, method: "GET" },
  );
}

export async function approveKycApplication(token: string, id: string) {
  return adminApiFetch<{ ok: boolean; status: string }>(
    `/admin/kyc-applications/${encodeURIComponent(id)}/approve`,
    { token, method: "POST" },
  );
}

export async function rejectKycApplication(
  token: string,
  id: string,
  body: { reason?: string },
) {
  return adminApiFetch<{ ok: boolean; status: string }>(
    `/admin/kyc-applications/${encodeURIComponent(id)}/reject`,
    { token, method: "POST", body: JSON.stringify(body) },
  );
}
