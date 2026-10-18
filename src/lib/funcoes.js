import { supabase } from './supabase'

const BASE = 'https://cpoxykaksqlrqnstjonv.supabase.co/functions/v1/'

/** Chama uma função do servidor com o login do dono. Lança erro com a mensagem do servidor. */
export async function chamarComLogin(nome, corpo) {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  const r = await fetch(BASE + nome, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(corpo),
  })
  const d = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(d.erro || 'Não foi possível enviar.')
  return d
}
