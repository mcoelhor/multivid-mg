import { useState } from 'react'

const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASSWORD || 'multivid@admin2026'

export function AdminLogin({ onLogin }) {
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (pass === ADMIN_PASS) {
      localStorage.setItem('multivid_admin', '1')
      onLogin()
    } else {
      setError('Senha incorreta')
      setPass('')
    }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6" style={{ background: '#14532d' }}>
      <div className="w-full max-w-xs">
        <div className="text-center mb-8">
          <p className="text-4xl mb-3">🌿</p>
          <h1 className="text-white text-2xl font-bold">Multivid MG</h1>
          <p className="text-emerald-300 text-sm mt-1">Painel Administrativo</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 shadow-2xl space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Senha de acesso</label>
            <input
              type="password"
              value={pass}
              onChange={e => setPass(e.target.value)}
              placeholder="Digite a senha..."
              autoFocus
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-900/20 transition-all"
            />
            {error && <p className="text-red-500 text-xs mt-1.5 font-medium">{error}</p>}
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-xl text-white font-bold text-sm"
            style={{ background: '#14532d' }}
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}
