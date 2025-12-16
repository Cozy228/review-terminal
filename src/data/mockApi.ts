import type { ReviewDataSeed } from '../types';
import type { DepartmentEntity } from '../types/executive';
import { executiveMock } from './executiveMock';
import { mockReviewSeed } from './mockData';

export type MockApiEnvelope<T> = {
  ok: true;
  source: 'mock';
  generatedAt: string;
  data: T;
};

export type MockFetchResponse<T> = {
  ok: boolean;
  status: number;
  json: () => Promise<T>;
};

const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

const deepClone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export const fetchMockReviewSeed = async (username: string): Promise<MockFetchResponse<MockApiEnvelope<ReviewDataSeed>>> => {
  await sleep(200);

  const seed = deepClone(mockReviewSeed);
  seed.user.username = username;

  return {
    ok: true,
    status: 200,
    json: async () => ({
      ok: true,
      source: 'mock',
      generatedAt: new Date().toISOString(),
      data: seed,
    }),
  };
};

export const fetchMockExecutiveDepartment = async (email: string): Promise<MockFetchResponse<MockApiEnvelope<DepartmentEntity>>> => {
  await sleep(200);

  const entity = deepClone(executiveMock);
  if (email.trim()) {
    entity.managerName = email.includes('@') ? email.split('@')[0] || entity.managerName : email;
  }

  return {
    ok: true,
    status: 200,
    json: async () => ({
      ok: true,
      source: 'mock',
      generatedAt: new Date().toISOString(),
      data: entity,
    }),
  };
};

