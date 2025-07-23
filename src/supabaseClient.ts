// src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ehknepnahltkdcjtxxvn.supabase.co'          // Replace this
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVoa25lcG5haGx0a2RjanR4eHZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwODkwNTgsImV4cCI6MjA2NzY2NTA1OH0.OCUi8LvKvGDkOKKD5lC1m_gMmPKCGbqjq8aNwXxXfBI'   // Replace this

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
