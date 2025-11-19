import { supabase } from '@/lib/supabase';
import type { InsightType } from '@/components/Dashboard/NovaInsightCard';

function hashInsight(type: InsightType, insight: string): string {
  return `${type}:${insight.substring(0, 50)}`;
}

export async function dismissInsight(
  userId: string,
  type: InsightType,
  insight: string,
  daysUntilExpiry: number = 7
): Promise<boolean> {
  try {
    const client = supabase();
    if (!client) return false;

    const hash = hashInsight(type, insight);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + daysUntilExpiry);

    const { error } = await client
      .from('dismissed_nova_insights')
      .insert({
        user_id: userId,
        insight_type: type,
        insight_hash: hash,
        expires_at: expiresAt.toISOString()
      });

    if (error) {
      if (error.code === '23505') {
        return true;
      }
      console.error('Error dismissing insight:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Failed to dismiss insight:', err);
    return false;
  }
}

export async function getDismissedInsights(userId: string): Promise<Set<string>> {
  try {
    const client = supabase();
    if (!client) return new Set();

    const { data, error } = await client
      .from('dismissed_nova_insights')
      .select('insight_hash')
      .eq('user_id', userId)
      .or('expires_at.is.null,expires_at.gt.now()');

    if (error) {
      console.error('Error fetching dismissed insights:', error);
      return new Set();
    }

    return new Set((data || []).map(d => d.insight_hash));
  } catch (err) {
    console.error('Failed to fetch dismissed insights:', err);
    return new Set();
  }
}

export async function undismissInsight(
  userId: string,
  type: InsightType,
  insight: string
): Promise<boolean> {
  try {
    const client = supabase();
    if (!client) return false;

    const hash = hashInsight(type, insight);

    const { error } = await client
      .from('dismissed_nova_insights')
      .delete()
      .eq('user_id', userId)
      .eq('insight_hash', hash);

    if (error) {
      console.error('Error undismissing insight:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Failed to undismiss insight:', err);
    return false;
  }
}

export function filterDismissedInsights<T extends { type: InsightType; insight: string }>(
  insights: T[],
  dismissedHashes: Set<string>
): T[] {
  return insights.filter(insight => {
    const hash = hashInsight(insight.type, insight.insight);
    return !dismissedHashes.has(hash);
  });
}
