/**
 * CHDX sync — Cloudflare Worker
 * Trava simples: qualquer um LÊ; só quem tem a chave EDITA.
 *
 *  GET  /state           -> retorna o estado salvo (público)
 *  PUT  /state           -> grava o estado (exige header x-edit-key === EDIT_KEY)
 *
 * Bindings necessários:
 *  - KV namespace:  STATE
 *  - Secret:        EDIT_KEY   (a chave secreta de edição)
 */

const KEY = "v1";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, x-edit-key",
  "Access-Control-Max-Age": "86400",
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...cors },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (url.pathname === "/state" && request.method === "GET") {
      const raw = await env.STATE.get(KEY);
      return json(raw ? JSON.parse(raw) : { camarim: null, guests: [], photos: {}, planner: null });
    }

    if (url.pathname === "/state" && request.method === "PUT") {
      const key = request.headers.get("x-edit-key") || "";
      if (!env.EDIT_KEY || key !== env.EDIT_KEY) {
        return json({ error: "chave inválida — somente leitura" }, 403);
      }
      let body;
      try {
        body = await request.json();
      } catch (e) {
        return json({ error: "json inválido" }, 400);
      }
      
      // Carrega o estado atual para evitar sobrescrever dados de outras abas/arquivos
      const raw = await env.STATE.get(KEY);
      const current = raw ? JSON.parse(raw) : { camarim: null, guests: [], photos: {}, planner: null };

      // sanidade mínima: mescla os campos recebidos com os já salvos
      const clean = {
        camarim: body.camarim !== undefined ? body.camarim : current.camarim,
        guests: body.guests !== undefined ? (Array.isArray(body.guests) ? body.guests.slice(0, 500) : current.guests) : current.guests,
        photos: body.photos !== undefined ? (body.photos && typeof body.photos === "object" ? body.photos : current.photos) : current.photos,
        planner: body.planner !== undefined ? body.planner : current.planner,
        updatedAt: Date.now(),
      };
      await env.STATE.put(KEY, JSON.stringify(clean));
      return json({ ok: true, updatedAt: clean.updatedAt });
    }

    return json({ error: "not found" }, 404);
  },
};
