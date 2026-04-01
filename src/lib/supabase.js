import { createClient } from '@supabase/supabase-js'

// Handles both environments:
// - Local dev (.env.local): uses VITE_ prefix, required by Vite to expose vars to the browser
// - Vercel + Supabase integration: auto-injects without VITE_ prefix, so we fall back to that
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? import.meta.env.SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
