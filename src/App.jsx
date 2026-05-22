import { useState, useRef, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://lhdbevkcpycikyudzqng.supabase.co";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || "sb_publishable_x98wrvkKncTzTV0QnZZjzA_MjD21sCw";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`;

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
    name: "Black Burguer", emoji: "🍔", color: "#e63946",
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
    name: "Café Veloz", emoji: "☕", color: "#6f4e37",
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
    --b
