import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

let cache = null
/** Avisos ativos da vila (festival, estrada, neblina). Poucas linhas, carregadas uma vez por sessão. */
export function useAvisos() {
  const [avisos, setAvisos] = useState(cache || [])
  useEffect(() => {
    if (cache) return
    let vivo = true
    supabase.from('avisos').select('id,texto,link,tipo,fim').order('criado_em', { ascending: false }).limit(5)
      .then(({ data }) => { cache = data || []; if (vivo) setAvisos(cache) })
    return () => { vivo = false }
  }, [])
  return avisos
}
