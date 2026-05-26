import { useState, useRef, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://lhdbevkcpycikyudzqng.supabase.co";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || "sb_publishable_x98wrvkKncTzTV0QnZZjzA_MjD21sCw";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`;

const makeSlug = (name) => name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Ramos que têm cardápio digital
const RAMOS_COMIDA = ["Hamburgueria","Pizzaria","Restaurante","Cafeteria","Lanchonete","Bar","Sorveteria","Padaria","Sushi/Japonês","Churrascaria"];
const isRamoComida = (ramo) => RAMOS_COMIDA.includes(ramo);

const CARDAPIO_LAYOUTS = [
  { id: "bold-full",   label: "Bold Full",       desc: "Foto pequena + nome e preço" },
  { id: "foto-grande", label: "Foto em Destaque", desc: "Imagem grande por item" },
  { id: "lista",       label: "Lista Compacta",   desc: "Sem foto, máximo de itens" },
  { id: "grade",       label: "Grade 2 Colunas",  desc: "Estilo delivery" },
  { id: "magazine",    label: "Magazine",          desc: "1 destaque + lista" },
];

const CARDAPIO_PALETAS = [
  { id: "dark",   label: "Dark",   bg: "#080808", text: "#f0ede8", card: "#111" },
  { id: "light",  label: "Light",  bg: "#f5f5f0", text: "#111",    card: "#fff" },
  { id: "brasil", label: "Brasil", bg: "#005c2a", text: "#fff",    card: "#004a22" },
  { id: "neutro", label: "Neutro", bg: "#1a1a1a", text: "#e0e0e0", card: "#242424" },
];

const makeDefaultCardapio = () => ({
  layout: "bold-full",
  paleta: "dark",
  categorias: [
    {
      id: "cat_1", nome: "Destaques", itens: [
        { id: "item_1", nome: "Hambúrguer Clássico", desc: "Blend 180g, queijo, alface, tomate", preco: "R$ 32,00", foto: "" },
        { id: "item_2", nome: "Smash Burguer",        desc: "Blend 120g duplo, cheddar derretido", preco: "R$ 38,00", foto: "" },
      ]
    },
    {
      id: "cat_2", nome: "Bebidas", itens: [
        { id: "item_3", nome: "Refrigerante Lata", desc: "350ml gelado", preco: "R$ 7,00", foto: "" },
        { id: "item_4", nome: "Suco Natural",       desc: "400ml — laranja, limão ou abacaxi", preco: "R$ 12,00", foto: "" },
      ]
    },
  ]
});

const makeDefaultQuestions = () => [
  { id: "q_atend", type: "staff",  label: "Quem realizou seu atendimento?",  options: ["Ana", "Carlos", "João", "Maria"], required: true },
  { id: "q_first", type: "choice", label: "É a sua primeira vez aqui?",      options: ["Sim", "Não"], required: true },
  { id: "q_hora",  type: "choice", label: "Em qual horário foi o atendimento?", options: ["De manhã", "De tarde", "De noite"], required: true },
  { id: "q_mesa",  type: "choice", label: "Quantas pessoas na mesa?",         options: ["Vim sozinho", "2 pessoas", "3 a 6 pessoas", "Mais de 6 pessoas"], required: true },
  { id: "q_como",  type: "choice", label: "Como conheceu o estabelecimento?", options: ["Instagram", "Indicação de amigos", "Família", "Influenciador", "TikTok", "Outro"], required: true, allowOther: true },
  { id: "q_amb",   type: "stars",  label: "Como avalia nosso ambiente?",      required: true },
  { id: "q_atd",   type: "stars",  label: "Como avalia nosso atendimento?",   required: true },
  { id: "q_prat",  type: "stars",  label: "Como avalia a qualidade dos pratos?", required: true },
  { id: "q_beb",   type: "stars",  label: "Como avalia a qualidade das bebidas?", required: true },
  { id: "q_esp",   type: "stars",  label: "Como avalia o tempo de espera?",   required: true },
  { id: "q_preco", type: "choice", label: "O que achou do nosso preço?",      options: ["Barato pelo que oferece", "Ideal pelo que oferece", "Caro pelo que oferece"], required: true },
  { id: "q_nps",   type: "nps",    label: "De 0 a 10, o quanto nos indicaria?", required: true },
  { id: "q_sug",   type: "text",   label: "Sugestão ou elogio para nós!",     required: false },
];

const SEED = [
  {
    id: "est_1", owner: "joao@burguer.com", pass: "123456", ativo: true,
    name: "Black Burguer", emoji: "🍔", color: "#e63946", slug: "black-burguer",
    googleUrl: "https://g.page/r/exemplo/review", logoUrl: "", feedbackInterval: 30,
    questions: makeDefaultQuestions(),
    prizes: [
      { id: "p1", label: "Fritas Grátis",    emoji: "🍟", color: "#e63946" },
      { id: "p2", label: "10% Desconto",     emoji: "🏷️", color: "#1a1a1a" },
      { id: "p3", label: "Refri Grátis",     emoji: "🥤", color: "#c1121f" },
      { id: "p4", label: "Sobremesa Grátis", emoji: "🍦", color: "#333" },
      { id: "p5", label: "20% Desconto",     emoji: "🎉", color: "#e63946" },
      { id: "p6", label: "Brinde Surpresa",  emoji: "🎁", color: "#111" },
    ],
    cardapio: makeDefaultCardapio(),
    feedbacks: [], plano: "R$ 169/mês", desde: "01/05/2026",
    responsavel: "João Silva", cidade: "Matinhos", ramo: "Hamburgueria", telefone: "(41) 99999-0001", whatsapp: "5541999990001",
  },
  {
    id: "est_demo", owner: "demo@notacheia.com.br", pass: "demo123", ativo: true,
    name: "Fake Burguer", emoji: "🍔", color: "#f4a261", slug: "fake-burguer",
    googleUrl: "", logoUrl: "", feedbackInterval: 0,
    // Perguntas de prospecção — para mostrar o produto a donos de estabelecimento
    questions: [
      { id: "qd_ramo",  type: "text",   label: "Qual é o seu ramo de atuação?", required: true },
      { id: "qd_fluxo", type: "choice", label: "Quantos clientes passam pelo seu estabelecimento por dia?", options: ["Menos de 50", "50 a 100", "Mais de 100", "Não sei ao certo"], required: true },
      { id: "qd_brind", type: "choice", label: "Você estaria disposto a oferecer brindes para seus clientes?", options: ["Sim, com certeza!", "Talvez, depende do custo", "Prefiro oferecer descontos", "Não sei ainda"], required: true },
      { id: "qd_fav",   type: "choice", label: "Você sabe qual prato/produto é o favorito dos seus clientes?", options: ["Sei sim!", "Acho que sei", "Não faço ideia"], required: true },
      { id: "qd_fb",    type: "choice", label: "Como você recebe feedback dos clientes hoje?", options: ["Não recebo", "Pelo Google", "Pessoalmente", "Redes sociais"], required: true },
      { id: "qd_goal",  type: "choice", label: "O que mais te interessa no seu negócio?", options: ["Fidelizar clientes", "Entender meu negócio melhor", "Atrair clientes novos", "Tudo isso!"], required: true },
    ],
    prizes: [
      { id: "pd1", label: "1 Mês Grátis",           emoji: "🎁", color: "#e63946" },
      { id: "pd2", label: "Setup Grátis",            emoji: "🛠️", color: "#2a9d8f" },
      { id: "pd3", label: "50% no 1º Mês",           emoji: "🏷️", color: "#457b9d" },
      { id: "pd4", label: "2 Meses pelo Preço de 1", emoji: "🎉", color: "#6d597a" },
      { id: "pd5", label: "Plano Pro c/ Desconto",   emoji: "⭐", color: "#f4a261" },
    ],
    cardapio: null,
    feedbacks: [
      { id: "fd1", nome: "Carlos Souza",  data: "25/05/2026 14:32", answers: { qd_ramo: "Pizzaria", qd_fluxo: "50 a 100", qd_brind: "Sim, com certeza!", qd_fav: "Acho que sei", qd_fb: "Pelo Google", qd_goal: "Fidelizar clientes" }, premio: "1 Mês Grátis" },
      { id: "fd2", nome: "Mariana Lima",  data: "24/05/2026 11:10", answers: { qd_ramo: "Lanchonete", qd_fluxo: "Mais de 100", qd_brind: "Talvez, depende do custo", qd_fav: "Sei sim!", qd_fb: "Pessoalmente", qd_goal: "Atrair clientes novos" }, premio: "Setup Grátis" },
      { id: "fd3", nome: "Roberto Alves", data: "23/05/2026 19:45", answers: { qd_ramo: "Bar", qd_fluxo: "50 a 100", qd_brind: "Sim, com certeza!", qd_fav: "Não faço ideia", qd_fb: "Não recebo", qd_goal: "Entender meu negócio melhor" }, premio: "50% no 1º Mês" },
      { id: "fd4", nome: "Patrícia Costa", data: "22/05/2026 13:00", answers: { qd_ramo: "Restaurante", qd_fluxo: "Mais de 100", qd_brind: "Prefiro oferecer descontos", qd_fav: "Sei sim!", qd_fb: "Redes sociais", qd_goal: "Tudo isso!" }, premio: "Plano Pro c/ Desconto" },
    ],
    plano: "Demo", desde: "01/05/2026",
    responsavel: "Hudson Nagano", cidade: "Matinhos", ramo: "Hamburgueria", telefone: "(41) 99675-6776", whatsapp: "5541996756776",
  },
];

const MASTER = { user: "master@notacheia.com.br", pass: "hu2001" };
const uid = () => Math.random().toString(36).slice(2, 8);
const genCoupon = () => "NTC-" + Math.random().toString(36).slice(2, 6).toUpperCase();
const addDays = (d) => { const dt = new Date(); dt.setDate(dt.getDate() + d); return dt.toLocaleDateString("pt-BR"); };

function canLeaveFeedback(estId, intervalDays, masterMode = false) {
  if (masterMode) return true;
  try {
    const last = localStorage.getItem(`fb_${estId}`);
    if (!last) return true;
    const diff = (Date.now() - parseInt(last)) / (1000 * 60 * 60 * 24);
    return diff >= intervalDays;
  } catch { return true; }
}
function markFeedbackDone(estId, masterMode = false) {
  if (masterMode) return;
  try { localStorage.setItem(`fb_${estId}`, Date.now().toString()); } catch {}
}
function daysUntilNext(estId, intervalDays) {
  try {
    const last = localStorage.getItem(`fb_${estId}`);
    if (!last) return 0;
    const diff = (Date.now() - parseInt(last)) / (1000 * 60 * 60 * 24);
    return Math.ceil(intervalDays - diff);
  } catch { return 0; }
}

const CSS = (ac = "#e63946") => `
  ${FONTS}
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --ac: ${ac}; --ac-glow: ${ac}55;
    --dark: #080808; --d1: #111; --d2: #181818; --d3: #222;
    --border: rgba(255,255,255,0.07); --text: #f0ede8; --muted: #666; --muted2: #999;
    --ff-head: 'Syne', sans-serif; --ff-body: 'Plus Jakarta Sans', sans-serif;
    --green: #4ade80; --yellow: #f0c96e; --red: #f87171;
  }
  body { background: var(--dark); color: var(--text); font-family: var(--ff-body); min-height: 100vh; }
  .page { min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: 80px 16px 40px; position: relative; }
  .page-center { justify-content: center; }
  .card { background: var(--d1); border: 1px solid var(--border); border-radius: 24px; padding: 28px; width: 100%; max-width: 480px; position: relative; box-shadow: 0 24px 80px rgba(0,0,0,0.6); }
  .card-wide { max-width: 540px; }
  .survey-header { background: var(--d2); border-bottom: 1px solid var(--border); padding: 14px 20px; text-align: center; margin: -28px -28px 20px; border-radius: 23px 23px 0 0; }
  .survey-title { font-family: var(--ff-head); font-size: 18px; }
  .survey-sub { font-size: 12px; color: var(--muted2); margin-top: 4px; line-height: 1.5; }
  .prog-wrap { margin-bottom: 16px; }
  .prog-label { display: flex; justify-content: space-between; font-size: 11px; color: var(--muted); margin-bottom: 6px; font-weight: 700; text-transform: uppercase; }
  .prog-bar { height: 4px; background: var(--d3); border-radius: 2px; overflow: hidden; }
  .prog-fill { height: 100%; background: linear-gradient(90deg, var(--ac), #ff8c69); border-radius: 2px; transition: width 0.4s ease; }
  .q-wrap { background: var(--d2); border: 1px solid var(--border); border-radius: 14px; padding: 16px; margin-bottom: 10px; transition: border-color 0.2s; }
  .q-wrap.answered { border-color: var(--ac)66; }
  .q-num { font-size: 10px; font-weight: 800; letter-spacing: 2px; color: var(--ac); text-transform: uppercase; margin-bottom: 6px; }
  .q-label { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 12px; line-height: 1.4; }
  .staff-grid { display: flex; flex-wrap: wrap; gap: 8px; }
  .staff-btn { padding: 8px 14px; border-radius: 20px; border: 1.5px solid var(--border); background: var(--d3); color: var(--muted2); font-family: var(--ff-body); font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.15s; }
  .staff-btn.sel { border-color: var(--ac); background: var(--ac)22; color: var(--text); }
  .choice-list { display: flex; flex-direction: column; gap: 8px; }
  .choice-item { display: flex; align-items: center; gap: 12px; padding: 11px 14px; border-radius: 12px; border: 1.5px solid var(--border); background: var(--d3); cursor: pointer; transition: all 0.15s; }
  .choice-item.sel { border-color: var(--ac); background: var(--ac)15; }
  .choice-radio { width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--muted); flex-shrink: 0; transition: all 0.15s; }
  .choice-item.sel .choice-radio { border-color: var(--ac); background: var(--ac); }
  .choice-label { font-size: 14px; font-weight: 600; color: var(--muted2); transition: color 0.15s; }
  .choice-item.sel .choice-label { color: var(--text); }
  .other-input { width: 100%; padding: 10px 12px; background: var(--dark); border: 1.5px solid var(--border); border-radius: 10px; color: var(--text); font-family: var(--ff-body); font-size: 14px; outline: none; margin-top: 8px; transition: border 0.2s; }
  .other-input:focus { border-color: var(--ac); }
  .stars-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .star { font-size: 30px; cursor: pointer; filter: grayscale(1) opacity(0.25); transition: all 0.15s; }
  .star.on { filter: none; transform: scale(1.1); }
  .nps-row { display: flex; gap: 4px; flex-wrap: wrap; }
  .nps-btn { width: 34px; height: 34px; border-radius: 8px; border: 1.5px solid var(--border); background: var(--d3); color: var(--muted2); font-family: var(--ff-head); font-size: 13px; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .nps-btn.sel { border-color: var(--ac); background: var(--ac); color: white; }
  .nps-labels { display: flex; justify-content: space-between; margin-top: 6px; }
  .nps-lbl { font-size: 10px; color: var(--muted); }
  .textarea { width: 100%; padding: 12px 14px; background: var(--d3); border: 1.5px solid var(--border); border-radius: 12px; color: var(--text); font-family: var(--ff-body); font-size: 14px; resize: none; outline: none; transition: border 0.2s; min-height: 80px; }
  .textarea:focus { border-color: var(--ac); }
  .textarea::placeholder { color: #444; }
  .field { width: 100%; padding: 12px 16px; background: var(--d2); border: 1.5px solid var(--border); border-radius: 12px; color: var(--text); font-family: var(--ff-body); font-size: 15px; outline: none; transition: border 0.2s; margin-bottom: 12px; }
  .field:focus { border-color: var(--ac); }
  .field::placeholder { color: #444; }
  label.lbl { display: block; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); margin-bottom: 6px; }
  .btn { width: 100%; padding: 14px; border: none; border-radius: 14px; font-family: var(--ff-body); font-size: 15px; font-weight: 800; cursor: pointer; transition: all 0.2s; }
  .btn-red { background: var(--ac); color: #fff; }
  .btn-red:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); box-shadow: 0 8px 28px var(--ac-glow); }
  .btn-red:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }
  .btn-ghost { background: transparent; border: 1.5px solid var(--border); color: var(--muted2); }
  .btn-ghost:hover { border-color: var(--ac); color: var(--ac); }
  .btn-sm { padding: 7px 14px; font-size: 12px; font-weight: 700; border: none; border-radius: 8px; cursor: pointer; font-family: var(--ff-body); transition: all 0.2s; }
  .btn-sm-red { background: var(--ac); color: #fff; }
  .btn-sm-green { background: #0a2a0a; color: var(--green); border: 1px solid var(--green)44; }
  .btn-sm-ghost { background: var(--d3); color: var(--muted); border: 1px solid var(--border); }
  .btn-sm-ghost:hover { border-color: var(--ac); color: var(--ac); }
  .btn-sm-danger { background: #1a0505; color: var(--red); border: 1px solid var(--red)33; }
  .err { background: #1a0505; border: 1px solid #f8717133; border-radius: 10px; padding: 10px 14px; font-size: 13px; color: var(--red); margin-bottom: 12px; }
  .welcome-name { font-family: var(--ff-head); font-size: 26px; text-align: center; color: var(--ac); letter-spacing: 1px; }
  .welcome-tag { font-size: 13px; color: var(--muted2); text-align: center; margin-top: 6px; margin-bottom: 20px; line-height: 1.6; }
  .welcome-badge { display: inline-flex; align-items: center; gap: 6px; background: var(--ac)22; border: 1px solid var(--ac)44; border-radius: 20px; padding: 6px 14px; font-size: 12px; font-weight: 700; color: var(--ac); margin-bottom: 16px; }
  .teaser-wrap { display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 16px; flex-wrap: wrap; }
  .teaser-prize { background: var(--d2); border: 1px solid var(--border); border-radius: 20px; padding: 5px 10px; font-size: 12px; font-weight: 700; color: var(--muted2); white-space: nowrap; animation: fadeUp 0.4s ease forwards; }
  .master-demo-bar { background: linear-gradient(90deg, #f0c96e22, #f0c96e11); border: 1px solid #f0c96e44; border-radius: 10px; padding: 8px 14px; margin-bottom: 14px; font-size: 12px; color: var(--yellow); font-weight: 700; text-align: center; }
  .confirm-wrap { text-align: center; padding: 8px 0; }
  .confirm-icon { font-size: 52px; margin-bottom: 12px; animation: popIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275); }
  .confirm-title { font-family: var(--ff-head); font-size: 24px; letter-spacing: 1px; }
  .confirm-sub { font-size: 13px; color: var(--muted2); margin-top: 6px; margin-bottom: 20px; line-height: 1.6; }
  .wheel-outer { position: relative; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
  .wheel-ptr { position: absolute; top: -14px; font-size: 26px; z-index: 5; filter: drop-shadow(0 2px 4px #000); }
  .wheel-ring { border-radius: 50%; box-shadow: 0 0 0 4px var(--ac), 0 0 0 8px var(--ac)33, 0 20px 60px rgba(0,0,0,0.7); }
  .spin-btn { background: var(--ac); border: 3px solid #000; border-radius: 50%; width: 72px; height: 72px; font-family: var(--ff-head); font-size: 16px; color: #fff; cursor: pointer; box-shadow: 0 4px 20px var(--ac-glow); transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
  .spin-btn:hover:not(:disabled) { transform: scale(1.1); }
  .spin-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .prize-wrap { text-align: center; }
  .prize-emoji { font-size: 64px; margin-bottom: 8px; }
  .prize-title { font-family: var(--ff-head); font-size: 32px; letter-spacing: 2px; color: var(--ac); }
  .prize-name { font-size: 20px; font-weight: 800; margin-top: 4px; margin-bottom: 4px; }
  .prize-congrats { font-size: 13px; color: var(--muted2); margin-bottom: 16px; }
  .coupon-box { background: var(--d2); border: 2px dashed var(--ac)88; border-radius: 16px; padding: 18px; margin: 14px 0; position: relative; overflow: hidden; }
  .coupon-box::before { content: 'CUPOM'; position: absolute; top: 8px; left: 50%; transform: translateX(-50%); font-size: 10px; letter-spacing: 3px; color: var(--muted); font-weight: 800; }
  .coupon-id { font-family: var(--ff-head); font-size: 26px; letter-spacing: 4px; color: var(--text); margin-top: 12px; }
  .coupon-validity { font-size: 12px; color: var(--muted); margin-top: 6px; }
  .btn-download { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 13px; background: var(--d2); border: 1.5px solid var(--border); border-radius: 14px; color: var(--muted2); font-family: var(--ff-body); font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; margin-bottom: 10px; }
  .btn-download:hover { border-color: var(--ac); color: var(--ac); }
  .google-box { background: linear-gradient(135deg, #0a1f0a, #051205); border: 1.5px solid #4ade8044; border-radius: 14px; padding: 16px; text-align: center; margin-bottom: 10px; }
  .btn-google { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; padding: 12px; background: white; color: #111; border: none; border-radius: 10px; font-family: var(--ff-body); font-size: 14px; font-weight: 800; cursor: pointer; transition: all 0.2s; margin-top: 10px; }
  .shell { display: flex; min-height: 100vh; }
  .sidebar { width: 220px; background: var(--d1); border-right: 1px solid var(--border); display: flex; flex-direction: column; padding: 20px 12px; gap: 3px; flex-shrink: 0; }
  .main { flex: 1; overflow-y: auto; padding: 28px; background: var(--dark); }
  .mobile-header { display: none; position: sticky; top: 0; z-index: 100; background: var(--d1); border-bottom: 1px solid var(--border); padding: 12px 16px; align-items: center; justify-content: space-between; }
  .hamburger { background: none; border: none; cursor: pointer; color: var(--text); font-size: 22px; padding: 4px; }
  .sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 200; }
  @media (max-width: 768px) {
    .shell { display: block; }
    .sidebar { position: fixed; top: 0; left: 0; bottom: 0; z-index: 300; transform: translateX(-100%); width: 260px; padding-top: 56px; transition: transform 0.3s ease; }
    .sidebar.open { transform: translateX(0); box-shadow: 4px 0 20px rgba(0,0,0,0.5); }
    .sidebar-overlay.open { display: block; }
    .mobile-header { display: flex; }
    .main { padding: 14px; width: 100%; }
    .main-title { font-size: 20px; margin-bottom: 14px; }
    .metrics { grid-template-columns: repeat(2, 1fr) !important; gap: 8px; }
    .metric { padding: 14px; }
    .metric-val { font-size: 22px; }
    .tbl-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
    .card { padding: 18px; border-radius: 18px; }
    .card-wide { max-width: 100%; }
    .nps-btn { width: 28px; height: 28px; font-size: 11px; }
    .star { font-size: 26px; }
    .page { padding: 56px 14px 28px; }
    .welcome-name { font-size: 22px; }
    .prize-title { font-size: 26px; }
    .prize-emoji { font-size: 52px; }
    .setup-box { padding: 14px; }
    .coupon-id { font-size: 20px; letter-spacing: 3px; }
    #master-table { display: none !important; }
    #master-cards { display: block !important; }
  }
  @media (min-width: 769px) {
    #master-table { display: block !important; }
    #master-cards { display: none !important; }
  }
  .main-title { font-family: var(--ff-head); font-size: 26px; letter-spacing: 1px; margin-bottom: 20px; }
  .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; margin-bottom: 20px; }
  .metric { background: var(--d1); border: 1px solid var(--border); border-radius: 14px; padding: 16px; position: relative; overflow: hidden; }
  .metric::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--ac); }
  .metric-val { font-family: var(--ff-head); font-size: 28px; letter-spacing: 1px; }
  .metric-lbl { font-size: 10px; color: var(--muted); margin-top: 4px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
  .tbl-wrap { background: var(--d1); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; margin-bottom: 14px; }
  .tbl-head { padding: 10px 16px; background: var(--d2); font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: var(--muted); border-bottom: 1px solid var(--border); display: grid; }
  .tbl-row { padding: 12px 16px; border-bottom: 1px solid var(--border); display: grid; align-items: center; font-size: 13px; transition: background 0.1s; }
  .tbl-row:last-child { border-bottom: none; }
  .tbl-row:hover { background: var(--d2); }
  .badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; flex-shrink: 0; }
  .badge-green { background: #0a1f0a; color: var(--green); border: 1px solid var(--green)33; }
  .badge-red { background: #1f0a0a; color: var(--red); border: 1px solid var(--red)33; }
  .live-dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: var(--green); animation: pulse 2s infinite; }
  .fb { background: var(--d2); border: 1px solid var(--border); border-radius: 12px; padding: 16px; margin-bottom: 10px; }
  .fb-top { display: flex; justify-content: space-between; margin-bottom: 10px; align-items: center; }
  .fb-name { font-weight: 800; font-size: 14px; }
  .fb-date { font-size: 11px; color: var(--muted); }
  .fb-comment { font-size: 13px; color: #bbb; font-style: italic; padding: 10px 12px; background: var(--dark); border-radius: 8px; margin: 8px 0; border-left: 3px solid var(--ac)44; }
  .fb-prize { display: inline-flex; align-items: center; gap: 5px; background: var(--dark); border: 1px solid var(--ac)33; border-radius: 20px; padding: 4px 12px; font-size: 11px; font-weight: 700; color: var(--ac); }
  .setup-box { background: var(--d1); border: 1px solid var(--border); border-radius: 14px; padding: 20px; margin-bottom: 12px; }
  .setup-box-title { font-family: var(--ff-head); font-size: 17px; letter-spacing: 0.5px; margin-bottom: 14px; }
  .pill-row { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: var(--d2); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 8px; }
  .pill-lbl { flex: 1; font-weight: 700; font-size: 13px; }
  .pill-sub { font-size: 11px; color: var(--muted); }
  .swatch-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
  .swatch { width: 28px; height: 28px; border-radius: 8px; cursor: pointer; border: 3px solid transparent; transition: all 0.15s; }
  .swatch.on { border-color: white; transform: scale(1.15); }
  .field-inline { flex: 1; padding: 9px 12px; background: var(--d2); border: 1.5px solid var(--border); border-radius: 9px; color: var(--text); font-family: var(--ff-body); font-size: 13px; outline: none; transition: border 0.2s; min-width: 0; }
  .field-inline:focus { border-color: var(--ac); }
  .type-sel { padding: 9px 10px; background: var(--d2); border: 1.5px solid var(--border); border-radius: 9px; color: var(--text); font-family: var(--ff-body); font-size: 13px; outline: none; cursor: pointer; }
  .top-bar { position: fixed; top: 0; left: 0; right: 0; z-index: 999; display: flex; justify-content: flex-end; gap: 8px; padding: 10px 14px; background: linear-gradient(var(--dark), transparent); }
  .top-btn { padding: 7px 14px; border-radius: 8px; border: none; cursor: pointer; font-family: var(--ff-body); font-weight: 700; font-size: 12px; transition: all 0.2s; }
  .top-btn-red { background: var(--ac); color: #fff; }
  .top-btn-ghost { background: var(--d2); color: var(--muted2); border: 1px solid var(--border); }
  .chart-wrap { background: var(--d1); border: 1px solid var(--border); border-radius: 14px; padding: 18px; margin-bottom: 14px; }
  .chart-title { font-size: 12px; font-weight: 800; color: var(--muted2); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px; }
  .bar-chart { display: flex; align-items: flex-end; gap: 6px; height: 90px; }
  .bar-col { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; }
  .bar { width: 100%; border-radius: 5px 5px 0 0; background: var(--ac); transition: height 0.4s ease; min-height: 4px; }
  .bar-val { font-size: 10px; font-weight: 800; color: var(--text); }
  .bar-lbl { font-size: 9px; color: var(--muted); }
  .rank-row { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--border); }
  .rank-row:last-child { border-bottom: none; }
  .rank-num { font-family: var(--ff-head); font-size: 18px; color: var(--muted); width: 24px; }
  .rank-name { flex: 1; font-weight: 700; font-size: 13px; }
  .rank-bar { flex: 2; height: 5px; background: var(--d3); border-radius: 3px; overflow: hidden; }
  .rank-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, var(--ac), #ff8c69); }
  .rank-score { font-family: var(--ff-head); font-size: 16px; color: var(--ac); width: 36px; text-align: right; }
  .filter-row { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
  .filter-btn { padding: 7px 14px; border-radius: 20px; border: 1.5px solid var(--border); background: var(--d2); color: var(--muted2); font-family: var(--ff-body); font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.15s; }
  .filter-btn.on { border-color: var(--ac); background: var(--ac)22; color: var(--text); }
  .insight { display: flex; align-items: flex-start; gap: 12px; padding: 12px; background: var(--d2); border-radius: 10px; margin-bottom: 8px; border-left: 3px solid var(--ac); }
  .insight-icon { font-size: 18px; flex-shrink: 0; }
  .insight-text { font-size: 13px; color: var(--muted2); line-height: 1.5; }
  .insight-text strong { color: var(--text); }
  .qr-wrap { background: white; border-radius: 18px; padding: 22px; text-align: center; max-width: 300px; margin: 0 auto; }
  .qr-logo { font-family: var(--ff-head); font-size: 17px; color: #1d6fa4; margin-bottom: 4px; }
  .qr-logo span { color: #2d9e6b; }
  .qr-est { font-size: 13px; font-weight: 700; color: #333; margin-bottom: 10px; }
  .qr-img { width: 160px; height: 160px; margin: 0 auto 10px; display: block; border-radius: 8px; }
  .qr-inst { font-size: 11px; color: #888; margin-top: 6px; }
  .modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px; }
  .modal { background: var(--d1); border: 1px solid var(--border); border-radius: 18px; padding: 24px; width: 100%; max-width: 460px; max-height: 85vh; overflow-y: auto; }
  .modal-title { font-family: var(--ff-head); font-size: 20px; margin-bottom: 18px; }
  .loading-screen { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--dark); gap: 20px; }
  .loading-spinner { width: 40px; height: 40px; border: 3px solid var(--d3); border-top-color: var(--ac); border-radius: 50%; animation: spin 0.8s linear infinite; }
  .loading-text { font-size: 12px; color: var(--muted); letter-spacing: 2px; text-transform: uppercase; }
  .sidebar-est { padding: 8px 10px; margin-bottom: 8px; }
  .sidebar-est-emoji { font-size: 20px; }
  .sidebar-est-name { font-weight: 800; font-size: 13px; margin-top: 2px; }
  .sidebar-est-email { font-size: 11px; color: var(--muted); }
  .nav { display: flex; align-items: center; gap: 9px; padding: 10px 12px; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 13px; color: var(--muted); transition: all 0.15s; border: none; background: none; width: 100%; text-align: left; font-family: var(--ff-body); }
  .nav:hover { background: var(--d3); color: var(--text); }
  .nav.on { background: var(--ac); color: #fff; }
  .logo-upload-area { border: 2px dashed var(--border); border-radius: 12px; padding: 18px; text-align: center; cursor: pointer; transition: border-color 0.2s; margin-bottom: 10px; }
  .logo-upload-area:hover { border-color: var(--ac); }
  .interval-btn { padding: 8px 14px; border-radius: 10px; font-family: var(--ff-body); font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.15s; }
  .est-card { background: var(--d1); border: 1px solid var(--border); border-radius: 14px; padding: 16px; margin-bottom: 10px; }
  .slug-box { display: flex; align-items: center; gap: 8px; background: var(--d2); border: 1px solid var(--border); border-radius: 10px; padding: 8px 12px; margin-top: 8px; }
  .slug-text { font-size: 12px; color: var(--ac); font-weight: 700; flex: 1; word-break: break-all; }
  /* ---- CARDÁPIO ---- */
  .cardapio-page { min-height: 100vh; padding-bottom: 90px; }
  .cardapio-header { padding: 20px 16px 14px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.08); }
  .cardapio-nome { font-family: var(--ff-head); font-size: 22px; letter-spacing: 1px; }
  .cardapio-cat-tabs { display: flex; gap: 8px; overflow-x: auto; padding: 12px 16px; scrollbar-width: none; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .cardapio-cat-tabs::-webkit-scrollbar { display: none; }
  .cardapio-tab { padding: 7px 16px; border-radius: 20px; font-size: 13px; font-weight: 700; white-space: nowrap; cursor: pointer; border: 1.5px solid transparent; transition: all 0.15s; flex-shrink: 0; }
  .cardapio-items { padding: 14px 16px; }
  .cardapio-footer { position: fixed; bottom: 0; left: 0; right: 0; padding: 12px 16px; border-top: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .cardapio-footer-txt { font-size: 12px; font-weight: 700; flex: 1; }
  .cardapio-footer-btn { padding: 12px 22px; border: none; border-radius: 12px; font-family: var(--ff-body); font-size: 14px; font-weight: 800; cursor: pointer; white-space: nowrap; }
  /* item bold-full */
  .item-bold { display: flex; align-items: center; gap: 12px; padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .item-bold-foto { width: 64px; height: 64px; border-radius: 12px; object-fit: cover; flex-shrink: 0; }
  .item-bold-foto-ph { width: 64px; height: 64px; border-radius: 12px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 28px; }
  .item-bold-info { flex: 1; min-width: 0; }
  .item-bold-nome { font-weight: 800; font-size: 14px; margin-bottom: 3px; }
  .item-bold-desc { font-size: 12px; opacity: 0.6; line-height: 1.4; }
  .item-bold-preco { font-family: var(--ff-head); font-size: 15px; margin-top: 5px; }
  /* item foto-grande */
  .item-foto { border-radius: 14px; overflow: hidden; margin-bottom: 14px; }
  .item-foto-img { width: 100%; height: 180px; object-fit: cover; display: block; }
  .item-foto-img-ph { width: 100%; height: 120px; display: flex; align-items: center; justify-content: center; font-size: 52px; }
  .item-foto-body { padding: 12px 14px; }
  .item-foto-nome { font-weight: 800; font-size: 15px; margin-bottom: 3px; }
  .item-foto-desc { font-size: 12px; opacity: 0.6; line-height: 1.4; }
  .item-foto-preco { font-family: var(--ff-head); font-size: 16px; margin-top: 6px; }
  /* item lista */
  .item-lista { display: flex; justify-content: space-between; align-items: center; padding: 11px 0; border-bottom: 1px solid rgba(255,255,255,0.06); gap: 10px; }
  .item-lista-nome { font-weight: 700; font-size: 13px; }
  .item-lista-desc { font-size: 11px; opacity: 0.55; margin-top: 1px; }
  .item-lista-preco { font-family: var(--ff-head); font-size: 13px; flex-shrink: 0; }
  /* item grade */
  .grade-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .item-grade { border-radius: 14px; overflow: hidden; }
  .item-grade-img { width: 100%; height: 110px; object-fit: cover; display: block; }
  .item-grade-img-ph { width: 100%; height: 90px; display: flex; align-items: center; justify-content: center; font-size: 36px; }
  .item-grade-body { padding: 10px; }
  .item-grade-nome { font-weight: 800; font-size: 13px; margin-bottom: 2px; }
  .item-grade-preco { font-family: var(--ff-head); font-size: 13px; margin-top: 4px; }
  /* item magazine */
  .item-mag-destaque { border-radius: 16px; overflow: hidden; margin-bottom: 14px; }
  .item-mag-destaque-img { width: 100%; height: 200px; object-fit: cover; display: block; }
  .item-mag-destaque-img-ph { width: 100%; height: 140px; display: flex; align-items: center; justify-content: center; font-size: 64px; }
  .item-mag-destaque-body { padding: 14px; }
  .item-mag-destaque-nome { font-family: var(--ff-head); font-size: 18px; margin-bottom: 4px; }
  .item-mag-destaque-desc { font-size: 13px; opacity: 0.65; }
  .item-mag-destaque-preco { font-family: var(--ff-head); font-size: 18px; margin-top: 8px; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes popIn { from { transform:scale(0.4); opacity:0; } to { transform:scale(1); opacity:1; } }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
  .fade-up { animation: fadeUp 0.4s ease forwards; }
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: var(--dark); } ::-webkit-scrollbar-thumb { background: var(--d3); border-radius: 3px; }
  .div { height: 1px; background: var(--border); margin: 14px 0; }
`;


// ============================================================
// EMOJI PICKER — Estilo WhatsApp com ramos de negócio
// ============================================================
const RAMOS_EMOJIS = [
  { ramo: "Hamburgueria",        emoji: "🍔", desc: "Lanches e hambúrgueres" },
  { ramo: "Pizzaria",            emoji: "🍕", desc: "Pizzas e massas" },
  { ramo: "Restaurante",         emoji: "🍽️", desc: "Restaurante geral" },
  { ramo: "Churrascaria",        emoji: "🥩", desc: "Carnes e churrasco" },
  { ramo: "Comida Japonesa",     emoji: "🍣", desc: "Sushi, temaki, yakisoba" },
  { ramo: "Comida Chinesa",      emoji: "🥡", desc: "Oriental variado" },
  { ramo: "Comida Mexicana",     emoji: "🌮", desc: "Tacos, burritos, nachos" },
  { ramo: "Cafeteria",           emoji: "☕", desc: "Café e salgados" },
  { ramo: "Padaria",             emoji: "🥐", desc: "Pães, bolos, doces" },
  { ramo: "Sorveteria / Açaí",   emoji: "🍦", desc: "Sorvetes e açaí" },
  { ramo: "Bar / Pub",           emoji: "🍺", desc: "Cervejas e petiscos" },
  { ramo: "Lanchonete",          emoji: "🌭", desc: "Lanches rápidos" },
  { ramo: "Confeitaria",         emoji: "🎂", desc: "Bolos personalizados" },
  { ramo: "Clínica Médica",      emoji: "🩺", desc: "Consultas e exames" },
  { ramo: "Clínica Dentista",    emoji: "🦷", desc: "Odontologia" },
  { ramo: "Farmácia",            emoji: "💊", desc: "Medicamentos e saúde" },
  { ramo: "Academia",            emoji: "🏋️", desc: "Musculação e fitness" },
  { ramo: "Salão de Beleza",     emoji: "💇", desc: "Cabelo, unhas, estética" },
  { ramo: "Barbearia",           emoji: "💈", desc: "Barba e cabelo masculino" },
  { ramo: "Spa / Estética",      emoji: "🧖", desc: "Massagem e bem-estar" },
  { ramo: "Petshop",             emoji: "🐾", desc: "Banho, tosa e veterinário" },
  { ramo: "Posto de Gasolina",   emoji: "⛽", desc: "Combustível e conveniência" },
  { ramo: "Imobiliária",         emoji: "🏠", desc: "Venda e locação de imóveis" },
  { ramo: "Hotel",               emoji: "🏨", desc: "Hospedagem e quartos" },
  { ramo: "Pousada",             emoji: "🛖", desc: "Hospedagem aconchegante" },
  { ramo: "Hostel",              emoji: "🛏️", desc: "Hospedagem econômica" },
  { ramo: "Supermercado",        emoji: "🛒", desc: "Mercado e mercearia" },
  { ramo: "Loja de Roupas",      emoji: "👗", desc: "Moda e vestuário" },
  { ramo: "Calçados",            emoji: "👟", desc: "Sapatos e tênis" },
  { ramo: "Ótica",               emoji: "👓", desc: "Óculos e lentes" },
  { ramo: "Joalheria",           emoji: "💍", desc: "Joias e acessórios" },
  { ramo: "Papelaria",           emoji: "📚", desc: "Material escolar" },
  { ramo: "Floricultura",        emoji: "💐", desc: "Flores e presentes" },
  { ramo: "Escola / Curso",      emoji: "🎓", desc: "Ensino e capacitação" },
  { ramo: "Oficina / Auto",      emoji: "🔧", desc: "Mecânica e auto center" },
  { ramo: "Lavanderia",          emoji: "👕", desc: "Lavagem e passagem" },
  { ramo: "Delivery",            emoji: "🛵", desc: "Entrega de qualquer tipo" },
  { ramo: "Clínica Veterinária", emoji: "🐕", desc: "Veterinário e animais" },
  { ramo: "Fisioterapia",        emoji: "🤸", desc: "Reabilitação" },
  { ramo: "Psicologia",          emoji: "🧠", desc: "Saúde mental" },
  { ramo: "Nutrição",            emoji: "🥗", desc: "Alimentação e dietas" },
  { ramo: "Advocacia",           emoji: "⚖️", desc: "Serviços jurídicos" },
  { ramo: "Contabilidade",       emoji: "📊", desc: "Contabilidade e finanças" },
  { ramo: "Tecnologia / TI",     emoji: "💻", desc: "Serviços de TI" },
  { ramo: "Fotografia",          emoji: "📸", desc: "Fotos e ensaios" },
  { ramo: "Escola de Música",    emoji: "🎵", desc: "Aulas de música" },
  { ramo: "Escape Room / Lazer", emoji: "🎯", desc: "Entretenimento" },
];

const WA_CATS = {
  "😀 Rostos":   ["😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃","😉","😊","😇","🥰","😍","🤩","😘","😗","😚","😙","🥲","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤫","🤔","🤐","🤨","😐","😑","😶","😏","😒","🙄","😬","🤥","😌","😔","😪","🤤","😴","😷","🤒","🤕","🤢","🤮","🤧","🥵","🥶","🥴","😵","🤯","🤠","🥳","🥸","😎","🤓","🧐","😕","😟","🙁","☹️","😮","😲","😳","🥺","😦","😧","😨","😰","😥","😢","😭","😱","😖","😣","😞","😓","😩","😫","🥱","😤","😡","😠","🤬","😈","👿","💀","☠️","💩","🤡","👹","👺","👻","👾","🤖"],
  "👋 Gestos":   ["👋","🤚","🖐","✋","🖖","👌","🤌","🤏","✌️","🤞","🤟","🤘","🤙","👈","👉","👆","🖕","👇","☝️","👍","👎","✊","👊","🤛","🤜","👏","🙌","🫶","👐","🤲","🙏","✍️","💅","🤳","💪","🦾","🦵","🦶","👂","🦻","👃","👀","👁","👅","👄"],
  "❤️ Corações": ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗","💖","💘","💝","💟","❤️‍🔥","❤️‍🩹","💋","💌"],
  "🎉 Festas":   ["🎉","🎊","🎈","🎁","🎀","🎗️","🏆","🥇","🥈","🥉","🏅","🎖","🎯","🎪","🎭","🎨","🎬","🎤","🎧","🎼","🎵","🎶","🎷","🎸","🎹","🎺","🎻","🥁","🎲","🎮","🕹️"],
  "✈️ Viagem":   ["✈️","🚀","🛸","🚗","🚕","🚙","🚌","🏎️","🚓","🚑","🚒","🛻","🚚","🏍️","🛵","🚲","🛴","⛽","🗺️","🧭","⛺","🏕️","🛖","🏠","🏡","🏢","🏥","🏦","🏨","🏪","🏫","🏬","🏯","🏰","💒","🗼","🗽","🕌","⛩️","🌆","🌇","🌃","🌉","🌅","🌄"],
  "⭐ Símbolos": ["⭐","🌟","💫","✨","🔥","💥","❄️","🌈","☀️","⛅","☁️","⛈️","🌩️","🌪️","🌊","💧","💦","☔","⚡","🌙","🌞","🪐","🌍","🌎","🌏","💡","🔦","🔑","🗝️","🔐","🔒","🔓","🔨","🔧","🔩","🔗","💰","💸","💳","🪙","💹","📈","📉","📊","💬","💭","📌","📍","🚩","❌","✅","✔️","❎","🔴","🟠","🟡","🟢","🔵","🟣","⚫","⚪","🟤","💯","🆕","🆓","🆒"],
  "🐶 Animais":  ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🙈","🙉","🙊","🐔","🐧","🐦","🦆","🦅","🦉","🦇","🐺","🐗","🐴","🦄","🐝","🦋","🐌","🐞","🐜","🕷","🦂","🐢","🐍","🦎","🐙","🦑","🦐","🦞","🦀","🐡","🐠","🐟","🐬","🐳","🦈","🐅","🐆","🦓","🐘","🦒","🦘","🐄","🐎","🐑","🦙","🐐","🦌","🐕","🐩","🦮","🐈","🐾"],
  "🌸 Natureza": ["🌸","🌺","🌻","🌹","🥀","🌷","🌼","💐","🍀","🌿","🍃","🍂","🍁","🌾","🌵","🎄","🌲","🌳","🌴","🌱","🪴","🌋","⛰️","🏔️","🗻","🏖","🏝","🌠","🎇","🎆"],
  "🍕 Comida":   ["🍕","🍔","🌮","🌯","🥙","🧆","🥚","🍳","🥘","🍲","🍜","🍝","🍛","🍣","🍱","🥟","🍤","🍙","🍚","🍘","🍥","🧁","🍰","🎂","🍮","🍭","🍬","🍫","🍿","🍩","🍪","🌰","🥜","🍞","🥐","🥖","🥨","🥯","🧀","🥗","🥦","🥬","🥒","🥕","🧄","🧅","🌽","🌶️","🍆","🍅","🍄","🥑","🍒","🍑","🥭","🍍","🥥","🍇","🍓","🫐","🍉","🍊","🍋","🍌","🍎","🍏","🍐","☕","🍵","🧃","🥤","🧋","🍺","🍻","🥂","🍷","🍸","🍹","🍾","🧉","🥛","🍶"],
  "⚽ Esportes": ["⚽","🏀","🏈","⚾","🥎","🎾","🏐","🏉","🥏","🎱","🏓","🏸","🏒","🏑","🥍","🏏","⛳","🥊","🥋","🎽","🛹","🛼","🛷","⛸️","🥌","🎿","⛷️","🏂","🪂","🏋️","🤼","🤸","⛹️","🤺","🤾","🏇","🏊","🏄","🚣","🧘","🏆","🥇","🥈","🥉"],
  "📱 Tech":     ["📱","💻","🖥️","🖨️","⌨️","🖱️","💽","💾","💿","📀","📷","📸","📹","🎥","📽️","🎞️","📞","☎️","📟","📠","📺","📻","🧭","⏱️","⏰","⌚","📡","🔋","🔌","💡","🔦","🕯️","🔭","🔬","🩺","🧬","🔬","💊","🩹","🧪","🧫","🧲","🔩","🔧","🪛","🔨","⚒️","🛠️"],
  "👔 Roupas":   ["👔","👗","👘","🥻","🩱","🩲","🩳","👙","👚","👛","👜","👝","🎒","🧳","👒","🎩","🧢","⛑️","👑","💍","💎","👠","👡","🥿","👢","👞","👟","🥾","🧤","🧣","🧦","🧥","🥼"],
};

const WA_SEARCH_NAMES = {
  "😥":"suando","🚀":"foguete rocket","🎯":"alvo target","❌":"x erro fechar","📍":"local pin mapa","😂":"rindo haha","😘":"beijo kiss","😗":"beijo kiss","😚":"beijo kiss","😄":"sorrindo feliz","😓":"suando cansado","❤️":"coracao amor love","🔥":"fogo fire","⭐":"estrela star","💯":"cem perfeito","✅":"ok certo check","📈":"subindo crescimento","💰":"dinheiro money","🏆":"trofeu campeao","🎉":"festa party","👏":"palmas parabens","🙏":"obrigado please","💪":"forte musculo","🤝":"acordo handshake","😊":"feliz smile","🥰":"apaixonado love","😍":"apaixonado olhos","🤩":"incrivel wow","😎":"legal cool","🤔":"pensando hmm","😴":"dormindo sono","🤣":"gargalhando rindo","😭":"chorando sad","😱":"assustado shock","🎁":"presente gift","🎊":"confete festa","🌟":"brilhante destaque","💫":"estrela girando","✨":"brilho sparkle","🙌":"comemorando","👍":"legal positivo","👎":"ruim negativo","💔":"coracao partido","🔑":"chave key","💡":"ideia light","📊":"grafico chart","📅":"calendario agenda","🔔":"notificacao sino",
};

function EmojiPicker({ value, onChange, ramoAtual }) {
  const [tab, setTab] = React.useState("ramos");
  const [search, setSearch] = React.useState("");
  const [waCat, setWaCat] = React.useState(Object.keys(WA_CATS)[0]);
  const [selectedRamo, setSelectedRamo] = React.useState(ramoAtual || null);

  const filteredRamos = search
    ? RAMOS_EMOJIS.filter(r =>
        r.ramo.toLowerCase().includes(search.toLowerCase()) ||
        r.desc.toLowerCase().includes(search.toLowerCase())
      )
    : RAMOS_EMOJIS;

  const waEmojis = React.useMemo(() => {
    if (search && tab === "todos") {
      const q = search.toLowerCase();
      const all = Object.values(WA_CATS).flat();
      const unique = [...new Set(all)];
      const byName = unique.filter(e => (WA_SEARCH_NAMES[e] || "").includes(q));
      if (byName.length >= 10) return byName.slice(0, 80);
      return unique.slice(0, 80);
    }
    return WA_CATS[waCat] || [];
  }, [search, tab, waCat]);

  const selectRamo = (r) => {
    setSelectedRamo(r.ramo);
    onChange(r.emoji);
  };

  return (
    <div style={{ background: "var(--d2)", border: "1px solid var(--border)", borderRadius: 12, padding: 12, marginBottom: 14 }}>
      {/* Preview */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10, padding: "8px 10px", background: "var(--dark)", borderRadius: 8 }}>
        <div style={{ width: 44, height: 44, background: "var(--d3)", border: "1.5px solid var(--border)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>{value}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>{selectedRamo || "Selecione um ramo ou emoji"}</div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Clique em um ramo ou escolha na aba "Todos os emojis"</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--border)", marginBottom: 10 }}>
        {[["ramos","🏪 Por ramo"],["todos","😀 Todos os emojis"]].map(([k,l]) => (
          <button key={k} onClick={() => { setTab(k); setSearch(""); }} style={{ padding: "7px 14px", fontSize: 12, fontWeight: 700, border: "none", background: "none", color: tab === k ? "var(--text)" : "var(--muted)", borderBottom: `2px solid ${tab === k ? "var(--ac)" : "transparent"}`, cursor: "pointer", marginBottom: -1, fontFamily: "var(--ff-body)" }}>{l}</button>
        ))}
      </div>

      {/* Busca */}
      <input className="field" placeholder={tab === "ramos" ? "🔍 Buscar ramo... ex: pizza, academia, hotel" : "🔍 Buscar emoji... ex: coração, foguete, rindo"} value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 8, fontSize: 13 }} />

      {/* Aba: ramos */}
      {tab === "ramos" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(86px, 1fr))", gap: 5, maxHeight: 260, overflowY: "auto", paddingRight: 2 }}>
          {filteredRamos.map(r => (
            <button key={r.ramo} onClick={() => selectRamo(r)} title={r.desc}
              style={{ padding: "7px 4px", border: `1.5px solid ${selectedRamo === r.ramo ? "var(--ac)" : "var(--border)"}`, borderRadius: 8, cursor: "pointer", background: selectedRamo === r.ramo ? "var(--ac)22" : "var(--d3)", color: selectedRamo === r.ramo ? "var(--text)" : "var(--muted2)", fontSize: 10, textAlign: "center", lineHeight: 1.3, transition: "all .15s", fontFamily: "var(--ff-body)", fontWeight: selectedRamo === r.ramo ? 800 : 600 }}>
              <div style={{ fontSize: 22, marginBottom: 3 }}>{r.emoji}</div>
              {r.ramo}
            </button>
          ))}
          {filteredRamos.length === 0 && <div style={{ gridColumn: "1/-1", textAlign: "center", color: "var(--muted)", fontSize: 12, padding: 16 }}>Nenhum ramo encontrado</div>}
        </div>
      )}

      {/* Aba: todos os emojis WhatsApp */}
      {tab === "todos" && (
        <>
          {!search && (
            <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 6, marginBottom: 6 }}>
              {Object.keys(WA_CATS).map(k => (
                <button key={k} onClick={() => setWaCat(k)}
                  style={{ padding: "4px 9px", fontSize: 11, fontWeight: 700, border: `1.5px solid ${waCat === k ? "var(--ac)" : "var(--border)"}`, borderRadius: 20, cursor: "pointer", background: waCat === k ? "var(--ac)22" : "none", color: waCat === k ? "var(--text)" : "var(--muted)", whiteSpace: "nowrap", flexShrink: 0, fontFamily: "var(--ff-body)" }}>{k}</button>
              ))}
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(32px, 1fr))", gap: 2, maxHeight: 200, overflowY: "auto" }}>
            {waEmojis.map(e => (
              <button key={e} onClick={() => { onChange(e); setSelectedRamo(null); }}
                style={{ width: 32, height: 32, fontSize: 18, border: value === e ? "2px solid var(--ac)" : "1px solid transparent", background: value === e ? "var(--ac)22" : "none", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {e}
              </button>
            ))}
          </div>
          {/* Campo de digitação direta */}
          <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "var(--dark)", borderRadius: 8 }}>
            <span style={{ fontSize: 11, color: "var(--muted)", whiteSpace: "nowrap" }}>✏️ Digite direto:</span>
            <input className="field" placeholder="Cole ou digite um emoji..." style={{ marginBottom: 0, flex: 1, fontSize: 18, padding: "4px 10px", height: 36 }}
              onInput={e => { const chars = [...e.target.value]; if (chars.length > 0) { onChange(chars[chars.length - 1]); setSelectedRamo(null); } }} />
          </div>
        </>
      )}
    </div>
  );
}

