import { adminApiFetch } from "@/lib/api/client";

export type PersonalKycListItem = {
  userId: string;
  personalKycVersion: number;
  documentCount: number;
  pendingSince: string | null;
  updatedAt: string;
  user: {
    id: string;
    email: string | null;
    phone: string | null;
    displayName: string | null;
    fullName: string | null;
  };
};

export type PersonalKycListResponse = {
  applications: PersonalKycListItem[];
};

export type PersonalKycDocumentDetail = {
  id: string;
  kind: string;
  uploader: string;
  fileKey: string;
  fileUrl: string;
  createdAt: string;
  downloadUrl: string;
};

export type PersonalKycDetailResponse = {
  application: {
    userId: string;
    status: string;
    personalKycVersion: number;
    pendingSince: string | null;
    rejectedReason: string | null;
    approvedAt: string | null;
    user: {
      id: string;
      email: string | null;
      phone: string | null;
      displayName: string | null;
      fullName: string | null;
      countryCode: string | null;
    };
    kycDocuments: PersonalKycDocumentDetail[];
  };
};

export async function listPersonalKycApplications(token: string) {
  return adminApiFetch<PersonalKycListResponse>("/admin/personal-kyc-applications", {
    token,
    method: "GET",
  });
}

export async function getPersonalKycApplication(token: string, userId: string) {
  return adminApiFetch<PersonalKycDetailResponse>(
    `/admin/personal-kyc-applications/${encodeURIComponent(userId)}`,
    { token, method: "GET" },
  );
}

export async function approvePersonalKyc(token: string, userId: string) {
  return adminApiFetch<{ ok: boolean; status: string }>(
    `/admin/personal-kyc-applications/${encodeURIComponent(userId)}/approve`,
    { token, method: "POST" },
  );
}

export async function rejectPersonalKyc(
  token: string,
  userId: string,
  body: { reason?: string },
) {
  return adminApiFetch<{ ok: boolean; status: string }>(
    `/admin/personal-kyc-applications/${encodeURIComponent(userId)}/reject`,
    { token, method: "POST", body: JSON.stringify(body) },
  );
}
