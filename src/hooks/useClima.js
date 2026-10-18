import { useEffect, useState } from 'react'

// Previsão do Open-Meteo para Monte Verde (sem chave, gratuito). Guardada 30 min no aparelho.
const URL = 'https://api.open-meteo.com/v1/forecast?latitude=-22.86&longitude=-46.03&elevation=1554&timezone=America%2FSao_Paulo'
  + '&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,is_day'
  + '&hourly=temperature_2m,precipitation_probability,precipitation,weather_code,relative_humidity_2m,cloud_cover,wind_speed_10m'
  + '&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code&forecast_days=3'
const CHAVE = 'mv_clima_v1'
const VALIDADE = 30 * 60 * 1000

const TEXTO = [
  [0, 'céu limpo', 'Sun'], [1, 'poucas nuvens', 'CloudSun'], [2, 'parcialmente nublado', 'CloudSun'], [3, 'nublado', 'Cloud'],
  [45, 'neblina', 'CloudFog'], [48, 'neblina', 'CloudFog'], [51, 'garoa', 'CloudDrizzle'], [53, 'garoa', 'CloudDrizzle'], [55, 'garoa', 'CloudDrizzle'],
  [56, 'garoa gelada', 'CloudDrizzle'], [57, 'garoa gelada', 'CloudDrizzle'], [61, 'chuva fraca', 'CloudRain'], [63, 'chuva', 'CloudRain'], [65, 'chuva forte', 'CloudRain'],
  [66, 'chuva gelada', 'CloudRain'], [67, 'chuva gelada', 'CloudRain'], [71, 'neve', 'Snowflake'], [73, 'neve', 'Snowflake'], [75, 'neve', 'Snowflake'], [77, 'neve', 'Snowflake'],
  [80, 'pancadas de chuva', 'CloudRain'], [81, 'pancadas de chuva', 'CloudRain'], [82, 'pancadas fortes', 'CloudRain'], [85, 'neve', 'Snowflake'], [86, 'neve', 'Snowflake'],
  [95, 'trovoada', 'CloudLightning'], [96, 'trovoada com granizo', 'CloudLightning'], [99, 'trovoada com granizo', 'CloudLightning'],
]
export function descreveCodigo(code, isDay = 1) {
  const t = TEXTO.find(x => x[0] === code) || [0, 'tempo estável', 'Cloud']
  const icone = t[2] === 'Sun' && !isDay ? 'Moon' : t[2] === 'CloudSun' && !isDay ? 'CloudMoon' : t[2]
  return { texto: t[1], icone }
}
const chove = code => code >= 51 && code !== 71 && code !== 73 && code !== 75 && code !== 77

/** Lê a previsão crua e tira o que o turista precisa decidir. */
export function interpretar(d, agora = new Date()) {
  if (!d?.current || !d.hourly) return null
  const h = d.hourly
  const horaLocal = Number(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', hour: '2-digit', hourCycle: 'h23' }).format(agora))
  const diaLocal = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(agora)
  const idx = h.time.findIndex(t => t.startsWith(diaLocal) && Number(t.slice(11, 13)) === horaLocal)
  const i0 = idx < 0 ? 0 : idx
  const prox = h.precipitation_probability.slice(i0, i0 + 6)
  const probProx = prox.length ? Math.max(...prox) : 0
  const codProx = h.weather_code.slice(i0, i0 + 6)
  const chuvaProx = probProx >= 50 || codProx.some(chove)
  const restoDoDia = h.precipitation_probability.slice(i0, i0 + (24 - horaLocal))
  const chuvaHoje = (restoDoDia.length ? Math.max(...restoDoDia) : 0) >= 55 || h.weather_code.slice(i0, i0 + (24 - horaLocal)).some(chove)

  // Noite de hoje: menor temperatura entre 19h e 6h
  const noiteIdx = h.time.map((t, k) => [t, k]).filter(([t]) => (t.startsWith(diaLocal) && Number(t.slice(11, 13)) >= 19) || (!t.startsWith(diaLocal) && Number(t.slice(11, 13)) <= 6)).map(([, k]) => k).filter(k => k >= i0).slice(0, 12)
  const minNoite = noiteIdx.length ? Math.min(...noiteIdx.map(k => h.temperature_2m[k])) : d.daily?.temperature_2m_min?.[0]

  // Mar de nuvens amanhã às 6h: madrugada fria, úmida, sem chuva e sem vento, céu não fechado.
  const amanha = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date(agora.getTime() + 86400e3))
  const k6 = h.time.findIndex(t => t.startsWith(amanha) && t.slice(11, 13) === '06')
  let marDeNuvens = null
  if (k6 > 0) {
    const umid = h.relative_humidity_2m[k6], vento = h.wind_speed_10m[k6], nuvem = h.cloud_cover[k6], temp = h.temperature_2m[k6]
    const chuvaMadrugada = h.precipitation.slice(k6 - 5, k6 + 1).some(p => p > 0.2)
    let pontos = 0
    if (umid >= 90) pontos++
    if (vento <= 10) pontos++
    if (temp <= 13) pontos++
    if (!chuvaMadrugada && nuvem <= 70) pontos++
    marDeNuvens = { pontos, umid, vento, nuvem, temp, chuvaMadrugada, nivel: pontos >= 4 ? 'favorável' : pontos === 3 ? 'possível' : 'improvável' }
  }

  const c = d.current
  return {
    temp: Math.round(c.temperature_2m), umidade: c.relative_humidity_2m, vento: Math.round(c.wind_speed_10m),
    ...descreveCodigo(c.weather_code, c.is_day), code: c.weather_code, isDay: !!c.is_day,
    max: Math.round(d.daily.temperature_2m_max[0]), min: Math.round(d.daily.temperature_2m_min[0]),
    probHoje: d.daily.precipitation_probability_max[0], probProx, chuvaProx, chuvaHoje,
    minNoite: minNoite == null ? null : Math.round(minNoite),
    amanha: d.daily.weather_code[1] != null ? { ...descreveCodigo(d.daily.weather_code[1]), max: Math.round(d.daily.temperature_2m_max[1]), min: Math.round(d.daily.temperature_2m_min[1]), prob: d.daily.precipitation_probability_max[1] } : null,
    marDeNuvens, atualizado: d.current.time,
  }
}

let cache = null
let promessa = null
export function carregarClima() {
  if (cache && Date.now() - cache.t < VALIDADE) return Promise.resolve(cache.v)
  if (promessa) return promessa
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE) || 'null')
    if (salvo && Date.now() - salvo.t < VALIDADE) { cache = salvo; return Promise.resolve(salvo.v) }
  } catch { /* sem armazenamento */ }
  promessa = fetch(URL).then(r => (r.ok ? r.json() : null)).then(d => {
    cache = { t: Date.now(), v: d }
    try { localStorage.setItem(CHAVE, JSON.stringify(cache)) } catch { /* */ }
    return d
  }).catch(() => null).finally(() => { promessa = null })
  return promessa
}

/** Clima interpretado para a home e o painel; null enquanto carrega ou se a previsão falhar. */
export function useClima() {
  const [clima, setClima] = useState(() => (cache ? interpretar(cache.v) : null))
  useEffect(() => {
    let vivo = true
    carregarClima().then(d => vivo && setClima(d ? interpretar(d) : null))
    return () => { vivo = false }
  }, [])
  return clima
}
