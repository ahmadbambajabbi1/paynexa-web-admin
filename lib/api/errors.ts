export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
    message?: string,
  ) {
    super(message ?? `Request failed (${status})`);
    this.name = "ApiError";
  }
}

export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    const b = err.body;
    if (typeof b === "object" && b && "message" in b) {
      const m = (b as { message: unknown }).message;
      if (Array.isArray(m)) return m.join(", ");
      if (typeof m === "string") return m;
    }
    return err.message;
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong";
}
