import { createClient } from '@supabase/supabase-js';

// Helper to get configuration from environment
const getEnvConfig = () => {
  if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
    return {
      url: import.meta.env.VITE_SUPABASE_URL,
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY
    };
  }
  return null;
};

// Helper to get configuration from localStorage
const getLocalConfig = () => {
  const url = localStorage.getItem('peixevoador_supabase_url');
  const anonKey = localStorage.getItem('peixevoador_supabase_anon_key');
  if (url && anonKey) {
    return { url, anonKey };
  }
  return null;
};

export const getSupabaseConfig = () => {
  return getLocalConfig() || getEnvConfig();
};

export const saveSupabaseConfig = (url, anonKey) => {
  localStorage.setItem('peixevoador_supabase_url', url.trim());
  localStorage.setItem('peixevoador_supabase_anon_key', anonKey.trim());
};

export const deleteSupabaseConfig = () => {
  localStorage.removeItem('peixevoador_supabase_url');
  localStorage.removeItem('peixevoador_supabase_anon_key');
};

let supabaseClient = null;

export const initSupabase = () => {
  const config = getSupabaseConfig();
  if (!config) {
    supabaseClient = null;
    return null;
  }
  try {
    supabaseClient = createClient(config.url, config.anonKey);
    return supabaseClient;
  } catch (error) {
    console.error("Erro ao inicializar o cliente Supabase:", error);
    supabaseClient = null;
    return null;
  }
};

export const getSupabase = () => {
  if (supabaseClient) return supabaseClient;
  return initSupabase();
};

export const isSupabaseActive = () => {
  return getSupabase() !== null;
};
