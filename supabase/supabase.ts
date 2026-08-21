import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/* - Cliente com persistência de sessão: "Lembre-me" marcado - */

const supabase = createClient(url, key, {
  auth: {
    storage: typeof window !== "undefined" ? localStorage : undefined,
    storageKey: "sb-remember-auth-token",
  },
});

/* - Cliente sem persistência de sessão: "Lembre-me" desmarcado - */

const supabaseTemp = createClient(url, key, {
  auth: {
    storage: typeof window !== "undefined" ? sessionStorage : undefined,
    storageKey: "sb-temp-auth-token",
  },
});

export { supabase, supabaseTemp };
