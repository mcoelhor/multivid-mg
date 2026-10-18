// Motor de horário: "aberto agora", "fecha às", "abre amanhã".
// Formato por dia: "08:00-18:00" | "12:00-15:00,19:00-23:00" | "fechado" | "24h" | ausente (não informado)
// Fechamento antes da abertura = passa da meia-noite ("18:00-01:00").

export const DIAS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom']
export const DIAS_NOME = { seg: 'Segunda', ter: 'Terça', qua: 'Quarta', qui: 'Quinta', sex: 'Sexta', sab: 'Sábado', dom: 'Domingo' }
const DIAS_CURTO = { seg: 'Seg', ter: 'Ter', qua: 'Qua', qui: 'Qui', sex: 'Sex', sab: 'Sáb', dom: 'Dom' }

/** Hora de Monte Verde, independente do fuso do celular do turista. */
export function agoraMV(base = new Date()) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Sao_Paulo', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(base).map(x => [x.type, x.value])
  )
  const wd = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 }[p.weekday]
  return { dia: wd, min: Number(p.hour) * 60 + Number(p.minute) }
}

/** "08:00-18:00,19:00-23:00" -> [[480,1080],[1140,1380]] | [] fechado | null desconhecido */
export function parseDia(txt) {
  const t = String(txt ?? '').trim().toLowerCase()
  if (!t) return null
  if (['fechado', 'closed', 'não abre', 'nao abre'].includes(t)) return []
  if (['24h', '24 horas', '00:00-24:00', '00:00-00:00'].includes(t)) return [[0, 1440]]
  const out = []
  for (const parte of t.split(/[,;/]+/)) {
    const m = parte.match(/(\d{1,2})[:h](\d{2})?\s*[-–a]+\s*(\d{1,2})[:h]?(\d{2})?/)
    if (!m) continue
    const ini = Number(m[1]) * 60 + Number(m[2] || 0)
    let fim = Number(m[3]) * 60 + Number(m[4] || 0)
    if (fim <= ini) fim += 1440
    out.push([ini, fim])
  }
  return out.length ? out : null
}

export function hhmm(min) {
  min = ((min % 1440) + 1440) % 1440
  const h = Math.floor(min / 60), m = min % 60
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`
}

/**
 * @returns {{estado:'aberto'|'fechado'|'plantao'|'desconhecido', rotulo:string, curto:string, abreHoje?:boolean}}
 */
export function statusHorario(b, agora = agoraMV()) {
  const h24 = String(b?.open_24h || '').toLowerCase()
  if (h24 === 'sim') return { estado: 'aberto', rotulo: 'Aberto 24 horas', curto: '24h' }
  const plantao = h24.startsWith('plant')
  const sem = Object.fromEntries(DIAS.map(d => [d, parseDia(b?.hours?.[d])]))
  const conhecidos = Object.values(sem).filter(v => v !== null)
  if (!conhecidos.length) {
    return plantao
      ? { estado: 'plantao', rotulo: 'Plantão 24h por telefone', curto: 'Plantão' }
      : { estado: 'desconhecido', rotulo: 'Horário não informado', curto: '' }
  }
  const { dia, min } = agora
  const hoje = DIAS[dia], ontem = DIAS[(dia + 6) % 7]
  for (const [a, f] of sem[hoje] || []) {
    if (min >= a && min < f) return { estado: 'aberto', rotulo: `Aberto · fecha às ${hhmm(f)}`, curto: 'Aberto' }
  }
  for (const [, f] of sem[ontem] || []) {
    if (f > 1440 && min < f - 1440) return { estado: 'aberto', rotulo: `Aberto · fecha às ${hhmm(f)}`, curto: 'Aberto' }
  }
  let prox = '', abreHoje = false
  outer: for (let k = 0; k < 7; k++) {
    const d = DIAS[(dia + k) % 7]
    for (const [a] of sem[d] || []) {
      if (k === 0 && a <= min) continue
      const quando = k === 0 ? 'hoje' : k === 1 ? 'amanhã' : DIAS_NOME[d].toLowerCase()
      prox = `abre ${quando} às ${hhmm(a)}`
      abreHoje = k === 0
      break outer
    }
  }
  const rotulo = 'Fechado' + (prox ? ` · ${prox}` : '')
  if (plantao) return { estado: 'plantao', rotulo: `${rotulo} · plantão por telefone`, curto: 'Plantão' }
  return { estado: 'fechado', rotulo, curto: abreHoje ? 'Abre hoje' : 'Fechado', abreHoje }
}

/** Linhas da semana agrupando dias iguais: [{dias:'Seg a Sex', texto:'8h–18h', hoje:true}] */
export function semanaLinhas(b, agora = agoraMV()) {
  if (!b?.hours) return []
  const fmt = v => {
    const p = parseDia(v)
    if (p === null) return 'não informado'
    if (!p.length) return 'fechado'
    if (p.length === 1 && p[0][0] === 0 && p[0][1] === 1440) return '24 horas'
    return p.map(([a, f]) => `${hhmm(a)}–${hhmm(f)}`).join(' e ')
  }
  const linhas = []
  DIAS.forEach((d, i) => {
    const t = fmt(b.hours[d])
    const ult = linhas[linhas.length - 1]
    if (ult && ult.texto === t) { ult.fim = d; ult.idx.push(i) } else linhas.push({ ini: d, fim: d, texto: t, idx: [i] })
  })
  return linhas.map(l => ({
    dias: l.ini === l.fim ? DIAS_CURTO[l.ini] : `${DIAS_CURTO[l.ini]} a ${DIAS_CURTO[l.fim]}`,
    texto: l.texto,
    hoje: l.idx.includes(agora.dia),
  }))
}

/** Peso para ordenar: aberto, plantão, abre hoje, sem horário, fechado. */
export function pesoEstado(st) {
  if (st.estado === 'fechado' && st.abreHoje) return 2
  return { aberto: 0, plantao: 1, desconhecido: 3, fechado: 4 }[st.estado] ?? 3
}
