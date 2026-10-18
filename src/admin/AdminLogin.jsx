import { useState } from 'react'
import { Lock } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { sair } from './useAdmin'

export function AdminLogin({ user }) {
  const [modo, setModo] = useState('entrar') // entrar | criar
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [msg, setMsg] = useState('')
  const [ok, setOk] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function enviar(e) {
    e.preventDefault()
    setMsg(''); setOk(''); setEnviando(true)
    if (modo === 'entrar') {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha })
      if (error) setMsg(error.message.includes('confirm') ? 'Confirme o e-mail antes de entrar (veja a caixa de entrada).' : 'E-mail ou senha incorretos.')
    } else {
      if (senha.length < 8) { setMsg('Use uma senha com pelo menos 8 caracteres.'); setEnviando(false); return }
      const { error } = await supabase.auth.signUp({ email: email.trim(), password: senha, options: { emailRedirectTo: `${location.origin}/admin` } })
      if (error) setMsg(error.message)
      else setOk('Conta criada. Abra o e-mail de confirmação e depois entre aqui.')
    }
    setEnviando(false)
  }

  const campo = 'w-full rounded-xl bg-[#f4f1eb] px-3.5 py-3 text-[15px] focus:bg-white focus:shadow-[inset_0_0_0_1.5px_var(--verde)]'
  return (
    <div className="flex min-h-dvh items-center justify-center p-5">
      <div className="entra w-full max-w-sm rounded-3xl bg-white p-6">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--verde)] text-white"><Lock size={22} /></span>
        <h1 className="mt-4 text-xl font-bold">Área do administrador</h1>
        {user ? (
          <>
            <p className="mt-2 text-sm text-[#626a63]">Você entrou como <b>{user.email}</b>, mas essa conta não tem acesso ao painel.</p>
            <button onClick={sair} className="botao botao-sec mt-4 w-full">Sair e usar outra conta</button>
          </>
        ) : (
          <form onSubmit={enviar} className="mt-4 space-y-3">
            <input className={campo} type="email" autoComplete="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} required />
            <input className={campo} type="password" autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'} placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} required />
            {msg && <p className="text-[13px] font-medium text-[#8a3b2e]" role="alert">{msg}</p>}
            {ok && <p className="text-[13px] font-medium text-[#1f6b2a]">{ok}</p>}
            <button disabled={enviando} className="botao botao-pri w-full disabled:opacity-60">{enviando ? 'Aguarde…' : modo === 'entrar' ? 'Entrar' : 'Criar conta'}</button>
            <button type="button" onClick={() => { setModo(modo === 'entrar' ? 'criar' : 'entrar'); setMsg(''); setOk('') }} className="w-full text-center text-[13px] font-semibold text-[var(--verde)]">
              {modo === 'entrar' ? 'Primeiro acesso? Criar conta' : 'Já tenho conta. Entrar'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
