import { adminApiFetch } from '@/lib/api/client';

export type VerificationCodeItem = {
  id: string;
  target: string;
  channel: string;
  medium: 'email' | 'phone';
  purpose: string;
  code: string | null;
  expiresAt: string;
  attemptCount: number;
  consumedAt: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string | null;
    phone: string | null;
    displayName: string | null;
    fullName: string | null;
  } | null;
};

export type VerificationCodesResponse = {
  verifications: VerificationCodeItem[];
};

export async function listVerificationCodes(token: string, limit = 100) {
  return adminApiFetch<VerificationCodesResponse>(
    `/admin/verifications?limit=${encodeURIComponent(String(limit))}`,
    { token, method: 'GET' },
  );
}
