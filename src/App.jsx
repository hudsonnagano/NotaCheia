import { useState, useRef, useEffect } from "react";

// ─── FONTS ───────────────────────────────────────────────────────────────────
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`;

// ─── SEED DATA ───────────────────────────────────────────────────────────────
const makeDefaultQuestions = () => [
  { id: "q_atend",  type: "staff",    label: "Quem realizou seu atendimento?",           options: ["Ana", "Carlos", "João", "Maria"], required: true },
  { id: "q_first",  type: "choice",   label: "É a sua primeira vez aqui?",               options: ["Sim", "Não"], required: true },
  { id: "q_hora",   type: "choice",   label: "Em qual horário foi o atendimento?",        options: ["De manhã", "De tarde", "De noite"], required: true },
  { id: "q_mesa",   type: "choice",   label: "Quantas pessoas na mesa?",                  options: ["Vim sozinho", "2 pessoas", "3 a 6 pessoas", "Mais de 6 pessoas"], required: true },
  { id: "q_como",   type: "choice",   label: "Como conheceu o estabelecimento?",          options: ["Instagram", "Indicação de amigos", "Família", "Influenciador", "TikTok", "Outro"], required: true, allowOther: true },
  { id: "q_amb",    type: "stars",    label: "Como avalia nosso ambiente?",               required: true },
  { id: "q_atd",    type: "stars",    label: "Como avalia nosso atendimento?",            required: true },
  { id: "q_prat",   type: "stars",    label: "Como avalia a qualidade dos pratos?",       required: true },
  { id: "q_beb",    type: "stars",    label: "Como avalia a qualidade das bebidas?",      required: true },
  { id: "q_esp",    type: "stars",    label: "Como avalia o tempo de espera?",            required: true },
  { id: "q_preco",  type: "choice",   label: "O que achou do nosso preço?",               options: ["Barato pelo que oferece", "Ideal pelo que oferece", "Caro pelo que oferece"], required: true },
  { id: "q_nps",    type: "nps",      label: "De 0 a 10, o quanto nos indicaria?",        required: true },
  { id: "q_sug",    type: "text",     label: "Sugestão ou elogio para nós!",              required: false },
];

const SEED = [
  {
    id: "est_1", owner: "joao@burguer.com", pass: "123456",
    name: "Black Burguer", emoji: "🍔", color: "#e63946",
    googleUrl: "https://g.page/r/exemplo/review",
    questions: makeDefaultQuestions(),
    prizes: [
      { id: "p1", label: "Fritas Grátis",    emoji: "🍟", color: "#e63946" },
      { id: "p2", label: "10% Desconto",     emoji: "🏷️", color: "#1a1a1a" },
      { id: "p3", label: "Refri Grátis",     emoji: "🥤", color: "#c1121f" },
      { id: "p4", label: "Sobremesa Grátis", emoji: "🍦", color: "#333" },
      { id: "p5", label: "20% Desconto",     emoji: "🎉", color: "#e63946" },
      { id: "p6", label: "Brinde Surpresa",  emoji: "🎁", color: "#111" },
    ],
    feedbacks: [
      { id: 1, nome: "Carlos M.", data: "12/05/2026 14:32", answers: { q_atend: "João", q_first: "Não", q_nps: 9, q_amb: 5, q_atd: 5 }, premio: "Fritas Grátis" },
      { id: 2, nome: "Fernanda L.", data: "12/05/2026 19:15", answers: { q_atend: "Ana", q_first: "Sim", q_nps: 8, q_amb: 4, q_atd: 5 }, premio: "10% Desconto" },
    ],
  },
];

const MASTER = { user: "master@notacheia.com.br", pass: "master2026" };
const uid = () => Math.random().toString(36).slice(2, 8);
const genCoupon = () => "NTC-" + Math.random().toString(36).slice(2, 6).toUpperCase();
const addDays = (d) => { const dt = new Date(); dt.setDate(dt.getDate() + d); return dt.toLocaleDateString("pt-BR"); };

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = (ac = "#e63946") => `
  ${FONTS}
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --ac: ${ac};
    --ac-glow: ${ac}55;
    --dark: #080808;
    --d1: #111;
    --d2: #181818;
    --d3: #222;
    --border: rgba(255,255,255,0.07);
    --text: #f0ede8;
    --muted: #666;
    --muted2: #999;
    --ff-head: 'Syne', sans-serif;
    --ff-body: 'Plus Jakarta Sans', sans-serif;
  }
  body { background: var(--dark); color: var(--text); font-family: var(--ff-body); min-height: 100vh; }

  /* ── PAGE ── */
  .page { min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: 80px 20px 40px; position: relative; }
  .page-center { justify-content: center; }
  .card { background: var(--d1); border: 1px solid var(--border); border-radius: 24px; padding: 32px; width: 100%; max-width: 480px; position: relative; box-shadow: 0 24px 80px rgba(0,0,0,0.6); }
  .card-wide { max-width: 560px; }

  /* ── BRAND ── */
  .brand { font-family: var(--ff-head); font-size: 26px; letter-spacing: 1px; }
  .brand-red { color: var(--ac); }
  .brand-white { color: var(--text); }
  .tagline { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: var(--muted); margin-top: 2px; }

  /* ── HEADER BAR (survey) ── */
  .survey-header { background: var(--d2); border-bottom: 1px solid var(--border); padding: 16px 20px 14px; text-align: center; margin: -32px -32px 24px; border-radius: 23px 23px 0 0; }
  .survey-title { font-family: var(--ff-head); font-size: 20px; letter-spacing: 0.5px; color: var(--text); }
  .survey-sub { font-size: 12px; color: var(--muted2); margin-top: 4px; line-height: 1.5; }

  /* ── PROGRESS ── */
  .prog-wrap { margin-bottom: 20px; }
  .prog-label { display: flex; justify-content: space-between; font-size: 11px; color: var(--muted); margin-bottom: 6px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; }
  .prog-bar { height: 3px; background: var(--d3); border-radius: 2px; }
  .prog-fill { height: 100%; background: var(--ac); border-radius: 2px; transition: width 0.4s ease; }

  /* ── QUESTION CARD ── */
  .q-wrap { background: var(--d2); border: 1px solid var(--border); border-radius: 16px; padding: 18px; margin-bottom: 10px; transition: border-color 0.2s; }
  .q-wrap.answered { border-color: var(--ac)66; }
  .q-num { font-size: 10px; font-weight: 800; letter-spacing: 2px; color: var(--ac); text-transform: uppercase; margin-bottom: 6px; }
  .q-label { font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 14px; line-height: 1.4; }

  /* ── STAFF SELECTOR ── */
  .staff-grid { display: flex; flex-wrap: wrap; gap: 8px; }
  .staff-btn { padding: 8px 16px; border-radius: 20px; border: 1.5px solid var(--border); background: var(--d3); color: var(--muted2); font-family: var(--ff-body); font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.15s; }
  .staff-btn.sel { border-color: var(--ac); background: var(--ac)22; color: var(--text); }

  /* ── CHOICE ── */
  .choice-list { display: flex; flex-direction: column; gap: 8px; }
  .choice-item { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 12px; border: 1.5px solid var(--border); background: var(--d3); cursor: pointer; transition: all 0.15s; }
  .choice-item.sel { border-color: var(--ac); background: var(--ac)15; }
  .choice-radio { width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--muted); flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
  .choice-item.sel .choice-radio { border-color: var(--ac); background: var(--ac); }
  .choice-radio::after { content:''; width: 6px; height: 6px; border-radius: 50%; background: white; display: none; }
  .choice-item.sel .choice-radio::after { display: block; }
  .choice-label { font-size: 14px; font-weight: 600; color: var(--muted2); transition: color 0.15s; }
  .choice-item.sel .choice-label { color: var(--text); }
  .other-input { width: 100%; padding: 10px 12px; background: var(--dark); border: 1.5px solid var(--border); border-radius: 10px; color: var(--text); font-family: var(--ff-body); font-size: 14px; outline: none; margin-top: 8px; transition: border 0.2s; }
  .other-input:focus { border-color: var(--ac); }

  /* ── STARS ── */
  .stars-row { display: flex; gap: 10px; align-items: center; }
  .star { font-size: 32px; cursor: pointer; filter: grayscale(1) opacity(0.25); transition: all 0.15s; }
  .star.on { filter: none; transform: scale(1.1); }
  .star:hover { transform: scale(1.2); filter: none; }
  .star-label { font-size: 12px; color: var(--muted); margin-left: 6px; }

  /* ── NPS ── */
  .nps-row { display: flex; gap: 6px; flex-wrap: wrap; }
  .nps-btn { width: 40px; height: 40px; border-radius: 10px; border: 1.5px solid var(--border); background: var(--d3); color: var(--muted2); font-family: var(--ff-head); font-size: 16px; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; justify-content: center; }
  .nps-btn.sel { border-color: var(--ac); background: var(--ac); color: white; }
  .nps-labels { display: flex; justify-content: space-between; margin-top: 8px; }
  .nps-lbl { font-size: 11px; color: var(--muted); }

  /* ── TEXT AREA ── */
  .textarea { width: 100%; padding: 12px 14px; background: var(--d3); border: 1.5px solid var(--border); border-radius: 12px; color: var(--text); font-family: var(--ff-body); font-size: 14px; resize: none; outline: none; transition: border 0.2s; min-height: 90px; }
  .textarea:focus { border-color: var(--ac); }
  .textarea::placeholder { color: #444; }

  /* ── INPUTS ── */
  .field { width: 100%; padding: 13px 16px; background: var(--d2); border: 1.5px solid var(--border); border-radius: 12px; color: var(--text); font-family: var(--ff-body); font-size: 15px; outline: none; transition: border 0.2s; margin-bottom: 12px; }
  .field:focus { border-color: var(--ac); }
  .field::placeholder { color: #444; }
  label.lbl { display: block; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); margin-bottom: 6px; }

  /* ── BUTTONS ── */
  .btn { width: 100%; padding: 15px; border: none; border-radius: 14px; font-family: var(--ff-body); font-size: 15px; font-weight: 800; cursor: pointer; transition: all 0.2s; }
  .btn-red { background: var(--ac); color: #fff; }
  .btn-red:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); box-shadow: 0 8px 28px var(--ac-glow); }
  .btn-red:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }
  .btn-ghost { background: transparent; border: 1.5px solid var(--border); color: var(--muted2); }
  .btn-ghost:hover { border-color: var(--ac); color: var(--ac); }
  .btn-sm { padding: 8px 16px; font-size: 13px; font-weight: 700; border: none; border-radius: 8px; cursor: pointer; font-family: var(--ff-body); transition: all 0.2s; }
  .btn-sm-red { background: var(--ac); color: #fff; }
  .btn-sm-ghost { background: var(--d3); color: var(--muted); border: 1px solid var(--border); }
  .btn-sm-ghost:hover { border-color: var(--ac); color: var(--ac); }
  .btn-sm-danger { background: #1a0505; color: #f87171; border: 1px solid #f8717133; }

  /* ── DIV ── */
  .div { height: 1px; background: var(--border); margin: 20px 0; }
  .div-ac { height: 2px; background: linear-gradient(90deg, var(--ac), transparent); border-radius: 1px; margin: 20px 0; }

  /* ── ERROR ── */
  .err { background: #1a0505; border: 1px solid #f8717133; border-radius: 10px; padding: 10px 14px; font-size: 13px; color: #f87171; margin-bottom: 12px; }

  /* ── WELCOME ── */
  .welcome-hero { font-size: 56px; margin-bottom: 12px; text-align: center; }
  .welcome-name { font-family: var(--ff-head); font-size: 30px; text-align: center; color: var(--ac); letter-spacing: 1px; }
  .welcome-tag { font-size: 13px; color: var(--muted2); text-align: center; margin-top: 6px; margin-bottom: 24px; line-height: 1.6; }
  .welcome-badge { display: inline-flex; align-items: center; gap: 6px; background: var(--ac)22; border: 1px solid var(--ac)44; border-radius: 20px; padding: 6px 14px; font-size: 12px; font-weight: 700; color: var(--ac); margin-bottom: 20px; }

  /* ── CONFIRM ── */
  .confirm-wrap { text-align: center; padding: 8px 0; }
  .confirm-icon { font-size: 56px; margin-bottom: 12px; animation: popIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275); }
  .confirm-title { font-family: var(--ff-head); font-size: 26px; letter-spacing: 1px; }
  .confirm-sub { font-size: 14px; color: var(--muted2); margin-top: 6px; margin-bottom: 24px; line-height: 1.6; }

  /* ── WHEEL ── */
  .wheel-outer { position: relative; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
  .wheel-ptr { position: absolute; top: -14px; font-size: 26px; z-index: 5; filter: drop-shadow(0 2px 4px #000); }
  .wheel-ring { border-radius: 50%; box-shadow: 0 0 0 4px var(--ac), 0 0 0 8px var(--ac)33, 0 20px 60px rgba(0,0,0,0.7); }
  .spin-btn { background: var(--ac); border: 3px solid #000; border-radius: 50%; width: 76px; height: 76px; font-family: var(--ff-head); font-size: 17px; letter-spacing: 1px; color: #fff; cursor: pointer; box-shadow: 0 4px 20px var(--ac-glow); transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
  .spin-btn:hover:not(:disabled) { transform: scale(1.1); }
  .spin-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  /* ── PRIZE ── */
  .prize-wrap { text-align: center; animation: popIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275); }
  .prize-emoji { font-size: 72px; margin-bottom: 8px; }
  .prize-title { font-family: var(--ff-head); font-size: 36px; letter-spacing: 2px; color: var(--ac); }
  .prize-name { font-size: 22px; font-weight: 800; margin-top: 4px; margin-bottom: 4px; }
  .prize-congrats { font-size: 14px; color: var(--muted2); margin-bottom: 20px; }
  .coupon-box { background: var(--d2); border: 2px dashed var(--ac)88; border-radius: 18px; padding: 20px; margin: 16px 0; position: relative; overflow: hidden; }
  .coupon-box::before { content: 'CUPOM'; position: absolute; top: 8px; left: 50%; transform: translateX(-50%); font-size: 10px; letter-spacing: 3px; color: var(--muted); font-weight: 800; }
  .coupon-id { font-family: var(--ff-head); font-size: 34px; letter-spacing: 6px; color: var(--text); margin-top: 12px; }
  .coupon-validity { font-size: 12px; color: var(--muted); margin-top: 8px; }
  .btn-download { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 14px; background: var(--d2); border: 1.5px solid var(--border); border-radius: 14px; color: var(--muted2); font-family: var(--ff-body); font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; margin-bottom: 10px; }
  .btn-download:hover { border-color: var(--ac); color: var(--ac); }

  /* ── GOOGLE ── */
  .google-box { background: linear-gradient(135deg, #0a1f0a, #051205); border: 1.5px solid #4ade8044; border-radius: 16px; padding: 18px; text-align: center; margin-bottom: 12px; }
  .google-box-low { background: var(--d2); border: 1px solid var(--border); border-radius: 16px; padding: 16px; text-align: center; margin-bottom: 12px; }
  .btn-google { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; padding: 13px; background: white; color: #111; border: none; border-radius: 12px; font-family: var(--ff-body); font-size: 14px; font-weight: 800; cursor: pointer; transition: all 0.2s; margin-top: 10px; }
  .btn-google:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(255,255,255,0.1); }

  /* ── SHELL ── */
  .shell { display: flex; min-height: 100vh; }
  .sidebar { width: 220px; background: var(--d1); border-right: 1px solid var(--border); display: flex; flex-direction: column; padding: 24px 14px; gap: 3px; flex-shrink: 0; }
  .sidebar-brand { font-family: var(--ff-head); font-size: 22px; padding: 0 8px 20px; border-bottom: 1px solid var(--border); margin-bottom: 10px; }
  .sidebar-est { padding: 8px 10px; margin-bottom: 8px; }
  .sidebar-est-emoji { font-size: 22px; }
  .sidebar-est-name { font-weight: 800; font-size: 14px; margin-top: 2px; }
  .sidebar-est-email { font-size: 11px; color: var(--muted); }
  .nav { display: flex; align-items: center; gap: 9px; padding: 10px 12px; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 13px; color: var(--muted); transition: all 0.15s; border: none; background: none; width: 100%; text-align: left; font-family: var(--ff-body); }
  .nav:hover { background: var(--d3); color: var(--text); }
  .nav.on { background: var(--ac); color: #fff; }
  .main { flex: 1; overflow-y: auto; padding: 32px; }
  .main-title { font-family: var(--ff-head); font-size: 30px; letter-spacing: 1px; margin-bottom: 24px; }

  /* ── METRICS ── */
  .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 24px; }
  .metric { background: var(--d1); border: 1px solid var(--border); border-radius: 16px; padding: 18px; position: relative; overflow: hidden; }
  .metric::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--ac); }
  .metric-val { font-family: var(--ff-head); font-size: 34px; letter-spacing: 1px; }
  .metric-lbl { font-size: 11px; color: var(--muted); margin-top: 4px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }

  /* ── TABLE ── */
  .tbl-wrap { background: var(--d1); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; margin-bottom: 16px; }
  .tbl-head { padding: 12px 18px; background: var(--d2); font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: var(--muted); border-bottom: 1px solid var(--border); display: grid; }
  .tbl-row { padding: 14px 18px; border-bottom: 1px solid var(--border); display: grid; align-items: center; font-size: 13px; transition: background 0.1s; }
  .tbl-row:last-child { border-bottom: none; }
  .tbl-row:hover { background: var(--d2); }
  .badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
  .badge-green { background: #0a1f0a; color: #4ade80; border: 1px solid #4ade8033; }
  .live-dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #4ade80; animation: pulse 2s infinite; }

  /* ── FB CARD ── */
  .fb { background: var(--d2); border: 1px solid var(--border); border-radius: 14px; padding: 18px; margin-bottom: 10px; }
  .fb-top { display: flex; justify-content: space-between; margin-bottom: 10px; }
  .fb-name { font-weight: 800; font-size: 14px; }
  .fb-date { font-size: 11px; color: var(--muted); }
  .fb-pills { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
  .fb-pill { background: var(--d3); border: 1px solid var(--border); border-radius: 20px; padding: 3px 10px; font-size: 11px; font-weight: 600; }
  .fb-comment { font-size: 13px; color: #aaa; font-style: italic; padding: 10px; background: var(--dark); border-radius: 8px; margin-bottom: 8px; }
  .fb-prize { display: inline-flex; align-items: center; gap: 5px; background: var(--dark); border: 1px solid var(--ac)33; border-radius: 20px; padding: 4px 12px; font-size: 11px; font-weight: 700; color: var(--ac); }

  /* ── SETUP ── */
  .setup-box { background: var(--d1); border: 1px solid var(--border); border-radius: 16px; padding: 22px; margin-bottom: 14px; }
  .setup-box-title { font-family: var(--ff-head); font-size: 18px; letter-spacing: 0.5px; margin-bottom: 16px; }
  .pill-row { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: var(--d2); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 8px; }
  .pill-lbl { flex: 1; font-weight: 700; font-size: 13px; }
  .pill-sub { font-size: 11px; color: var(--muted); }
  .color-dot { width: 14px; height: 14px; border-radius: 4px; flex-shrink: 0; }
  .swatch-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
  .swatch { width: 30px; height: 30px; border-radius: 8px; cursor: pointer; border: 3px solid transparent; transition: all 0.15s; }
  .swatch.on { border-color: white; transform: scale(1.15); }
  .field-inline { flex: 1; padding: 9px 12px; background: var(--d2); border: 1.5px solid var(--border); border-radius: 9px; color: var(--text); font-family: var(--ff-body); font-size: 13px; outline: none; transition: border 0.2s; }
  .field-inline:focus { border-color: var(--ac); }
  .type-sel { padding: 9px 10px; background: var(--d2); border: 1.5px solid var(--border); border-radius: 9px; color: var(--text); font-family: var(--ff-body); font-size: 13px; outline: none; cursor: pointer; }

  /* ── TOP BAR ── */
  .top-bar { position: fixed; top: 0; left: 0; right: 0; z-index: 999; display: flex; justify-content: flex-end; gap: 8px; padding: 12px 16px; background: linear-gradient(var(--dark), transparent); }
  .top-btn { padding: 8px 16px; border-radius: 8px; border: none; cursor: pointer; font-family: var(--ff-body); font-weight: 700; font-size: 12px; transition: all 0.2s; }
  .top-btn-red { background: var(--ac); color: #fff; }
  .top-btn-ghost { background: var(--d2); color: var(--muted2); border: 1px solid var(--border); }
  .top-btn-ghost:hover { color: var(--text); }

  /* ── ANIMATIONS ── */
  @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes popIn { from { transform:scale(0.4); opacity:0; } to { transform:scale(1); opacity:1; } }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
  .fade-up { animation: fadeUp 0.4s ease forwards; }
  ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: var(--dark); } ::-webkit-scrollbar-thumb { background: var(--d3); border-radius: 3px; }
`;

// ─── LOGO COMPONENT ──────────────────────────────────────────────────────────
function LogoSVG({ size = 140, style = {} }) {
  const [err, setErr] = useState(false);
  if (err) return (
    <div style={{ fontFamily: "var(--ff-head)", fontSize: 22, textAlign: "center", ...style }}>
      <span style={{ color: "#1d6fa4" }}>Nota</span>
      <span style={{ color: "#2d9e6b" }}>Cheia</span>
    </div>
  );
  return (
    <img
      src="/logo.png"
      alt="NotaCheia"
      style={{ width: size, height: "auto", objectFit: "contain", ...style }}
      onError={() => setErr(true)}
    />
  );
}

// ─── WHEEL ───────────────────────────────────────────────────────────────────
function Wheel({ prizes, onResult }) {
  const ref = useRef(null);
  const angRef = useRef(0);
  const [spinning, setSpinning] = useState(false);
  const SIZE = 240, R = SIZE / 2;
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
      ctx.fillText(p.label.length > 12 ? p.label.slice(0, 11) + "…" : p.label, R - 14, 4);
      ctx.font = "15px serif"; ctx.fillText(p.emoji, R - 12, -10);
      ctx.restore();
    });
    ctx.beginPath(); ctx.arc(R, R, 20, 0, 2 * Math.PI);
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
      const idx = Math.floor(((2 * Math.PI - norm) / slice) % prizes.length);
      onResult(prizes[(idx + 1) % prizes.length]);
    };
    requestAnimationFrame(go);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div className="wheel-outer">
        <div className="wheel-ptr">▼</div>
        <canvas ref={ref} width={SIZE} height={SIZE} className="wheel-ring" />
      </div>
      <button className="spin-btn" onClick={spin} disabled={spinning}>
        {spinning ? "⏳" : "GIRAR!"}
      </button>
    </div>
  );
}

// ─── QUESTION RENDERER ───────────────────────────────────────────────────────
function QuestionItem({ q, idx, answer, onChange }) {
  const answered = answer !== undefined && answer !== "" && answer !== null;

  return (
    <div className={`q-wrap ${answered ? "answered" : ""}`}>
      <div className="q-num">Pergunta {idx + 1}</div>
      <div className="q-label">{q.label}</div>

      {q.type === "staff" && (
        <div className="staff-grid">
          {q.options.map(o => (
            <button key={o} className={`staff-btn ${answer === o ? "sel" : ""}`} onClick={() => onChange(o)}>{o}</button>
          ))}
        </div>
      )}

      {q.type === "choice" && (
        <div className="choice-list">
          {q.options.map(o => (
            <div key={o} className={`choice-item ${answer === o || (o === "Outro" && answer?.startsWith("Outro:")) ? "sel" : ""}`}
              onClick={() => onChange(o === "Outro" ? "Outro:" : o)}>
              <div className="choice-radio" />
              <span className="choice-label">{o}</span>
            </div>
          ))}
          {q.allowOther && answer?.startsWith("Outro:") && (
            <input className="other-input" placeholder="Qual?" autoFocus
              value={answer.replace("Outro:", "")}
              onChange={e => onChange("Outro:" + e.target.value)} />
          )}
        </div>
      )}

      {q.type === "stars" && (
        <div>
          <div className="stars-row">
            {[1,2,3,4,5].map(s => (
              <span key={s} className={`star ${s <= (answer || 0) ? "on" : ""}`}
                onClick={() => onChange(s)}>⭐</span>
            ))}
            {answer && <span className="star-label">{{1:"Ruim",2:"Regular",3:"Bom",4:"Ótimo",5:"Excelente"}[answer]}</span>}
          </div>
        </div>
      )}

      {q.type === "nps" && (
        <div>
          <div className="nps-row">
            {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
              <button key={n} className={`nps-btn ${answer === n ? "sel" : ""}`} onClick={() => onChange(n)}>{n}</button>
            ))}
          </div>
          <div className="nps-labels">
            <span className="nps-lbl">😞 Jamais indicaria</span>
            <span className="nps-lbl">Indicaria com certeza 😍</span>
          </div>
        </div>
      )}

      {q.type === "text" && (
        <textarea className="textarea" placeholder="Escreva aqui..."
          value={answer || ""}
          onChange={e => onChange(e.target.value)} />
      )}
    </div>
  );
}

// ─── CLIENT FLOW ─────────────────────────────────────────────────────────────
function ClientApp({ est, onSubmit }) {
  const [step, setStep] = useState("welcome");
  const [nome, setNome] = useState("");
  const [answers, setAnswers] = useState({});
  const [prize, setPrize] = useState(null);
  const [coupon] = useState(genCoupon());
  const [avgStars, setAvgStars] = useState(0);

  const required = est.questions.filter(q => q.required);
  const answered = required.filter(q => {
    const a = answers[q.id];
    if (a === undefined || a === null || a === "") return false;
    if (q.type === "choice" && a === "Outro:") return false;
    return true;
  });
  const prog = (answered.length / required.length) * 100;
  const allDone = answered.length === required.length;

  const handleSubmit = () => {
    const starQs = est.questions.filter(q => q.type === "stars");
    const avg = starQs.length
      ? starQs.reduce((s, q) => s + (answers[q.id] || 0), 0) / starQs.length
      : 5;
    setAvgStars(avg);
    onSubmit({ nome: nome || "Anônimo", answers, premio: null });
    setStep("confirm");
  };

  if (step === "welcome") return (
    <div className="page page-center fade-up" style={{ background: `radial-gradient(ellipse at 50% 0%, ${est.color}20, transparent 60%), var(--dark)` }}>
      <div className="card" style={{ textAlign: "center" }}>
        <LogoSVG size={200} style={{ margin: "0 auto 8px" }} />
        <div className="welcome-hero">{est.emoji}</div>
        <div className="welcome-name">{est.name}</div>
        <div className="welcome-tag">Sua opinião é muito importante para nós!<br/>Responda e ganhe um brinde surpresa 🎁</div>
        <div className="welcome-badge">🎰 Gire a roleta e ganhe na hora!</div>
        <input className="field" placeholder="Seu nome (opcional)" value={nome} onChange={e => setNome(e.target.value)} />
        <button className="btn btn-red" onClick={() => setStep("survey")}>Começar pesquisa →</button>
      </div>
    </div>
  );

  if (step === "survey") return (
    <div className="page fade-up" style={{ background: `radial-gradient(ellipse at 50% 0%, ${est.color}15, transparent 50%), var(--dark)` }}>
      <div className="card card-wide">
        <div className="survey-header">
          <div style={{ fontSize: 22, marginBottom: 6 }}>{est.emoji} {est.name}</div>
          <div className="survey-title">Queremos saber como foi sua experiência!</div>
          <div className="survey-sub">Compartilhe sua opinião conosco e responda sinceramente 💬</div>
        </div>
        <div className="prog-wrap">
          <div className="prog-label">
            <span>Progresso</span>
            <span>{answered.length}/{required.length}</span>
          </div>
          <div className="prog-bar"><div className="prog-fill" style={{ width: `${prog}%` }} /></div>
        </div>
        {est.questions.map((q, i) => (
          <QuestionItem key={q.id} q={q} idx={i}
            answer={answers[q.id]}
            onChange={v => setAnswers(a => ({ ...a, [q.id]: v }))} />
        ))}
        <div style={{ marginTop: 20 }}>
          <button className="btn btn-red" onClick={handleSubmit} disabled={!allDone}>
            {allDone ? "Enviar e girar a roleta! 🎰" : `Responda todas as ${required.length - answered.length} obrigatórias`}
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
          <div className="confirm-title" style={{ color: "var(--ac)" }}>Pesquisa de Satisfação</div>
          <div style={{ fontFamily: "var(--ff-head)", fontSize: 20, margin: "6px 0" }}>{est.name}</div>
          <div className="confirm-sub">Sua resposta foi registrada com sucesso!<br/>Agora gire a roleta e descubra seu prêmio 🎁</div>
          <div className="div" />
          <Wheel prizes={est.prizes} onResult={p => { setPrize(p); setTimeout(() => setStep("prize"), 500); }} />
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
          <div className="prize-congrats">
            {nome && nome !== "Anônimo" ? `${nome}, você` : "Você"} ganhou este prêmio!
          </div>
          <div className="coupon-box">
            <div className="coupon-id">{coupon}</div>
            <div className="coupon-validity">
              🗓️ Válido até: {addDays(7)} · Apresente ao atendente
            </div>
          </div>
          <button className="btn-download" onClick={() => {
            const txt = `NotaCheia ⭐\n${est.name}\n\nPrêmio: ${prize.label}\nCupom: ${coupon}\nVálido até: ${addDays(7)}\n\nApresente ao atendente para resgatar.`;
            const blob = new Blob([txt], { type: "text/plain" });
            const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
            a.download = `premio-${coupon}.txt`; a.click();
          }}>
            ⬇️ Baixar comprovante
          </button>
          {est.googleUrl && isHappy && (
            <div className="google-box">
              <div style={{ fontSize: 12, fontWeight: 800, color: "#4ade80", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>🎉 Que ótimo que gostou!</div>
              <div style={{ fontSize: 13, color: "#aaa", lineHeight: 1.5 }}>Conta pra mais pessoas no Google? Leva só 1 minutinho!</div>
              <button className="btn-google" onClick={() => window.open(est.googleUrl, "_blank")}>
                🌐 Avaliar no Google Maps
              </button>
            </div>
          )}
          {est.googleUrl && !isHappy && (
            <div className="google-box-low">
              <div style={{ fontSize: 13, color: "#888", lineHeight: 1.5 }}>😔 Sentimos muito. Seu feedback já foi enviado ao responsável e vamos melhorar!</div>
            </div>
          )}
          <div style={{ fontSize: 11, color: "#444", textAlign: "center", marginTop: 8 }}>
            {est.name} · Powered by NotaCheia ⭐
          </div>
        </div>
      </div>
    );
  }
}

// ─── OWNER DASHBOARD ─────────────────────────────────────────────────────────
function OwnerDash({ est, onUpdate, onLogout }) {
  const [tab, setTab] = useState("overview");
  const [ed, setEd] = useState({ ...est, questions: est.questions.map(q => ({ ...q })), prizes: est.prizes.map(p => ({ ...p })) });
  const [saved, setSaved] = useState(false);
  const [newQ, setNewQ] = useState({ label: "", type: "stars", options: "" });
  const [newP, setNewP] = useState({ label: "", emoji: "🎁", color: "#e63946" });
  const COLORS = ["#e63946","#f4a261","#2a9d8f","#457b9d","#6d597a","#e76f51","#264653","#e9c46a","#f72585","#4cc9f0","#111","#222"];

  const starAvg = (key) => {
    const vals = est.feedbacks.map(f => f.answers?.[key]).filter(v => typeof v === "number" && v > 0);
    return vals.length ? (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1) : "-";
  };
  const overall = () => {
    const starQs = est.questions.filter(q => q.type === "stars");
    if (!starQs.length || !est.feedbacks.length) return "-";
    const vals = est.feedbacks.flatMap(f => starQs.map(q => f.answers?.[q.id] || 0).filter(v => v > 0));
    return vals.length ? (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1) : "-";
  };
  const npsAvg = () => {
    const vals = est.feedbacks.map(f => f.answers?.q_nps).filter(v => v !== undefined);
    return vals.length ? (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1) : "-";
  };

  const save = () => { onUpdate(ed); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const addQ = () => {
    if (!newQ.label) return;
    const opts = newQ.options.split(",").map(s => s.trim()).filter(Boolean);
    setEd(e => ({ ...e, questions: [...e.questions, { id: uid(), ...newQ, options: opts, required: true }] }));
    setNewQ({ label: "", type: "stars", options: "" });
  };
  const removeQ = id => setEd(e => ({ ...e, questions: e.questions.filter(q => q.id !== id) }));
  const addP = () => {
    if (!newP.label) return;
    setEd(e => ({ ...e, prizes: [...e.prizes, { id: uid(), ...newP }] }));
    setNewP({ label: "", emoji: "🎁", color: "#e63946" });
  };
  const removeP = id => setEd(e => ({ ...e, prizes: e.prizes.filter(p => p.id !== id) }));

  const navs = [
    { id: "overview", icon: "📊", lbl: "Visão Geral" },
    { id: "feedbacks", icon: "💬", lbl: "Feedbacks" },
    { id: "setup", icon: "⚙️", lbl: "Configurar" },
  ];

  return (
    <div className="shell">
      <div className="sidebar">
        <div className="sidebar-brand"><span className="brand-red">NOTA</span><span className="brand-white">CHEIA</span> <span style={{color:"var(--ac)"}}>⭐</span></div>
        <div className="sidebar-est">
          <div className="sidebar-est-emoji">{est.emoji}</div>
          <div className="sidebar-est-name">{est.name}</div>
          <div className="sidebar-est-email">{est.owner}</div>
        </div>
        <div className="div" style={{ margin: "0 0 8px" }} />
        {navs.map(n => <button key={n.id} className={`nav ${tab === n.id ? "on" : ""}`} onClick={() => setTab(n.id)}><span>{n.icon}</span><span>{n.lbl}</span></button>)}
        <div style={{ flex: 1 }} />
        <button className="nav" onClick={onLogout}><span>🚪</span><span>Sair</span></button>
      </div>

      <div className="main">
        {tab === "overview" && (
          <>
            <div className="main-title">{est.emoji} {est.name}</div>
            <div className="metrics">
              <div className="metric"><div className="metric-val">{est.feedbacks.length}</div><div className="metric-lbl">Avaliações</div></div>
              <div className="metric"><div className="metric-val">⭐ {overall()}</div><div className="metric-lbl">Nota geral</div></div>
              <div className="metric"><div className="metric-val">📊 {npsAvg()}</div><div className="metric-lbl">NPS médio</div></div>
              <div className="metric"><div className="metric-val">{est.feedbacks.length}</div><div className="metric-lbl">Brindes entregues</div></div>
              <div className="metric"><div className="metric-val" style={{fontSize:22}}>{est.googleUrl ? "✅" : "❌"}</div><div className="metric-lbl">Google Reviews</div>{!est.googleUrl && <div style={{fontSize:11,color:"var(--ac)",marginTop:4}}>Configure em ⚙️</div>}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10 }}>
              {est.questions.filter(q => q.type === "stars").map(q => {
                const s = starAvg(q.id);
                return (
                  <div key={q.id} style={{ background: "var(--d1)", border: "1px solid var(--border)", borderRadius: 14, padding: 16, textAlign: "center" }}>
                    <div style={{ fontSize: 22, marginBottom: 4 }}>⭐</div>
                    <div style={{ fontFamily: "var(--ff-head)", fontSize: 26, color: s >= 4 ? "#4ade80" : s >= 3 ? "var(--ac)" : "#f87171" }}>{s}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{q.label.replace("Como avalia ", "").replace("?", "")}</div>
                    <div style={{ height: 3, background: "var(--d3)", borderRadius: 2, marginTop: 8 }}>
                      <div style={{ height: "100%", width: `${(s / 5) * 100}%`, background: "var(--ac)", borderRadius: 2 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {tab === "feedbacks" && (
          <>
            <div className="main-title">💬 Feedbacks ({est.feedbacks.length})</div>
            {est.feedbacks.length === 0 && <div style={{ color: "var(--muted)", textAlign: "center", marginTop: 60 }}>Nenhum feedback ainda. Compartilhe o QR code!</div>}
            {[...est.feedbacks].reverse().map((f, i) => (
              <div className="fb" key={f.id || i} style={{ marginBottom: 16 }}>
                {/* Header */}
                <div className="fb-top">
                  <div className="fb-name">👤 {f.nome}</div>
                  <div className="fb-date">{f.data || "Agora"}</div>
                </div>

                {/* Respostas organizadas por tipo */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

                  {/* Info rápida — choice e staff */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {Object.entries(f.answers || {}).map(([k, v]) => {
                      const q = est.questions.find(q => q.id === k);
                      if (!q || q.type === "stars" || q.type === "nps" || q.type === "text") return null;
                      return (
                        <div key={k} style={{ background: "var(--d3)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600, color: "var(--text)", display: "flex", gap: 4, alignItems: "center" }}>
                          <span style={{ color: "var(--muted)", fontSize: 11 }}>{q.label.replace("Quem realizou seu atendimento?", "Atendente").replace("É a sua primeira vez aqui?", "1ª vez").replace("Em qual horário foi o atendimento?", "Horário").replace("Quantas pessoas na mesa?", "Mesa").replace("Como conheceu o estabelecimento?", "Veio via").replace("O que achou do nosso preço?", "Preço")}:</span>
                          <span>{String(v).replace("Outro:", "")}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* NPS */}
                  {f.answers?.q_nps !== undefined && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 700 }}>NPS:</span>
                      <div style={{ background: f.answers.q_nps >= 9 ? "#0a2a0a" : f.answers.q_nps >= 7 ? "#1a1a0a" : "#2a0a0a", border: `1px solid ${f.answers.q_nps >= 9 ? "#4ade80" : f.answers.q_nps >= 7 ? "#f0c96e" : "#f87171"}44`, borderRadius: 10, padding: "3px 12px", fontSize: 13, fontWeight: 800, color: f.answers.q_nps >= 9 ? "#4ade80" : f.answers.q_nps >= 7 ? "#f0c96e" : "#f87171" }}>
                        {f.answers.q_nps}/10
                      </div>
                    </div>
                  )}

                  {/* Estrelas por categoria */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {Object.entries(f.answers || {}).map(([k, v]) => {
                      const q = est.questions.find(q => q.id === k);
                      if (!q || q.type !== "stars") return null;
                      return (
                        <div key={k} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 12, color: "var(--muted)", minWidth: 140, fontWeight: 600 }}>{q.label.replace("Como avalia nosso ", "").replace("Como avalia a qualidade dos ", "").replace("Como avalia a qualidade das ", "").replace("Como avalia o ", "").replace("?", "")}</span>
                          <div style={{ display: "flex", gap: 2 }}>
                            {[1,2,3,4,5].map(s => (
                              <span key={s} style={{ fontSize: 14, filter: s <= v ? "none" : "grayscale(1) opacity(0.2)" }}>⭐</span>
                            ))}
                          </div>
                          <span style={{ fontSize: 12, color: v >= 4 ? "#4ade80" : v >= 3 ? "#f0c96e" : "#f87171", fontWeight: 700 }}>
                            {["","Ruim","Regular","Bom","Ótimo","Excelente"][v]}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Comentário */}
                  {f.answers?.q_sug && (
                    <div className="fb-comment">💬 "{f.answers.q_sug}"</div>
                  )}

                  {/* Prêmio */}
                  {f.premio && <div className="fb-prize">🎁 {f.premio}</div>}
                </div>
              </div>
            ))}
          </>
        )}

        {tab === "setup" && (
          <>
            <div className="main-title">⚙️ Configurar</div>

            <div className="setup-box">
              <div className="setup-box-title">🏪 Identidade</div>
              <label className="lbl">Nome</label>
              <input className="field" value={ed.name} onChange={e => setEd(s => ({ ...s, name: e.target.value }))} />
              <label className="lbl">Emoji</label>
              <input className="field" value={ed.emoji} onChange={e => setEd(s => ({ ...s, emoji: e.target.value }))} style={{ fontSize: 24 }} />
              <label className="lbl">Cor principal</label>
              <div className="swatch-row">{COLORS.map(c => <div key={c} className={`swatch ${ed.color === c ? "on" : ""}`} style={{ background: c }} onClick={() => setEd(s => ({ ...s, color: c }))} />)}</div>
              <label className="lbl">🌐 Link Google Reviews</label>
              <input className="field" placeholder="https://g.page/r/..." value={ed.googleUrl || ""} onChange={e => setEd(s => ({ ...s, googleUrl: e.target.value }))} />
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: -8, marginBottom: 8 }}>💡 Notas 4⭐+ vão pro Google. Notas baixas ficam só aqui.</div>
            </div>

            <div className="setup-box">
              <div className="setup-box-title">❓ Perguntas</div>
              {ed.questions.map(q => (
                <div className="pill-row" key={q.id}>
                  <div style={{ flex: 1 }}>
                    <div className="pill-lbl">{q.label}</div>
                    <div className="pill-sub">{q.type} {q.options?.length ? `· ${q.options.slice(0,3).join(", ")}${q.options.length > 3 ? "…" : ""}` : ""}</div>
                  </div>
                  <button className="btn-sm btn-sm-danger" onClick={() => removeQ(q.id)}>✕</button>
                </div>
              ))}
              <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                <input className="field-inline" placeholder="Texto da pergunta" value={newQ.label} onChange={e => setNewQ(s => ({ ...s, label: e.target.value }))} />
                <select className="type-sel" value={newQ.type} onChange={e => setNewQ(s => ({ ...s, type: e.target.value }))}>
                  <option value="stars">⭐ Estrelas</option>
                  <option value="choice">☑️ Múltipla escolha</option>
                  <option value="nps">📊 NPS 0-10</option>
                  <option value="text">📝 Texto livre</option>
                  <option value="staff">👤 Colaborador</option>
                </select>
                {(newQ.type === "choice" || newQ.type === "staff") && (
                  <input className="field-inline" placeholder="Opções separadas por vírgula" value={newQ.options} onChange={e => setNewQ(s => ({ ...s, options: e.target.value }))} />
                )}
                <button className="btn-sm btn-sm-red" onClick={addQ}>+ Adicionar</button>
              </div>
            </div>

            <div className="setup-box">
              <div className="setup-box-title">🎡 Prêmios da Roleta</div>
              {ed.prizes.map(p => (
                <div className="pill-row" key={p.id}>
                  <span style={{ fontSize: 20 }}>{p.emoji}</span>
                  <div className="color-dot" style={{ background: p.color }} />
                  <div className="pill-lbl" style={{ flex: 1 }}>{p.label}</div>
                  <button className="btn-sm btn-sm-danger" onClick={() => removeP(p.id)}>✕</button>
                </div>
              ))}
              <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                <input className="field-inline" placeholder="Nome do brinde" value={newP.label} onChange={e => setNewP(s => ({ ...s, label: e.target.value }))} />
                <input className="field-inline" placeholder="Emoji" value={newP.emoji} onChange={e => setNewP(s => ({ ...s, emoji: e.target.value }))} style={{ maxWidth: 70 }} />
                <input type="color" value={newP.color} onChange={e => setNewP(s => ({ ...s, color: e.target.value }))} style={{ width: 42, height: 42, border: "none", background: "none", cursor: "pointer", borderRadius: 8 }} />
                <button className="btn-sm btn-sm-red" onClick={addP}>+ Adicionar</button>
              </div>
            </div>

            <button className="btn btn-red" style={{ maxWidth: 240 }} onClick={save}>
              {saved ? "✅ Salvo!" : "Salvar alterações"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── MASTER PANEL ─────────────────────────────────────────────────────────────
function MasterPanel({ establishments, onLogout }) {
  const total = establishments.reduce((a, e) => a + e.feedbacks.length, 0);
  return (
    <div className="shell">
      <div className="sidebar">
        <div style={{ padding: "0 4px 16px", borderBottom: "1px solid var(--border)", marginBottom: 10 }}><LogoSVG size={170} /></div>
        <div className="sidebar-est">
          <div className="sidebar-est-emoji">👑</div>
          <div className="sidebar-est-name">Master Admin</div>
          <div className="sidebar-est-email">notacheia.com.br</div>
        </div>
        <div className="div" style={{ margin: "0 0 8px" }} />
        <button className="nav on"><span>🏢</span><span>Estabelecimentos</span></button>
        <div style={{ flex: 1 }} />
        <button className="nav" onClick={onLogout}><span>🚪</span><span>Sair</span></button>
      </div>
      <div className="main">
        <div className="main-title">🏢 Estabelecimentos</div>
        <div className="metrics">
          <div className="metric"><div className="metric-val">{establishments.length}</div><div className="metric-lbl">Cadastrados</div></div>
          <div className="metric"><div className="metric-val">R$ {(establishments.length * 99).toLocaleString("pt-BR")}</div><div className="metric-lbl">MRR</div></div>
          <div className="metric"><div className="metric-val">{total}</div><div className="metric-lbl">Total feedbacks</div></div>
        </div>
        <div className="tbl-wrap">
          <div className="tbl-head" style={{ gridTemplateColumns: "2fr 1.5fr 1fr 1fr 100px" }}>
            <span>Estabelecimento</span><span>Dono</span><span>Feedbacks</span><span>Plano</span><span>Status</span>
          </div>
          {establishments.map(e => (
            <div className="tbl-row" key={e.id} style={{ gridTemplateColumns: "2fr 1.5fr 1fr 1fr 100px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}><span style={{ fontSize: 18 }}>{e.emoji}</span>{e.name}</div>
              <div style={{ color: "var(--muted)", fontSize: 12 }}>{e.owner}</div>
              <div style={{ fontWeight: 700 }}>{e.feedbacks.length}</div>
              <div style={{ fontWeight: 700, color: "var(--ac)" }}>R$ 99/mês</div>
              <div><span className="badge badge-green"><span className="live-dot" style={{ marginRight: 4 }} />Ativo</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginScreen({ title, hint, onLogin, establishments }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");

  const handle = () => {
    const ok = onLogin(email, pass);
    if (!ok) { setErr("E-mail ou senha incorretos."); setTimeout(() => setErr(""), 3000); }
  };

  return (
    <div className="page page-center fade-up" style={{ background: "radial-gradient(ellipse at 50% 0%, #e6394615, transparent 50%), var(--dark)" }}>
      <div className="card">
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <LogoSVG size={180} style={{ margin: "0 auto 12px" }} />
          <div className="tagline">{title}</div>
        </div>
        <div className="div" />
        {err && <div className="err">⚠️ {err}</div>}
        <label className="lbl">E-mail</label>
        <input className="field" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handle()} />
        <label className="lbl">Senha</label>
        <div style={{ position: "relative", marginBottom: 16 }}>
          <input className="field" style={{ marginBottom: 0, paddingRight: 48 }} type={show ? "text" : "password"}
            placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && handle()} />
          <button onClick={() => setShow(s => !s)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#555" }}>{show ? "🙈" : "👁️"}</button>
        </div>
        <button className="btn btn-red" onClick={handle}>Entrar →</button>
        <div style={{ textAlign: "center", fontSize: 11, color: "var(--muted)", marginTop: 16 }}>{hint}</div>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [mode, setMode] = useState("client");
  const [ests, setEsts] = useState(SEED);
  const [activeEst, setActiveEst] = useState(SEED[0]);
  const [loggedEst, setLoggedEst] = useState(null);
  const css = CSS(activeEst?.color || "#e63946");

  const addFeedback = (fb) => {
    const newFb = { ...fb, id: Date.now(), data: new Date().toLocaleString("pt-BR") };
    setEsts(prev => prev.map(e => e.id === activeEst.id ? { ...e, feedbacks: [...e.feedbacks, newFb] } : e));
    setActiveEst(e => ({ ...e, feedbacks: [...e.feedbacks, newFb] }));
  };
  const updateEst = (updated) => {
    setEsts(prev => prev.map(e => e.id === updated.id ? updated : e));
    setLoggedEst(updated);
  };

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="top-bar">
          {mode !== "client" && <button className="top-btn top-btn-ghost" onClick={() => setMode("client")}>📱 Cliente</button>}
          {mode === "client" && (
            <>
              <select style={{ background:"var(--d2)", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"7px 10px", fontFamily:"var(--ff-body)", fontSize:12, cursor:"pointer" }}
                value={activeEst.id} onChange={e => setActiveEst(ests.find(x => x.id === e.target.value))}>
                {ests.map(e => <option key={e.id} value={e.id}>{e.emoji} {e.name}</option>)}
              </select>
              <button className="top-btn top-btn-ghost" onClick={() => setMode("ownerLogin")}>🏪 Dono</button>
              <button className="top-btn top-btn-red" onClick={() => setMode("masterLogin")}>👑 Master</button>
            </>
          )}
        </div>

        {mode === "client" && <ClientApp est={activeEst} onSubmit={addFeedback} key={activeEst.id} />}

        {mode === "ownerLogin" && (
          <LoginScreen title="ACESSO DO PROPRIETÁRIO"
            hint="Demo: joao@burguer.com / 123456"
            onLogin={(email, pass) => {
              const found = ests.find(e => e.owner === email && e.pass === pass);
              if (found) { setLoggedEst(found); setMode("ownerDash"); return true; }
              return false;
            }} />
        )}

        {mode === "ownerDash" && loggedEst && (
          <OwnerDash est={loggedEst} onUpdate={updateEst} onLogout={() => { setLoggedEst(null); setMode("client"); }} />
        )}

        {mode === "masterLogin" && (
          <LoginScreen title="PAINEL MASTER"
            hint="master@notacheia.com.br / master2026"
            onLogin={(email, pass) => {
              if (email === MASTER.user && pass === MASTER.pass) { setMode("masterDash"); return true; }
              return false;
            }} />
        )}

        {mode === "masterDash" && <MasterPanel establishments={ests} onLogout={() => setMode("client")} />}
      </div>
    </>
  );
}
