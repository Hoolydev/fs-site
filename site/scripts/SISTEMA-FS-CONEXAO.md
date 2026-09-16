# Conexão ativada com o sistema FS

Receptor: `https://fs-solucoes-sistema.vercel.app/api/webhooks/diagnostico`

Funil: `comercial` · Etapa: `novos-contatos`.

O projeto `fs-site-preview` recebeu as cinco variáveis de produção descritas em DIAGNOSTICO-WEBHOOK.md (URL, token, segredo HMAC, funil e etapa) e foi reimplantado. Segredos não estão neste arquivo.

O sistema `fs-solucoes-sistema` usa PostgreSQL Neon. Confirma 201 após persistir ou 200 para reenvio já salvo; autentica Bearer e HMAC, valida timestamp, CNPJ e consentimento para atendimento. Não realiza consulta fiscal por esse formulário.

A equipe acessa `https://fs-solucoes-sistema.vercel.app/comercial` sem login, conforme solicitação posterior do usuário. A solicitação aparece em Novos contatos; o cartão abre Dados do contato, Diagnóstico e Anexos. Um novo contato começa aguardando análise, sem débitos fictícios. Pareceres em PDF podem ser vinculados e visualizados no modal.

Homologação em 15/09/2026: fluxo publicado do formulário até o banco validado, reenvio deduplicado, PDF armazenado e servido com controle de acesso. Uma solicitação explicitamente identificada como HOMOLOGAÇÃO FS foi mantida para conferência. Nenhuma mensagem WhatsApp foi enviada pelo teste.

Atualização: o login HTTP Basic do Comercial foi removido por solicitação do usuário. O webhook continua autenticado por token e assinatura.
