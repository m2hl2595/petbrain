import type { UserStage } from '@/types';

const STORAGE_KEY = 'petbrain_user_stage';

/**
 * 获取用户当前阶段
 */
export function getUserStage(): UserStage | null {
  if (typeof window === 'undefined') return null;

  const stage = localStorage.getItem(STORAGE_KEY);
  if (stage === 'explore' || stage === 'prep' || stage === 'withDog') {
    return stage;
  }
  return null;
}

/**
 * 设置用户阶段
 */
export function setUserStage(stage: UserStage): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem(STORAGE_KEY, stage);
}

/**
 * 清除用户阶段
 */
export function clearUserStage(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(STORAGE_KEY);
}
