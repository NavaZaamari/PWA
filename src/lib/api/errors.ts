export type ApiErrorCode =
  | "userExists"
  | "userMissing"
  | "wrongCredentials"
  | "wrongOtp"
  | "unauthorized"
  | "notFound"
  | "invalid";

export class ApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    message?: string,
  ) {
    super(message ?? code);
    this.name = "ApiError";
  }
}
