import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

/** Sessão do Supabase + confirmação de que o usuário é administrador. */
export function useAdmin() {
  const [s, setS] = useState({ carregando: true, user: null, admin: false })

  useEffect(() => {
    let vivo = true
    async function checar(session) {
      if (!session?.user) { if (vivo) setS({ carregando: false, user: null, admin: false }); return }
      const { data } = await supabase.rpc('sou_admin')
      if (data) { try { localStorage.setItem('mv_equipe', '1') } catch { /* */ } }
      if (vivo) setS({ carregando: false, user: session.user, admin: !!data })
    }
    supabase.auth.getSession().then(({ data }) => checar(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => { setTimeout(() => checar(session), 0) })
    return () => { vivo = false; sub.subscription.unsubscribe() }
  }, [])

  return s
}

export async function sair() {
  await supabase.auth.signOut()
}
