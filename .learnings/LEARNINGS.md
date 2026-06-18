# Learnings

Correções, insights e lacunas de conhecimento capturadas durante o desenvolvimento.

**Categories**: correction | insight | knowledge_gap | best_practice  
**Areas**: frontend | backend | infra | tests | docs | config  
**Statuses**: pending | in_progress | resolved | wont_fix | promoted

---

## [LRN-20260618-001] config

**Logged**: 2026-06-18T20:51:00Z
**Priority**: high
**Status**: resolved
**Area**: infra

### Summary
Instalação global de skills da Cloudflare falha no macOS via PromptScript; configuração manual no `config.toml` é necessária.

### Details
Ao tentar instalar as skills globais da Cloudflare usando o comando recomendado `npx -y skills add cloudflare/skills --skill '*' --yes --global`, o instalador indicou erro de que o PromptScript não suporta instalação global de skills (como `cloudflare`, `wrangler`, `agents-sdk`, etc.). 

### Suggested Action
Configurar manualmente os servidores MCP adicionando-os na seção `[mcp_servers]` do arquivo `/Users/ana/.Codex/config.toml` e habilitar os plugins `cloudflare@claude-plugins-official` e `cloudflare@openai-curated` configurando `enabled = true`.

### Metadata
- Source: error
- Related Files: /Users/ana/.Codex/config.toml
- Tags: cloudflare, mcp, config, macOS
- Resolution: Resolved by manual edits in config.toml in session 1293084c-8581-4035-8e59-76bb820231c5.
