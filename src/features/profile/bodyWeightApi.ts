import { supabase } from '@/lib/supabase'
import type { Tables } from '@/types/database.types'

export type BodyWeightLog = Tables<'body_weight_logs'>

export async function fetchBodyWeightLogs(userId: string): Promise<BodyWeightLog[]> {
  const { data, error } = await supabase
    .from('body_weight_logs')
    .select('*')
    .eq('user_id', userId)
    .order('logged_date', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function upsertBodyWeightLog(
  userId: string,
  loggedDate: string,
  weightKg: number,
  note?: string,
): Promise<void> {
  const { error } = await supabase
    .from('body_weight_logs')
    .upsert(
      { user_id: userId, logged_date: loggedDate, weight_kg: weightKg, note: note ?? null },
      { onConflict: 'user_id,logged_date' },
    )
  if (error) throw error
}

export async function deleteBodyWeightLog(id: string): Promise<void> {
  const { error } = await supabase.from('body_weight_logs').delete().eq('id', id)
  if (error) throw error
}
