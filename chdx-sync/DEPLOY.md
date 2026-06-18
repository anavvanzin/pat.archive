# Como publicar o CHDX (Cloudflare)

Site = `../site/` · Backend de sync = esta pasta (`chdx-sync/`).
Você precisa de uma conta Cloudflare (grátis) e do Node instalado.

## 1. Backend de sincronização (Worker + KV)

```bash
cd chdx-sync
npx wrangler login                      # abre o navegador, faz login
npx wrangler kv namespace create STATE  # copie o "id" retornado
```

- Cole esse `id` no `wrangler.toml` (campo `id = "..."`).
- Defina a chave secreta de edição (escolha uma frase forte; é o que destrava a edição):

```bash
npx wrangler secret put EDIT_KEY        # cole a chave quando pedir, ex.: pat-ana-2026-xyz
npx wrangler deploy                     # publica o Worker
```

No fim ele imprime a URL, algo como `https://chdx-sync.SEU-SUBDOMINIO.workers.dev`.

## 2. Ligar o site ao backend

Abra `../site/index.html` e edite a linha:

```js
const SYNC_URL = "";   // <- cole aqui a URL do Worker (sem barra no fim)
```

Ex.: `const SYNC_URL = "https://chdx-sync.seu-sub.workers.dev";`

## 3. Publicar o site (Cloudflare Pages)

```bash
cd ..
npx wrangler pages deploy site --project-name chdx-pat
```

Sai uma URL pública tipo `https://chdx-pat.pages.dev` — esse é o link da Patricia (qualquer um abre e vê).

## 4. Como a trava funciona

- **Ver:** `https://chdx-pat.pages.dev` — modo leitura, ninguém edita.
- **Editar (você e a pat):** `https://chdx-pat.pages.dev/?k=SUA_CHAVE` — com a chave, tudo salva e sincroniza entre os aparelhos.

Sem `SYNC_URL` preenchido, o site funciona normal só no aparelho (localStorage). Assim que você liga o Worker, vira sincronizado.

> Dica: enquanto não publica, é só abrir o `site/index.html` no navegador — funciona localmente.
