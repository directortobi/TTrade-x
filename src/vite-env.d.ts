
// FIX: Removed problematic triple-slash reference to vite/client that was causing type definition lookup failures.

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Ensure module resolution for vite/client types if the reference fails
declare module 'vite/client';
