import type { FitfiTier } from '@/config/novaAccess';

const TIER_KEY = 'fitfi_tier';
const UID_KEY  = 'fitfi_uid';

export function getUserTier(): FitfiTier {
  const v = (localStorage.getItem(TIER_KEY) || '').toLowerCase();
  if (v === 'member' || v === 'plus' || v === 'founder') return v as FitfiTier;
  return 'visitor';
}
export function setUserTier(tier: FitfiTier) {
  localStorage.setItem(TIER_KEY, tier);
}
export function getUID(): string {
  let uid = localStorage.getItem(UID_KEY);
  if (!uid) {
    uid = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
    localStorage.setItem(UID_KEY, uid);
  }
  return uid;
}