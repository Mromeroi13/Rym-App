// Tipos generados a mano a partir de la migración SQL ejecutada en Supabase.
// Si más adelante corres `supabase gen types` o lo descargas del dashboard,
// puedes reemplazar este archivo por el generado automáticamente.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type AppRole = 'user' | 'admin'
export type ProposalStatus = 'pending' | 'accepted' | 'rejected'
export type MealType = 'breakfast' | 'snack' | 'lunch' | 'afternoon_snack' | 'dinner'
export type WorkoutStatus = 'active' | 'paused' | 'completed' | 'abandoned'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          weight_kg: number | null
          height_cm: number | null
          role: AppRole
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          weight_kg?: number | null
          height_cm?: number | null
          role?: AppRole
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          weight_kg?: number | null
          height_cm?: number | null
          role?: AppRole
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      muscle_groups: {
        Row: { id: string; name: string }
        Insert: { id?: string; name: string }
        Update: { id?: string; name?: string }
        Relationships: []
      }
      exercises: {
        Row: {
          id: string
          name: string
          muscle_group_id: string
          active: boolean
          source_proposal_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          muscle_group_id: string
          active?: boolean
          source_proposal_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          muscle_group_id?: string
          active?: boolean
          source_proposal_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'exercises_muscle_group_id_fkey'
            columns: ['muscle_group_id']
            isOneToOne: false
            referencedRelation: 'muscle_groups'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'exercises_source_proposal_fk'
            columns: ['source_proposal_id']
            isOneToOne: false
            referencedRelation: 'exercise_proposals'
            referencedColumns: ['id']
          }
        ]
      }
      exercise_proposals: {
        Row: {
          id: string
          submitted_by: string
          name: string
          muscle_group_id: string
          status: ProposalStatus
          reviewed_by: string | null
          reviewed_at: string | null
          rejection_reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          submitted_by: string
          name: string
          muscle_group_id: string
          status?: ProposalStatus
          reviewed_by?: string | null
          reviewed_at?: string | null
          rejection_reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          submitted_by?: string
          name?: string
          muscle_group_id?: string
          status?: ProposalStatus
          reviewed_by?: string | null
          reviewed_at?: string | null
          rejection_reason?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'exercise_proposals_muscle_group_id_fkey'
            columns: ['muscle_group_id']
            isOneToOne: false
            referencedRelation: 'muscle_groups'
            referencedColumns: ['id']
          }
        ]
      }
      routines: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      routine_exercises: {
        Row: {
          id: string
          routine_id: string
          exercise_id: string
          position: number
          created_at: string
        }
        Insert: {
          id?: string
          routine_id: string
          exercise_id: string
          position?: number
          created_at?: string
        }
        Update: {
          id?: string
          routine_id?: string
          exercise_id?: string
          position?: number
          created_at?: string
        }
        Relationships: []
      }
      routine_sets: {
        Row: {
          id: string
          routine_exercise_id: string
          set_number: number
          planned_weight_kg: number | null
          planned_reps: number | null
        }
        Insert: {
          id?: string
          routine_exercise_id: string
          set_number: number
          planned_weight_kg?: number | null
          planned_reps?: number | null
        }
        Update: {
          id?: string
          routine_exercise_id?: string
          set_number?: number
          planned_weight_kg?: number | null
          planned_reps?: number | null
        }
        Relationships: []
      }
      routine_assignments: {
        Row: {
          id: string
          user_id: string
          routine_id: string
          scheduled_date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          routine_id: string
          scheduled_date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          routine_id?: string
          scheduled_date?: string
          created_at?: string
        }
        Relationships: []
      }
      workout_sessions: {
        Row: {
          id: string
          user_id: string
          source_routine_id: string | null
          status: WorkoutStatus
          timer_enabled: boolean
          elapsed_seconds: number
          started_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          source_routine_id?: string | null
          status?: WorkoutStatus
          timer_enabled?: boolean
          elapsed_seconds?: number
          started_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          source_routine_id?: string | null
          status?: WorkoutStatus
          timer_enabled?: boolean
          elapsed_seconds?: number
          started_at?: string
          completed_at?: string | null
        }
        Relationships: []
      }
      workout_exercises: {
        Row: {
          id: string
          workout_session_id: string
          exercise_id: string
          exercise_name_snapshot: string
          position: number
        }
        Insert: {
          id?: string
          workout_session_id: string
          exercise_id: string
          exercise_name_snapshot: string
          position?: number
        }
        Update: {
          id?: string
          workout_session_id?: string
          exercise_id?: string
          exercise_name_snapshot?: string
          position?: number
        }
        Relationships: []
      }
      workout_sets: {
        Row: {
          id: string
          workout_exercise_id: string
          set_number: number
          planned_weight_kg: number | null
          planned_reps: number | null
          actual_weight_kg: number | null
          actual_reps: number | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          workout_exercise_id: string
          set_number: number
          planned_weight_kg?: number | null
          planned_reps?: number | null
          actual_weight_kg?: number | null
          actual_reps?: number | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          workout_exercise_id?: string
          set_number?: number
          planned_weight_kg?: number | null
          planned_reps?: number | null
          actual_weight_kg?: number | null
          actual_reps?: number | null
          completed_at?: string | null
        }
        Relationships: []
      }
      meals: {
        Row: {
          id: string
          user_id: string
          meal_date: string
          meal_type: MealType
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          meal_date: string
          meal_type: MealType
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          meal_date?: string
          meal_type?: MealType
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      // Migración 002 (rym_app_migration_002_hardening.sql)
      accept_exercise_proposal: {
        Args: { p_proposal_id: string }
        Returns: string
      }
      admin_list_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          username: string | null
          email: string
          role: AppRole
          is_active: boolean
          created_at: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
