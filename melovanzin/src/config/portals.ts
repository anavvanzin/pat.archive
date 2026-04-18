const defaultLoveuUrl = 'https://love-u-1066380962084.us-west1.run.app'

export const loveuPortal = {
  url: import.meta.env.VITE_LOVEU_URL?.trim() || defaultLoveuUrl,
  title: 'Lyra Lounge',
  subtitle: 'o nosso estudio nas nuvens',
  description: 'abre o laboratorio musical do loveu para compor uma faixa mais sonhadora, brilhante e meio impossivel.',
  cta: 'abrir portal musical',
}
