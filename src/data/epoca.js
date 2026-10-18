// O que está na época em Monte Verde, por mês (0 = janeiro). Texto curto para a home e página própria.
// Datas são faixas usuais da serra; eventos com data ficam na agenda, não aqui.
import { FOTOS } from './fotos'

export const EPOCAS = [
  { id: 'hortensias', nome: 'Hortênsias', meses: [11, 0, 1, 2], foto: FOTOS.ruaAraucaria, resumo: 'As hortênsias florescem no verão e colorem as ruas e os jardins das pousadas.', dica: 'Passeie a pé pelas ruas fora do centro no fim da tarde.', busca: 'hortensia' },
  { id: 'chuva-verao', nome: 'Tardes de chuva', meses: [11, 0, 1, 2], foto: FOTOS.neblina, resumo: 'No verão chove à tarde quase todo dia. Manhã é para a natureza; tarde, para chocolate, cervejaria e lojinhas.', dica: 'Comece cedo. O guia troca as sugestões quando a chuva chega.', busca: 'chuva' },
  { id: 'pinhao', nome: 'Pinhão', meses: [3, 4, 5, 6], foto: FOTOS.serelepe, resumo: 'De abril a julho as araucárias soltam as pinhas. Pinhão cozido, paçoca de pinhão e os serelepes atrás dele.', dica: 'Procure pinhão nos mercados e nas barracas do centro.', busca: 'pinhao' },
  { id: 'mar-de-nuvens', nome: 'Mar de nuvens', meses: [3, 4, 5, 6, 7], foto: FOTOS.marDeNuvens, resumo: 'Nas madrugadas frias e úmidas de outono e inverno o vale amanhece coberto de nuvens, visto de cima.', dica: 'Acorde antes das 7h e suba a um mirante. O painel do guia acompanha as condições.', busca: 'mirante' },
  { id: 'inverno', nome: 'Inverno e geada', meses: [5, 6, 7], foto: FOTOS.porDoSol, resumo: 'Noites perto de zero, geada nos gramados e a temporada de fondue, lareira e vinho.', dica: 'Casaco de verdade, gorro e luva. Reserve jantar nos fins de semana.', busca: 'fondue' },
  { id: 'primavera', nome: 'Primavera na serra', meses: [8, 9, 10], foto: FOTOS.vistaAzul, resumo: 'Dias claros e amenos, mata florida e menos gente que no inverno: a melhor época para trilhas.', dica: 'Trilha da Pedra Redonda pela manhã; leve água e protetor.', busca: 'trilha' },
]

export function epocasDoMes(mes = new Date().getMonth()) {
  return EPOCAS.filter(e => e.meses.includes(mes))
}
export const NOME_MES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
