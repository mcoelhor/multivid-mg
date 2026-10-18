import { Layout } from '../components/Layout/Layout'
import { LISTA_FOTOS } from '../data/fotos'

/** Créditos das fotos livres usadas no app (licenças Creative Commons). */
export function Creditos() {
  return (
    <Layout title="Créditos das fotos" showBack>
      <div className="px-5 pt-2">
        <p className="text-[16px] leading-relaxed text-[var(--leve)]">
          As fotos da vila vêm do Wikimedia Commons, publicadas pelos autores com licenças livres. Elas mostram Monte Verde, não um estabelecimento específico.
        </p>
        <ul className="mt-6 space-y-3">
          {LISTA_FOTOS.map(f => (
            <li key={f.id} className="flex gap-3.5 rounded-[var(--raio)] bg-[var(--papel)] p-2.5 pr-4">
              <img src={f.p} alt="" loading="lazy" className="h-16 w-16 shrink-0 rounded-[12px] object-cover" />
              <div className="min-w-0 text-[15px] leading-snug">
                <p className="font-bold">{f.legenda}</p>
                <p className="text-[var(--leve)]">Foto: {f.autor} · {f.licenca}</p>
                <a href={f.fonte} target="_blank" rel="noopener noreferrer" className="text-[14px] font-semibold text-[var(--musgo)] underline underline-offset-4">Ver original</a>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-[14px] text-[var(--leve)]">As imagens foram reduzidas e convertidas para carregar mais rápido. Licenças: creativecommons.org/licenses.</p>
      </div>
    </Layout>
  )
}
