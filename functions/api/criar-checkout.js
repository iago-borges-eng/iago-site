// Pages Function — cria um link de pagamento no Mercado Pago (Checkout Pro).
// O token vive em env MP_ACCESS_TOKEN (configurado no painel do Cloudflare Pages),
// nunca no código. Recebe POST {descricao, valor, parcelas, nome?, email?} e
// devolve {init_point} — a URL do checkout pra mandar pro cliente.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

export function onRequestOptions() {
  return new Response(null, { headers: CORS });
}

export async function onRequestPost({ request, env }) {
  const token = env.MP_ACCESS_TOKEN;
  if (!token) {
    return json({ error: 'MP_ACCESS_TOKEN não está configurado no Cloudflare Pages.' }, 500);
  }

  let data;
  try {
    data = await request.json();
  } catch {
    return json({ error: 'JSON inválido.' }, 400);
  }

  const descricao = (String(data.descricao || '').trim() || 'Pagamento · Iago Bald').slice(0, 200);
  const valor = Number(data.valor);
  const parcelas = Math.min(Math.max(parseInt(data.parcelas, 10) || 12, 1), 12);

  if (!Number.isFinite(valor) || valor < 5 || valor > 100000) {
    return json({ error: 'Valor inválido. Use um número entre R$5 e R$100.000.' }, 400);
  }

  const payer = {};
  if (data.email) payer.email = String(data.email).trim().slice(0, 120);
  if (data.nome) payer.name = String(data.nome).trim().slice(0, 80);

  const ref = 'bald-' + Date.now();

  const pref = {
    items: [{
      title: descricao,
      quantity: 1,
      unit_price: Math.round(valor * 100) / 100,
      currency_id: 'BRL',
    }],
    payment_methods: { installments: parcelas },
    back_urls: {
      success: 'https://iagobald.com.br/pagar/?status=ok',
      pending: 'https://iagobald.com.br/pagar/?status=pendente',
      failure: 'https://iagobald.com.br/pagar/?status=falha',
    },
    auto_return: 'approved',
    statement_descriptor: 'IAGOBALD',
    external_reference: ref,
  };
  if (payer.email || payer.name) pref.payer = payer;

  let resp, out;
  try {
    resp = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pref),
    });
    out = await resp.json();
  } catch (e) {
    return json({ error: 'Não consegui falar com o Mercado Pago.', detail: String(e) }, 502);
  }

  if (!resp.ok) {
    return json({ error: out.message || 'Erro ao criar o link no Mercado Pago.', detail: out }, 502);
  }

  return json({
    id: out.id,
    init_point: out.init_point,
    sandbox_init_point: out.sandbox_init_point,
    ref,
  });
}
