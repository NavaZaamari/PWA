/**
 * Single entry point for data access. Swap `mockApi` for a real HTTP
 * implementation of the same interfaces to connect a backend.
 */
import { mockApi } from "./mock";

export const api = mockApi;
export * from "./types";
export * from "./errors";
export type * from "./repositories";
