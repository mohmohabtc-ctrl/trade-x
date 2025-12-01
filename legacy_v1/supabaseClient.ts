import { createClient } from '@supabase/supabase-js';

// Clés fournies par l'utilisateur
// Utilisation de (import.meta as any) pour éviter les erreurs TS si les types Vite ne sont pas chargés
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://wesjfaqzzighybovostc.supabase.co';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indlc2pmYXF6emlnaHlib3Zvc3RjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0Mjc0ODcsImV4cCI6MjA3OTAwMzQ4N30.m48Ju2M5VzBhhi5-eu9FFOv2W2rL38nHLe0tB-RoP38';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL ou Key manquante.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);