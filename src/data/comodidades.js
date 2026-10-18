// Comodidades que o turista pergunta antes de ir. Ícones do lucide.
export const COMODIDADES = [
  ['pet', 'Aceita pet', 'Dog'], ['wifi', 'Wi‑Fi', 'Wifi'], ['estacionamento', 'Estacionamento', 'Car'], ['lareira', 'Lareira', 'Flame'],
  ['acessivel', 'Acessível', 'Accessibility'], ['fraldario', 'Fraldário', 'Baby'], ['banheiro', 'Banheiro', 'Toilet'], ['vista', 'Vista', 'Mountain'],
  ['criancas', 'Espaço kids', 'Baby'], ['cartao', 'Cartão', 'CreditCard'], ['pix', 'Pix', 'QrCode'], ['coberto', 'Coberto', 'Umbrella'],
]
export const nomeComodidade = id => COMODIDADES.find(c => c[0] === id)?.[1] || id
export const iconeComodidade = id => COMODIDADES.find(c => c[0] === id)?.[2] || 'Check'
// Filtros que valem a pena por categoria
export const FILTROS = { hospedagem: ['pet', 'lareira', 'estacionamento', 'wifi', 'criancas'], alimentacao: ['pet', 'lareira', 'vista', 'estacionamento', 'criancas'], turismo: ['pet', 'criancas', 'coberto', 'estacionamento'] }
