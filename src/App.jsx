import { useState, useRef, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://lhdbevkcpycikyudzqng.supabase.co";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || "sb_publishable_x98wrvkKncTzTV0QnZZjzA_MjD21sCw";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`;

const makeSlug = (name) => name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

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
      { id: "p1", label: "Fritas Grátis", emoji: "🍟", color: "#e63946" },
      { id: "p2", label: "10% Desconto",  emoji: "🏷️", color: "#1a1a1a" },
      { id: "p3", label: "Refri Grátis",  emoji: "🥤", color: "#c1121f" },
      { id: "p4", label: "Sobremesa Grátis", emoji: "🍦", color: "#333" },
      { id: "p5", label: "20% Desconto",  emoji: "🎉", color: "#e63946" },
      { id: "p6", label: "Brinde Surpresa", emoji: "🎁", color: "#111" },
    ],
    feedbacks: [], plano: "R$ 99/mês", desde: "01/05/2026",
  },
  {
    id: "est_2", owner: "ana@cafezinho.com", pass: "123456", ativo: true,
    name: "Café Veloz", emoji: "☕", color: "#6f4e37", slug: "cafe-veloz",
    googleUrl: "", logoUrl: "", feedbackInterval: 30,
    questions: makeDefaultQuestions(),
    prizes: [
      { id: "p1", label: "Café Grátis",    emoji: "☕", color: "#6f4e37" },
      { id: "p2", label: "Bolo Grátis",    emoji: "🎂", color: "#5a3e2b" },
      { id: "p3", label: "10% Desconto",   emoji: "🏷️", color: "#8b5e3c" },
      { id: "p4", label: "Brinde Surpresa",emoji: "🎁", color: "#4a2f1a" },
    ],
    feedbacks: [], plano: "R$ 99/mês", desde: "05/05/2026",
  },
];

const MASTER = { user: "master@notacheia.com.br", pass: "master2026" };
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
  .google-box-low { background: var(--d2); border: 1px solid var(--border); border-radius: 14px; padding: 14px; text-align: center; margin-bottom: 10px; }
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
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes popIn { from { transform:scale(0.4); opacity:0; } to { transform:scale(1); opacity:1; } }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
  .fade-up { animation: fadeUp 0.4s ease forwards; }
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: var(--dark); } ::-webkit-scrollbar-thumb { background: var(--d3); border-radius: 3px; }
  .div { height: 1px; background: var(--border); margin: 14px 0; }
