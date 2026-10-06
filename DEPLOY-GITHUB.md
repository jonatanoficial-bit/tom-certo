# Deploy no GitHub Pages

## Configuração única no GitHub

1. Crie ou conecte o repositório e envie o branch `main`.
2. Em **Settings → Pages**, selecione **GitHub Actions** como fonte de deploy.
3. Faça push para `main` ou execute manualmente o workflow **Deploy Tom Certo to GitHub Pages**.

O arquivo `.github/workflows/deploy.yml` habilita o GitHub Pages na primeira execução, instala dependências com `pnpm install --frozen-lockfile`, executa lint, typecheck, testes e build, e só publica se tudo passar.

## Caminho de assets

O workflow configura automaticamente:

- `VITE_BASE_PATH=/` para um repositório `usuario.github.io`;
- `VITE_BASE_PATH=/nome-do-repositorio/` para um repositório de projeto.

Para testar localmente um site de projeto:

```bash
VITE_BASE_PATH=/tom-certo/ pnpm build
```

No PowerShell:

```powershell
$env:VITE_BASE_PATH='/tom-certo/'
pnpm build
```

## Atualizações

O service worker atual usa cache do app shell. Mudanças relevantes em assets devem atualizar a versão `CACHE_NAME` em `public/sw.js`. No Lote 11, a estratégia será revisada para cache offline completo e controle de atualização mais refinado.
