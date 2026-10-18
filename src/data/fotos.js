// Fotos livres de Monte Verde (Wikimedia Commons), guardadas no Storage do app.
// Mostram a cidade, nunca um estabelecimento específico. Créditos na página /creditos.

const BASE = 'https://cpoxykaksqlrqnstjonv.supabase.co/storage/v1/object/public/fotos/cidade'

const F = (id, legenda, autor, licenca, fonte, w, h) => ({
  id, legenda, autor, licenca, fonte, w, h,
  g: `${BASE}/${id}-g.webp`,
  p: `${BASE}/${id}-p.webp`,
})

const C = 'https://commons.wikimedia.org/wiki/File:'

export const FOTOS = {
  marDeNuvens: F('mar-de-nuvens', 'Mar de nuvens no vale, visto da serra', 'Danilo Prudêncio Silva', 'CC BY-SA 3.0', C + 'VistaDeMonteVerdeII.jpg', 1600, 1200),
  nuvensVale: F('nuvens-vale', 'Nuvens descendo a Mantiqueira', 'Danilo Prudêncio Silva', 'CC BY-SA 3.0', C + 'VistaDeMonteVerde.JPG', 1600, 1200),
  porDoSol: F('por-do-sol-araucaria', 'Araucária no fim da tarde', 'Rafael Vianna Croffi', 'CC BY 2.0', C + 'Monte_Verde_-_MG_(31640041985).jpg', 1600, 1060),
  serra: F('serra-mantiqueira', 'Camadas da Serra da Mantiqueira', 'Rafael Vianna Croffi', 'CC BY 2.0', C + 'Zoom_nos_montes_verdes_(31888329796).jpg', 1600, 1064),
  solSerra: F('sol-serra', 'Sol de inverno sobre a mata', 'Rafael Vianna Croffi', 'CC BY 2.0', C + 'Monte_Verde_-_MG_(31550654256).jpg', 1600, 744),
  vilaAerea: F('vila-aerea', 'A vila entre a mata', 'BruxelasDaBelgica', 'CC BY-SA 4.0', C + 'Casas_em_monte_verde.jpg', 959, 670),
  enxaimel: F('casa-enxaimel', 'Casa em estilo enxaimel', 'Girlfromrio891', 'CC BY-SA 4.0', C + 'Typical_German_house_in_Monte_Verde.jpg', 1210, 703),
  chale: F('chale-montanha', 'Chalé e araucárias', 'Girlfromrio891', 'CC BY-SA 4.0', C + 'Houses_in_Monte_Verde.jpg', 1210, 703),
  pousadas: F('vila-pousadas', 'Pousadas vistas do alto', 'Girlfromrio891', 'CC BY-SA 4.0', C + 'Neighborhood_in_Monte_Verde.jpg', 1239, 703),
  ruaAraucaria: F('rua-araucaria', 'Rua de pedra e araucária', 'Lelê Breveglieri', 'CC BY 2.0', C + 'Monte_Verde_-_MG_-_Brasil_(5242347878).jpg', 1200, 800),
  galeria: F('galeria-centro', 'Galeria no centro', 'Lelê Breveglieri', 'CC BY 2.0', C + 'Monte_Verde_-_MG_-_Brasil_(5241752627).jpg', 1200, 800),
  serelepe: F('serelepe', 'O serelepe, morador da mata', 'Lelê Breveglieri', 'CC BY 2.0', C + 'Monte_Verde_-_MG_-_Brasil_(5242348242).jpg', 1024, 769),
  samambaia: F('samambaiacu', 'Samambaiaçu da Mata Atlântica', 'titoprotasio', 'CC BY-SA 3.0', C + 'Pousada_em_monte_verde.mg_-_panoramio.jpg', 1600, 1067),
  mata: F('mata-atlantica', 'Mata com bromélias', 'nikola_pu', 'CC BY-SA 3.0', C + 'Monte_verde_-_panoramio.jpg', 1023, 768),
  capela: F('capela', 'Capela de madeira', 'Boris Karpuk', 'CC BY-SA 3.0', C + 'Igreja_Batista_em_Monte_Verde_-_panoramio.jpg', 1600, 1200),
  neblina: F('neblina-manha', 'Manhã de neblina', 'Kell Kell', 'CC BY-SA 3.0', C + 'Monte_Verde,_junho_de_2008_-_panoramio.jpg', 600, 456),
  vistaAzul: F('vista-azul', 'Monte Verde à vista', 'Felipe Guimarães', 'CC BY 2.0', C + 'Monte_Verde_%C3%A0_vista!_(9721079398).jpg', 1600, 904),
  avenida: F('avenida-centro', 'Avenida Monte Verde', 'Msadp06', 'CC BY-SA 3.0', C + 'Monte_Verde_02.jpg', 1600, 898),
  viela: F('viela-lojas', 'Vielas de lojas no centro', 'CivArmy', 'CC BY 4.0', C + 'Monte_Verde_district,_Camanducaia,_Brazil.jpg', 1600, 1200),
  chalesMata: F('chales-mata', 'Chalés na mata', 'Paulo JC Nogueira', 'CC BY-SA 3.0', C + 'Pousada_Serras_de_Monte_Verde_-_Monte_Verde,_MG_-_panoramio.jpg', 1600, 1195),
}

export const LISTA_FOTOS = Object.values(FOTOS)

// Foto de clima para cada categoria (usada como capa; não é o lugar em si)
export const FOTO_CATEGORIA = {
  alimentacao: FOTOS.viela,
  hospedagem: FOTOS.chale,
  turismo: FOTOS.serra,
  compras: FOTOS.galeria,
  saude: FOTOS.neblina,
  transporte: FOTOS.avenida,
  servicos: FOTOS.ruaAraucaria,
  construcao: FOTOS.enxaimel,
  imobiliarias: FOTOS.pousadas,
}
