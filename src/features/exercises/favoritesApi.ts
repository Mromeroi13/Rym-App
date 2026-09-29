import { supabase } from '@/lib/supabase'

// Favoritos personales (RT-07). RLS ya limita todo al propietario; el filtro por
// user_id se repite aquí para no depender de una sola capa.

export async function fetchFavoriteIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('favorite_exercises')
    .select('exercise_id')
    .eq('user_id', userId)
  if (error) throw error
  return (data ?? []).map((row) => row.exercise_id)
}

export async function addFavorite(userId: string, exerciseId: string): Promise<void> {
  const { error } = await supabase.from('favorite_exercises').insert({ user_id: userId, exercise_id: exerciseId })
  // 23505: ya era favorito (PK user_id + exercise_id). El resultado deseado ya se cumple.
  if (error && (error as { code?: string }).code !== '23505') throw error
}

export async function removeFavorite(userId: string, exerciseId: string): Promise<void> {
  const { error } = await supabase
    .from('favorite_exercises')
    .delete()
    .eq('user_id', userId)
    .eq('exercise_id', exerciseId)
  if (error) throw error
}
