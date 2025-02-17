import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://xcpnxblpmecdzwatreid.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjcG54YmxwbWVjZHp3YXRyZWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUzOTczMzgsImV4cCI6MjA1MDk3MzMzOH0.178tCICGp0pH73iGJZ5vWjLDo8VXZdKCoSGkIYIwhb8";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    storageKey: 'supabase.auth.token',
    storage: localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
});

// Initialize session from storage on client load
const initSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error initializing session:', error);
      return;
    }
    if (session) {
      console.log('Session initialized successfully');
    }
  } catch (error) {
    console.error('Failed to initialize session:', error);
  }
};

// Call initSession when the client is imported
initSession();