`;

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

async function loadEstabelecimentos() {
  const { data, error } = await supabase.from("estabelecimentos").select("*");
  if (error || !data || data.length === 0) return null;
  return data.map(e => ({ ...e, questions: e.questions || makeDefaultQuestions(), prizes: e.prizes || [], feedbacks: [], slug: e.slug || makeSlug(e.name) }));
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
      {[1,2,3,4,5].map(s => (
        <span key={s} className={`star ${s <= (hov || val) ? "on" : ""}`}
          onMouseEnter={() => setHov(s)} onMouseLeave={() => setHov(0)} onClick={() => onChange(s)}>⭐</span>
      ))}
      {(hov || val) > 0 && <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 4 }}>{["","Ruim","Regular","Bom","Ótimo","Excelente"][hov || val]}</span>}
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
          <div className="nps-row">{[0,1,2,3,4,5,6,7,8,9,10].map(n => <button key={n} className={`nps-btn ${answer === n ? "sel" : ""}`} onClick={() => onChange(n)}>{n}</button>)}</div>
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
  const navs = isMaster
    ? [{ id: "ests", icon: "🏢", lbl: "Estabelecimentos" }, { id: "metricas", icon: "📊", lbl: "Métricas gerais" }]
    : [
        { id: "overview", icon: "📊", lbl: "Visão Geral" },
        { id: "feedbacks", icon: "💬", lbl: "Feedbacks" },
        { id: "insights", icon: "💡", lbl: "Insights" },
        { id: "qrcode", icon: "📱", lbl: "Meu QR Code" },
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

function ClientApp({ est, onSubmit, masterMode = false }) {
  const interval = est.feedbackInterval || 30;
  const blocked = !canLeaveFeedback(est.id, interval, masterMode);
  const daysLeft = daysUntilNext(est.id, interval);
  const [step, setStep] = useState("welcome");
  const [nome, setNome] = useState("");
  const [answers, setAnswers] = useState({});
  const [prize, setPrize] = useState(null);
  const [coupon] = useState(genCoupon());
  const [avgStars, setAvgStars] = useState(0);
  const [saving, setSaving] = useState(false);
  const [savedAnswers, setSavedAnswers] = useState({});
  const [savedNome, setSavedNome] = useState("");
  const required = est.questions.filter(q => q.required);
  const answered = required.filter(q => { const a = answers[q.id]; if (a === undefined || a === null || a === "") return false; if (q.type === "choice" && a === "Outro:") return false; return true; });
  const prog = (answered.length / required.length) * 100;
  const allDone = answered.length === required.length;

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

  if (step === "welcome") return (
    <div className="page page-center fade-up" style={{ background: `radial-gradient(ellipse at 50% 0%, ${est.color}20, transparent 60%), var(--dark)` }}>
      <div className="card" style={{ textAlign: "center" }}>
        <LogoSVG size={130} style={{ margin: "0 auto 14px" }} />
        {masterMode && <div className="master-demo-bar">👑 Modo demonstração — bloqueio desativado</div>}
        <div style={{ fontSize: 52, marginBottom: 10 }}><EstLogo est={est} size={60} /></div>
        <div className="welcome-name">{est.name}</div>
        <div className="welcome-tag">Sua opinião é muito importante para nós!<br/>Responda e ganhe um brinde surpresa 🎁</div>
        <div className="welcome-badge">🎰 Gire a roleta e ganhe na hora!</div>
        <WheelTeaser prizes={est.prizes} />
        <input className="field" placeholder="Seu nome (opcional)" value={nome} onChange={e => setNome(e.target.value)} />
        <button className="btn btn-red" onClick={() => setStep("survey")}>Começar pesquisa →</button>
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
          <button className="btn btn-red" onClick={() => { const sqs = est.questions.filter(q => q.type === "stars"); setAvgStars(sqs.length ? sqs.reduce((s, q) => s + (answers[q.id] || 0), 0) / sqs.length : 5); setSavedAnswers(answers); setSavedNome(nome || "Anônimo"); setStep("confirm"); }} disabled={!allDone}>
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
          <div className="confirm-sub">Sua resposta foi registrada!<br/>Agora gire a roleta e descubra seu prêmio 🎁</div>
          <div className="div" />
          <Wheel prizes={est.prizes} onResult={async (p) => {
            setPrize(p); setSaving(true);
            await onSubmit({ nome: savedNome, answers: savedAnswers, premio: p.label });
            markFeedbackDone(est.id, masterMode);
            setSaving(false); setStep("prize");
          }} />
          {saving && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>Salvando...</div>}
        </div>
      </div>
    </div>
  );

  if (step === "prize") {
    const isHappy = avgStars >= 4;
    return (
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
          <button className="btn-download" onClick={() => { const txt=`NotaCheia ⭐\n${est.name}\n\nPrêmio: ${prize.label}\nCupom: ${coupon}\nVálido até: ${addDays(7)}\n\nApresente ao atendente para resgatar.`;const blob=new Blob([txt],{type:"text/plain"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`premio-${coupon}.txt`;a.click(); }}>⬇️ Baixar comprovante</button>
          {est.googleUrl && isHappy && (<div className="google-box"><div style={{ fontSize: 11, fontWeight: 800, color: "#4ade80", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>🎉 Que ótimo que gostou!</div><div style={{ fontSize: 13, color: "#aaa", lineHeight: 1.5 }}>Conta pra mais pessoas no Google?</div><button className="btn-google" onClick={() => window.open(est.googleUrl, "_blank")}>🌐 Avaliar no Google Maps</button></div>)}
          {est.googleUrl && !isHappy && (<div className="google-box-low"><div style={{ fontSize: 13, color: "#888", lineHeight: 1.5 }}>😔 Sentimos muito. Seu feedback já foi enviado ao responsável!</div></div>)}
          <div style={{ fontSize: 11, color: "#444", textAlign: "center", marginTop: 8 }}>{est.name} · Powered by NotaCheia ⭐</div>
        </div>
      </div>
    );
  }
}

function MiniBarChart({ data, color = "var(--ac)" }) {
  const max = Math.max(...data.map(d => d.val), 1);
  return (<div className="bar-chart">{data.map((d, i) => (<div className="bar-col" key={i}><div className="bar-val">{d.val}</div><div className="bar" style={{ height: `${(d.val / max) * 70}px`, background: color, opacity: 0.7 + (i / data.length) * 0.3 }} /><div className="bar-lbl">{d.lbl}</div></div>))}</div>);
}

function OwnerDash({ est, onUpdate, onLogout }) {
  const [tab, setTab] = useState("overview");
  const [ed, setEd] = useState({ ...est, questions: est.questions.map(q=>({...q})), prizes: est.prizes.map(p=>({...p})) });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newQ, setNewQ] = useState({ label: "", type: "stars", options: "" });
  const [newP, setNewP] = useState({ label: "", emoji: "🎁", color: "#e63946" });
  const [filter, setFilter] = useState("todos");
  const [newPass, setNewPass] = useState({ atual: "", nova: "", confirma: "" });
  const [passMsg, setPassMsg] = useState("");
  const COLORS = ["#e63946","#f4a261","#2a9d8f","#457b9d","#6d597a","#e76f51","#264653","#e9c46a","#f72585","#4cc9f0","#111","#333"];
  const starQs = est.questions.filter(q => q.type === "stars");
  const starAvg = (key) => { const v=est.feedbacks.map(f=>f.answers?.[key]).filter(v=>typeof v==="number"&&v>0); return v.length?(v.reduce((a,b)=>a+b,0)/v.length).toFixed(1):"-"; };
  const overall = () => { if(!starQs.length||!est.feedbacks.length)return"-"; const v=est.feedbacks.flatMap(f=>starQs.map(q=>f.answers?.[q.id]||0).filter(v=>v>0)); return v.length?(v.reduce((a,b)=>a+b,0)/v.length).toFixed(1):"-"; };
  const npsAvg = () => { const v=est.feedbacks.map(f=>f.answers?.q_nps).filter(v=>v!==undefined); return v.length?(v.reduce((a,b)=>a+b,0)/v.length).toFixed(1):"-"; };
  const staffRanking = () => { const map={}; est.feedbacks.forEach(f=>{const atd=f.answers?.q_atend;if(!atd)return;if(!map[atd])map[atd]={total:0,count:0};const s=starQs.map(q=>f.answers?.[q.id]||0).filter(v=>v>0);if(s.length){map[atd].total+=s.reduce((a,b)=>a+b,0)/s.length;map[atd].count++;}}); return Object.entries(map).map(([name,d])=>({name,avg:d.count?(d.total/d.count).toFixed(1):0})).sort((a,b)=>b.avg-a.avg); };
  const howKnew = () => { const map={}; est.feedbacks.forEach(f=>{const v=f.answers?.q_como;if(v)map[v]=(map[v]||0)+1;}); return Object.entries(map).sort((a,b)=>b[1]-a[1]); };
  const chartData = (() => { const days=["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"],result=[]; for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const lbl=days[d.getDay()],dateStr=d.toLocaleDateString("pt-BR");result.push({lbl,val:est.feedbacks.filter(f=>f.data?.includes(dateStr)).length});} return result; })();
  const insights = () => { const list=[],ov=parseFloat(overall()),nps=parseFloat(npsAvg()); if(ov>=4.5)list.push({icon:"🏆",text:<><strong>Excelente!</strong> Nota acima de 4.5.</>}); if(nps>=8)list.push({icon:"📈",text:<><strong>NPS alto!</strong> Clientes vão indicar seu negócio.</>}); const esp=parseFloat(starAvg("q_esp"));if(esp&&esp<3.5)list.push({icon:"⚠️",text:<><strong>Tempo de espera!</strong> Nota {esp}.</>}); const pv=est.feedbacks.map(f=>f.answers?.q_preco).filter(Boolean);const caro=pv.filter(v=>v==="Caro pelo que oferece").length;if(caro>pv.length*0.3)list.push({icon:"💰",text:<><strong>{Math.round(caro/pv.length*100)}% acham caro.</strong></>}); const prim=est.feedbacks.filter(f=>f.answers?.q_first==="Sim").length;if(prim>0)list.push({icon:"🆕",text:<><strong>{prim} cliente{prim>1?"s":""} novo{prim>1?"s":""}</strong> recentemente!</>}); if(list.length===0)list.push({icon:"📊",text:<>Continue coletando feedbacks para receber insights.</>}); return list; };
  const filteredFeedbacks = () => { if(filter==="positivos")return est.feedbacks.filter(f=>(f.answers?.q_nps||0)>=9); if(filter==="negativos")return est.feedbacks.filter(f=>(f.answers?.q_nps||0)<=6); if(filter==="neutros")return est.feedbacks.filter(f=>{const n=f.answers?.q_nps;return n===7||n===8;}); return est.feedbacks; };
  const save = async () => { setSaving(true); await saveEstabelecimento(ed); onUpdate(ed); setSaving(false); setSaved(true); setTimeout(()=>setSaved(false),2000); };
  const addQ = () => { if(!newQ.label)return; const opts=newQ.options.split(",").map(s=>s.trim()).filter(Boolean); setEd(e=>({...e,questions:[...e.questions,{id:uid(),...newQ,options:opts,required:true}]})); setNewQ({label:"",type:"stars",options:""}); };
  const removeQ = id => setEd(e=>({...e,questions:e.questions.filter(q=>q.id!==id)}));
  const addP = () => { if(!newP.label)return; setEd(e=>({...e,prizes:[...e.prizes,{id:uid(),...newP}]})); setNewP({label:"",emoji:"🎁",color:"#e63946"}); };
  const removeP = id => setEd(e=>({...e,prizes:e.prizes.filter(p=>p.id!==id)}));
  const trocarSenha = async () => { if(newPass.atual!==est.pass){setPassMsg("❌ Senha incorreta.");setTimeout(()=>setPassMsg(""),3000);return;} if(newPass.nova.length<6){setPassMsg("❌ Mínimo 6 caracteres.");setTimeout(()=>setPassMsg(""),3000);return;} if(newPass.nova!==newPass.confirma){setPassMsg("❌ Senhas não coincidem.");setTimeout(()=>setPassMsg(""),3000);return;} const u={...est,pass:newPass.nova};await saveEstabelecimento(u);onUpdate(u);setPassMsg("✅ Senha alterada!");setNewPass({atual:"",nova:"",confirma:""});setTimeout(()=>setPassMsg(""),3000); };
  const handleLogoUpload = (e) => { const file=e.target.files[0];if(!file)return;const r=new FileReader();r.onload=(ev)=>setEd(s=>({...s,logoUrl:ev.target.result}));r.readAsDataURL(file); };

  return (
    <div className="shell">
      <Sidebar est={est} tab={tab} setTab={setTab} onLogout={onLogout} />
      <div className="main">
        {tab==="overview"&&(<>
          <div className="main-title">{est.emoji} {est.name}</div>
          <div className="metrics">
            <div className="metric"><div className="metric-val">{est.feedbacks.length}</div><div className="metric-lbl">Avaliações</div></div>
            <div className="metric"><div className="metric-val">⭐ {overall()}</div><div className="metric-lbl">Nota geral</div></div>
            <div className="metric"><div className="metric-val">📊 {npsAvg()}</div><div className="metric-lbl">NPS médio</div></div>
            <div className="metric"><div className="metric-val">{est.feedbacks.filter(f=>(f.answers?.q_nps||0)>=9).length}</div><div className="metric-lbl">Promotores</div></div>
            <div className="metric"><div className="metric-val">{est.feedbacks.filter(f=>f.answers?.q_first==="Sim").length}</div><div className="metric-lbl">Clientes novos</div></div>
            <div className="metric"><div className="metric-val" style={{fontSize:20}}>{est.googleUrl?"✅":"❌"}</div><div className="metric-lbl">Google Reviews</div></div>
          </div>
          <div className="chart-wrap"><div className="chart-title">📅 Feedbacks — últimos 7 dias</div><MiniBarChart data={chartData}/></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:8,marginBottom:14}}>
            {starQs.map(q=>{const s=starAvg(q.id);return(<div key={q.id} style={{background:"var(--d1)",border:"1px solid var(--border)",borderRadius:12,padding:14,textAlign:"center"}}><div style={{fontFamily:"var(--ff-head)",fontSize:22,color:s>=4?"var(--green)":s>=3?"var(--yellow)":"var(--red)"}}>{s}</div><div style={{fontSize:10,color:"var(--muted)",fontWeight:700,textTransform:"uppercase",marginTop:4}}>{q.label.replace("Como avalia nosso ","").replace("Como avalia a qualidade dos ","").replace("Como avalia a qualidade das ","").replace("Como avalia o ","").replace("?","")}</div><div style={{height:3,background:"var(--d3)",borderRadius:2,marginTop:6}}><div style={{height:"100%",width:`${(parseFloat(s)/5)*100}%`,background:"var(--ac)",borderRadius:2}}/></div></div>);})}
          </div>
          {staffRanking().length>0&&(<div className="chart-wrap"><div className="chart-title">🏆 Ranking colaboradores</div>{staffRanking().map((s,i)=>(<div className="rank-row" key={s.name}><div className="rank-num">{i+1}</div><div className="rank-name">{s.name}</div><div className="rank-bar"><div className="rank-fill" style={{width:`${(s.avg/5)*100}%`}}/></div><div className="rank-score">{s.avg}</div></div>))}</div>)}
          {howKnew().length>0&&(<div className="chart-wrap"><div className="chart-title">📍 Como chegaram</div><MiniBarChart data={howKnew().map(([lbl,val])=>({lbl:lbl.slice(0,10),val}))} color="var(--green)"/></div>)}
        </>)}
        {tab==="feedbacks"&&(<>
          <div className="main-title">💬 Feedbacks</div>
          <div className="filter-row">{[["todos","Todos"],["positivos","😍 Promotores"],["neutros","😐 Neutros"],["negativos","😞 Detratores"]].map(([k,l])=>(<button key={k} className={`filter-btn ${filter===k?"on":""}`} onClick={()=>setFilter(k)}>{l}</button>))}</div>
          {filteredFeedbacks().length===0&&<div style={{color:"var(--muted)",textAlign:"center",marginTop:40}}>Nenhum feedback neste filtro.</div>}
          {filteredFeedbacks().map((f,i)=>{const nps=f.answers?.q_nps;const npsColor=nps>=9?"var(--green)":nps>=7?"var(--yellow)":"var(--red)";return(<div className="fb" key={f.id||i}><div className="fb-top"><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:34,height:34,borderRadius:"50%",background:"var(--d3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>👤</div><div><div className="fb-name">{f.nome}</div><div className="fb-date">{f.data||"Agora"}</div></div></div>{nps!==undefined&&(<div style={{background:"var(--d3)",border:`1px solid ${npsColor}44`,borderRadius:10,padding:"4px 10px",textAlign:"center"}}><div style={{fontSize:14,fontFamily:"var(--ff-head)",color:npsColor}}>{nps}</div><div style={{fontSize:9,color:"var(--muted)",textTransform:"uppercase"}}>NPS</div></div>)}</div><div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:8}}>{[["q_atend","👨‍💼"],["q_first","🆕"],["q_hora","⏰"],["q_mesa","🪑"],["q_como","📍"],["q_preco","💰"]].map(([key,icon])=>{const v=f.answers?.[key];if(!v)return null;const sl={q_atend:"Atend",q_first:"1ªvez",q_hora:"Hora",q_mesa:"Mesa",q_como:"Via",q_preco:"Preço"}[key];return(<div key={key} style={{background:"var(--d3)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:20,padding:"3px 8px",fontSize:11,display:"flex",gap:3,alignItems:"center"}}><span>{icon}</span><span style={{color:"var(--muted2)",fontSize:10}}>{sl}:</span><span style={{color:"var(--text)",fontWeight:600}}>{String(v).replace("Outro:","")}</span></div>);})}</div><div style={{background:"var(--dark)",borderRadius:8,padding:"8px 10px",marginBottom:6}}>{starQs.map(q=>{const v=f.answers?.[q.id];if(!v)return null;const sn=q.label.replace("Como avalia nosso ","").replace("Como avalia a qualidade dos ","").replace("Como avalia a qualidade das ","").replace("Como avalia o ","").replace("?","");return(<div key={q.id} style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}><span style={{fontSize:11,color:"var(--muted)",minWidth:90,fontWeight:600}}>{sn}</span><div style={{display:"flex",gap:2}}>{[1,2,3,4,5].map(s=><span key={s} style={{fontSize:12,filter:s<=v?"none":"grayscale(1) opacity(0.2)"}}>⭐</span>)}</div><span style={{fontSize:10,fontWeight:800,color:v>=4?"var(--green)":v>=3?"var(--yellow)":"var(--red)"}}>{["","Ruim","Regular","Bom","Ótimo","Excelente"][v]}</span></div>);})}</div>{f.answers?.q_sug&&<div className="fb-comment">💬 "{f.answers.q_sug}"</div>}{f.premio&&<div className="fb-prize">🎁 {f.premio}</div>}</div>);})}
        </>)}
        {tab==="insights"&&(<>
          <div className="main-title">💡 Insights</div>
          {insights().map((ins,i)=>(<div className="insight" key={i}><div className="insight-icon">{ins.icon}</div><div className="insight-text">{ins.text}</div></div>))}
          <div className="chart-wrap" style={{marginTop:16}}><div className="chart-title">📊 Distribuição NPS</div><div style={{display:"flex",gap:10}}>{[["😍 Promotores","9-10","var(--green)",est.feedbacks.filter(f=>(f.answers?.q_nps||0)>=9).length],["😐 Neutros","7-8","var(--yellow)",est.feedbacks.filter(f=>{const n=f.answers?.q_nps;return n===7||n===8;}).length],["😞 Detratores","0-6","var(--red)",est.feedbacks.filter(f=>(f.answers?.q_nps||0)<=6&&f.answers?.q_nps!==undefined).length]].map(([lbl,range,color,count])=>(<div key={lbl} style={{flex:1,background:"var(--d2)",border:`1px solid ${color}33`,borderRadius:10,padding:12,textAlign:"center"}}><div style={{fontSize:20,fontFamily:"var(--ff-head)",color}}>{count}</div><div style={{fontSize:10,color:"var(--muted)",marginTop:3}}>{lbl}</div><div style={{fontSize:9,color,marginTop:2}}>NPS {range}</div></div>))}</div></div>
          <div className="chart-wrap"><div className="chart-title">💰 Percepção de preço</div><MiniBarChart data={["Barato pelo que oferece","Ideal pelo que oferece","Caro pelo que oferece"].map(v=>({lbl:v==="Barato pelo que oferece"?"Barato":v==="Ideal pelo que oferece"?"Ideal":"Caro",val:est.feedbacks.filter(f=>f.answers?.q_preco===v).length}))} color="var(--yellow)"/></div>
        </>)}
        {tab==="qrcode"&&(<><div className="main-title">📱 Meu QR Code</div><QRCodeView est={est}/></>)}
        {tab==="setup"&&(<>
          <div className="main-title">⚙️ Configurar</div>
          <div className="setup-box">
            <div className="setup-box-title">🏪 Identidade</div>
            <label className="lbl">Logo do estabelecimento</label>
            <div className="logo-upload-area" onClick={()=>document.getElementById("logo-input").click()}>
              {ed.logoUrl?<img src={ed.logoUrl} alt="logo" style={{width:70,height:70,objectFit:"contain",borderRadius:8,display:"block",margin:"0 auto 6px"}}/>:<div style={{fontSize:12,color:"var(--muted)"}}>Clique para fazer upload da sua logo<br/><span style={{fontSize:10}}>PNG, JPG ou SVG</span></div>}
            </div>
            <input id="logo-input" type="file" accept="image/*" style={{display:"none"}} onChange={handleLogoUpload}/>
            {ed.logoUrl&&<button className="btn-sm btn-sm-danger" style={{marginBottom:12}} onClick={()=>setEd(s=>({...s,logoUrl:""}))}>Remover logo</button>}
            <label className="lbl">Nome</label>
            <div style={{display:"flex",gap:8,marginBottom:12}}><div style={{width:48,height:48,background:"var(--d2)",border:"1.5px solid var(--border)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>{ed.emoji}</div><input className="field" style={{marginBottom:0,flex:1}} value={ed.name} onChange={e=>setEd(s=>({...s,name:e.target.value}))}/></div>
            <label className="lbl">🔗 Link exclusivo (slug)</label>
            <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}>
              <span style={{fontSize:12,color:"var(--muted)",whiteSpace:"nowrap"}}>notacheia.com.br/r/</span>
              <input className="field" style={{marginBottom:0,flex:1}} placeholder="meu-estabelecimento" value={ed.slug||makeSlug(ed.name)} onChange={e=>setEd(s=>({...s,slug:e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,"")}))}/>
            </div>
            <div style={{fontSize:11,color:"var(--muted)",marginBottom:12}}>Apenas letras minúsculas, números e hífen.</div>
            <label className="lbl">Emoji</label>
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14,background:"var(--d2)",borderRadius:10,padding:10}}>{["🍔","🍕","🍣","🍜","🍰","🧁","☕","🍺","🥗","🍱","🌮","🍗","🥩","🍦","🧇","🍩","🍫","🥐","🍷","🥤","💇","💅","🏋️","🛍️","💊","🏥","🐾","🎮","🏪","🏬","🍽️","🎪"].map(e=>(<button key={e} onClick={()=>setEd(s=>({...s,emoji:e}))} style={{width:34,height:34,fontSize:18,background:ed.emoji===e?"var(--ac)22":"var(--d3)",border:ed.emoji===e?"2px solid var(--ac)":"1px solid var(--border)",borderRadius:8,cursor:"pointer"}}>{e}</button>))}</div>
            <label className="lbl">Cor principal</label>
            <div className="swatch-row">{COLORS.map(c=><div key={c} className={`swatch ${ed.color===c?"on":""}`} style={{background:c}} onClick={()=>setEd(s=>({...s,color:c}))}/>)}</div>
            <label className="lbl">🌐 Link Google Reviews</label>
            <input className="field" placeholder="https://g.page/r/..." value={ed.googleUrl||""} onChange={e=>setEd(s=>({...s,googleUrl:e.target.value}))}/>
            <label className="lbl">⏱️ Intervalo entre feedbacks</label>
            <div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap"}}>{[7,15,30,60].map(d=>(<button key={d} className="interval-btn" onClick={()=>setEd(s=>({...s,feedbackInterval:d}))} style={{border:`1.5px solid ${ed.feedbackInterval===d?"var(--ac)":"var(--border)"}`,background:ed.feedbackInterval===d?"var(--ac)22":"var(--d3)",color:ed.feedbackInterval===d?"var(--text)":"var(--muted2)"}}>{d} dias</button>))}</div>
            <div style={{fontSize:11,color:"var(--muted)",marginBottom:4}}>O cliente só poderá responder novamente após este período.</div>
          </div>
          <div className="setup-box">
            <div className="setup-box-title">❓ Perguntas</div>
            {ed.questions.map(q=>(<div className="pill-row" key={q.id}><div style={{flex:1}}><div className="pill-lbl">{q.label}</div><div className="pill-sub">{q.type}</div></div><button className="btn-sm btn-sm-danger" onClick={()=>removeQ(q.id)}>✕</button></div>))}
            <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
              <input className="field-inline" placeholder="Texto da pergunta" value={newQ.label} onChange={e=>setNewQ(s=>({...s,label:e.target.value}))}/>
              <select className="type-sel" value={newQ.type} onChange={e=>setNewQ(s=>({...s,type:e.target.value}))}><option value="stars">⭐ Estrelas</option><option value="choice">☑️ Múltipla escolha</option><option value="nps">📊 NPS 0-10</option><option value="text">📝 Texto livre</option><option value="staff">👤 Colaborador</option></select>
              {(newQ.type==="choice"||newQ.type==="staff")&&<input className="field-inline" placeholder="Opções por vírgula" value={newQ.options} onChange={e=>setNewQ(s=>({...s,options:e.target.value}))}/>}
              <button className="btn-sm btn-sm-red" onClick={addQ}>+ Adicionar</button>
            </div>
          </div>
          <div className="setup-box">
            <div className="setup-box-title">🎡 Prêmios da Roleta</div>
            {ed.prizes.map(p=>(<div className="pill-row" key={p.id}><span style={{fontSize:18}}>{p.emoji}</span><div style={{width:12,height:12,borderRadius:4,background:p.color,flexShrink:0}}/><div className="pill-lbl" style={{flex:1}}>{p.label}</div><button className="btn-sm btn-sm-danger" onClick={()=>removeP(p.id)}>✕</button></div>))}
            <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
              <input className="field-inline" placeholder="Nome do brinde" value={newP.label} onChange={e=>setNewP(s=>({...s,label:e.target.value}))}/>
              <input className="field-inline" placeholder="Emoji" value={newP.emoji} onChange={e=>setNewP(s=>({...s,emoji:e.target.value}))} style={{maxWidth:60}}/>
              <input type="color" value={newP.color} onChange={e=>setNewP(s=>({...s,color:e.target.value}))} style={{width:40,height:40,border:"none",background:"none",cursor:"pointer",borderRadius:8}}/>
              <button className="btn-sm btn-sm-red" onClick={addP}>+ Adicionar</button>
            </div>
          </div>
          <button className="btn btn-red" style={{maxWidth:220}} onClick={save} disabled={saving}>{saving?"Salvando...":saved?"✅ Salvo!":"Salvar alterações"}</button>
        </>)}
        {tab==="senha"&&(<>
          <div className="main-title">🔑 Trocar Senha</div>
          <div className="setup-box" style={{maxWidth:420}}>
            <div className="setup-box-title">Alterar senha de acesso</div>
            {passMsg&&<div style={{padding:"10px 14px",borderRadius:10,marginBottom:14,fontSize:13,fontWeight:700,background:passMsg.includes("✅")?"#0a2a0a":"#1a0505",color:passMsg.includes("✅")?"var(--green)":"var(--red)",border:`1px solid ${passMsg.includes("✅")?"var(--green)":"var(--red)"}33`}}>{passMsg}</div>}
            <label className="lbl">Senha atual</label>
            <input className="field" type="password" value={newPass.atual} onChange={e=>setNewPass(s=>({...s,atual:e.target.value}))}/>
            <label className="lbl">Nova senha</label>
            <input className="field" type="password" placeholder="Mínimo 6 caracteres" value={newPass.nova} onChange={e=>setNewPass(s=>({...s,nova:e.target.value}))}/>
            <label className="lbl">Confirmar nova senha</label>
            <input className="field" type="password" value={newPass.confirma} onChange={e=>setNewPass(s=>({...s,confirma:e.target.value}))}/>
            <button className="btn btn-red" style={{maxWidth:220}} onClick={trocarSenha}>Alterar senha</button>
          </div>
        </>)}
      </div>
    </div>
  );
}

function MasterPanel({ establishments, setEstablishments, onLogout }) {
  const [tab, setTab] = useState("ests");
  const [viewEst, setViewEst] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newEst, setNewEst] = useState({ name: "", emoji: "🏪", owner: "", pass: "", color: "#e63946", googleUrl: "", slug: "" });
  const [actionLoading, setActionLoading] = useState(false);
  const [demoEst, setDemoEst] = useState(null);
  const [copied, setCopied] = useState(null);
  const COLORS = ["#e63946","#f4a261","#2a9d8f","#457b9d","#6d597a","#e76f51","#264653","#e9c46a"];
  const total = establishments.reduce((a,e)=>a+e.feedbacks.length,0);
  const mrr = establishments.filter(e=>e.ativo).length*99;
  const ativos = establishments.filter(e=>e.ativo).length;
  const toggleAtivo = async(id)=>{const est=establishments.find(e=>e.id===id);const u={...est,ativo:!est.ativo};await saveEstabelecimento(u);setEstablishments(prev=>prev.map(e=>e.id===id?{...e,ativo:!e.ativo}:e));};
  const deleteEst = async(id)=>{if(!window.confirm("Excluir este estabelecimento?"))return;await deleteEstabelecimentoFromDB(id);setEstablishments(prev=>prev.filter(e=>e.id!==id));};
  const addEst = async()=>{
    if(!newEst.name||!newEst.owner||!newEst.pass)return;
    setActionLoading(true);
    const slug = newEst.slug || makeSlug(newEst.name);
    const novo={...newEst,slug,id:"est_"+uid(),ativo:true,logoUrl:"",feedbackInterval:30,questions:makeDefaultQuestions(),prizes:[{id:uid(),label:"Brinde Grátis",emoji:"🎁",color:newEst.color},{id:uid(),label:"10% Desconto",emoji:"🏷️",color:"#333"},{id:uid(),label:"Surpresa!",emoji:"🎉",color:"#6d597a"}],feedbacks:[],plano:"R$ 99/mês",desde:new Date().toLocaleDateString("pt-BR")};
    await createEstabelecimento(novo);
    setEstablishments(prev=>[...prev,novo]);
    setNewEst({name:"",emoji:"🏪",owner:"",pass:"",color:"#e63946",googleUrl:"",slug:""});
    setShowAdd(false);setActionLoading(false);
  };

  const copyLink = (e) => {
    const slug = e.slug || makeSlug(e.name);
    navigator.clipboard.writeText(`https://notacheia.com.br/r/${slug}`);
    setCopied(e.id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (demoEst) {
    return (
      <>
        <style>{CSS(demoEst.color)}</style>
        <div className="top-bar">
          <button className="top-btn top-btn-ghost" onClick={() => setDemoEst(null)}>← Voltar ao Master</button>
        </div>
        <ClientApp est={demoEst} onSubmit={async () => {}} masterMode={true} key={demoEst.id + "_demo"} />
      </>
    );
  }

  const EstCard = ({ e }) => {
    const sqs = e.questions.filter(q => q.type === "stars");
    const vals = e.feedbacks.flatMap(f => sqs.map(q => f.answers?.[q.id]||0).filter(v => v > 0));
    const avg = vals.length ? (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1) : "-";
    const slug = e.slug || makeSlug(e.name);
    return (
      <div className="est-card">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0}}>
            <span style={{fontSize:22,flexShrink:0}}>{e.emoji}</span>
            <div style={{minWidth:0}}>
              <div style={{fontWeight:800,fontSize:14,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.name}</div>
              <div style={{fontSize:11,color:"var(--muted)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.owner}</div>
            </div>
          </div>
          {e.ativo ? <span className="badge badge-green" style={{marginLeft:8}}><span className="live-dot" style={{marginRight:4}}/>Ativo</span> : <span className="badge badge-red" style={{marginLeft:8}}>Bloqueado</span>}
        </div>
        <div className="slug-box" style={{marginBottom:10}}>
          <span className="slug-text">notacheia.com.br/r/{slug}</span>
          <button className="btn-sm btn-sm-ghost" onClick={()=>copyLink(e)}>{copied===e.id?"✅":"📋"}</button>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:12}}>
          <div style={{flex:1,background:"var(--d2)",borderRadius:10,padding:"8px 10px",textAlign:"center"}}>
            <div style={{fontFamily:"var(--ff-head)",fontSize:18}}>{e.feedbacks.length}</div>
            <div style={{fontSize:9,color:"var(--muted)",textTransform:"uppercase",fontWeight:700}}>Feedbacks</div>
          </div>
          <div style={{flex:1,background:"var(--d2)",borderRadius:10,padding:"8px 10px",textAlign:"center"}}>
            <div style={{fontFamily:"var(--ff-head)",fontSize:18,color:"var(--ac)"}}>⭐ {avg}</div>
            <div style={{fontSize:9,color:"var(--muted)",textTransform:"uppercase",fontWeight:700}}>Nota</div>
          </div>
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          <button className="btn-sm btn-sm-ghost" onClick={()=>setViewEst(e)}>👁️ Ver</button>
          <button className="btn-sm btn-sm-ghost" onClick={()=>setDemoEst(e)}>🎯 Demo</button>
          <button className={`btn-sm ${e.ativo?"btn-sm-danger":"btn-sm-green"}`} onClick={()=>toggleAtivo(e.id)}>{e.ativo?"🔒 Bloquear":"✅ Ativar"}</button>
          <button className="btn-sm btn-sm-danger" onClick={()=>deleteEst(e.id)}>🗑️</button>
        </div>
      </div>
    );
  };

  return (
    <div className="shell">
      <Sidebar tab={tab} setTab={setTab} onLogout={onLogout} isMaster />
      <div className="main">
        {tab==="ests"&&(<>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
            <div className="main-title" style={{marginBottom:0}}>🏢 Estabelecimentos</div>
            <button className="btn-sm btn-sm-red" onClick={()=>setShowAdd(true)}>+ Novo</button>
          </div>
          <div className="metrics" style={{marginBottom:20}}>
            <div className="metric"><div className="metric-val">{establishments.length}</div><div className="metric-lbl">Cadastrados</div></div>
            <div className="metric"><div className="metric-val">{ativos}</div><div className="metric-lbl">Ativos</div></div>
            <div className="metric"><div className="metric-val">R$ {mrr.toLocaleString("pt-BR")}</div><div className="metric-lbl">MRR</div></div>
            <div className="metric"><div className="metric-val">{total}</div><div className="metric-lbl">Feedbacks</div></div>
          </div>
          <div className="tbl-wrap" id="master-table">
            <div className="tbl-head" style={{gridTemplateColumns:"1.5fr 1.2fr 1.5fr 50px 50px 70px 100px",minWidth:600}}>
              <span>Estabelecimento</span><span>Dono</span><span>Link</span><span>Feedbacks</span><span>Nota</span><span>Status</span><span>Ações</span>
            </div>
            {establishments.map(e=>{
              const sqs=e.questions.filter(q=>q.type==="stars");
              const vals=e.feedbacks.flatMap(f=>sqs.map(q=>f.answers?.[q.id]||0).filter(v=>v>0));
              const avg=vals.length?(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1):"-";
              const slug=e.slug||makeSlug(e.name);
              return(
                <div className="tbl-row" key={e.id} style={{gridTemplateColumns:"1.5fr 1.2fr 1.5fr 50px 50px 70px 100px",minWidth:600}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,fontWeight:700}}><span>{e.emoji}</span>{e.name}</div>
                  <div style={{color:"var(--muted)",fontSize:11}}>{e.owner}</div>
                  <div style={{display:"flex",alignItems:"center",gap:4}}>
                    <span style={{fontSize:10,color:"var(--ac)",fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>/r/{slug}</span>
                    <button className="btn-sm btn-sm-ghost" style={{padding:"3px 7px",fontSize:10}} onClick={()=>copyLink(e)}>{copied===e.id?"✅":"📋"}</button>
                  </div>
                  <div style={{fontWeight:700}}>{e.feedbacks.length}</div>
                  <div style={{fontWeight:700,color:"var(--ac)"}}>⭐ {avg}</div>
                  <div>{e.ativo?<span className="badge badge-green"><span className="live-dot" style={{marginRight:4}}/>Ativo</span>:<span className="badge badge-red">Bloqueado</span>}</div>
                  <div style={{display:"flex",gap:4}}>
                    <button className="btn-sm btn-sm-ghost" title="Ver feedbacks" onClick={()=>setViewEst(e)}>👁️</button>
                    <button className="btn-sm btn-sm-ghost" title="Demo sem bloqueio" onClick={()=>setDemoEst(e)}>🎯</button>
                    <button className={`btn-sm ${e.ativo?"btn-sm-danger":"btn-sm-green"}`} onClick={()=>toggleAtivo(e.id)}>{e.ativo?"🔒":"✅"}</button>
                    <button className="btn-sm btn-sm-danger" onClick={()=>deleteEst(e.id)}>🗑️</button>
                  </div>
                </div>
              );
            })}
          </div>
          <div id="master-cards">
            {establishments.map(e => <EstCard key={e.id} e={e} />)}
          </div>
          <div style={{fontSize:12,color:"var(--muted)",marginTop:8}}>💡 Clique em 🎯 para fazer uma demo sem bloqueio de tempo</div>
        </>)}
        {tab==="metricas"&&(<>
          <div className="main-title">📊 Métricas Gerais</div>
          <div className="metrics">
            <div className="metric"><div className="metric-val">{establishments.length}</div><div className="metric-lbl">Total clientes</div></div>
            <div className="metric"><div className="metric-val">R$ {mrr.toLocaleString("pt-BR")}</div><div className="metric-lbl">MRR</div></div>
            <div className="metric"><div className="metric-val">R$ {(mrr*12).toLocaleString("pt-BR")}</div><div className="metric-lbl">ARR projetado</div></div>
            <div className="metric"><div className="metric-val">{total}</div><div className="metric-lbl">Feedbacks</div></div>
            <div className="metric"><div className="metric-val">R$ {(mrr-150).toLocaleString("pt-BR")}</div><div className="metric-lbl">Lucro líquido</div></div>
          </div>
        </>)}
      </div>
      {viewEst&&(<div className="modal-bg" onClick={()=>setViewEst(null)}><div className="modal" onClick={e=>e.stopPropagation()}><div className="modal-title">{viewEst.emoji} {viewEst.name}</div>{viewEst.feedbacks.length===0&&<div style={{color:"var(--muted)"}}>Nenhum feedback ainda.</div>}{viewEst.feedbacks.map((f,i)=>(<div className="fb" key={i} style={{marginBottom:8}}><div className="fb-top"><div className="fb-name">👤 {f.nome}</div><div className="fb-date">{f.data||"Agora"}</div></div><div style={{fontSize:12,color:"var(--muted2)"}}>NPS: {f.answers?.q_nps??"-"} · Atendente: {f.answers?.q_atend??"-"}</div>{f.answers?.q_sug&&<div className="fb-comment">💬 "{f.answers.q_sug}"</div>}{f.premio&&<div className="fb-prize">🎁 {f.premio}</div>}</div>))}<button className="btn btn-ghost" style={{marginTop:14}} onClick={()=>setViewEst(null)}>Fechar</button></div></div>)}
      {showAdd&&(<div className="modal-bg" onClick={()=>setShowAdd(false)}><div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-title">➕ Novo Estabelecimento</div>
        <label className="lbl">Nome</label>
        <div style={{display:"flex",gap:8,marginBottom:12}}><div style={{width:48,height:48,background:"var(--d2)",border:"1.5px solid var(--border)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>{newEst.emoji}</div><input className="field" style={{marginBottom:0,flex:1}} placeholder="Ex: Pizzaria Bella" value={newEst.name} onChange={e=>setNewEst(s=>({...s,name:e.target.value,slug:s.slug||makeSlug(e.target.value)}))}/></div>
        <label className="lbl">🔗 Link exclusivo</label>
        <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:4}}>
          <span style={{fontSize:11,color:"var(--muted)",whiteSpace:"nowrap"}}>/r/</span>
          <input className="field" style={{marginBottom:0,flex:1}} placeholder="meu-estabelecimento" value={newEst.slug||makeSlug(newEst.name)} onChange={e=>setNewEst(s=>({...s,slug:e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,"")}))}/>
        </div>
        <div style={{fontSize:11,color:"var(--muted)",marginBottom:12}}>Gerado automaticamente. Pode editar se quiser.</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14,background:"var(--d2)",borderRadius:10,padding:10}}>{["🍔","🍕","🍣","🍜","🍰","🧁","☕","🍺","🥗","🍱","🌮","🍗","🥩","🍦","💇","💅","🏋️","🛍️","💊","🏥","🐾","🏪"].map(e=>(<button key={e} onClick={()=>setNewEst(s=>({...s,emoji:e}))} style={{width:34,height:34,fontSize:18,background:newEst.emoji===e?"var(--ac)22":"var(--d3)",border:newEst.emoji===e?"2px solid var(--ac)":"1px solid var(--border)",borderRadius:8,cursor:"pointer"}}>{e}</button>))}</div>
        <label className="lbl">Cor</label><div className="swatch-row" style={{marginBottom:14}}>{COLORS.map(c=><div key={c} className={`swatch ${newEst.color===c?"on":""}`} style={{background:c}} onClick={()=>setNewEst(s=>({...s,color:c}))}/>)}</div>
        <label className="lbl">E-mail do dono</label><input className="field" placeholder="dono@email.com" value={newEst.owner} onChange={e=>setNewEst(s=>({...s,owner:e.target.value}))}/>
        <label className="lbl">Senha</label><input className="field" placeholder="Senha de acesso" value={newEst.pass} onChange={e=>setNewEst(s=>({...s,pass:e.target.value}))}/>
        <label className="lbl">Google Reviews (opcional)</label><input className="field" placeholder="https://g.page/r/..." value={newEst.googleUrl} onChange={e=>setNewEst(s=>({...s,googleUrl:e.target.value}))}/>
        <div style={{display:"flex",gap:10}}><button className="btn btn-red" onClick={addEst} disabled={actionLoading}>{actionLoading?"Criando...":"Criar"}</button><button className="btn btn-ghost" onClick={()=>setShowAdd(false)}>Cancelar</button></div>
      </div></div>)}
    </div>
  );
}

