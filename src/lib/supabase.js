import { createClient } from '@supabase/supabase-js'

// Variáveis com nome novo (VITE_MV_*): as antigas da Vercel apontam para o banco anterior.
// Chave publicável: feita para ficar no app. A segurança está nas regras do banco (RLS).
const supabaseUrl = import.meta.env.VITE_MV_SUPABASE_URL || 'https://cpoxykaksqlrqnstjonv.supabase.co'
const supabaseKey = import.meta.env.VITE_MV_SUPABASE_KEY || 'sb_publishable_Azm8A8z7LluWcp7_pNruxQ_NZ03PaCL'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: true, autoRefreshToken: true },
})

// Colunas que o público pode ler (as observações internas ficam de fora)
export const BUSINESS_COLS =
  'id,slug,name,description,category,subcategory,urgency_group,address,city,latitude,longitude,' +
  'phone,phone2,whatsapp,email,instagram,website,hours,open_24h,tags,plan,plan_expires_at,featured,status'
