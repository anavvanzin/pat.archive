# Google Audio Integration

## Estado atual do repo

Hoje o site público deste projeto é publicado em **GitHub Pages** a partir de `melovanzin/dist`.

Isso importa porque GitHub Pages:

- não executa backend Node/Express;
- não protege segredos em runtime;
- não é o lugar certo para usar service account diretamente.

## Onde entra o service account

O endereço:

`1066380962084-compute@developer.gserviceaccount.com`

é útil para o lado de **infraestrutura/backend**, não para o frontend do site.

Ele pode ser usado em cenários como:

- deploy automatizado para Cloud Run via GitHub Actions;
- autenticação server-to-server no Google Cloud;
- execução de um backend que converse com Vertex AI / Gemini sem expor chaves no browser.

Ele **não** deve ser colocado em:

- `.env` do frontend;
- código React/Vite;
- JavaScript publicado no GitHub Pages.

## Diferença prática: `GEMINI_API_KEY` vs service account

### 1. Protótipo local ou app estilo AI Studio

O `loveu` que você compartilhou segue este modelo:

- usa `@google/genai` no cliente;
- espera `GEMINI_API_KEY` em `.env.local`;
- funciona bem para experimento e prototipagem.

Esse modelo é simples, mas não é o ideal para um site público sensível, porque a lógica de IA fica muito próxima do cliente.

### 2. Site público com backend

Para um site público derivado dessa ideia, o fluxo recomendado é:

1. `melovanzin` continua como frontend.
2. Um backend roda em Cloud Run.
3. O backend autentica no Google Cloud.
4. O frontend chama endpoints próprios.
5. O backend fala com Gemini/Vertex e devolve só o necessário.

Aqui, o service account entra do jeito certo.

## Onde esse e-mail entra no GitHub

Se você criar ou reativar um workflow de deploy para Cloud Run, o valor:

`1066380962084-compute@developer.gserviceaccount.com`

vai no secret:

`GCP_SERVICE_ACCOUNT`

Normalmente junto com:

- `GCP_PROJECT_ID`
- `GCP_WORKLOAD_IDENTITY_PROVIDER`

Mas isso só faz sentido quando existir um deploy de backend em Cloud Run.

## Recomendação para este projeto

Para o `pixel-love`, a melhor sequência é:

1. manter o site principal em GitHub Pages;
2. usar o áudio local/gerado no navegador para a camada poética e interativa;
3. se você quiser recursos tipo Lyra/Gemini, criar um backend separado;
4. só então usar o service account no fluxo de Cloud Run.

## Próximo passo técnico recomendado

Se a meta for trazer “mágica Google/Lyra” para o site, o próximo passo mais sólido é:

1. criar um backend pequeno em Express ou outro runtime;
2. expor um endpoint como `/api/compose`;
3. autenticar esse backend no Google Cloud;
4. conectar o `melovanzin` a esse endpoint.

Esse é o ponto em que o service account começa a ser realmente útil.
