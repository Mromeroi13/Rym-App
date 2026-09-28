import { supabase } from '@/lib/supabase'
import type { MealType, Tables } from '@/types/database.types'

export type MealRow = Tables<'meals'>

// rangeStart / rangeEnd: 'YYYY-MM-DD' (ambos incluidos)
export async function fetchMeals(rangeStart: string, rangeEnd: string): Promise<MealRow[]> {
  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .gte('meal_date', rangeStart)
    .lte('meal_date', rangeEnd)
    .order('meal_date', { ascending: true })
  if (error) throw error
  return data ?? []
}

// Crea o actualiza el registro del tramo (una fila por usuario, día y tipo de comida).
export async function saveMeal(
  userId: string,
  mealDate: string,
  mealType: MealType,
  description: string,
): Promise<void> {
  const { error } = await supabase.from('meals').upsert(
    {
      user_id: userId,
      meal_date: mealDate,
      meal_type: mealType,
      description: description.trim(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,meal_date,meal_type' },
  )
  if (error) throw error
}

export async function deleteMeal(id: string): Promise<void> {
  const { error } = await supabase.from('meals').delete().eq('id', id)
  if (error) throw error
}
