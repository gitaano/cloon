import { createClient } from "@supabase/supabase-js";

// Estas dos claves NO son secretas — es normal y seguro que viajen en
// el código de la app (por eso se llama "anon key", clave anónima).
// La seguridad de verdad la ponen las políticas RLS que ya creamos en
// la base de datos, no el ocultar esta clave.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Faltan las variables VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. " +
      "Revisa el archivo .env (en local) o las Environment Variables del proyecto en Vercel."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
