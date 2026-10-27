import { Logger, ServiceUnavailableException } from '@nestjs/common';

const DEFAULT_TIMEOUT_MS = 8000;
const logger = new Logger('Upstream');

type UpstreamOptions = {
  service: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
};

async function request(
  url: string,
  { service, headers, timeoutMs = DEFAULT_TIMEOUT_MS }: UpstreamOptions,
) {
  let response: Response;
  try {
    response = await fetch(url, { headers, signal: AbortSignal.timeout(timeoutMs) });
  } catch (error) {
    logger.warn(
      `${service} request failed: ${error instanceof Error ? error.message : String(error)}`,
    );
    throw new ServiceUnavailableException(`${service} is unavailable right now. Please try again.`);
  }

  if (!response.ok) {
    logger.warn(`${service} answered ${response.status}`);
    throw new ServiceUnavailableException(`${service} is unavailable right now. Please try again.`);
  }

  return response;
}

export async function fetchJson<T>(url: string, options: UpstreamOptions): Promise<T> {
  const response = await request(url, options);
  return (await response.json()) as T;
}

export async function fetchBuffer(url: string, options: UpstreamOptions): Promise<Buffer> {
  const response = await request(url, options);
  return Buffer.from(await response.arrayBuffer());
}