function LogoSVG({ size = 140, style = {} }) {
  const [err, setErr] = useState(false);
  if (err) return (
    <div style={{ fontFamily: "var(--ff-head)", fontSize: 20, textAlign: "center", ...style }}>
      <span style={{ color: "#1d6fa4" }}>Nota</span><span style={{ color: "#2d9e6b" }}>Cheia</span>
    </div>
  );
  return <img src="/logo.png" alt="NotaCheia" style={{ width: size, height: "auto", objectFit: "contain", ...style }} onError={() => setErr(true)} />;
}

function EstLogo({ est, size = 64 }) {
  const [err, setErr] = useState(false);
  if (est.logoUrl && !err) return <img src={est.logoUrl} alt={est.name} style={{ width: size, height: size, objectFit: "contain", borderRadius: 10 }} onError={() => setErr(true)} />;
  return <span style={{ fontSize: size * 0.7 }}>{est.emoji}</span>;
}

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <LogoSVG size={150} />
      <div className="loading-spinner" />
      <div className="loading-text">Carregando...</div>
    </div>
  );
}

// ============================================================
// CARDÁPIO VIEW — tela pública que o cliente vê
// ============================================================
function CardapioView({ est, onAvaliar }) {
  const cardapio = est.cardapio || makeDefaultCardapio();
  const paleta = CARDAPIO_PALETAS.find(p => p.id === cardapio.paleta) || CARDAPIO_PALETAS[0];
  const [catAtiva, setCatAtiva] = useState(cardapio.categorias?.[0]?.id || "");
  const catAtual = cardapio.categorias?.find(c => c.id === catAtiva) || cardapio.categorias?.[0];
  const ac = est.color || "#e63946";

  const estilos = {
    bg: paleta.bg,
    text: paleta.text,
    card: paleta.card,
    ac,
  };

  const renderItem = (item) => {
    const layout = cardapio.layout;
    const fotoEl = item.foto
      ? <img src={item.foto} alt={item.nome} style={{ objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />
      : null;

    if (layout === "bold-full") return (
      <div className="item-bold" key={item.id}>
        {item.foto
          ? <img src={item.foto} alt={item.nome} className="item-bold-foto" />
          : <div className="item-bold-foto-ph" style={{ background: estilos.card }}>🍽️</div>
        }
        <div className="item-bold-info">
          <div className="item-bold-nome" style={{ color: estilos.text }}>{item.nome}</div>
          {item.desc && <div className="item-bold-desc" style={{ color: estilos.text }}>{item.desc}</div>}
          {item.preco && <div className="item-bold-preco" style={{ color: ac }}>{item.preco}</div>}
        </div>
      </div>
    );

    if (layout === "foto-grande") return (
      <div className="item-foto" key={item.id} style={{ background: estilos.card }}>
        {item.foto
          ? <img src={item.foto} alt={item.nome} className="item-foto-img" />
          : <div className="item-foto-img-ph" style={{ background: estilos.card, opacity: 0.5 }}>🍽️</div>
        }
        <div className="item-foto-body">
          <div className="item-foto-nome" style={{ color: estilos.text }}>{item.nome}</div>
          {item.desc && <div className="item-foto-desc" style={{ color: estilos.text }}>{item.desc}</div>}
          {item.preco && <div className="item-foto-preco" style={{ color: ac }}>{item.preco}</div>}
        </div>
      </div>
    );

    if (layout === "lista") return (
      <div className="item-lista" key={item.id}>
        <div>
          <div className="item-lista-nome" style={{ color: estilos.text }}>{item.nome}</div>
          {item.desc && <div className="item-lista-desc" style={{ color: estilos.text }}>{item.desc}</div>}
        </div>
        {item.preco && <div className="item-lista-preco" style={{ color: ac }}>{item.preco}</div>}
      </div>
    );

    if (layout === "magazine") {
      const isFirst = catAtual?.itens?.[0]?.id === item.id;
      if (isFirst) return (
        <div className="item-mag-destaque" key={item.id} style={{ background: estilos.card }}>
          {item.foto
            ? <img src={item.foto} alt={item.nome} className="item-mag-destaque-img" />
            : <div className="item-mag-destaque-img-ph" style={{ background: estilos.card, opacity: 0.4 }}>🍽️</div>
          }
          <div className="item-mag-destaque-body">
            <div className="item-mag-destaque-nome" style={{ color: estilos.text }}>{item.nome}</div>
            {item.desc && <div className="item-mag-destaque-desc" style={{ color: estilos.text }}>{item.desc}</div>}
            {item.preco && <div className="item-mag-destaque-preco" style={{ color: ac }}>{item.preco}</div>}
          </div>
        </div>
      );
      return (
        <div className="item-bold" key={item.id}>
          {item.foto
            ? <img src={item.foto} alt={item.nome} className="item-bold-foto" />
            : <div className="item-bold-foto-ph" style={{ background: estilos.card }}>🍽️</div>
          }
          <div className="item-bold-info">
            <div className="item-bold-nome" style={{ color: estilos.text }}>{item.nome}</div>
            {item.desc && <div className="item-bold-desc" style={{ color: estilos.text }}>{item.desc}</div>}
            {item.preco && <div className="item-bold-preco" style={{ color: ac }}>{item.preco}</div>}
          </div>
        </div>
      );
    }

    // grade
    return null;
  };

  const renderGrade = (itens) => (
    <div className="grade-grid">
      {itens.map(item => (
        <div className="item-grade" key={item.id} style={{ background: estilos.card }}>
          {item.foto
            ? <img src={item.foto} alt={item.nome} className="item-grade-img" />
            : <div className="item-grade-img-ph" style={{ background: estilos.card, opacity: 0.4 }}>🍽️</div>
          }
          <div className="item-grade-body">
            <div className="item-grade-nome" style={{ color: estilos.text }}>{item.nome}</div>
            {item.desc && <div style={{ fontSize: 11, opacity: 0.6, color: estilos.text }}>{item.desc}</div>}
            {item.preco && <div className="item-grade-preco" style={{ color: ac }}>{item.preco}</div>}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="cardapio-page fade-up" style={{ background: estilos.bg, minHeight: "100vh" }}>
      {/* Header */}
      <div className="cardapio-header" style={{ background: estilos.card }}>
        <div style={{ fontSize: 32, marginBottom: 6 }}>{est.emoji}</div>
        <div className="cardapio-nome" style={{ color: estilos.text }}>{est.name}</div>
        <div style={{ fontSize: 12, color: estilos.text, opacity: 0.5, marginTop: 3 }}>Cardápio digital</div>
      </div>

      {/* Tabs de categorias */}
      <div className="cardapio-cat-tabs" style={{ background: estilos.card }}>
        {cardapio.categorias?.map(cat => (
          <div key={cat.id} className="cardapio-tab"
            onClick={() => setCatAtiva(cat.id)}
            style={{
              background: catAtiva === cat.id ? ac : "transparent",
              color: catAtiva === cat.id ? "#fff" : estilos.text,
              border: `1.5px solid ${catAtiva === cat.id ? ac : "rgba(255,255,255,0.12)"}`,
              opacity: catAtiva === cat.id ? 1 : 0.7,
            }}>
            {cat.nome}
          </div>
        ))}
      </div>

      {/* Itens */}
      <div className="cardapio-items">
        {catAtual && (
          cardapio.layout === "grade"
            ? renderGrade(catAtual.itens || [])
            : (catAtual.itens || []).map(item => renderItem(item))
        )}
        {(!catAtual || !catAtual.itens?.length) && (
          <div style={{ textAlign: "center", color: estilos.text, opacity: 0.4, padding: "40px 0", fontSize: 13 }}>
            Nenhum item nesta categoria ainda.
          </div>
        )}
      </div>

      {/* Footer fixo */}
      <div className="cardapio-footer" style={{ background: estilos.card, borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="cardapio-footer-txt" style={{ color: estilos.text, opacity: 0.7 }}>
          🎁 Avalie e ganhe um brinde!
        </div>
        <button className="cardapio-footer-btn" onClick={onAvaliar}
          style={{ background: ac, color: "#fff" }}>
          Avaliar e girar 🎰
        </button>
      </div>
    </div>
  );
}

// ============================================================
// CARDÁPIO EDITOR — painel do dono
// ============================================================
function CardapioEditor({ est, onChange }) {
  const cardapio = est.cardapio || makeDefaultCardapio();
  const [catEdit, setCatEdit] = useState(null); // id da categoria sendo editada
  const [newCat, setNewCat] = useState("");
  const [newItem, setNewItem] = useState({ nome: "", desc: "", preco: "", foto: "" });
  const [addingItemCat, setAddingItemCat] = useState(null);

  const update = (patch) => onChange({ ...cardapio, ...patch });
  const updateCats = (cats) => update({ categorias: cats });

  const addCat = () => {
    if (!newCat.trim()) return;
    updateCats([...cardapio.categorias, { id: uid(), nome: newCat.trim(), itens: [] }]);
    setNewCat("");
  };
  const removeCat = (id) => updateCats(cardapio.categorias.filter(c => c.id !== id));
  const addItem = (catId) => {
    if (!newItem.nome.trim()) return;
    updateCats(cardapio.categorias.map(c =>
      c.id === catId ? { ...c, itens: [...(c.itens || []), { id: uid(), ...newItem }] } : c
    ));
    setNewItem({ nome: "", desc: "", preco: "", foto: "" });
    setAddingItemCat(null);
  };
  const removeItem = (catId, itemId) => {
    updateCats(cardapio.categorias.map(c =>
      c.id === catId ? { ...c, itens: c.itens.filter(i => i.id !== itemId) } : c
    ));
  };

  return (
    <div>
      {/* Layout */}
      <div className="setup-box">
        <div className="setup-box-title">🖼️ Layout do Cardápio</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
          {CARDAPIO_LAYOUTS.map(l => (
            <button key={l.id} onClick={() => update({ layout: l.id })}
              style={{ padding: "8px 14px", borderRadius: 10, fontFamily: "var(--ff-body)", fontSize: 12, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${cardapio.layout === l.id ? "var(--ac)" : "var(--border)"}`, background: cardapio.layout === l.id ? "var(--ac)22" : "var(--d3)", color: cardapio.layout === l.id ? "var(--text)" : "var(--muted2)" }}>
              {l.label}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>
          {CARDAPIO_LAYOUTS.find(l => l.id === cardapio.layout)?.desc}
        </div>
      </div>

      {/* Paleta */}
      <div className="setup-box">
        <div className="setup-box-title">🎨 Paleta de Cores</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {CARDAPIO_PALETAS.map(p => (
            <button key={p.id} onClick={() => update({ paleta: p.id })}
              style={{ padding: "8px 16px", borderRadius: 10, fontFamily: "var(--ff-body)", fontSize: 12, fontWeight: 700, cursor: "pointer", background: p.bg, color: p.text, border: `2.5px solid ${cardapio.paleta === p.id ? "var(--ac)" : "transparent"}`, boxShadow: cardapio.paleta === p.id ? "0 0 0 2px var(--ac)44" : "none" }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Categorias e itens */}
      <div className="setup-box">
        <div className="setup-box-title">🍽️ Categorias e Itens</div>

        {cardapio.categorias?.map(cat => (
          <div key={cat.id} style={{ background: "var(--d2)", border: "1px solid var(--border)", borderRadius: 12, padding: 14, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontWeight: 800, fontSize: 14 }}>📂 {cat.nome}</span>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn-sm btn-sm-ghost" onClick={() => setAddingItemCat(addingItemCat === cat.id ? null : cat.id)}>+ Item</button>
                <button className="btn-sm btn-sm-danger" onClick={() => removeCat(cat.id)}>✕</button>
              </div>
            </div>

            {/* Itens da categoria */}
            {(cat.itens || []).map(item => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{item.nome}</div>
                  {item.desc && <div style={{ fontSize: 11, color: "var(--muted2)" }}>{item.desc}</div>}
                  {item.preco && <div style={{ fontSize: 12, color: "var(--ac)", fontWeight: 700 }}>{item.preco}</div>}
                </div>
                <button className="btn-sm btn-sm-danger" onClick={() => removeItem(cat.id, item.id)}>✕</button>
              </div>
            ))}
            {!cat.itens?.length && (
              <div style={{ fontSize: 12, color: "var(--muted)", padding: "6px 0" }}>Nenhum item ainda.</div>
            )}

            {/* Formulário de novo item */}
            {addingItemCat === cat.id && (
              <div style={{ marginTop: 10, padding: 12, background: "var(--dark)", borderRadius: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "var(--muted)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Novo item</div>
                <input className="field-inline" placeholder="Nome do item *" value={newItem.nome} onChange={e => setNewItem(s => ({ ...s, nome: e.target.value }))} style={{ width: "100%", marginBottom: 6 }} />
                <input className="field-inline" placeholder="Descrição (opcional)" value={newItem.desc} onChange={e => setNewItem(s => ({ ...s, desc: e.target.value }))} style={{ width: "100%", marginBottom: 6 }} />
                <input className="field-inline" placeholder="Preço (ex: R$ 32,00)" value={newItem.preco} onChange={e => setNewItem(s => ({ ...s, preco: e.target.value }))} style={{ width: "100%", marginBottom: 6 }} />
                <input className="field-inline" placeholder="URL da foto (opcional)" value={newItem.foto} onChange={e => setNewItem(s => ({ ...s, foto: e.target.value }))} style={{ width: "100%", marginBottom: 8 }} />
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn-sm btn-sm-red" onClick={() => addItem(cat.id)}>Adicionar item</button>
                  <button className="btn-sm btn-sm-ghost" onClick={() => { setAddingItemCat(null); setNewItem({ nome: "", desc: "", preco: "", foto: "" }); }}>Cancelar</button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Nova categoria */}
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <input className="field-inline" placeholder="Nome da categoria (ex: Bebidas)" value={newCat} onChange={e => setNewCat(e.target.value)} onKeyDown={e => e.key === "Enter" && addCat()} />
          <button className="btn-sm btn-sm-red" onClick={addCat}>+ Categoria</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SUPABASE HELPERS
// ============================================================
async function loadEstabelecimentos() {
  const { data, error } = await supabase.from("estabelecimentos").select("*");
  if (error || !data || data.length === 0) return null;
  return data.map(e => ({
    ...e,
    questions: e.questions || makeDefaultQuestions(),
    prizes: e.prizes || [],
    feedbacks: [],
    slug: e.slug || makeSlug(e.name),
    cardapio: e.cardapio || null,
  }));
}
async function loadFeedbacks(estId) {
  const { data, error } = await supabase.from("feedbacks").select("*").eq("estabelecimento_id", estId).order("created_at", { ascending: false });
  if (error) return [];
  return data.map(f => ({ id: f.id, nome: f.nome, data: new Date(f.created_at).toLocaleString("pt-BR"), answers: f.answers, premio: f.premio }));
}
async function saveFeedbackToSupabase(estId, fb) {
  const { error } = await supabase.from("feedbacks").insert({ estabelecimento_id: estId, nome: fb.nome, answers: fb.answers, premio: fb.premio });
  return !error;
}
async function saveEstabelecimento(est) {
  const { id, feedbacks, ...data } = est;
  const { error } = await supabase.from("estabelecimentos").upsert({ id, ...data });
  return !error;
}
async function deleteEstabelecimentoFromDB(id) {
  await supabase.from("feedbacks").delete().eq("estabelecimento_id", id);
  await supabase.from("estabelecimentos").delete().eq("id", id);
}
async function createEstabelecimento(est) {
  const { feedbacks, ...data } = est;
  const { error } = await supabase.from("estabelecimentos").insert(data);
  return !error;
}

// ============================================================
// WHEEL
// ============================================================
function Wheel({ prizes, onResult }) {
  const ref = useRef(null);
  const angRef = useRef(0);
  const [spinning, setSpinning] = useState(false);
  const SIZE = 230, R = SIZE / 2;
  const slice = (2 * Math.PI) / prizes.length;
  const draw = (a) => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, SIZE, SIZE);
    prizes.forEach((p, i) => {
      const s = a + i * slice - Math.PI / 2, e = s + slice;
      ctx.beginPath(); ctx.moveTo(R, R); ctx.arc(R, R, R - 1, s, e); ctx.closePath();
      ctx.fillStyle = p.color; ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.4)"; ctx.lineWidth = 2; ctx.stroke();
      ctx.save(); ctx.translate(R, R); ctx.rotate(s + slice / 2);
      ctx.textAlign = "right"; ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.font = "bold 11px Plus Jakarta Sans, sans-serif";
      ctx.fillText(p.label.length > 12 ? p.label.slice(0, 11) + "…" : p.label, R - 12, 4);
      ctx.font = "14px serif"; ctx.fillText(p.emoji, R - 10, -9);
      ctx.restore();
    });
    ctx.beginPath(); ctx.arc(R, R, 18, 0, 2 * Math.PI);
    ctx.fillStyle = "#080808"; ctx.fill();
    ctx.strokeStyle = "var(--ac,#e63946)"; ctx.lineWidth = 3; ctx.stroke();
  };
  useEffect(() => { draw(0); }, [prizes]);
  const spin = () => {
    if (spinning) return; setSpinning(true);
    const total = Math.PI * 2 * (7 + Math.random() * 5), dur = 4500, t0 = performance.now(), a0 = angRef.current;
    const go = (now) => {
      const t = Math.min((now - t0) / dur, 1), ease = 1 - Math.pow(1 - t, 4), cur = a0 + total * ease;
      angRef.current = cur; draw(cur);
      if (t < 1) { requestAnimationFrame(go); return; }
      setSpinning(false);
      const norm = ((cur % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      const idx = Math.floor((prizes.length - (norm / slice) % prizes.length) % prizes.length);
      onResult(prizes[idx]);
    };
    requestAnimationFrame(go);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <div className="wheel-outer">
        <div className="wheel-ptr">▼</div>
        <canvas ref={ref} width={SIZE} height={SIZE} className="wheel-ring" />
      </div>
      <button className="spin-btn" onClick={spin} disabled={spinning}>{spinning ? "⏳" : "GIRAR!"}</button>
    </div>
  );
}

function WheelTeaser({ prizes }) {
  const [visible, setVisible] = useState([]);
  useEffect(() => { prizes.slice(0, 4).forEach((p, i) => setTimeout(() => setVisible(v => [...v, p]), i * 150)); }, []);
  return (
    <div className="teaser-wrap">
      <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>Ganhe:</span>
      {visible.map((p, i) => <div key={i} className="teaser-prize">{p.emoji} {p.label}</div>)}
      {prizes.length > 4 && <div className="teaser-prize">+{prizes.length - 4}</div>}
    </div>
  );
}

function Stars({ val, onChange }) {
  const [hov, setHov] = useState(0);
  return (
    <div className="stars-row">
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} className={`star ${s <= (hov || val) ? "on" : ""}`}
          onMouseEnter={() => setHov(s)} onMouseLeave={() => setHov(0)} onClick={() => onChange(s)}>⭐</span>
      ))}
      {(hov || val) > 0 && <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 4 }}>{["", "Ruim", "Regular", "Bom", "Ótimo", "Excelente"][hov || val]}</span>}
    </div>
  );
}

function QuestionItem({ q, idx, answer, onChange }) {
  const answered = answer !== undefined && answer !== "" && answer !== null;
  return (
    <div className={`q-wrap ${answered ? "answered" : ""}`}>
      <div className="q-num">Pergunta {idx + 1}</div>
      <div className="q-label">{q.label}</div>
      {q.type === "staff" && (<div className="staff-grid">{q.options.map(o => <button key={o} className={`staff-btn ${answer === o ? "sel" : ""}`} onClick={() => onChange(o)}>{o}</button>)}</div>)}
      {q.type === "choice" && (
        <div className="choice-list">
          {q.options.map(o => (<div key={o} className={`choice-item ${answer === o || (o === "Outro" && answer?.startsWith("Outro:")) ? "sel" : ""}`} onClick={() => onChange(o === "Outro" ? "Outro:" : o)}><div className="choice-radio" /><span className="choice-label">{o}</span></div>))}
          {q.allowOther && answer?.startsWith("Outro:") && <input className="other-input" placeholder="Qual?" autoFocus value={answer.replace("Outro:", "")} onChange={e => onChange("Outro:" + e.target.value)} />}
        </div>
      )}
      {q.type === "stars" && <Stars val={answer || 0} onChange={onChange} />}
      {q.type === "nps" && (
        <div>
          <div className="nps-row">{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <button key={n} className={`nps-btn ${answer === n ? "sel" : ""}`} onClick={() => onChange(n)}>{n}</button>)}</div>
          <div className="nps-labels"><span className="nps-lbl">😞 Jamais indicaria</span><span className="nps-lbl">Indicaria com certeza 😍</span></div>
        </div>
      )}
      {q.type === "text" && <textarea className="textarea" placeholder="Escreva aqui..." value={answer || ""} onChange={e => onChange(e.target.value)} />}
    </div>
  );
}

function QRCodeView({ est }) {
  const slug = est.slug || makeSlug(est.name);
  const url = `https://notacheia.com.br/r/${slug}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(url)}&bgcolor=ffffff&color=111111&margin=10`;
  return (
    <div>
      <div style={{ marginBottom: 16, color: "var(--muted2)", fontSize: 13, lineHeight: 1.6 }}>Cole este QR code nas mesas ou balcão do seu estabelecimento.</div>
      <div style={{ background: "var(--d2)", border: "1px solid var(--border)", borderRadius: 12, padding: "10px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 12, color: "var(--muted)" }}>🔗 Link exclusivo:</span>
        <span style={{ fontSize: 12, color: "var(--ac)", fontWeight: 700, flex: 1, wordBreak: "break-all" }}>{url}</span>
        <button className="btn-sm btn-sm-ghost" onClick={() => { navigator.clipboard.writeText(url); }}>📋 Copiar</button>
      </div>
      <div className="qr-wrap">
        <div className="qr-logo">Nota<span>Cheia</span> ⭐</div>
        <div className="qr-est">{est.emoji} {est.name}</div>
        <img src={qrUrl} alt="QR Code" className="qr-img" />
        <div style={{ fontSize: 11, color: "#333", fontWeight: 700, marginBottom: 4 }}>Aponte a câmera e ganhe um brinde!</div>
        <div className="qr-inst">{url}</div>
      </div>
      <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
        <button className="btn btn-red" onClick={() => {
          const link = document.createElement("a");
          link.href = qrUrl;
          link.download = `qrcode-${est.name}.png`;
          link.target = "_blank";
          link.click();
        }}>⬇️ Baixar QR Code PNG</button>
      </div>
      <div style={{ marginTop: 10, padding: 12, background: "var(--d2)", borderRadius: 10, fontSize: 12, color: "var(--muted2)", lineHeight: 1.6 }}>
        💡 <strong style={{ color: "var(--text)" }}>Dica:</strong> Leve este QR code para uma gráfica e peça uma plaquinha acrílica personalizada.
      </div>
    </div>
  );
}

function Sidebar({ est, tab, setTab, onLogout, isMaster = false }) {
  const [open, setOpen] = useState(false);
  const temCardapio = est && isRamoComida(est.ramo);
  const navs = isMaster
    ? [{ id: "ests", icon: "🏢", lbl: "Estabelecimentos" }, { id: "metricas", icon: "📊", lbl: "Métricas gerais" }, { id: "senha", icon: "🔑", lbl: "Trocar senha" }]
    : [
        { id: "overview", icon: "📊", lbl: "Visão Geral" },
        { id: "feedbacks", icon: "💬", lbl: "Feedbacks" },
        { id: "insights", icon: "💡", lbl: "Insights" },
        { id: "qrcode", icon: "📱", lbl: "Meu QR Code" },
        ...(temCardapio ? [{ id: "cardapio", icon: "🍽️", lbl: "Cardápio Digital" }] : []),
        { id: "setup", icon: "⚙️", lbl: "Configurar" },
        { id: "senha", icon: "🔑", lbl: "Trocar senha" },
      ];
  return (
    <>
      <div className="mobile-header">
        <button className="hamburger" onClick={() => setOpen(true)}>☰</button>
        <div style={{ fontFamily: "var(--ff-head)", fontSize: 15 }}>{isMaster ? "👑 Master" : `${est?.emoji} ${est?.name}`}</div>
        <div style={{ width: 32 }} />
      </div>
      <div className={`sidebar-overlay ${open ? "open" : ""}`} onClick={() => setOpen(false)} />
      <div className={`sidebar ${open ? "open" : ""}`}>
        <div style={{ padding: "0 4px 14px", borderBottom: "1px solid var(--border)", marginBottom: 10 }}><LogoSVG size={130} /></div>
        <div className="sidebar-est">
          <div className="sidebar-est-emoji">{isMaster ? "👑" : est?.emoji}</div>
          <div className="sidebar-est-name">{isMaster ? "Master Admin" : est?.name}</div>
          <div className="sidebar-est-email">{isMaster ? "notacheia.com.br" : est?.owner}</div>
        </div>
        <div className="div" style={{ margin: "0 0 6px" }} />
        {navs.map(n => <button key={n.id} className={`nav ${tab === n.id ? "on" : ""}`} onClick={() => { setTab(n.id); setOpen(false); }}><span>{n.icon}</span><span>{n.lbl}</span></button>)}
        <div style={{ flex: 1 }} />
        <button className="nav" onClick={onLogout}><span>🚪</span><span>Sair</span></button>
      </div>
    </>
  );
}

// ============================================================
// CLIENT APP — fluxo do cliente
// ============================================================
function ClientApp({ est, onSubmit, masterMode = false }) {
  const interval = est.feedbackInterval || 30;
  const temCardapio = isRamoComida(est.ramo) && est.cardapio;
  const blocked = !canLeaveFeedback(est.id, interval, masterMode);
  const daysLeft = daysUntilNext(est.id, interval);

  // Se tem cardápio, começa no cardápio; senão vai direto para welcome
  const initialStep = temCardapio ? "cardapio" : "welcome";
  const [step, setStep] = useState(initialStep);
  const [nome, setNome] = useState("");
  const [answers, setAnswers] = useState({});
  const [prize, setPrize] = useState(null);
  const [coupon] = useState(genCoupon());
  const [avgStars, setAvgStars] = useState(0);
  const [saving, setSaving] = useState(false);
  const [savedAnswers, setSavedAnswers] = useState({});
  const [savedNome, setSavedNome] = useState("");
  const [lgpd, setLgpd] = useState(false);
  const required = est.questions.filter(q => q.required);
  const answered = required.filter(q => { const a = answers[q.id]; if (a === undefined || a === null || a === "") return false; if (q.type === "choice" && a === "Outro:") return false; return true; });
  const prog = (answered.length / required.length) * 100;
  const allDone = answered.length === required.length;

  // Tela: bloqueado mas tem cardápio → mostra cardápio + aviso no rodapé
  if (blocked && step === "cardapio") return (
    <div>
      <CardapioView est={est} onAvaliar={() => {}} />
      {/* Sobrepõe o botão do footer com aviso */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "12px 16px", background: "var(--d1)", borderTop: "1px solid var(--border)", textAlign: "center", fontSize: 13 }}>
        ⏳ Você poderá avaliar novamente em <strong style={{ color: "var(--ac)" }}>{daysLeft} dia{daysLeft !== 1 ? "s" : ""}</strong>
      </div>
    </div>
  );

  // Tela: bloqueado sem cardápio
  if (blocked && step === "welcome") return (
    <div className="page page-center fade-up" style={{ background: `radial-gradient(ellipse at 50% 0%, ${est.color}20, transparent 60%), var(--dark)` }}>
      <div className="card" style={{ textAlign: "center" }}>
        <div style={{ marginBottom: 12 }}><EstLogo est={est} size={72} /></div>
        <div className="welcome-name">{est.name}</div>
        <div style={{ fontSize: 44, margin: "16px 0" }}>⏳</div>
        <div style={{ fontFamily: "var(--ff-head)", fontSize: 18, marginBottom: 8 }}>Já participou recentemente!</div>
        <div style={{ fontSize: 13, color: "var(--muted2)", lineHeight: 1.6 }}>Você poderá responder novamente em <strong style={{ color: "var(--ac)" }}>{daysLeft} dia{daysLeft !== 1 ? "s" : ""}</strong>.</div>
        <div style={{ marginTop: 20, fontSize: 11, color: "#444" }}>{est.name} · Powered by NotaCheia ⭐</div>
      </div>
    </div>
  );

  if (step === "cardapio") return (
    <CardapioView est={est} onAvaliar={() => setStep("welcome")} />
  );

  if (step === "welcome") return (
    <div className="page page-center fade-up" style={{ background: `radial-gradient(ellipse at 50% 0%, ${est.color}20, transparent 60%), var(--dark)` }}>
      <div className="card" style={{ textAlign: "center" }}>
        <LogoSVG size={130} style={{ margin: "0 auto 14px" }} />
        {masterMode && <div className="master-demo-bar">👑 Modo demonstração — bloqueio desativado</div>}
        <div style={{ fontSize: 52, marginBottom: 10 }}><EstLogo est={est} size={60} /></div>
        <div className="welcome-name">{est.name}</div>
        <div className="welcome-tag">Sua opinião é muito importante para nós!<br />Responda e ganhe um brinde surpresa 🎁</div>
        <div className="welcome-badge">🎰 Gire a roleta e ganhe na hora!</div>
        <WheelTeaser prizes={est.prizes} />
        <input className="field" placeholder="Seu nome (opcional)" value={nome} onChange={e => setNome(e.target.value)} />
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "var(--d2)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 14px", marginBottom: 14, textAlign: "left", cursor: "pointer" }} onClick={() => setLgpd(l => !l)}>
          <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${lgpd ? "var(--ac)" : "var(--muted)"}`, background: lgpd ? "var(--ac)" : "transparent", flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
            {lgpd && <span style={{ fontSize: 12, color: "#fff", fontWeight: 900 }}>✓</span>}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted2)", lineHeight: 1.6 }}>
            Concordo que minha avaliação seja usada para melhorar os serviços do <strong style={{ color: "var(--text)" }}>{est.name}</strong>. Nenhum dado pessoal será compartilhado com terceiros.
          </div>
        </div>
        {temCardapio && (
          <button className="btn btn-ghost" style={{ marginBottom: 8, fontSize: 13 }} onClick={() => setStep("cardapio")}>
            ← Ver cardápio
          </button>
        )}
        <button className="btn btn-red" onClick={() => setStep("survey")} disabled={!lgpd && !masterMode}>
          {lgpd || masterMode ? "Começar pesquisa →" : "Aceite os termos para continuar"}
        </button>
      </div>
    </div>
  );

  if (step === "survey") return (
    <div className="page fade-up" style={{ background: `radial-gradient(ellipse at 50% 0%, ${est.color}15, transparent 50%), var(--dark)` }}>
      <div className="card card-wide">
        <div className="survey-header">
          <div style={{ fontSize: 20, marginBottom: 4 }}>{est.emoji} {est.name}</div>
          <div className="survey-title">Como foi sua experiência?</div>
          <div className="survey-sub">Responda sinceramente 💬</div>
        </div>
        <div className="prog-wrap">
          <div className="prog-label"><span>Progresso</span><span>{answered.length}/{required.length}</span></div>
          <div className="prog-bar"><div className="prog-fill" style={{ width: `${prog}%` }} /></div>
        </div>
        {est.questions.map((q, i) => <QuestionItem key={q.id} q={q} idx={i} answer={answers[q.id]} onChange={v => setAnswers(a => ({ ...a, [q.id]: v }))} />)}
        <div style={{ marginTop: 16 }}>
          <button className="btn btn-red" onClick={() => {
            const sqs = est.questions.filter(q => q.type === "stars");
            setAvgStars(sqs.length ? sqs.reduce((s, q) => s + (answers[q.id] || 0), 0) / sqs.length : 5);
            setSavedAnswers(answers); setSavedNome(nome || "Anônimo"); setStep("confirm");
          }} disabled={!allDone}>
            {allDone ? "Enviar e girar a roleta! 🎰" : `Responda mais ${required.length - answered.length} pergunta${required.length - answered.length !== 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </div>
  );

  if (step === "confirm") return (
    <div className="page page-center fade-up" style={{ background: `radial-gradient(ellipse at 50% 30%, ${est.color}20, transparent 60%), var(--dark)` }}>
      <div className="card">
        <div className="confirm-wrap">
          <div className="confirm-icon">✅</div>
          <div className="confirm-title" style={{ color: "var(--ac)" }}>Obrigado!</div>
          <div style={{ fontFamily: "var(--ff-head)", fontSize: 18, margin: "6px 0" }}>{est.name}</div>
          <div className="confirm-sub">Sua resposta foi registrada!<br />Agora gire a roleta e descubra seu prêmio 🎁</div>
          <div className="div" />
          <Wheel prizes={est.prizes} onResult={async (p) => {
            setPrize(p); setSaving(true);
            await onSubmit({ nome: savedNome, answers: savedAnswers, premio: p.label });
            markFeedbackDone(est.id, masterMode);
            setSaving(false);
            if (!masterMode && avgStars > 0 && avgStars < 4 && est.owner) {
              const nps = savedAnswers?.q_nps !== undefined ? savedAnswers.q_nps : "-";
              const comentario = savedAnswers?.q_sug || "";
              const cliente = savedNome && savedNome !== "Anônimo" ? savedNome : "Anônimo";
              try {
                await fetch("https://api.resend.com/emails", {
                  method: "POST",
                  headers: { "Authorization": "Bearer re_3kBjVHJT_MhYrCC7g7x5U9B8TMfJYTmev", "Content-Type": "application/json" },
                  body: JSON.stringify({
                    from: "NotaCheia <notificacoes@notacheia.com.br>",
                    to: [est.owner],
                    subject: `⚠️ Avaliação negativa no ${est.name}`,
                    html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#111;color:#f0ede8;border-radius:16px;"><h2 style="color:#e63946;margin-bottom:4px;">⚠️ Avaliação negativa!</h2><p style="color:#999;margin-bottom:20px;font-size:13px;">Recebida agora em <strong style="color:#fff">${est.name}</strong></p><div style="background:#1a1a1a;border-radius:10px;padding:16px;margin-bottom:12px;"><p style="margin:0 0 8px;font-size:13px;color:#999;">👤 Cliente</p><p style="margin:0;font-weight:700;">${cliente}</p></div><div style="background:#1a1a1a;border-radius:10px;padding:16px;margin-bottom:12px;"><p style="margin:0 0 8px;font-size:13px;color:#999;">⭐ Nota média</p><p style="margin:0;font-weight:700;color:#e63946;font-size:22px;">${avgStars.toFixed(1)}</p></div><div style="background:#1a1a1a;border-radius:10px;padding:16px;margin-bottom:12px;"><p style="margin:0 0 8px;font-size:13px;color:#999;">📊 NPS</p><p style="margin:0;font-weight:700;">${nps}</p></div>${comentario ? `<div style="background:#1a1a1a;border-radius:10px;padding:16px;margin-bottom:12px;border-left:3px solid #e63946;"><p style="margin:0 0 8px;font-size:13px;color:#999;">💬 Comentário</p><p style="margin:0;font-style:italic;">"${comentario}"</p></div>` : ""}<p style="font-size:12px;color:#555;margin-top:20px;text-align:center;">Acesse o painel NotaCheia para ver o feedback completo.</p></div>`,
                  }),
                });
              } catch (e) { console.log("Erro ao enviar email:", e); }
            }
            setStep("prize");
          }} />
          {saving && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>Salvando...</div>}
        </div>
      </div>
    </div>
  );

  if (step === "prize") return (
    <div className="page page-center fade-up" style={{ background: `radial-gradient(ellipse at 50% 20%, ${est.color}25, transparent 60%), var(--dark)` }}>
      <div className="card prize-wrap">
        <div className="prize-emoji">{prize.emoji}</div>
        <div className="prize-title">PARABÉNS!</div>
        <div className="prize-name">{prize.label}</div>
        <div className="prize-congrats">{nome && nome !== "Anônimo" ? `${nome}, você` : "Você"} ganhou este prêmio!</div>
        <div className="coupon-box">
          <div className="coupon-id">{coupon}</div>
          <div className="coupon-validity">🗓️ Válido até: {addDays(7)} · Apresente ao atendente</div>
        </div>
        <button className="btn-download" onClick={() => { const txt = `NotaCheia ⭐\n${est.name}\n\nPrêmio: ${prize.label}\nCupom: ${coupon}\nVálido até: ${addDays(7)}\n\nApresente ao atendente para resgatar.`; const blob = new Blob([txt], { type: "text/plain" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `premio-${coupon}.txt`; a.click(); }}>⬇️ Baixar comprovante</button>
        {est.googleUrl && avgStars >= 4 && (
          <button className="btn btn-red" style={{ marginTop: 8 }} onClick={() => setStep("google")}>
            Continuar →
          </button>
        )}
        <div style={{ fontSize: 11, color: "#444", textAlign: "center", marginTop: 8 }}>{est.name} · Powered by NotaCheia ⭐</div>
      </div>
    </div>
  );

  if (step === "google") return (
    <div className="page page-center fade-up" style={{ background: `radial-gradient(ellipse at 50% 20%, ${est.color}20, transparent 60%), var(--dark)` }}>
      <div className="card" style={{ textAlign: "center" }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>🌟</div>
        <div style={{ fontFamily: "var(--ff-head)", fontSize: 22, marginBottom: 8 }}>Você adorou, né?</div>
        <div style={{ fontSize: 14, color: "var(--muted2)", lineHeight: 1.7, marginBottom: 20 }}>
          Que tal contar pra mais pessoas?<br />
          Uma avaliação no Google ajuda muito o <strong style={{ color: "var(--text)" }}>{est.name}</strong> a crescer! 🙏
        </div>
        <button className="btn-google" onClick={() => window.open(est.googleUrl, "_blank")} style={{ marginBottom: 12 }}>
          🌐 Avaliar no Google Maps
        </button>
        <button className="btn btn-ghost" style={{ fontSize: 13 }} onClick={() => setStep("fim")}>
          Agora não
        </button>
      </div>
    </div>
  );

  if (step === "fim") return (
    <div className="page page-center fade-up" style={{ background: "var(--dark)" }}>
      <div className="card" style={{ textAlign: "center" }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>🙏</div>
        <div style={{ fontFamily: "var(--ff-head)", fontSize: 22, marginBottom: 8 }}>Obrigado!</div>
        <div style={{ fontSize: 14, color: "var(--muted2)", lineHeight: 1.7 }}>
          Sua opinião foi registrada.<br />Até a próxima visita! 😊
        </div>
        <div style={{ fontSize: 11, color: "#444", marginTop: 20 }}>{est.name} · Powered by NotaCheia ⭐</div>
      </div>
    </div>
  );
}

function MiniBarChart({ data, color = "var(--ac)" }) {
  const max = Math.max(...data.map(d => d.val), 1);
  return (<div className="bar-chart">{data.map((d, i) => (<div className="bar-col" key={i}><div className="bar-val">{d.val}</div><div className="bar" style={{ height: `${(d.val / max) * 70}px`, background: color, opacity: 0.7 + (i / data.length) * 0.3 }} /><div className="bar-lbl">{d.lbl}</div></div>))}</div>);
}

function OwnerDash({ est, onUpdate, onLogout }) {
  const [tab, setTab] = useState("overview");
  const [ed, setEd] = useState({ ...est, questions: est.questions.map(q => ({ ...q })), prizes: est.prizes.map(p => ({ ...p })) });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cardapioSaving, setCardapioSaving] = useState(false);
  const [cardapioSaved, setCardapioSaved] = useState(false);
  const [newQ, setNewQ] = useState({ label: "", type: "stars", options: "" });
  const [newP, setNewP] = useState({ label: "", emoji: "🎁", color: "#e63946" });
  const [filter, setFilter] = useState("todos");
  const [newPass, setNewPass] = useState({ atual: "", nova: "", confirma: "" });
  const [passMsg, setPassMsg] = useState("");
  const COLORS = ["#e63946", "#f4a261", "#2a9d8f", "#457b9d", "#6d597a", "#e76f51", "#264653", "#e9c46a", "#f72585", "#4cc9f0", "#111", "#333"];
  const starQs = est.questions.filter(q => q.type === "stars");
  const starAvg = (key) => { const v = est.feedbacks.map(f => f.answers?.[key]).filter(v => typeof v === "number" && v > 0); return v.length ? (v.reduce((a, b) => a + b, 0) / v.length).toFixed(1) : "-"; };
  const overall = () => { if (!starQs.length || !est.feedbacks.length) return "-"; const v = est.feedbacks.flatMap(f => starQs.map(q => f.answers?.[q.id] || 0).filter(v => v > 0)); return v.length ? (v.reduce((a, b) => a + b, 0) / v.length).toFixed(1) : "-"; };
  const npsAvg = () => { const v = est.feedbacks.map(f => f.answers?.q_nps).filter(v => v !== undefined); return v.length ? (v.reduce((a, b) => a + b, 0) / v.length).toFixed(1) : "-"; };
  const staffRanking = () => { const map = {}; est.feedbacks.forEach(f => { const atd = f.answers?.q_atend; if (!atd) return; if (!map[atd]) map[atd] = { total: 0, count: 0 }; const s = starQs.map(q => f.answers?.[q.id] || 0).filter(v => v > 0); if (s.length) { map[atd].total += s.reduce((a, b) => a + b, 0) / s.length; map[atd].count++; } }); return Object.entries(map).map(([name, d]) => ({ name, avg: d.count ? (d.total / d.count).toFixed(1) : 0 })).sort((a, b) => b.avg - a.avg); };
  const howKnew = () => { const map = {}; est.feedbacks.forEach(f => { const v = f.answers?.q_como; if (v) map[v] = (map[v] || 0) + 1; }); return Object.entries(map).sort((a, b) => b[1] - a[1]); };
  const chartData = (() => { const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"], result = []; for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const lbl = days[d.getDay()], dateStr = d.toLocaleDateString("pt-BR"); result.push({ lbl, val: est.feedbacks.filter(f => f.data?.includes(dateStr)).length }); } return result; })();
  const insights = () => { const list = [], ov = parseFloat(overall()), nps = parseFloat(npsAvg()); if (ov >= 4.5) list.push({ icon: "🏆", text: <><strong>Excelente!</strong> Nota acima de 4.5.</> }); if (nps >= 8) list.push({ icon: "📈", text: <><strong>NPS alto!</strong> Clientes vão indicar seu negócio.</> }); const esp = parseFloat(starAvg("q_esp")); if (esp && esp < 3.5) list.push({ icon: "⚠️", text: <><strong>Tempo de espera!</strong> Nota {esp}.</> }); const pv = est.feedbacks.map(f => f.answers?.q_preco).filter(Boolean); const caro = pv.filter(v => v === "Caro pelo que oferece").length; if (caro > pv.length * 0.3) list.push({ icon: "💰", text: <><strong>{Math.round(caro / pv.length * 100)}% acham caro.</strong></> }); const prim = est.feedbacks.filter(f => f.answers?.q_first === "Sim").length; if (prim > 0) list.push({ icon: "🆕", text: <><strong>{prim} cliente{prim > 1 ? "s" : ""} novo{prim > 1 ? "s" : ""}</strong> recentemente!</> }); if (list.length === 0) list.push({ icon: "📊", text: <>Continue coletando feedbacks para receber insights.</> }); return list; };
  const filteredFeedbacks = () => { if (filter === "positivos") return est.feedbacks.filter(f => (f.answers?.q_nps || 0) >= 9); if (filter === "negativos") return est.feedbacks.filter(f => (f.answers?.q_nps || 0) <= 6); if (filter === "neutros") return est.feedbacks.filter(f => { const n = f.answers?.q_nps; return n === 7 || n === 8; }); return est.feedbacks; };
  const save = async () => { setSaving(true); await saveEstabelecimento(ed); onUpdate(ed); setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const addQ = () => { if (!newQ.label) return; const opts = newQ.options.split(",").map(s => s.trim()).filter(Boolean); setEd(e => ({ ...e, questions: [...e.questions, { id: uid(), ...newQ, options: opts, required: true }] })); setNewQ({ label: "", type: "stars", options: "" }); };
  const removeQ = id => setEd(e => ({ ...e, questions: e.questions.filter(q => q.id !== id) }));
  const addP = () => { if (!newP.label) return; setEd(e => ({ ...e, prizes: [...e.prizes, { id: uid(), ...newP }] })); setNewP({ label: "", emoji: "🎁", color: "#e63946" }); };
  const removeP = id => setEd(e => ({ ...e, prizes: e.prizes.filter(p => p.id !== id) }));
  const trocarSenha = async () => { if (newPass.atual !== est.pass) { setPassMsg("❌ Senha incorreta."); setTimeout(() => setPassMsg(""), 3000); return; } if (newPass.nova.length < 6) { setPassMsg("❌ Mínimo 6 caracteres."); setTimeout(() => setPassMsg(""), 3000); return; } if (newPass.nova !== newPass.confirma) { setPassMsg("❌ Senhas não coincidem."); setTimeout(() => setPassMsg(""), 3000); return; } const u = { ...est, pass: newPass.nova }; await saveEstabelecimento(u); onUpdate(u); setPassMsg("✅ Senha alterada!"); setNewPass({ atual: "", nova: "", confirma: "" }); setTimeout(() => setPassMsg(""), 3000); };
  const handleLogoUpload = (e) => { const file = e.target.files[0]; if (!file) return; const r = new FileReader(); r.onload = (ev) => setEd(s => ({ ...s, logoUrl: ev.target.result })); r.readAsDataURL(file); };

  const saveCardapio = async () => {
    setCardapioSaving(true);
    const updated = { ...est, cardapio: ed.cardapio };
    await saveEstabelecimento(updated);
    onUpdate(updated);
    setCardapioSaving(false);
    setCardapioSaved(true);
    setTimeout(() => setCardapioSaved(false), 2000);
  };

  return (
    <div className="shell">
      <Sidebar est={est} tab={tab} setTab={setTab} onLogout={onLogout} />
      <div className="main">
        {tab === "overview" && (<>
          <div className="main-title">{est.emoji} {est.name}</div>
          <div className="metrics">
            <div className="metric"><div className="metric-val">{est.feedbacks.length}</div><div className="metric-lbl">Avaliações</div></div>
            <div className="metric"><div className="metric-val">⭐ {overall()}</div><div className="metric-lbl">Nota geral</div></div>
            <div className="metric"><div className="metric-val">📊 {npsAvg()}</div><div className="metric-lbl">NPS médio</div></div>
            <div className="metric"><div className="metric-val">{est.feedbacks.filter(f => (f.answers?.q_nps || 0) >= 9).length}</div><div className="metric-lbl">Promotores</div></div>
            <div className="metric"><div className="metric-val">{est.feedbacks.filter(f => f.answers?.q_first === "Sim").length}</div><div className="metric-lbl">Clientes novos</div></div>
            <div className="metric"><div className="metric-val" style={{ fontSize: 20 }}>{est.googleUrl ? "✅" : "❌"}</div><div className="metric-lbl">Google Reviews</div></div>
          </div>
          <div className="chart-wrap"><div className="chart-title">📅 Feedbacks — últimos 7 dias</div><MiniBarChart data={chartData} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 8, marginBottom: 14 }}>
            {starQs.map(q => { const s = starAvg(q.id); return (<div key={q.id} style={{ background: "var(--d1)", border: "1px solid var(--border)", borderRadius: 12, padding: 14, textAlign: "center" }}><div style={{ fontFamily: "var(--ff-head)", fontSize: 22, color: s >= 4 ? "var(--green)" : s >= 3 ? "var(--yellow)" : "var(--red)" }}>{s}</div><div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", marginTop: 4 }}>{q.label.replace("Como avalia nosso ", "").replace("Como avalia a qualidade dos ", "").replace("Como avalia a qualidade das ", "").replace("Como avalia o ", "").replace("?", "")}</div><div style={{ height: 3, background: "var(--d3)", borderRadius: 2, marginTop: 6 }}><div style={{ height: "100%", width: `${(parseFloat(s) / 5) * 100}%`, background: "var(--ac)", borderRadius: 2 }} /></div></div>); })}
          </div>
          {staffRanking().length > 0 && (<div className="chart-wrap"><div className="chart-title">🏆 Ranking colaboradores</div>{staffRanking().map((s, i) => (<div className="rank-row" key={s.name}><div className="rank-num">{i + 1}</div><div className="rank-name">{s.name}</div><div className="rank-bar"><div className="rank-fill" style={{ width: `${(s.avg / 5) * 100}%` }} /></div><div className="rank-score">{s.avg}</div></div>))}</div>)}
          {howKnew().length > 0 && (<div className="chart-wrap"><div className="chart-title">📍 Como chegaram</div><MiniBarChart data={howKnew().map(([lbl, val]) => ({ lbl: lbl.slice(0, 10), val }))} color="var(--green)" /></div>)}
        </>)}
        {tab === "feedbacks" && (<>
          <div className="main-title">💬 Feedbacks</div>
          <div className="filter-row">{[["todos", "Todos"], ["positivos", "😍 Promotores"], ["neutros", "😐 Neutros"], ["negativos", "😞 Detratores"]].map(([k, l]) => (<button key={k} className={`filter-btn ${filter === k ? "on" : ""}`} onClick={() => setFilter(k)}>{l}</button>))}</div>
          {filteredFeedbacks().length === 0 && <div style={{ color: "var(--muted)", textAlign: "center", marginTop: 40 }}>Nenhum feedback neste filtro.</div>}
          {filteredFeedbacks().map((f, i) => { const nps = f.answers?.q_nps; const npsColor = nps >= 9 ? "var(--green)" : nps >= 7 ? "var(--yellow)" : "var(--red)"; return (<div className="fb" key={f.id || i}><div className="fb-top"><div style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--d3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>👤</div><div><div className="fb-name">{f.nome}</div><div className="fb-date">{f.data || "Agora"}</div></div></div>{nps !== undefined && (<div style={{ background: "var(--d3)", border: `1px solid ${npsColor}44`, borderRadius: 10, padding: "4px 10px", textAlign: "center" }}><div style={{ fontSize: 14, fontFamily: "var(--ff-head)", color: npsColor }}>{nps}</div><div style={{ fontSize: 9, color: "var(--muted)", textTransform: "uppercase" }}>NPS</div></div>)}</div><div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>{[["q_atend", "👨‍💼"], ["q_first", "🆕"], ["q_hora", "⏰"], ["q_mesa", "🪑"], ["q_como", "📍"], ["q_preco", "💰"]].map(([key, icon]) => { const v = f.answers?.[key]; if (!v) return null; const sl = { q_atend: "Atend", q_first: "1ªvez", q_hora: "Hora", q_mesa: "Mesa", q_como: "Via", q_preco: "Preço" }[key]; return (<div key={key} style={{ background: "var(--d3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "3px 8px", fontSize: 11, display: "flex", gap: 3, alignItems: "center" }}><span>{icon}</span><span style={{ color: "var(--muted2)", fontSize: 10 }}>{sl}:</span><span style={{ color: "var(--text)", fontWeight: 600 }}>{String(v).replace("Outro:", "")}</span></div>); })}</div><div style={{ background: "var(--dark)", borderRadius: 8, padding: "8px 10px", marginBottom: 6 }}>{starQs.map(q => { const v = f.answers?.[q.id]; if (!v) return null; const sn = q.label.replace("Como avalia nosso ", "").replace("Como avalia a qualidade dos ", "").replace("Como avalia a qualidade das ", "").replace("Como avalia o ", "").replace("?", ""); return (<div key={q.id} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}><span style={{ fontSize: 11, color: "var(--muted)", minWidth: 90, fontWeight: 600 }}>{sn}</span><div style={{ display: "flex", gap: 2 }}>{[1, 2, 3, 4, 5].map(s => <span key={s} style={{ fontSize: 12, filter: s <= v ? "none" : "grayscale(1) opacity(0.2)" }}>⭐</span>)}</div><span style={{ fontSize: 10, fontWeight: 800, color: v >= 4 ? "var(--green)" : v >= 3 ? "var(--yellow)" : "var(--red)" }}>{["", "Ruim", "Regular", "Bom", "Ótimo", "Excelente"][v]}</span></div>); })}</div>{f.answers?.q_sug && <div className="fb-comment">💬 "{f.answers.q_sug}"</div>}{f.premio && <div className="fb-prize">🎁 {f.premio}</div>}</div>); })}
        </>)}
        {tab === "insights" && (<>
          <div className="main-title">💡 Insights</div>
          {insights().map((ins, i) => (<div className="insight" key={i}><div className="insight-icon">{ins.icon}</div><div className="insight-text">{ins.text}</div></div>))}
          <div className="chart-wrap" style={{ marginTop: 16 }}><div className="chart-title">📊 Distribuição NPS</div><div style={{ display: "flex", gap: 10 }}>{[["😍 Promotores", "9-10", "var(--green)", est.feedbacks.filter(f => (f.answers?.q_nps || 0) >= 9).length], ["😐 Neutros", "7-8", "var(--yellow)", est.feedbacks.filter(f => { const n = f.answers?.q_nps; return n === 7 || n === 8; }).length], ["😞 Detratores", "0-6", "var(--red)", est.feedbacks.filter(f => (f.answers?.q_nps || 0) <= 6 && f.answers?.q_nps !== undefined).length]].map(([lbl, range, color, count]) => (<div key={lbl} style={{ flex: 1, background: "var(--d2)", border: `1px solid ${color}33`, borderRadius: 10, padding: 12, textAlign: "center" }}><div style={{ fontSize: 20, fontFamily: "var(--ff-head)", color }}>{count}</div><div style={{ fontSize: 10, color: "var(--muted)", marginTop: 3 }}>{lbl}</div><div style={{ fontSize: 9, color, marginTop: 2 }}>NPS {range}</div></div>))}</div></div>
          <div className="chart-wrap"><div className="chart-title">💰 Percepção de preço</div><MiniBarChart data={["Barato pelo que oferece", "Ideal pelo que oferece", "Caro pelo que oferece"].map(v => ({ lbl: v === "Barato pelo que oferece" ? "Barato" : v === "Ideal pelo que oferece" ? "Ideal" : "Caro", val: est.feedbacks.filter(f => f.answers?.q_preco === v).length }))} color="var(--yellow)" /></div>
        </>)}
        {tab === "qrcode" && (<><div className="main-title">📱 Meu QR Code</div><QRCodeView est={est} /></>)}

        {tab === "cardapio" && (<>
          <div className="main-title">🍽️ Cardápio Digital</div>
          {!isRamoComida(est.ramo) && (
            <div style={{ padding: 20, background: "var(--d1)", border: "1px solid var(--border)", borderRadius: 14, color: "var(--muted2)", fontSize: 13 }}>
              O cardápio digital está disponível para ramos de alimentação.
            </div>
          )}
          {isRamoComida(est.ramo) && (
            <>
              <div style={{ padding: "10px 14px", background: "var(--ac)11", border: "1px solid var(--ac)33", borderRadius: 10, fontSize: 12, color: "var(--muted2)", marginBottom: 16 }}>
                🍽️ <strong style={{ color: "var(--text)" }}>Plano Pro</strong> — Cardápio digital integrado. Seus clientes veem o cardápio antes de avaliar.
              </div>
              <CardapioEditor
                est={{ ...est, cardapio: ed.cardapio || makeDefaultCardapio() }}
                onChange={(novoCardapio) => setEd(e => ({ ...e, cardapio: novoCardapio }))}
              />
              <button className="btn btn-red" style={{ maxWidth: 220 }} onClick={saveCardapio} disabled={cardapioSaving}>
                {cardapioSaving ? "Salvando..." : cardapioSaved ? "✅ Salvo!" : "Salvar cardápio"}
              </button>
            </>
          )}
        </>)}

        {tab === "setup" && (<>
          <div className="main-title">⚙️ Configurar</div>
          <div className="setup-box">
            <div className="setup-box-title">🏪 Identidade</div>
            <label className="lbl">Logo do estabelecimento</label>
            <div className="logo-upload-area" onClick={() => document.getElementById("logo-input").click()}>
              {ed.logoUrl ? <img src={ed.logoUrl} alt="logo" style={{ width: 70, height: 70, objectFit: "contain", borderRadius: 8, display: "block", margin: "0 auto 6px" }} /> : <div style={{ fontSize: 12, color: "var(--muted)" }}>Clique para fazer upload da sua logo<br /><span style={{ fontSize: 10 }}>PNG, JPG ou SVG</span></div>}
            </div>
            <input id="logo-input" type="file" accept="image/*" style={{ display: "none" }} onChange={handleLogoUpload} />
            {ed.logoUrl && <button className="btn-sm btn-sm-danger" style={{ marginBottom: 12 }} onClick={() => setEd(s => ({ ...s, logoUrl: "" }))}>Remover logo</button>}
            <label className="lbl">Nome</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}><div style={{ width: 48, height: 48, background: "var(--d2)", border: "1.5px solid var(--border)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>{ed.emoji}</div><input className="field" style={{ marginBottom: 0, flex: 1 }} value={ed.name} onChange={e => setEd(s => ({ ...s, name: e.target.value }))} /></div>
            <label className="lbl">🔗 Link exclusivo (slug)</label>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: "var(--muted)", whiteSpace: "nowrap" }}>notacheia.com.br/r/</span>
              <input className="field" style={{ marginBottom: 0, flex: 1 }} placeholder="meu-estabelecimento" value={ed.slug || makeSlug(ed.name)} onChange={e => setEd(s => ({ ...s, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }))} />
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 12 }}>Apenas letras minúsculas, números e hífen.</div>
            <label className="lbl">Emoji do estabelecimento</label>
            <EmojiPicker value={ed.emoji} ramoAtual={ed.ramo} onChange={emoji => setEd(s => ({ ...s, emoji }))} />
            <label className="lbl">Cor principal</label>
            <div className="swatch-row">{COLORS.map(c => <div key={c} className={`swatch ${ed.color === c ? "on" : ""}`} style={{ background: c }} onClick={() => setEd(s => ({ ...s, color: c }))} />)}</div>
            <label className="lbl">🌐 Link Google Reviews</label>
            <input className="field" placeholder="https://g.page/r/..." value={ed.googleUrl || ""} onChange={e => setEd(s => ({ ...s, googleUrl: e.target.value }))} />
            <label className="lbl">⏱️ Intervalo entre feedbacks</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>{[7, 15, 30, 60].map(d => (<button key={d} className="interval-btn" onClick={() => setEd(s => ({ ...s, feedbackInterval: d }))} style={{ border: `1.5px solid ${ed.feedbackInterval === d ? "var(--ac)" : "var(--border)"}`, background: ed.feedbackInterval === d ? "var(--ac)22" : "var(--d3)", color: ed.feedbackInterval === d ? "var(--text)" : "var(--muted2)" }}>{d} dias</button>))}</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>O cliente só poderá responder novamente após este período.</div>
          </div>
          <div className="setup-box">
            <div className="setup-box-title">❓ Perguntas</div>
            {ed.questions.map(q => (<div className="pill-row" key={q.id}><div style={{ flex: 1 }}><div className="pill-lbl">{q.label}</div><div className="pill-sub">{q.type}</div></div><button className="btn-sm btn-sm-danger" onClick={() => removeQ(q.id)}>✕</button></div>))}
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              <input className="field-inline" placeholder="Texto da pergunta" value={newQ.label} onChange={e => setNewQ(s => ({ ...s, label: e.target.value }))} />
              <select className="type-sel" value={newQ.type} onChange={e => setNewQ(s => ({ ...s, type: e.target.value }))}><option value="stars">⭐ Estrelas</option><option value="choice">☑️ Múltipla escolha</option><option value="nps">📊 NPS 0-10</option><option value="text">📝 Texto livre</option><option value="staff">👤 Colaborador</option></select>
              {(newQ.type === "choice" || newQ.type === "staff") && <input className="field-inline" placeholder="Opções por vírgula" value={newQ.options} onChange={e => setNewQ(s => ({ ...s, options: e.target.value }))} />}
              <button className="btn-sm btn-sm-red" onClick={addQ}>+ Adicionar</button>
            </div>
          </div>
          <div className="setup-box">
            <div className="setup-box-title">🎡 Prêmios da Roleta</div>
            {ed.prizes.map(p => (<div className="pill-row" key={p.id}><span style={{ fontSize: 18 }}>{p.emoji}</span><div style={{ width: 12, height: 12, borderRadius: 4, background: p.color, flexShrink: 0 }} /><div className="pill-lbl" style={{ flex: 1 }}>{p.label}</div><button className="btn-sm btn-sm-danger" onClick={() => removeP(p.id)}>✕</button></div>))}
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              <input className="field-inline" placeholder="Nome do brinde" value={newP.label} onChange={e => setNewP(s => ({ ...s, label: e.target.value }))} />
              <input className="field-inline" placeholder="Emoji" value={newP.emoji} onChange={e => setNewP(s => ({ ...s, emoji: e.target.value }))} style={{ maxWidth: 60 }} />
              <input type="color" value={newP.color} onChange={e => setNewP(s => ({ ...s, color: e.target.value }))} style={{ width: 40, height: 40, border: "none", background: "none", cursor: "pointer", borderRadius: 8 }} />
              <button className="btn-sm btn-sm-red" onClick={addP}>+ Adicionar</button>
            </div>
          </div>
          <button className="btn btn-red" style={{ maxWidth: 220 }} onClick={save} disabled={saving}>{saving ? "Salvando..." : saved ? "✅ Salvo!" : "Salvar alterações"}</button>
        </>)}
        {tab === "senha" && (<>
          <div className="main-title">🔑 Trocar Senha</div>
          <div className="setup-box" style={{ maxWidth: 420 }}>
            <div className="setup-box-title">Alterar senha de acesso</div>
            {passMsg && <div style={{ padding: "10px 14px", borderRadius: 10, marginBottom: 14, fontSize: 13, fontWeight: 700, background: passMsg.includes("✅") ? "#0a2a0a" : "#1a0505", color: passMsg.includes("✅") ? "var(--green)" : "var(--red)", border: `1px solid ${passMsg.includes("✅") ? "var(--green)" : "var(--red)"}33` }}>{passMsg}</div>}
            <label className="lbl">Senha atual</label>
            <input className="field" type="password" value={newPass.atual} onChange={e => setNewPass(s => ({ ...s, atual: e.target.value }))} />
            <label className="lbl">Nova senha</label>
            <input className="field" type="password" placeholder="Mínimo 6 caracteres" value={newPass.nova} onChange={e => setNewPass(s => ({ ...s, nova: e.target.value }))} />
            <label className="lbl">Confirmar nova senha</label>
            <input className="field" type="password" value={newPass.confirma} onChange={e => setNewPass(s => ({ ...s, confirma: e.target.value }))} />
            <button className="btn btn-red" style={{ maxWidth: 220 }} onClick={trocarSenha}>Alterar senha</button>
          </div>
        </>)}
      </div>
    </div>
  );
}

const RAMOS = ["Hamburgueria", "Pizzaria", "Restaurante", "Cafeteria", "Lanchonete", "Bar", "Sorveteria", "Padaria", "Sushi/Japonês", "Churrascaria", "Clínica Odontológica", "Clínica Médica", "Barbearia", "Salão de Beleza", "Academia", "Pet Shop", "Farmácia", "Outro"];
const PLANOS = ["R$ 99/mês", "R$ 169/mês", "R$ 229/mês", "Personalizado"];

function MasterPanel({ establishments, setEstablishments, onLogout }) {
  const [tab, setTab] = useState("ests");
  const [viewEst, setViewEst] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editEst, setEditEst] = useState(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editSaved, setEditSaved] = useState(false);
  const EMPTY_EST = { name: "", emoji: "🏪", owner: "", pass: "", color: "#e63946", googleUrl: "", slug: "", responsavel: "", cidade: "", ramo: "Restaurante", telefone: "", whatsapp: "", plano: "R$ 99/mês" };
  const [newEst, setNewEst] = useState(EMPTY_EST);
  const [actionLoading, setActionLoading] = useState(false);
  const [demoEst, setDemoEst] = useState(null);
  const [copied, setCopied] = useState(null);
  const [masterPass, setMasterPass] = useState({ atual: "", nova: "", confirma: "" });
  const [masterPassMsg, setMasterPassMsg] = useState("");
  const COLORS = ["#e63946", "#f4a261", "#2a9d8f", "#457b9d", "#6d597a", "#e76f51", "#264653", "#e9c46a"];
  const total = establishments.reduce((a, e) => a + e.feedbacks.length, 0);
  const mrr = establishments.filter(e => e.ativo).length * 99;
  const ativos = establishments.filter(e => e.ativo).length;
  const toggleAtivo = async (id) => { const est = establishments.find(e => e.id === id); const u = { ...est, ativo: !est.ativo }; await saveEstabelecimento(u); setEstablishments(prev => prev.map(e => e.id === id ? { ...e, ativo: !e.ativo } : e)); };
  const deleteEst = async (id) => { if (!window.confirm("Excluir este estabelecimento?")) return; await deleteEstabelecimentoFromDB(id); setEstablishments(prev => prev.filter(e => e.id !== id)); };
  const addEst = async () => {
    if (!newEst.name || !newEst.owner || !newEst.pass) return;
    setActionLoading(true);
    const slug = newEst.slug || makeSlug(newEst.name);
    const temCardapio = isRamoComida(newEst.ramo);
    const novo = {
      ...newEst, slug, id: "est_" + uid(), ativo: true, logoUrl: "", feedbackInterval: 30,
      questions: makeDefaultQuestions(),
      prizes: [{ id: uid(), label: "Brinde Grátis", emoji: "🎁", color: newEst.color }, { id: uid(), label: "10% Desconto", emoji: "🏷️", color: "#333" }, { id: uid(), label: "Surpresa!", emoji: "🎉", color: "#6d597a" }],
      cardapio: temCardapio ? makeDefaultCardapio() : null,
      feedbacks: [], desde: new Date().toLocaleDateString("pt-BR")
    };
    await createEstabelecimento(novo);
    setEstablishments(prev => [...prev, novo]);
    setNewEst(EMPTY_EST);
    setShowAdd(false); setActionLoading(false);
  };

  const saveEditEst = async () => {
    setEditSaving(true);
    await saveEstabelecimento(editEst);
    setEstablishments(prev => prev.map(e => e.id === editEst.id ? { ...e, ...editEst } : e));
    setEditSaving(false); setEditSaved(true);
    setTimeout(() => setEditSaved(false), 2000);
  };

  const trocarSenhaMaster = async () => {
    if (masterPass.atual !== MASTER.pass) { setMasterPassMsg("❌ Senha atual incorreta."); setTimeout(() => setMasterPassMsg(""), 3000); return; }
    if (masterPass.nova.length < 6) { setMasterPassMsg("❌ Mínimo 6 caracteres."); setTimeout(() => setMasterPassMsg(""), 3000); return; }
    if (masterPass.nova !== masterPass.confirma) { setMasterPassMsg("❌ Senhas não coincidem."); setTimeout(() => setMasterPassMsg(""), 3000); return; }
    MASTER.pass = masterPass.nova;
    setMasterPass({ atual: "", nova: "", confirma: "" });
    setMasterPassMsg("✅ Senha alterada! Anote a nova senha.");
    setTimeout(() => setMasterPassMsg(""), 5000);
  };

  const copyLink = (e) => {
    const slug = e.slug || makeSlug(e.name);
    navigator.clipboard.writeText(`https://notacheia.com.br/r/${slug}`);
    setCopied(e.id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (demoEst) return (
    <>
      <style>{CSS(demoEst.color)}</style>
      <div className="top-bar">
        <button className="top-btn top-btn-ghost" onClick={() => setDemoEst(null)}>← Voltar ao Master</button>
      </div>
      <ClientApp est={demoEst} onSubmit={async () => { }} masterMode={true} key={demoEst.id + "_demo"} />
    </>
  );

  const EstCard = ({ e }) => {
    const sqs = e.questions.filter(q => q.type === "stars");
    const vals = e.feedbacks.flatMap(f => sqs.map(q => f.answers?.[q.id] || 0).filter(v => v > 0));
    const avg = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : "-";
    const slug = e.slug || makeSlug(e.name);
    return (
      <div className="est-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>{e.emoji}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.name}</div>
              <div style={{ fontSize: 11, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.responsavel || e.owner}</div>
            </div>
          </div>
          {e.ativo ? <span className="badge badge-green" style={{ marginLeft: 8 }}><span className="live-dot" style={{ marginRight: 4 }} />Ativo</span> : <span className="badge badge-red" style={{ marginLeft: 8 }}>Bloqueado</span>}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
          {e.cidade && <span style={{ background: "var(--d3)", border: "1px solid var(--border)", borderRadius: 20, padding: "2px 8px", fontSize: 11, color: "var(--muted2)" }}>📍 {e.cidade}</span>}
          {e.ramo && <span style={{ background: "var(--d3)", border: "1px solid var(--border)", borderRadius: 20, padding: "2px 8px", fontSize: 11, color: "var(--muted2)" }}>🏷️ {e.ramo}</span>}
          <span style={{ background: "var(--ac)22", border: "1px solid var(--ac)44", borderRadius: 20, padding: "2px 8px", fontSize: 11, color: "var(--ac)", fontWeight: 700 }}>💳 {e.plano || "R$ 99/mês"}</span>
          {e.cardapio && <span style={{ background: "#0a1f0a", border: "1px solid var(--green)33", borderRadius: 20, padding: "2px 8px", fontSize: 11, color: "var(--green)", fontWeight: 700 }}>🍽️ Pro</span>}
        </div>
        <div className="slug-box" style={{ marginBottom: 10 }}>
          <span className="slug-text">notacheia.com.br/r/{slug}</span>
          <button className="btn-sm btn-sm-ghost" onClick={() => copyLink(e)}>{copied === e.id ? "✅" : "📋"}</button>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1, background: "var(--d2)", borderRadius: 10, padding: "8px 10px", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--ff-head)", fontSize: 18 }}>{e.feedbacks.length}</div>
            <div style={{ fontSize: 9, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>Feedbacks</div>
          </div>
          <div style={{ flex: 1, background: "var(--d2)", borderRadius: 10, padding: "8px 10px", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--ff-head)", fontSize: 18, color: "var(--ac)" }}>⭐ {avg}</div>
            <div style={{ fontSize: 9, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>Nota</div>
          </div>
          <div style={{ flex: 1, background: "var(--d2)", borderRadius: 10, padding: "8px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "var(--muted2)" }}>{e.desde || "—"}</div>
            <div style={{ fontSize: 9, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>Desde</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button className="btn-sm btn-sm-ghost" onClick={() => setViewEst(e)}>👁️ Ver</button>
          <button className="btn-sm btn-sm-ghost" onClick={() => setEditEst({ ...e })}>✏️ Editar</button>
          <button className="btn-sm btn-sm-ghost" onClick={() => setDemoEst(e)}>🎯 Demo</button>
          <button className={`btn-sm ${e.ativo ? "btn-sm-danger" : "btn-sm-green"}`} onClick={() => toggleAtivo(e.id)}>{e.ativo ? "🔒 Bloquear" : "✅ Ativar"}</button>
          <button className="btn-sm btn-sm-danger" onClick={() => deleteEst(e.id)}>🗑️</button>
        </div>
      </div>
    );
  };

  return (
    <div className="shell">
      <Sidebar tab={tab} setTab={setTab} onLogout={onLogout} isMaster />
      <div className="main">
        {tab === "ests" && (<>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div className="main-title" style={{ marginBottom: 0 }}>🏢 Estabelecimentos</div>
            <button className="btn-sm btn-sm-red" onClick={() => setShowAdd(true)}>+ Novo</button>
          </div>
          <div className="metrics" style={{ marginBottom: 20 }}>
            <div className="metric"><div className="metric-val">{establishments.length}</div><div className="metric-lbl">Cadastrados</div></div>
            <div className="metric"><div className="metric-val">{ativos}</div><div className="metric-lbl">Ativos</div></div>
            <div className="metric"><div className="metric-val">R$ {mrr.toLocaleString("pt-BR")}</div><div className="metric-lbl">MRR</div></div>
            <div className="metric"><div className="metric-val">{total}</div><div className="metric-lbl">Feedbacks</div></div>
          </div>
          <div className="tbl-wrap" id="master-table">
            <div className="tbl-head" style={{ gridTemplateColumns: "1.6fr 1.2fr 0.9fr 0.9fr 70px 80px 90px", minWidth: 650 }}>
              <span>Estabelecimento</span><span>Responsável</span><span>Cidade</span><span>Plano</span><span>Feedbacks</span><span>Status</span><span>Ações</span>
            </div>
            {establishments.map(e => {
              const sqs = e.questions.filter(q => q.type === "stars");
              const vals = e.feedbacks.flatMap(f => sqs.map(q => f.answers?.[q.id] || 0).filter(v => v > 0));
              const avg = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : "-";
              return (
                <div className="tbl-row" key={e.id} style={{ gridTemplateColumns: "1.6fr 1.2fr 0.9fr 0.9fr 70px 80px 90px", minWidth: 650 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, minWidth: 0 }}>
                    <span>{e.emoji}</span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.name}</span>
                    <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 400, flexShrink: 0 }}>⭐{avg}</span>
                    {e.cardapio && <span style={{ fontSize: 9, color: "var(--green)", fontWeight: 800, flexShrink: 0 }}>🍽️Pro</span>}
                  </div>
                  <div style={{ minWidth: 0 }}><div style={{ color: "var(--muted2)", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.responsavel || "—"}</div><div style={{ fontSize: 10, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.owner}</div></div>
                  <div style={{ color: "var(--muted2)", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.cidade || "—"}</div>
                  <div style={{ color: "var(--ac)", fontSize: 12, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.plano || "R$ 99/mês"}</div>
                  <div style={{ fontWeight: 700, textAlign: "center" }}>{e.feedbacks.length}</div>
                  <div>{e.ativo ? <span className="badge badge-green"><span className="live-dot" style={{ marginRight: 4 }} />Ativo</span> : <span className="badge badge-red">Bloqueado</span>}</div>
                  <div style={{ display: "flex", gap: 3, flexWrap: "nowrap" }}>
                    <button className="btn-sm btn-sm-ghost" title="Ver feedbacks" style={{ padding: "5px 7px" }} onClick={() => setViewEst(e)}>👁️</button>
                    <button className="btn-sm btn-sm-ghost" title="Editar" style={{ padding: "5px 7px" }} onClick={() => setEditEst({ ...e })}>✏️</button>
                    <button className="btn-sm btn-sm-ghost" title="Demo" style={{ padding: "5px 7px" }} onClick={() => setDemoEst(e)}>🎯</button>
                    <button className={`btn-sm ${e.ativo ? "btn-sm-danger" : "btn-sm-green"}`} style={{ padding: "5px 7px" }} onClick={() => toggleAtivo(e.id)}>{e.ativo ? "🔒" : "✅"}</button>
                    <button className="btn-sm btn-sm-danger" style={{ padding: "5px 7px" }} onClick={() => deleteEst(e.id)}>🗑️</button>
                  </div>
                </div>
              );
            })}
          </div>
          <div id="master-cards">
            {establishments.map(e => <EstCard key={e.id} e={e} />)}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>💡 Clique em 🎯 para fazer uma demo sem bloqueio de tempo</div>
        </>)}
        {tab === "metricas" && (<>
          <div className="main-title">📊 Métricas Gerais</div>
          <div className="metrics">
            <div className="metric"><div className="metric-val">{establishments.length}</div><div className="metric-lbl">Total clientes</div></div>
            <div className="metric"><div className="metric-val">R$ {mrr.toLocaleString("pt-BR")}</div><div className="metric-lbl">MRR</div></div>
            <div className="metric"><div className="metric-val">R$ {(mrr * 12).toLocaleString("pt-BR")}</div><div className="metric-lbl">ARR projetado</div></div>
            <div className="metric"><div className="metric-val">{total}</div><div className="metric-lbl">Feedbacks</div></div>
            <div className="metric"><div className="metric-val">R$ {(mrr - 150).toLocaleString("pt-BR")}</div><div className="metric-lbl">Lucro líquido</div></div>
          </div>
        </>)}
        {tab === "senha" && (<>
          <div className="main-title">🔑 Trocar Senha Master</div>
          <div className="setup-box" style={{ maxWidth: 420 }}>
            <div className="setup-box-title">Alterar senha de acesso Master</div>
            <div style={{ padding: "10px 14px", borderRadius: 10, marginBottom: 14, fontSize: 12, color: "var(--muted2)", background: "var(--d2)", border: "1px solid var(--border)", lineHeight: 1.6 }}>
              ⚠️ <strong style={{ color: "var(--yellow)" }}>Atenção:</strong> a nova senha só dura enquanto o app estiver aberto. Se recarregar a página, volta para a senha original do código.
            </div>
            {masterPassMsg && <div style={{ padding: "10px 14px", borderRadius: 10, marginBottom: 14, fontSize: 13, fontWeight: 700, background: masterPassMsg.includes("✅") ? "#0a2a0a" : "#1a0505", color: masterPassMsg.includes("✅") ? "var(--green)" : "var(--red)", border: `1px solid ${masterPassMsg.includes("✅") ? "var(--green)" : "var(--red)"}33` }}>{masterPassMsg}</div>}
            <label className="lbl">Senha atual</label>
            <input className="field" type="password" value={masterPass.atual} onChange={e => setMasterPass(s => ({ ...s, atual: e.target.value }))} />
            <label className="lbl">Nova senha</label>
            <input className="field" type="password" placeholder="Mínimo 6 caracteres" value={masterPass.nova} onChange={e => setMasterPass(s => ({ ...s, nova: e.target.value }))} />
            <label className="lbl">Confirmar nova senha</label>
            <input className="field" type="password" value={masterPass.confirma} onChange={e => setMasterPass(s => ({ ...s, confirma: e.target.value }))} />
            <button className="btn btn-red" style={{ maxWidth: 220 }} onClick={trocarSenhaMaster}>Alterar senha</button>
          </div>
        </>)}
      </div>

      {/* Modal ver feedbacks */}
      {viewEst && (<div className="modal-bg" onClick={() => setViewEst(null)}><div className="modal" onClick={e => e.stopPropagation()}><div className="modal-title">{viewEst.emoji} {viewEst.name}</div>{viewEst.feedbacks.length === 0 && <div style={{ color: "var(--muted)" }}>Nenhum feedback ainda.</div>}{viewEst.feedbacks.map((f, i) => (<div className="fb" key={i} style={{ marginBottom: 8 }}><div className="fb-top"><div className="fb-name">👤 {f.nome}</div><div className="fb-date">{f.data || "Agora"}</div></div><div style={{ fontSize: 12, color: "var(--muted2)" }}>NPS: {f.answers?.q_nps ?? "-"} · Atendente: {f.answers?.q_atend ?? "-"}</div>{f.answers?.q_sug && <div className="fb-comment">💬 "{f.answers.q_sug}"</div>}{f.premio && <div className="fb-prize">🎁 {f.premio}</div>}</div>))}<button className="btn btn-ghost" style={{ marginTop: 14 }} onClick={() => setViewEst(null)}>Fechar</button></div></div>)}

      {/* Modal novo estabelecimento */}
      {showAdd && (<div className="modal-bg" onClick={() => setShowAdd(false)}><div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">➕ Novo Estabelecimento</div>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--muted)", marginBottom: 10 }}>📋 Dados do Estabelecimento</div>
        <label className="lbl">Nome do estabelecimento</label>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}><div style={{ width: 48, height: 48, background: "var(--d2)", border: "1.5px solid var(--border)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>{newEst.emoji}</div><input className="field" style={{ marginBottom: 0, flex: 1 }} placeholder="Ex: Pizzaria Bella" value={newEst.name} onChange={e => setNewEst(s => ({ ...s, name: e.target.value, slug: s.slug || makeSlug(e.target.value) }))} /></div>
        <label className="lbl">🔗 Link exclusivo</label>
        <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: "var(--muted)", whiteSpace: "nowrap" }}>/r/</span>
          <input className="field" style={{ marginBottom: 0, flex: 1 }} placeholder="meu-estabelecimento" value={newEst.slug || makeSlug(newEst.name)} onChange={e => setNewEst(s => ({ ...s, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }))} />
        </div>
        <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 12 }}>Gerado automaticamente. Pode editar se quiser.</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
          <div><label className="lbl">Ramo</label>
            <select className="field" style={{ marginBottom: 0 }} value={newEst.ramo} onChange={e => setNewEst(s => ({ ...s, ramo: e.target.value }))}>
              {RAMOS.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div><label className="lbl">Cidade</label><input className="field" style={{ marginBottom: 0 }} placeholder="Ex: Matinhos" value={newEst.cidade} onChange={e => setNewEst(s => ({ ...s, cidade: e.target.value }))} /></div>
        </div>
        {isRamoComida(newEst.ramo) && (
          <div style={{ padding: "8px 12px", background: "var(--ac)11", border: "1px solid var(--ac)33", borderRadius: 8, fontSize: 12, color: "var(--muted2)", marginBottom: 12 }}>
            🍽️ Este ramo terá <strong style={{ color: "var(--text)" }}>cardápio digital</strong> disponível (Plano Pro).
          </div>
        )}
        <label className="lbl">Emoji do estabelecimento</label>
        <EmojiPicker value={newEst.emoji} ramoAtual={newEst.ramo} onChange={emoji => setNewEst(s => ({ ...s, emoji }))} />
        <label className="lbl">Cor</label><div className="swatch-row" style={{ marginBottom: 14 }}>{COLORS.map(c => <div key={c} className={`swatch ${newEst.color === c ? "on" : ""}`} style={{ background: c }} onClick={() => setNewEst(s => ({ ...s, color: c }))} />)}</div>
        <div className="div" />
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--muted)", marginBottom: 10 }}>👤 Dados do Responsável</div>
        <label className="lbl">Nome do responsável</label>
        <input className="field" placeholder="Nome completo" value={newEst.responsavel} onChange={e => setNewEst(s => ({ ...s, responsavel: e.target.value }))} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 0 }}>
          <div><label className="lbl">Telefone</label><input className="field" style={{ marginBottom: 0 }} placeholder="(41) 99999-0000" value={newEst.telefone} onChange={e => setNewEst(s => ({ ...s, telefone: e.target.value }))} /></div>
          <div><label className="lbl">WhatsApp</label><input className="field" style={{ marginBottom: 0 }} placeholder="5541999990000" value={newEst.whatsapp} onChange={e => setNewEst(s => ({ ...s, whatsapp: e.target.value }))} /></div>
        </div>
        <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 12, marginTop: 4 }}>WhatsApp: código do país + DDD + número, sem espaços.</div>
        <label className="lbl">E-mail de acesso</label><input className="field" placeholder="dono@email.com" value={newEst.owner} onChange={e => setNewEst(s => ({ ...s, owner: e.target.value }))} />
        <label className="lbl">Senha</label><input className="field" placeholder="Senha de acesso" value={newEst.pass} onChange={e => setNewEst(s => ({ ...s, pass: e.target.value }))} />
        <div className="div" />
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--muted)", marginBottom: 10 }}>💳 Plano & Configuração</div>
        <label className="lbl">Plano</label>
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>{PLANOS.map(p => (<button key={p} onClick={() => setNewEst(s => ({ ...s, plano: p }))} style={{ padding: "8px 14px", borderRadius: 10, fontFamily: "var(--ff-body)", fontSize: 13, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${newEst.plano === p ? "var(--ac)" : "var(--border)"}`, background: newEst.plano === p ? "var(--ac)22" : "var(--d3)", color: newEst.plano === p ? "var(--text)" : "var(--muted2)" }}>{p}</button>))}</div>
        <label className="lbl">Google Reviews (opcional)</label><input className="field" placeholder="https://g.page/r/..." value={newEst.googleUrl} onChange={e => setNewEst(s => ({ ...s, googleUrl: e.target.value }))} />
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}><button className="btn btn-red" onClick={addEst} disabled={actionLoading}>{actionLoading ? "Criando..." : "Criar estabelecimento"}</button><button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancelar</button></div>
      </div></div>)}

      {/* Modal editar */}
      {editEst && (<div className="modal-bg" onClick={() => setEditEst(null)}><div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">✏️ Editar — {editEst.name}</div>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--muted)", marginBottom: 10 }}>📋 Dados do Estabelecimento</div>
        <label className="lbl">Nome</label>
        <input className="field" value={editEst.name} onChange={e => setEditEst(s => ({ ...s, name: e.target.value }))} />
        <label className="lbl">🔗 Link exclusivo</label>
        <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: "var(--muted)", whiteSpace: "nowrap" }}>/r/</span>
          <input className="field" style={{ marginBottom: 0, flex: 1 }} value={editEst.slug || makeSlug(editEst.name)} onChange={e => setEditEst(s => ({ ...s, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }))} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
          <div><label className="lbl">Ramo</label><select className="field" style={{ marginBottom: 0 }} value={editEst.ramo || ""} onChange={e => setEditEst(s => ({ ...s, ramo: e.target.value }))}>{RAMOS.map(r => <option key={r}>{r}</option>)}</select></div>
          <div><label className="lbl">Cidade</label><input className="field" style={{ marginBottom: 0 }} value={editEst.cidade || ""} onChange={e => setEditEst(s => ({ ...s, cidade: e.target.value }))} /></div>
        </div>
        <label className="lbl">Google Reviews</label>
        <input className="field" placeholder="https://g.page/r/..." value={editEst.googleUrl || ""} onChange={e => setEditEst(s => ({ ...s, googleUrl: e.target.value }))} />
        <div className="div" />
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--muted)", marginBottom: 10 }}>👤 Dados do Responsável</div>
        <label className="lbl">Nome do responsável</label>
        <input className="field" value={editEst.responsavel || ""} onChange={e => setEditEst(s => ({ ...s, responsavel: e.target.value }))} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 0 }}>
          <div><label className="lbl">Telefone</label><input className="field" style={{ marginBottom: 0 }} value={editEst.telefone || ""} onChange={e => setEditEst(s => ({ ...s, telefone: e.target.value }))} /></div>
          <div><label className="lbl">WhatsApp</label><input className="field" style={{ marginBottom: 0 }} value={editEst.whatsapp || ""} onChange={e => setEditEst(s => ({ ...s, whatsapp: e.target.value }))} /></div>
        </div>
        <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 12, marginTop: 4 }}>WhatsApp: código país + DDD + número sem espaços.</div>
        <label className="lbl">E-mail de acesso</label>
        <input className="field" value={editEst.owner} onChange={e => setEditEst(s => ({ ...s, owner: e.target.value }))} />
        <label className="lbl">Senha</label>
        <input className="field" type="password" placeholder="Nova senha (deixe em branco para manter)" value={editEst.pass} onChange={e => setEditEst(s => ({ ...s, pass: e.target.value }))} />
        <div className="div" />
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--muted)", marginBottom: 10 }}>💳 Plano</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>{PLANOS.map(p => (<button key={p} onClick={() => setEditEst(s => ({ ...s, plano: p }))} style={{ padding: "8px 14px", borderRadius: 10, fontFamily: "var(--ff-body)", fontSize: 13, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${editEst.plano === p ? "var(--ac)" : "var(--border)"}`, background: editEst.plano === p ? "var(--ac)22" : "var(--d3)", color: editEst.plano === p ? "var(--text)" : "var(--muted2)" }}>{p}</button>))}</div>
        <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>Cliente desde: <strong style={{ color: "var(--text)" }}>{editEst.desde || "—"}</strong></div>
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button className="btn btn-red" onClick={saveEditEst} disabled={editSaving}>{editSaving ? "Salvando..." : editSaved ? "✅ Salvo!" : "Salvar alterações"}</button>
          <button className="btn btn-ghost" onClick={() => setEditEst(null)}>Fechar</button>
        </div>
      </div></div>)}
    </div>
  );
}


// Tela de escolha: Demo do painel OU login real
function OwnerGateway({ onDemo, onLogin }) {
  return (
    <div className="page page-center fade-up" style={{ background: "radial-gradient(ellipse at 50% 0%, #e6394615, transparent 50%), var(--dark)" }}>
      <div className="card" style={{ textAlign: "center" }}>
        <LogoSVG size={150} style={{ margin: "0 auto 18px" }} />
        <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "var(--muted)", marginBottom: 20 }}>ÁREA DO PROPRIETÁRIO</div>
        <div className="div" />
        <div style={{ background: "var(--d2)", border: "1.5px solid var(--ac)44", borderRadius: 16, padding: 20, marginBottom: 12, cursor: "pointer" }} onClick={onDemo}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🎯</div>
          <div style={{ fontFamily: "var(--ff-head)", fontSize: 17, marginBottom: 6 }}>Ver demonstração</div>
          <div style={{ fontSize: 12, color: "var(--muted2)", lineHeight: 1.6 }}>Explore o painel completo sem precisar de senha.<br /><span style={{ color: "var(--ac)", fontWeight: 700 }}>Ideal para apresentações.</span></div>
        </div>
        <div style={{ background: "var(--d2)", border: "1.5px solid var(--border)", borderRadius: 16, padding: 20, cursor: "pointer" }} onClick={onLogin}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🔑</div>
          <div style={{ fontFamily: "var(--ff-head)", fontSize: 17, marginBottom: 6 }}>Já sou cliente</div>
          <div style={{ fontSize: 12, color: "var(--muted2)", lineHeight: 1.6 }}>Acesse seu painel com e-mail e senha.</div>
        </div>
      </div>
    </div>
  );
}

function LoginScreen({ title, hint, onLogin, prefillEmail = "", prefillPass = "" }) {
  const [email, setEmail] = useState(prefillEmail);
  const [pass, setPass] = useState(prefillPass);
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const handle = () => { const ok = onLogin(email, pass); if (!ok) { setErr("E-mail ou senha incorretos."); setTimeout(() => setErr(""), 3000); } };
  return (
    <div className="page page-center fade-up" style={{ background: "radial-gradient(ellipse at 50% 0%, #e6394615, transparent 50%), var(--dark)" }}>
      <div className="card">
        <LogoSVG size={170} style={{ margin: "0 auto 14px" }} />
        <div style={{ textAlign: "center", marginBottom: 18 }}><div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "var(--muted)" }}>{title}</div></div>
        <div className="div" />
        {err && <div className="err">⚠️ {err}</div>}
        <label className="lbl">E-mail</label>
        <input className="field" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handle()} />
        <label className="lbl">Senha</label>
        <div style={{ position: "relative", marginBottom: 14 }}>
          <input className="field" style={{ marginBottom: 0, paddingRight: 48 }} type={show ? "text" : "password"} placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && handle()} />
          <button onClick={() => setShow(s => !s)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#555" }}>{show ? "🙈" : "👁️"}</button>
        </div>
        <button className="btn btn-red" onClick={handle}>Entrar →</button>
        <div style={{ textAlign: "center", fontSize: 11, color: "var(--muted)", marginTop: 14 }}>{hint}</div>
      </div>
    </div>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("client");
  const [ests, setEsts] = useState([]);
  const [activeEst, setActiveEst] = useState(null);
  const [loggedEst, setLoggedEst] = useState(null);

  useEffect(() => {
    const slug = window.location.pathname.match(/^\/r\/([^/]+)/)?.[1];
    async function init() {
      const data = await loadEstabelecimentos();
      if (data && data.length > 0) {
        const withFeedbacks = await Promise.all(data.map(async (e) => ({ ...e, feedbacks: await loadFeedbacks(e.id) })));
        setEsts(withFeedbacks);
        if (slug) {
          const found = withFeedbacks.find(e => (e.slug || makeSlug(e.name)) === slug);
          setActiveEst(found || withFeedbacks[0]);
        } else {
          setActiveEst(withFeedbacks[0]);
        }
      } else {
        setEsts(SEED);
        if (slug) {
          const found = SEED.find(e => (e.slug || makeSlug(e.name)) === slug);
          setActiveEst(found || SEED[0]);
        } else {
          setActiveEst(SEED[0]);
        }
      }
      setLoading(false);
    }
    init();
  }, []);

  const css = CSS(activeEst?.color || "#e63946");
  const addFeedback = async (fb) => {
    await saveFeedbackToSupabase(activeEst.id, fb);
    const nf = { ...fb, id: Date.now(), data: new Date().toLocaleString("pt-BR") };
    setEsts(prev => prev.map(e => e.id === activeEst.id ? { ...e, feedbacks: [...e.feedbacks, nf] } : e));
    setActiveEst(e => ({ ...e, feedbacks: [...e.feedbacks, nf] }));
  };
  const updateEst = (updated) => {
    setEsts(prev => prev.map(e => e.id === updated.id ? updated : e));
    setLoggedEst(updated);
    if (activeEst?.id === updated.id) setActiveEst(updated);
  };

  if (loading) return (<><style>{CSS()}</style><LoadingScreen /></>);

  return (
    <>
      <style>{css}</style>
      <div>
        <div className="top-bar">
          {mode !== "client" && <button className="top-btn top-btn-ghost" onClick={() => setMode("client")}>📱 Cliente</button>}
          {mode === "client" && (<>
            <select style={{ background: "var(--d2)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px", fontFamily: "var(--ff-body)", fontSize: 12, cursor: "pointer" }}
              value={activeEst?.id} onChange={e => setActiveEst(ests.find(x => x.id === e.target.value))}>
              {ests.map(e => <option key={e.id} value={e.id}>{e.emoji} {e.name}</option>)}
            </select>
            <button className="top-btn top-btn-ghost" onClick={() => setMode("ownerGateway")}>🏪 Dono</button>
            <button className="top-btn top-btn-red" onClick={() => setMode("masterLogin")}>👑 Master</button>
          </>)}
        </div>
        {mode === "client" && activeEst && <ClientApp est={activeEst} onSubmit={addFeedback} key={activeEst.id} />}
        {mode === "ownerGateway" && <OwnerGateway onDemo={() => { const demo = ests.find(e => e.id === "est_demo") || SEED.find(e => e.id === "est_demo"); setLoggedEst(demo); setMode("ownerDash"); }} onLogin={() => setMode("ownerLogin")} />}
        {mode === "ownerLogin" && <LoginScreen title="ACESSO DO PROPRIETÁRIO" hint="" onLogin={(email, pass) => { const found = ests.find(e => e.owner === email && e.pass === pass); if (found) { setLoggedEst(found); setMode("ownerDash"); return true; } return false; }} />}
        {mode === "ownerDash" && loggedEst && <OwnerDash est={loggedEst} onUpdate={updateEst} onLogout={() => { setLoggedEst(null); setMode("client"); }} />}
        {mode === "masterLogin" && <LoginScreen title="PAINEL MASTER" hint="" prefillEmail="master@notacheia.com.br" prefillPass="hu2001" onLogin={(email, pass) => { if (email === MASTER.user && pass === MASTER.pass) { setMode("masterDash"); return true; } return false; }} />}
        {mode === "masterDash" && <MasterPanel establishments={ests} setEstablishments={setEsts} onLogout={() => setMode("client")} />}
      </div>
    </>
  );
}
