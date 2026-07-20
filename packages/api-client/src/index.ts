// @liftly/api-client — a small, typed wrapper over the `/api/v1/*` mobile API.
// Injects the Supabase access token as a Bearer header and surfaces typed
// responses (see @liftly/shared-types DTOs). Runtime-agnostic: pass a `fetch`.
import type {
  ProgramV1,
  DashboardV1,
  ProgressV1,
  ReadinessGetV1,
  ReadinessInput,
  SessionLogInput,
  SessionLogResultV1,
  NutritionV1,
  NutritionGenerateInput,
  ChatHistoryV1,
  ChatSendInput,
  FormCheckListV1,
  FormCheckDetailV1,
  FormCheckUploadTicketV1,
  UsageV1,
  ProfileV1,
  OkV1,
} from '@liftly/shared-types';

export interface ApiClientOptions {
  /** Base origin of the backend, e.g. https://liftly.tech (no trailing slash). */
  baseUrl: string;
  /** Returns the current Supabase access token (JWT) or null when signed out. */
  getToken: () => Promise<string | null> | string | null;
  /** Called on any 401 so the app can drop the session and route to login. */
  onUnauthorized?: () => void;
  /** Injected fetch (RN provides a global; tests can pass a mock). */
  fetch?: typeof fetch;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export class ApiClient {
  constructor(private readonly opts: ApiClientOptions) {}

  private get fetchImpl(): typeof fetch {
    return this.opts.fetch ?? fetch;
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    body?: unknown,
  ): Promise<T> {
    const token = await this.opts.getToken();
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await this.fetchImpl(`${this.opts.baseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (res.status === 401) {
      this.opts.onUnauthorized?.();
      throw new ApiError(401, 'Unauthorized');
    }

    const text = await res.text();
    const data = text ? safeJson(text) : null;

    if (!res.ok) {
      let message = res.statusText || `Request failed (${res.status})`;
      if (data && typeof data === 'object' && 'error' in data) {
        const errVal = (data as { error: unknown }).error;
        if (typeof errVal === 'string' && errVal) message = errVal;
      }
      throw new ApiError(res.status, message, data);
    }
    return data as T;
  }

  // ---- Program / dashboard / progress ----
  getProgram() {
    return this.request<ProgramV1>('GET', '/api/v1/program');
  }
  getDashboard() {
    return this.request<DashboardV1>('GET', '/api/v1/dashboard');
  }
  getProgress() {
    return this.request<ProgressV1>('GET', '/api/v1/progress');
  }

  // ---- Readiness ----
  getReadiness() {
    return this.request<ReadinessGetV1>('GET', '/api/v1/readiness');
  }
  submitReadiness(input: ReadinessInput) {
    return this.request<ReadinessGetV1>('POST', '/api/v1/readiness', input);
  }

  // ---- Session logging ----
  logSession(input: SessionLogInput) {
    return this.request<SessionLogResultV1>('POST', '/api/v1/session/log', input);
  }

  // ---- Nutrition ----
  getNutrition() {
    return this.request<NutritionV1>('GET', '/api/v1/nutrition');
  }
  generateNutrition(input: NutritionGenerateInput) {
    return this.request<NutritionV1>('POST', '/api/v1/nutrition/generate', input);
  }

  // ---- Chat ----
  getChat() {
    return this.request<ChatHistoryV1>('GET', '/api/v1/chat');
  }
  sendChat(input: ChatSendInput) {
    return this.request<ChatHistoryV1>('POST', '/api/v1/chat', input);
  }

  // ---- Form-check ----
  listFormChecks() {
    return this.request<FormCheckListV1>('GET', '/api/v1/formcheck');
  }
  getFormCheck(id: string) {
    return this.request<FormCheckDetailV1>('GET', `/api/v1/formcheck/${id}`);
  }
  requestFormCheckUpload(liftType: string, contentType: string) {
    return this.request<FormCheckUploadTicketV1>('POST', '/api/v1/formcheck/upload-url', {
      liftType,
      contentType,
    });
  }
  startFormCheckAnalysis(formCheckId: string, userContext?: string) {
    return this.request<FormCheckDetailV1>('POST', `/api/v1/formcheck/${formCheckId}/analyze`, {
      userContext,
    });
  }

  // ---- Profile / onboarding ----
  getProfile() {
    return this.request<ProfileV1>('GET', '/api/v1/profile');
  }
  saveProfile(profile: Record<string, unknown>) {
    return this.request<ProfileV1>('PUT', '/api/v1/profile', profile);
  }

  // ---- Billing / usage ----
  getUsage() {
    return this.request<UsageV1>('GET', '/api/v1/usage');
  }
  /** Push a RevenueCat entitlement snapshot so the server can reconcile the plan. */
  syncEntitlement(payload: { plan: 'free' | 'pro' | 'coach'; rcAppUserId: string }) {
    return this.request<OkV1>('POST', '/api/v1/billing/entitlement', payload);
  }

  // ---- Generic escape hatches ----
  get<T>(path: string) {
    return this.request<T>('GET', path);
  }
  post<T>(path: string, body?: unknown) {
    return this.request<T>('POST', path, body);
  }
}

export function createApiClient(opts: ApiClientOptions): ApiClient {
  return new ApiClient(opts);
}