function LoginScreen({ title, hint, onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const handle = () => { const ok=onLogin(email,pass); if(!ok){setErr("E-mail ou senha incorretos.");setTimeout(()=>setErr(""),3000);} };
  return (
    <div className="page page-center fade-up" style={{background:"radial-gradient(ellipse at 50% 0%, #e6394615, transparent 50%), var(--dark)"}}>
      <div className="card">
        <LogoSVG size={170} style={{margin:"0 auto 14px"}}/>
        <div style={{textAlign:"center",marginBottom:18}}><div style={{fontSize:11,letterSpacing:3,textTransform:"uppercase",color:"var(--muted)"}}>{title}</div></div>
        <div className="div"/>
        {err&&<div className="err">⚠️ {err}</div>}
        <label className="lbl">E-mail</label>
        <input className="field" placeholder="seu@email.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handle()}/>
        <label className="lbl">Senha</label>
        <div style={{position:"relative",marginBottom:14}}>
          <input className="field" style={{marginBottom:0,paddingRight:48}} type={show?"text":"password"} placeholder="••••••••" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handle()}/>
          <button onClick={()=>setShow(s=>!s)} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:16,color:"#555"}}>{show?"🙈":"👁️"}</button>
        </div>
        <button className="btn btn-red" onClick={handle}>Entrar →</button>
        <div style={{textAlign:"center",fontSize:11,color:"var(--muted)",marginTop:14}}>{hint}</div>
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
        const withFeedbacks = await Promise.all(data.map(async(e)=>({...e,feedbacks:await loadFeedbacks(e.id)})));
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
  const addFeedback = async(fb) => { await saveFeedbackToSupabase(activeEst.id,fb); const nf={...fb,id:Date.now(),data:new Date().toLocaleString("pt-BR")}; setEsts(prev=>prev.map(e=>e.id===activeEst.id?{...e,feedbacks:[...e.feedbacks,nf]}:e)); setActiveEst(e=>({...e,feedbacks:[...e.feedbacks,nf]})); };
  const updateEst = (updated) => { setEsts(prev=>prev.map(e=>e.id===updated.id?updated:e)); setLoggedEst(updated); if(activeEst?.id===updated.id)setActiveEst(updated); };

  if (loading) return (<><style>{CSS()}</style><LoadingScreen /></>);

  return (
    <>
      <style>{css}</style>
      <div>
        <div className="top-bar">
          {mode !== "client" && <button className="top-btn top-btn-ghost" onClick={()=>setMode("client")}>📱 Cliente</button>}
          {mode === "client" && (<>
            <select style={{background:"var(--d2)",color:"var(--text)",border:"1px solid var(--border)",borderRadius:8,padding:"6px 10px",fontFamily:"var(--ff-body)",fontSize:12,cursor:"pointer"}}
              value={activeEst?.id} onChange={e=>setActiveEst(ests.find(x=>x.id===e.target.value))}>
              {ests.map(e=><option key={e.id} value={e.id}>{e.emoji} {e.name}</option>)}
            </select>
            <button className="top-btn top-btn-ghost" onClick={()=>setMode("ownerLogin")}>🏪 Dono</button>
            <button className="top-btn top-btn-red" onClick={()=>setMode("masterLogin")}>👑 Master</button>
          </>)}
        </div>
        {mode==="client"&&activeEst&&<ClientApp est={activeEst} onSubmit={addFeedback} key={activeEst.id}/>}
        {mode==="ownerLogin"&&<LoginScreen title="ACESSO DO PROPRIETÁRIO" hint="" onLogin={(email,pass)=>{const found=ests.find(e=>e.owner===email&&e.pass===pass);if(found){setLoggedEst(found);setMode("ownerDash");return true;}return false;}}/>}
        {mode==="ownerDash"&&loggedEst&&<OwnerDash est={loggedEst} onUpdate={updateEst} onLogout={()=>{setLoggedEst(null);setMode("client");}}/>}
        {mode==="masterLogin"&&<LoginScreen title="PAINEL MASTER" hint="" onLogin={(email,pass)=>{if(email===MASTER.user&&pass===MASTER.pass){setMode("masterDash");return true;}return false;}}/>}
        {mode==="masterDash"&&<MasterPanel establishments={ests} setEstablishments={setEsts} onLogout={()=>setMode("client")}/>}
      </div>
    </>
  );
}
