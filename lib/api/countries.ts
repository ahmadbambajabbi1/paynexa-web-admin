import { adminApiFetch } from "@/lib/api/client";

export type CountryRow = {
  id: string;
  iso2: string;
  name: string;
  dialCode: string;
  currencyCode: string;
  currencyName: string;
  currencySymbol: string;
  active: boolean;
};

export type OperatingCountryRow = CountryRow & {
  active: boolean;
  sortOrder: number;
};

export async function listCountries(token: string) {
  return await adminApiFetch<{ countries: CountryRow[] }>("/admin/countries", { token });
}

export async function listOperatingCountries(token: string) {
  return await adminApiFetch<{ countries: OperatingCountryRow[] }>(
    "/admin/operating-countries",
    { token },
  );
}

export async function upsertOperatingCountry(
  token: string,
  dto: { iso2: string; active?: boolean; sortOrder?: number },
) {
  return await adminApiFetch<{ country: OperatingCountryRow }>(
    "/admin/operating-countries",
    { method: "POST", token, body: JSON.stringify(dto) },
  );
}

export async function removeOperatingCountry(token: string, iso2: string) {
  return await adminApiFetch<{ ok: true }>(
    `/admin/operating-countries/${encodeURIComponent(iso2)}`,
    { method: "DELETE", token },
  );
}
