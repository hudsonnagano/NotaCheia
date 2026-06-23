import React, { useState, useRef, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://lhdbevkcpycikyudzqng.supabase.co";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || "sb_publishable_x98wrvkKncTzTV0QnZZjzA_MjD21sCw";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`;

const makeSlug = (name) => name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Ramos que têm cardápio digital
const RAMOS_COMIDA = ["Hamburgueria","Pizzaria","Restaurante","Cafeteria","Lanchonete","Bar","Sorveteria","Padaria","Sushi/Japonês","Churrascaria"];
const isRamoComida = (ramo) => RAMOS_COMIDA.includes(ramo);
const temCardapioPorPlano = (plano) => plano === "R$ 129/mês" || plano === "Pro";

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

// ============================================================
// BANCO DE PERGUNTAS POR NICHO
// ============================================================
const PERGUNTAS_POR_NICHO = {
  "Hamburgueria": [
    { id:"hb_1",  type:"stars",  label:"Como avalia a qualidade do hambúrguer?", defaultActive:true },
    { id:"hb_2",  type:"stars",  label:"Como avalia o sabor do blend da carne?", defaultActive:true },
    { id:"hb_3",  type:"stars",  label:"Como avalia a qualidade do pão?", defaultActive:true },
    { id:"hb_4",  type:"stars",  label:"Como avalia os ingredientes e complementos?", defaultActive:true },
    { id:"hb_5",  type:"stars",  label:"Como avalia o tamanho/porção do lanche?", defaultActive:true },
    { id:"hb_6",  type:"stars",  label:"Como avalia o atendimento?" },
    { id:"hb_7",  type:"stars",  label:"Como avalia a agilidade no preparo?" },
    { id:"hb_8",  type:"stars",  label:"Como avalia o ambiente/espaço?" },
    { id:"hb_9",  type:"stars",  label:"Como avalia a limpeza do local?" },
    { id:"hb_10", type:"stars",  label:"Como avalia as batatas fritas ou acompanhamentos?" },
    { id:"hb_11", type:"stars",  label:"Como avalia as bebidas?" },
    { id:"hb_12", type:"stars",  label:"Como avalia o custo-benefício?" },
    { id:"hb_13", type:"choice", label:"O que achou do preço?", options:["Barato","Justo","Caro"] },
    { id:"hb_14", type:"choice", label:"O lanche chegou na temperatura certa?", options:["Sim, perfeito","Podia estar mais quente","Estava frio"] },
    { id:"hb_15", type:"choice", label:"Como pediu?", options:["No balcão","Mesa com garçom","Delivery","App"] },
    { id:"hb_16", type:"choice", label:"É sua primeira visita?", options:["Sim","Não"], defaultActive:true },
    { id:"hb_17", type:"choice", label:"Com quantas pessoas veio?", options:["Sozinho","2 pessoas","3 a 5","Mais de 5"] },
    { id:"hb_18", type:"choice", label:"Como nos conheceu?", options:["Instagram","Indicação","Passando pela rua","Google","TikTok","Outro"] },
    { id:"hb_19", type:"choice", label:"Você voltaria?", options:["Com certeza","Talvez","Provavelmente não"] },
    { id:"hb_20", type:"choice", label:"O tempo de espera foi:", options:["Rápido","Razoável","Demorado"] },
    { id:"hb_21", type:"choice", label:"O cardápio é fácil de entender?", options:["Sim","Poderia ser mais claro","Não"] },
    { id:"hb_22", type:"choice", label:"Teve algum problema com seu pedido?", options:["Não","Pedido errado","Faltou item","Outro"] },
    { id:"hb_23", type:"choice", label:"Qual o melhor horário para você?", options:["Almoço","Tarde","Jantar","Madrugada"] },
    { id:"hb_24", type:"choice", label:"O local tem estacionamento fácil?", options:["Sim","Difícil mas achei","Não tem"] },
    { id:"hb_25", type:"choice", label:"As opções vegetarianas/veganas são suficientes?", options:["Sim","Poucas opções","Não tem"] },
    { id:"hb_26", type:"staff",  label:"Quem te atendeu?", options:[] },
    { id:"hb_27", type:"choice", label:"A embalagem do delivery estava boa?", options:["Sim","Poderia melhorar","Não"] },
    { id:"hb_28", type:"choice", label:"O ambiente é confortável para ficar?", options:["Sim","Razoável","Prefiro viagem"] },
    { id:"hb_29", type:"choice", label:"Indicaria para amigos?", options:["Com certeza","Talvez","Não"] },
    { id:"hb_30", type:"choice", label:"O que mais gostou?", options:["Sabor","Atendimento","Preço","Ambiente","Rapidez"] },
    { id:"hb_31", type:"choice", label:"A mesa estava limpa quando você chegou?", options:["Sim","Precisou pedir para limpar","Não"] },
    { id:"hb_nps", type:"nps",  label:"De 0 a 10, o quanto nos indicaria?", defaultActive:true },
    { id:"hb_sug", type:"text", label:"Alguma sugestão ou elogio?", defaultActive:true },
  ],
  "Pizzaria": [
    { id:"pz_1",  type:"stars",  label:"Como avalia o sabor da pizza?", defaultActive:true },
    { id:"pz_2",  type:"stars",  label:"Como avalia a massa da pizza?", defaultActive:true },
    { id:"pz_3",  type:"stars",  label:"Como avalia os ingredientes/recheio?", defaultActive:true },
    { id:"pz_4",  type:"stars",  label:"Como avalia o tamanho da pizza?", defaultActive:true },
    { id:"pz_5",  type:"stars",  label:"Como avalia o atendimento?", defaultActive:true },
    { id:"pz_6",  type:"stars",  label:"Como avalia a agilidade na entrega/preparo?" },
    { id:"pz_7",  type:"stars",  label:"Como avalia o ambiente?" },
    { id:"pz_8",  type:"stars",  label:"Como avalia a limpeza do local?" },
    { id:"pz_9",  type:"stars",  label:"Como avalia as bebidas?" },
    { id:"pz_10", type:"stars",  label:"Como avalia o custo-benefício?" },
    { id:"pz_11", type:"choice", label:"A pizza chegou na temperatura certa?", options:["Sim, perfeita","Poderia estar mais quente","Estava fria"] },
    { id:"pz_12", type:"choice", label:"O que achou do preço?", options:["Barato","Justo","Caro"], defaultActive:true },
    { id:"pz_13", type:"choice", label:"Como pediu?", options:["No local","Delivery","Telefone","App"] },
    { id:"pz_14", type:"choice", label:"É sua primeira visita?", options:["Sim","Não"] },
    { id:"pz_15", type:"choice", label:"Com quantas pessoas veio/pediu?", options:["Sozinho","2 pessoas","3 a 5","Mais de 5"] },
    { id:"pz_16", type:"choice", label:"Como nos conheceu?", options:["Instagram","Indicação","Google","TikTok","Outro"] },
    { id:"pz_17", type:"choice", label:"O tempo de espera foi:", options:["Rápido","Razoável","Demorado"] },
    { id:"pz_18", type:"choice", label:"Teve algum problema com seu pedido?", options:["Não","Ingrediente errado","Faltou item","Outro"] },
    { id:"pz_19", type:"choice", label:"A embalagem (delivery) manteve bem a pizza?", options:["Sim","Podia ser melhor","Não"] },
    { id:"pz_20", type:"choice", label:"Qual tipo de massa prefere?", options:["Fina","Grossa","Média","Borda recheada"] },
    { id:"pz_21", type:"choice", label:"Há opções doces suficientes?", options:["Sim","Poucas","Não tem"] },
    { id:"pz_22", type:"choice", label:"Há opções salgadas/tradicionais suficientes?", options:["Sim","Poucas","Não"] },
    { id:"pz_23", type:"choice", label:"Você voltaria?", options:["Com certeza","Talvez","Provavelmente não"] },
    { id:"pz_24", type:"choice", label:"O cardápio é fácil de entender?", options:["Sim","Poderia melhorar","Não"] },
    { id:"pz_25", type:"staff",  label:"Quem te atendeu?", options:[] },
    { id:"pz_26", type:"choice", label:"O ambiente é agradável para comer no local?", options:["Sim","Razoável","Prefiro delivery"] },
    { id:"pz_27", type:"choice", label:"As promoções/combos são atrativas?", options:["Sim","Podia ter mais","Não tem"] },
    { id:"pz_28", type:"choice", label:"Indicaria para amigos?", options:["Com certeza","Talvez","Não"] },
    { id:"pz_29", type:"choice", label:"Qual o melhor horário para você?", options:["Almoço","Jantar","Final de semana"] },
    { id:"pz_30", type:"choice", label:"O que mais gostou?", options:["Sabor","Recheio","Massa","Preço","Atendimento"] },
    { id:"pz_31", type:"choice", label:"A mesa estava limpa quando você chegou?", options:["Sim","Precisou pedir para limpar","Não"] },
    { id:"pz_nps", type:"nps",  label:"De 0 a 10, o quanto nos indicaria?", defaultActive:true },
    { id:"pz_sug", type:"text", label:"Alguma sugestão ou elogio?", defaultActive:true },
  ],
  "Restaurante": [
    { id:"rt_1",  type:"stars",  label:"Como avalia a qualidade dos pratos?", defaultActive:true },
    { id:"rt_2",  type:"stars",  label:"Como avalia o sabor da comida?", defaultActive:true },
    { id:"rt_3",  type:"stars",  label:"Como avalia a apresentação dos pratos?", defaultActive:true },
    { id:"rt_4",  type:"stars",  label:"Como avalia o atendimento do garçom?", defaultActive:true },
    { id:"rt_5",  type:"stars",  label:"Como avalia a agilidade no serviço?", defaultActive:true },
    { id:"rt_6",  type:"stars",  label:"Como avalia o ambiente/decoração?" },
    { id:"rt_7",  type:"stars",  label:"Como avalia a limpeza do local?" },
    { id:"rt_8",  type:"stars",  label:"Como avalia as bebidas?" },
    { id:"rt_9",  type:"stars",  label:"Como avalia as sobremesas?" },
    { id:"rt_10", type:"stars",  label:"Como avalia o custo-benefício?" },
    { id:"rt_11", type:"choice", label:"O que achou do preço?", options:["Barato","Justo","Caro"], defaultActive:true },
    { id:"rt_12", type:"choice", label:"É sua primeira visita?", options:["Sim","Não"] },
    { id:"rt_13", type:"choice", label:"Com quantas pessoas veio?", options:["Sozinho","2 pessoas","3 a 5","Mais de 5"] },
    { id:"rt_14", type:"choice", label:"Qual refeição fez?", options:["Almoço","Jantar","Café da manhã","Brunch"] },
    { id:"rt_15", type:"choice", label:"Como nos conheceu?", options:["Indicação","Google","Instagram","Passando pela rua","Outro"] },
    { id:"rt_16", type:"choice", label:"O tempo de espera pelo prato foi:", options:["Rápido","Razoável","Demorado"] },
    { id:"rt_17", type:"choice", label:"Teve algum problema com seu pedido?", options:["Não","Pedido errado","Faltou item","Outro"] },
    { id:"rt_18", type:"choice", label:"O cardápio tem variedade suficiente?", options:["Sim","Poderia ter mais","Não"] },
    { id:"rt_19", type:"choice", label:"Há opções para restrições alimentares?", options:["Sim","Poucas","Não tem"] },
    { id:"rt_20", type:"choice", label:"O restaurante aceita reservas?", options:["Sim e funciona bem","Sim mas complica","Não aceita"] },
    { id:"rt_21", type:"choice", label:"Você voltaria?", options:["Com certeza","Talvez","Provavelmente não"] },
    { id:"rt_22", type:"choice", label:"O ambiente é adequado para o momento?", options:["Ótimo para família","Ótimo para casal","Ótimo para negócios","Muito barulhento"] },
    { id:"rt_23", type:"choice", label:"A conta/cobrança foi correta?", options:["Sim","Teve erro corrigido","Sim mas demorou"] },
    { id:"rt_24", type:"staff",  label:"Quem te atendeu?", options:[] },
    { id:"rt_25", type:"choice", label:"Como avalia o estacionamento/acesso?", options:["Fácil","Difícil mas achei","Não tem"] },
    { id:"rt_26", type:"choice", label:"As porções são adequadas?", options:["Grandes","No tamanho certo","Pequenas"] },
    { id:"rt_27", type:"choice", label:"Indicaria para amigos?", options:["Com certeza","Talvez","Não"] },
    { id:"rt_28", type:"choice", label:"O que mais gostou?", options:["Sabor","Atendimento","Ambiente","Preço","Apresentação"] },
    { id:"rt_29", type:"choice", label:"O local é acessível para cadeirantes?", options:["Sim","Parcialmente","Não"] },
    { id:"rt_30", type:"choice", label:"Qual dia da semana prefere vir?", options:["Segunda–Quinta","Sexta","Sábado","Domingo"] },
    { id:"rt_31", type:"choice", label:"A mesa estava limpa quando você chegou?", options:["Sim","Precisou pedir para limpar","Não"] },
    { id:"rt_nps", type:"nps",  label:"De 0 a 10, o quanto nos indicaria?", defaultActive:true },
    { id:"rt_sug", type:"text", label:"Alguma sugestão ou elogio?", defaultActive:true },
  ],
  "Cafeteria": [
    { id:"cf_1",  type:"stars",  label:"Como avalia a qualidade do café?", defaultActive:true },
    { id:"cf_2",  type:"stars",  label:"Como avalia o sabor das bebidas quentes?", defaultActive:true },
    { id:"cf_3",  type:"stars",  label:"Como avalia as bebidas frias/geladas?", defaultActive:true },
    { id:"cf_4",  type:"stars",  label:"Como avalia os alimentos (bolos, pães, doces)?", defaultActive:true },
    { id:"cf_5",  type:"stars",  label:"Como avalia o atendimento?", defaultActive:true },
    { id:"cf_6",  type:"stars",  label:"Como avalia a agilidade no preparo?" },
    { id:"cf_7",  type:"stars",  label:"Como avalia o ambiente/conforto?" },
    { id:"cf_8",  type:"stars",  label:"Como avalia a limpeza?" },
    { id:"cf_9",  type:"stars",  label:"Como avalia a apresentação dos produtos?" },
    { id:"cf_10", type:"stars",  label:"Como avalia o custo-benefício?" },
    { id:"cf_11", type:"choice", label:"O que achou do preço?", options:["Barato","Justo","Caro"], defaultActive:true },
    { id:"cf_12", type:"choice", label:"É sua primeira visita?", options:["Sim","Não"] },
    { id:"cf_13", type:"choice", label:"O que pediu?", options:["Café","Cappuccino","Bebida gelada","Lanche","Bolo","Combo"] },
    { id:"cf_14", type:"choice", label:"O café estava na temperatura certa?", options:["Sim","Podia estar mais quente","Muito quente"] },
    { id:"cf_15", type:"choice", label:"Como nos conheceu?", options:["Indicação","Google","Instagram","Passando","Outro"] },
    { id:"cf_16", type:"choice", label:"O ambiente é bom para trabalhar/estudar?", options:["Sim, ótimo","Razoável","Não"] },
    { id:"cf_17", type:"choice", label:"O Wi-Fi funciona bem?", options:["Sim","Razoável","Não tem"] },
    { id:"cf_18", type:"choice", label:"Com quem veio?", options:["Sozinho","Com amigos","A trabalho","Em casal"] },
    { id:"cf_19", type:"choice", label:"O tempo de espera foi:", options:["Rápido","Razoável","Demorado"] },
    { id:"cf_20", type:"choice", label:"Você voltaria?", options:["Com certeza","Talvez","Provavelmente não"] },
    { id:"cf_21", type:"staff",  label:"Quem te atendeu?", options:[] },
    { id:"cf_22", type:"choice", label:"A música/ambiente sonoro estava:", options:["Agradável","Alto demais","Muito silencioso"] },
    { id:"cf_23", type:"choice", label:"Há tomadas/carregadores disponíveis?", options:["Sim","Poucas","Não"] },
    { id:"cf_24", type:"choice", label:"Indicaria para amigos?", options:["Com certeza","Talvez","Não"] },
    { id:"cf_25", type:"choice", label:"O que mais gostou?", options:["Café","Ambiente","Atendimento","Alimentos","Conforto"] },
    { id:"cf_26", type:"choice", label:"Há opções sem lactose/veganas?", options:["Sim","Poucas","Não"] },
    { id:"cf_27", type:"choice", label:"O local é aconchegante?", options:["Sim","Razoável","Não"] },
    { id:"cf_28", type:"choice", label:"Qual período prefere vir?", options:["Manhã","Tarde","Noite"] },
    { id:"cf_29", type:"choice", label:"O copo/xícara estava limpo e adequado?", options:["Sim","Estava opaco/manchado","Não"] },
    { id:"cf_30", type:"choice", label:"As opções de cardápio são variadas?", options:["Sim","Podia ter mais","Não"] },
    { id:"cf_31", type:"choice", label:"A mesa estava limpa quando você chegou?", options:["Sim","Precisou pedir para limpar","Não"] },
    { id:"cf_nps", type:"nps",  label:"De 0 a 10, o quanto nos indicaria?", defaultActive:true },
    { id:"cf_sug", type:"text", label:"Alguma sugestão ou elogio?", defaultActive:true },
  ],
  "Lanchonete": [
    { id:"lc_1",  type:"stars",  label:"Como avalia a qualidade dos lanches?", defaultActive:true },
    { id:"lc_2",  type:"stars",  label:"Como avalia o sabor?", defaultActive:true },
    { id:"lc_3",  type:"stars",  label:"Como avalia a variedade do cardápio?", defaultActive:true },
    { id:"lc_4",  type:"stars",  label:"Como avalia o atendimento?", defaultActive:true },
    { id:"lc_5",  type:"stars",  label:"Como avalia a agilidade?", defaultActive:true },
    { id:"lc_6",  type:"stars",  label:"Como avalia a limpeza?" },
    { id:"lc_7",  type:"stars",  label:"Como avalia os sucos/bebidas?" },
    { id:"lc_8",  type:"stars",  label:"Como avalia o ambiente?" },
    { id:"lc_9",  type:"stars",  label:"Como avalia as porções?" },
    { id:"lc_10", type:"stars",  label:"Como avalia o custo-benefício?" },
    { id:"lc_11", type:"choice", label:"O que achou do preço?", options:["Barato","Justo","Caro"], defaultActive:true },
    { id:"lc_12", type:"choice", label:"É sua primeira visita?", options:["Sim","Não"] },
    { id:"lc_13", type:"choice", label:"O que pediu?", options:["Misto","Bauru","Cachorro-quente","Coxinha","Combo","Outro"] },
    { id:"lc_14", type:"choice", label:"O lanche chegou quente?", options:["Sim","Razoável","Não"] },
    { id:"lc_15", type:"choice", label:"O tempo de espera foi:", options:["Rápido","Razoável","Demorado"] },
    { id:"lc_16", type:"choice", label:"Como nos conheceu?", options:["Indicação","Google","Mora perto","Instagram","Outro"] },
    { id:"lc_17", type:"choice", label:"Você voltaria?", options:["Com certeza","Talvez","Provavelmente não"] },
    { id:"lc_18", type:"choice", label:"Como pediu?", options:["No balcão","Delivery","App"] },
    { id:"lc_19", type:"choice", label:"Qual refeição fez?", options:["Café da manhã","Almoço","Lanche da tarde","Jantar"] },
    { id:"lc_20", type:"staff",  label:"Quem te atendeu?", options:[] },
    { id:"lc_21", type:"choice", label:"Indicaria para amigos?", options:["Com certeza","Talvez","Não"] },
    { id:"lc_22", type:"choice", label:"O que mais gostou?", options:["Sabor","Preço","Porção","Atendimento","Rapidez"] },
    { id:"lc_23", type:"choice", label:"O local tem opções saudáveis?", options:["Sim","Poucas","Não"] },
    { id:"lc_24", type:"choice", label:"A embalagem para viagem estava boa?", options:["Sim","Podia melhorar","Não"] },
    { id:"lc_25", type:"choice", label:"Com que frequência você vem?", options:["Primeira vez","Raramente","Semanalmente","Todo dia"] },
    { id:"lc_26", type:"choice", label:"O cardápio tem combos atraentes?", options:["Sim","Podia ter mais","Não"] },
    { id:"lc_27", type:"choice", label:"Há opções vegetarianas?", options:["Sim","Poucas","Não"] },
    { id:"lc_28", type:"choice", label:"O caixa foi eficiente?", options:["Sim","Demorou um pouco","Não"] },
    { id:"lc_29", type:"choice", label:"O ambiente é confortável para ficar?", options:["Sim","Prefiro levar","Não tem espaço"] },
    { id:"lc_30", type:"choice", label:"O que te faria pedir mais vezes?", options:["Promoções","Novidades","App de delivery","Cartão fidelidade"] },
    { id:"lc_31", type:"choice", label:"A mesa estava limpa quando você chegou?", options:["Sim","Precisou pedir para limpar","Não"] },
    { id:"lc_nps", type:"nps",  label:"De 0 a 10, o quanto nos indicaria?", defaultActive:true },
    { id:"lc_sug", type:"text", label:"Alguma sugestão ou elogio?", defaultActive:true },
  ],
  "Bar": [
    { id:"br_1",  type:"stars",  label:"Como avalia a qualidade das bebidas?", defaultActive:true },
    { id:"br_2",  type:"stars",  label:"Como avalia a variedade de cervejas/drinks?", defaultActive:true },
    { id:"br_3",  type:"stars",  label:"Como avalia os petiscos/comida?", defaultActive:true },
    { id:"br_4",  type:"stars",  label:"Como avalia o atendimento?", defaultActive:true },
    { id:"br_5",  type:"stars",  label:"Como avalia a agilidade no serviço?", defaultActive:true },
    { id:"br_6",  type:"stars",  label:"Como avalia o ambiente/decoração?" },
    { id:"br_7",  type:"stars",  label:"Como avalia a música/clima?" },
    { id:"br_8",  type:"stars",  label:"Como avalia a limpeza?" },
    { id:"br_9",  type:"stars",  label:"Como avalia o preço das bebidas?" },
    { id:"br_10", type:"stars",  label:"Como avalia o custo-benefício geral?" },
    { id:"br_11", type:"choice", label:"O que achou do preço?", options:["Barato","Justo","Caro"], defaultActive:true },
    { id:"br_12", type:"choice", label:"É sua primeira visita?", options:["Sim","Não"] },
    { id:"br_13", type:"choice", label:"O que consumiu?", options:["Cerveja","Drinks","Vinho","Petiscos","Tudo junto"] },
    { id:"br_14", type:"choice", label:"A cerveja estava gelada?", options:["Sim, perfeita","Razoável","Não"] },
    { id:"br_15", type:"choice", label:"Com quantas pessoas veio?", options:["Sozinho","2 pessoas","3 a 5","Mais de 5"] },
    { id:"br_16", type:"choice", label:"Como nos conheceu?", options:["Indicação","Google","Instagram","Passando","Outro"] },
    { id:"br_17", type:"choice", label:"O volume da música estava:", options:["Ótimo","Alto demais","Baixo demais"] },
    { id:"br_18", type:"choice", label:"Você voltaria?", options:["Com certeza","Talvez","Provavelmente não"] },
    { id:"br_19", type:"choice", label:"O local tem transmissão de jogos?", options:["Sim e é bom","Sim mas podia melhorar","Não"] },
    { id:"br_20", type:"choice", label:"O atendimento no bar foi ágil?", options:["Sim","Demorou um pouco","Muito lento"] },
    { id:"br_21", type:"staff",  label:"Quem te atendeu?", options:[] },
    { id:"br_22", type:"choice", label:"Indicaria para amigos?", options:["Com certeza","Talvez","Não"] },
    { id:"br_23", type:"choice", label:"O que mais gostou?", options:["Bebidas","Petiscos","Ambiente","Música","Atendimento"] },
    { id:"br_24", type:"choice", label:"O banheiro estava limpo?", options:["Sim","Razoável","Não"] },
    { id:"br_25", type:"choice", label:"O local aceita reservas/mesas?", options:["Sim","Não","Não precisei"] },
    { id:"br_26", type:"choice", label:"Qual horário veio?", options:["Happy hour","Noite","Madrugada"] },
    { id:"br_27", type:"choice", label:"Há opções de petiscos para dividir?", options:["Sim, boas","Poucas opções","Não"] },
    { id:"br_28", type:"choice", label:"O local tem estacionamento fácil?", options:["Sim","Difícil","Não tem"] },
    { id:"br_29", type:"choice", label:"Pretende voltar para um evento/show?", options:["Sim","Talvez","Não"] },
    { id:"br_30", type:"choice", label:"O que te faria voltar mais vezes?", options:["Promoções","Eventos","Novas cervejas","Cardápio maior"] },
    { id:"br_31", type:"choice", label:"A mesa estava limpa quando você chegou?", options:["Sim","Precisou pedir para limpar","Não"] },
    { id:"br_nps", type:"nps",  label:"De 0 a 10, o quanto nos indicaria?", defaultActive:true },
    { id:"br_sug", type:"text", label:"Alguma sugestão ou elogio?", defaultActive:true },
  ],
  "Churrascaria": [
    { id:"ch_1",  type:"stars",  label:"Como avalia a qualidade das carnes?", defaultActive:true },
    { id:"ch_2",  type:"stars",  label:"Como avalia o ponto das carnes?", defaultActive:true },
    { id:"ch_3",  type:"stars",  label:"Como avalia a variedade de cortes?", defaultActive:true },
    { id:"ch_4",  type:"stars",  label:"Como avalia o atendimento dos churrasqueiros?", defaultActive:true },
    { id:"ch_5",  type:"stars",  label:"Como avalia a variedade das saladas/buffet?", defaultActive:true },
    { id:"ch_6",  type:"stars",  label:"Como avalia a qualidade das saladas/buffet?" },
    { id:"ch_7",  type:"stars",  label:"Como avalia o atendimento geral?" },
    { id:"ch_8",  type:"stars",  label:"Como avalia o ambiente?" },
    { id:"ch_9",  type:"stars",  label:"Como avalia a limpeza?" },
    { id:"ch_10", type:"stars",  label:"Como avalia o custo-benefício?" },
    { id:"ch_11", type:"choice", label:"O que achou do preço?", options:["Barato","Justo","Caro"], defaultActive:true },
    { id:"ch_12", type:"choice", label:"O ponto da sua carne foi respeitado?", options:["Sim, perfeito","Aproximado","Não"] },
    { id:"ch_13", type:"choice", label:"É sua primeira visita?", options:["Sim","Não"] },
    { id:"ch_14", type:"choice", label:"Com quantas pessoas veio?", options:["2 pessoas","3 a 5","6 a 10","Mais de 10"] },
    { id:"ch_15", type:"choice", label:"O tempo de atendimento na mesa foi:", options:["Ótimo","Bom","Demorou muito"] },
    { id:"ch_16", type:"choice", label:"A reposição das carnes foi frequente?", options:["Sim","Demorou um pouco","Não"] },
    { id:"ch_17", type:"choice", label:"Como nos conheceu?", options:["Indicação","Google","Instagram","Passou pela rua","Outro"] },
    { id:"ch_18", type:"choice", label:"As bebidas foram servidas em temperatura adequada?", options:["Sim","Podia estar mais gelada","Não"] },
    { id:"ch_19", type:"choice", label:"Você voltaria?", options:["Com certeza","Talvez","Provavelmente não"] },
    { id:"ch_20", type:"choice", label:"O espaço é adequado para grupos grandes?", options:["Sim","Razoável","Não"] },
    { id:"ch_21", type:"choice", label:"Indicaria para amigos?", options:["Com certeza","Talvez","Não"] },
    { id:"ch_22", type:"choice", label:"O local aceita reservas?", options:["Sim e funciona bem","Sim mas complica","Não"] },
    { id:"ch_23", type:"choice", label:"O que mais gostou?", options:["Carnes","Atendimento","Buffet","Ambiente","Preço"] },
    { id:"ch_24", type:"staff",  label:"Quem te atendeu?", options:[] },
    { id:"ch_25", type:"choice", label:"Qual refeição fez?", options:["Almoço","Jantar","Final de semana"] },
    { id:"ch_26", type:"choice", label:"O estacionamento é acessível?", options:["Sim","Difícil","Não tem"] },
    { id:"ch_27", type:"choice", label:"A música/ambiente sonoro estava:", options:["Agradável","Alto demais","Baixo demais"] },
    { id:"ch_28", type:"choice", label:"Os acompanhamentos estavam bons?", options:["Sim","Razoável","Não"] },
    { id:"ch_29", type:"choice", label:"A sobremesa foi satisfatória?", options:["Sim","Razoável","Não pedi"] },
    { id:"ch_30", type:"choice", label:"Pretende voltar para um evento/comemoração?", options:["Sim","Talvez","Não"] },
    { id:"ch_31", type:"choice", label:"A mesa estava limpa quando você chegou?", options:["Sim","Precisou pedir para limpar","Não"] },
    { id:"ch_nps", type:"nps",  label:"De 0 a 10, o quanto nos indicaria?", defaultActive:true },
    { id:"ch_sug", type:"text", label:"Alguma sugestão ou elogio?", defaultActive:true },
  ],
  "Salão de Beleza": [
    { id:"sl_1",  type:"stars",  label:"Como avalia o resultado do serviço?", defaultActive:true },
    { id:"sl_2",  type:"stars",  label:"Como avalia a habilidade do profissional?", defaultActive:true },
    { id:"sl_3",  type:"stars",  label:"Como avalia o atendimento e cordialidade?", defaultActive:true },
    { id:"sl_4",  type:"stars",  label:"Como avalia o tempo de execução?", defaultActive:true },
    { id:"sl_5",  type:"stars",  label:"Como avalia a limpeza e higiene?", defaultActive:true },
    { id:"sl_6",  type:"stars",  label:"Como avalia os produtos utilizados?" },
    { id:"sl_7",  type:"stars",  label:"Como avalia o ambiente/decoração?" },
    { id:"sl_8",  type:"stars",  label:"Como avalia o conforto durante o serviço?" },
    { id:"sl_9",  type:"stars",  label:"Como avalia o custo-benefício?" },
    { id:"sl_10", type:"stars",  label:"Como avalia o agendamento?" },
    { id:"sl_11", type:"choice", label:"O que achou do preço?", options:["Barato","Justo","Caro"], defaultActive:true },
    { id:"sl_12", type:"choice", label:"É sua primeira visita?", options:["Sim","Não"] },
    { id:"sl_13", type:"choice", label:"Qual serviço fez?", options:["Corte","Coloração","Escova","Manicure","Sobrancelha","Outro"] },
    { id:"sl_14", type:"choice", label:"O resultado ficou como esperado?", options:["Sim, perfeito","Próximo","Não"] },
    { id:"sl_15", type:"choice", label:"O horário agendado foi cumprido?", options:["Sim, pontual","Pequeno atraso","Muito atraso"] },
    { id:"sl_16", type:"choice", label:"Como nos conheceu?", options:["Indicação","Google","Instagram","Outro"] },
    { id:"sl_17", type:"choice", label:"Você voltaria?", options:["Com certeza","Talvez","Provavelmente não"] },
    { id:"sl_18", type:"choice", label:"Indicaria para amigos?", options:["Com certeza","Talvez","Não"] },
    { id:"sl_19", type:"staff",  label:"Quem te atendeu?", options:[] },
    { id:"sl_20", type:"choice", label:"O profissional escutou bem o que você queria?", options:["Sim, muito bem","Razoável","Não"] },
    { id:"sl_21", type:"choice", label:"Os produtos usados causaram alguma reação?", options:["Não","Leve irritação","Sim, problema"] },
    { id:"sl_22", type:"choice", label:"A duração do serviço foi adequada?", options:["Sim","Demorou mais que o esperado","Muito rápido"] },
    { id:"sl_23", type:"choice", label:"O ambiente é confortável para esperar?", options:["Sim","Razoável","Não"] },
    { id:"sl_24", type:"choice", label:"Há boa variedade de serviços?", options:["Sim","Podia ter mais","Não"] },
    { id:"sl_25", type:"choice", label:"Como agendou?", options:["WhatsApp","App","Telefone","Pessoalmente"] },
    { id:"sl_26", type:"choice", label:"O local tem estacionamento fácil?", options:["Sim","Difícil","Não tem"] },
    { id:"sl_27", type:"choice", label:"Com que frequência você vem?", options:["Primeira vez","Mensalmente","A cada 2 meses","Raramente"] },
    { id:"sl_28", type:"choice", label:"O que mais gostou?", options:["Resultado","Profissional","Ambiente","Preço","Atendimento"] },
    { id:"sl_29", type:"choice", label:"A higienização dos equipamentos é visível?", options:["Sim, sempre","Às vezes","Não percebi"] },
    { id:"sl_30", type:"choice", label:"O que te faria voltar mais vezes?", options:["Promoções","Novos serviços","Fidelidade","Horários flexíveis"] },
    { id:"sl_nps", type:"nps",  label:"De 0 a 10, o quanto nos indicaria?", defaultActive:true },
    { id:"sl_sug", type:"text", label:"Alguma sugestão ou elogio?", defaultActive:true },
  ],
  "Barbearia": [
    { id:"bb_1",  type:"stars",  label:"Como avalia o resultado do corte?", defaultActive:true },
    { id:"bb_2",  type:"stars",  label:"Como avalia o resultado da barba?", defaultActive:true },
    { id:"bb_3",  type:"stars",  label:"Como avalia a habilidade do barbeiro?", defaultActive:true },
    { id:"bb_4",  type:"stars",  label:"Como avalia o atendimento e papo?", defaultActive:true },
    { id:"bb_5",  type:"stars",  label:"Como avalia o tempo de espera?", defaultActive:true },
    { id:"bb_6",  type:"stars",  label:"Como avalia a limpeza e higiene?" },
    { id:"bb_7",  type:"stars",  label:"Como avalia o ambiente/decoração?" },
    { id:"bb_8",  type:"stars",  label:"Como avalia os produtos utilizados?" },
    { id:"bb_9",  type:"stars",  label:"Como avalia o custo-benefício?" },
    { id:"bb_10", type:"stars",  label:"Como avalia o agendamento?" },
    { id:"bb_11", type:"choice", label:"O que achou do preço?", options:["Barato","Justo","Caro"], defaultActive:true },
    { id:"bb_12", type:"choice", label:"É sua primeira visita?", options:["Sim","Não"] },
    { id:"bb_13", type:"choice", label:"Qual serviço fez?", options:["Corte","Barba","Corte + barba","Sobrancelha","Hidratação","Outro"] },
    { id:"bb_14", type:"choice", label:"O resultado ficou como pediu?", options:["Sim, perfeito","Próximo","Não"] },
    { id:"bb_15", type:"choice", label:"O horário agendado foi cumprido?", options:["Sim, pontual","Pequeno atraso","Muito atraso"] },
    { id:"bb_16", type:"choice", label:"Como nos conheceu?", options:["Indicação","Google","Instagram","Passando","Outro"] },
    { id:"bb_17", type:"choice", label:"Você voltaria?", options:["Com certeza","Talvez","Provavelmente não"] },
    { id:"bb_18", type:"choice", label:"Indicaria para amigos?", options:["Com certeza","Talvez","Não"] },
    { id:"bb_19", type:"staff",  label:"Qual barbeiro te atendeu?", options:[] },
    { id:"bb_20", type:"choice", label:"O barbeiro entendeu o que você queria?", options:["Sim, perfeitamente","Razoável","Não"] },
    { id:"bb_21", type:"choice", label:"A navalha/lâmina estava afiada/nova?", options:["Sim","Não percebi","Pareceu gasta"] },
    { id:"bb_22", type:"choice", label:"O ambiente tem boa música/clima?", options:["Sim","Razoável","Não"] },
    { id:"bb_23", type:"choice", label:"Há opções de bebidas/café enquanto aguarda?", options:["Sim","Às vezes","Não"] },
    { id:"bb_24", type:"choice", label:"Com que frequência você vem?", options:["Primeira vez","Toda semana","A cada 15 dias","Mensalmente"] },
    { id:"bb_25", type:"choice", label:"Como agendou?", options:["WhatsApp","App","Telefone","Sem agendamento"] },
    { id:"bb_26", type:"choice", label:"O que mais gostou?", options:["Resultado","Barbeiro","Ambiente","Preço","Rapidez"] },
    { id:"bb_27", type:"choice", label:"A higienização dos equipamentos é feita?", options:["Sim, sempre","Às vezes","Não percebi"] },
    { id:"bb_28", type:"choice", label:"O local aceita encaixe sem agendamento?", options:["Sim","Às vezes","Não"] },
    { id:"bb_29", type:"choice", label:"Você tem barbeiro fixo aqui?", options:["Sim","Não, qualquer um","Ainda estou escolhendo"] },
    { id:"bb_30", type:"choice", label:"O que te faria voltar mais vezes?", options:["Promoções","Fidelidade","Novos serviços","Horários flexíveis"] },
    { id:"bb_nps", type:"nps",  label:"De 0 a 10, o quanto nos indicaria?", defaultActive:true },
    { id:"bb_sug", type:"text", label:"Alguma sugestão ou elogio?", defaultActive:true },
  ],
  "Clínica Médica": [
    { id:"cm_1",  type:"stars",  label:"Como avalia o atendimento do médico?", defaultActive:true },
    { id:"cm_2",  type:"stars",  label:"Como avalia a atenção e escuta do médico?", defaultActive:true },
    { id:"cm_3",  type:"stars",  label:"Como avalia o atendimento da recepção?", defaultActive:true },
    { id:"cm_4",  type:"stars",  label:"Como avalia a clareza das explicações médicas?", defaultActive:true },
    { id:"cm_5",  type:"stars",  label:"Como avalia o tempo de espera?", defaultActive:true },
    { id:"cm_6",  type:"stars",  label:"Como avalia a limpeza e higiene?" },
    { id:"cm_7",  type:"stars",  label:"Como avalia o conforto da sala de espera?" },
    { id:"cm_8",  type:"stars",  label:"Como avalia a agilidade no agendamento?" },
    { id:"cm_9",  type:"stars",  label:"Como avalia a estrutura/equipamentos?" },
    { id:"cm_10", type:"stars",  label:"Como avalia o custo-benefício?" },
    { id:"cm_11", type:"choice", label:"O que achou do preço?", options:["Acessível","Justo","Caro"], defaultActive:true },
    { id:"cm_12", type:"choice", label:"É sua primeira consulta aqui?", options:["Sim","Não"] },
    { id:"cm_13", type:"choice", label:"O horário agendado foi cumprido?", options:["Sim, pontual","Pequeno atraso","Muito atraso"] },
    { id:"cm_14", type:"choice", label:"Como agendou?", options:["Telefone","WhatsApp","App","Plano de saúde"] },
    { id:"cm_15", type:"choice", label:"Seu plano de saúde é aceito?", options:["Sim","Paguei particular","Não aceita meu plano"] },
    { id:"cm_16", type:"choice", label:"As orientações do médico foram claras?", options:["Sim, muito","Razoável","Precisei pedir mais explicações"] },
    { id:"cm_17", type:"choice", label:"Você voltaria para uma próxima consulta?", options:["Com certeza","Talvez","Provavelmente não"] },
    { id:"cm_18", type:"choice", label:"Indicaria para amigos/família?", options:["Com certeza","Talvez","Não"] },
    { id:"cm_19", type:"staff",  label:"Com qual médico foi atendido?", options:[] },
    { id:"cm_20", type:"choice", label:"O ambiente transmite confiança e segurança?", options:["Sim","Razoável","Não"] },
    { id:"cm_21", type:"choice", label:"Como nos conheceu?", options:["Indicação","Google","Plano de saúde","Outro"] },
    { id:"cm_22", type:"choice", label:"A consulta durou tempo suficiente?", options:["Sim","Poderia ter sido mais longa","Muito curta"] },
    { id:"cm_23", type:"choice", label:"A recepção foi cordial e eficiente?", options:["Sim","Razoável","Não"] },
    { id:"cm_24", type:"choice", label:"Você conseguiu tirar todas as suas dúvidas?", options:["Sim","Maioria","Não"] },
    { id:"cm_25", type:"choice", label:"O retorno/resultado foi entregue no prazo?", options:["Sim","Com atraso","Ainda aguardo"] },
    { id:"cm_26", type:"choice", label:"A clínica tem estacionamento?", options:["Sim","Difícil","Não tem"] },
    { id:"cm_27", type:"choice", label:"O banheiro estava limpo?", options:["Sim","Razoável","Não"] },
    { id:"cm_28", type:"choice", label:"Você se sentiu bem acolhido desde a chegada?", options:["Sim","Razoável","Não"] },
    { id:"cm_29", type:"choice", label:"O que mais valoriza numa clínica?", options:["Pontualidade","Atenção do médico","Limpeza","Preço","Facilidade de agendamento"] },
    { id:"cm_30", type:"choice", label:"O que te faria recomendar?", options:["Atendimento humanizado","Preço","Pontualidade","Estrutura moderna"] },
    { id:"cm_nps", type:"nps",  label:"De 0 a 10, o quanto nos indicaria?", defaultActive:true },
    { id:"cm_sug", type:"text", label:"Alguma sugestão ou elogio?", defaultActive:true },
  ],
  "Clínica Odontológica": [
    { id:"od_1",  type:"stars",  label:"Como avalia o atendimento do dentista?", defaultActive:true },
    { id:"od_2",  type:"stars",  label:"Como avalia a habilidade/delicadeza?", defaultActive:true },
    { id:"od_3",  type:"stars",  label:"Como avalia a clareza nas explicações?", defaultActive:true },
    { id:"od_4",  type:"stars",  label:"Como avalia o atendimento da recepção?", defaultActive:true },
    { id:"od_5",  type:"stars",  label:"Como avalia o tempo de espera?", defaultActive:true },
    { id:"od_6",  type:"stars",  label:"Como avalia a limpeza e esterilização?" },
    { id:"od_7",  type:"stars",  label:"Como avalia o conforto durante o procedimento?" },
    { id:"od_8",  type:"stars",  label:"Como avalia a estrutura/equipamentos?" },
    { id:"od_9",  type:"stars",  label:"Como avalia o custo-benefício?" },
    { id:"od_10", type:"stars",  label:"Como avalia o agendamento?" },
    { id:"od_11", type:"choice", label:"O que achou do preço?", options:["Acessível","Justo","Caro"], defaultActive:true },
    { id:"od_12", type:"choice", label:"É sua primeira consulta aqui?", options:["Sim","Não"] },
    { id:"od_13", type:"choice", label:"Qual serviço fez?", options:["Limpeza","Restauração","Extração","Ortodontia","Clareamento","Implante","Outro"] },
    { id:"od_14", type:"choice", label:"O horário agendado foi cumprido?", options:["Sim, pontual","Pequeno atraso","Muito atraso"] },
    { id:"od_15", type:"choice", label:"Sentiu dor durante o procedimento?", options:["Não, sem dor","Leve","Sim, bastante"] },
    { id:"od_16", type:"choice", label:"Como nos conheceu?", options:["Indicação","Google","Instagram","Plano odontológico","Outro"] },
    { id:"od_17", type:"choice", label:"Você voltaria?", options:["Com certeza","Talvez","Provavelmente não"] },
    { id:"od_18", type:"choice", label:"Indicaria para amigos?", options:["Com certeza","Talvez","Não"] },
    { id:"od_19", type:"staff",  label:"Qual dentista te atendeu?", options:[] },
    { id:"od_20", type:"choice", label:"O dentista explicou o tratamento antes?", options:["Sim","Razoável","Não"] },
    { id:"od_21", type:"choice", label:"O ambiente transmite limpeza e confiança?", options:["Sim","Razoável","Não"] },
    { id:"od_22", type:"choice", label:"O plano odontológico é aceito?", options:["Sim","Pago particular","Não aceita o meu"] },
    { id:"od_23", type:"choice", label:"A recepção foi eficiente e simpática?", options:["Sim","Razoável","Não"] },
    { id:"od_24", type:"choice", label:"O tratamento ficou com boa aparência/resultado?", options:["Sim","Razoável","Não"] },
    { id:"od_25", type:"choice", label:"Com que frequência você vai ao dentista?", options:["A cada 6 meses","Anualmente","Só quando dói","Primeira vez"] },
    { id:"od_26", type:"choice", label:"O que mais gostou?", options:["Delicadeza","Resultado","Limpeza","Atendimento","Preço"] },
    { id:"od_27", type:"choice", label:"Você se sentiu bem acolhido(a)?", options:["Sim","Razoável","Não"] },
    { id:"od_28", type:"choice", label:"O dentista é pontual nas consultas?", options:["Sim, sempre","Às vezes atrasa","Frequentemente atrasa"] },
    { id:"od_29", type:"choice", label:"O local tem Wi-Fi/entretenimento na espera?", options:["Sim","Razoável","Não"] },
    { id:"od_30", type:"choice", label:"O que te faria recomendar?", options:["Delicadeza","Resultado","Pontualidade","Preço","Limpeza"] },
    { id:"od_nps", type:"nps",  label:"De 0 a 10, o quanto nos indicaria?", defaultActive:true },
    { id:"od_sug", type:"text", label:"Alguma sugestão ou elogio?", defaultActive:true },
  ],
  "Pet Shop": [
    { id:"pt_1",  type:"stars",  label:"Como avalia o resultado do banho/tosa?", defaultActive:true },
    { id:"pt_2",  type:"stars",  label:"Como avalia o cuidado com seu pet?", defaultActive:true },
    { id:"pt_3",  type:"stars",  label:"Como avalia o atendimento?", defaultActive:true },
    { id:"pt_4",  type:"stars",  label:"Como avalia a limpeza e higiene?", defaultActive:true },
    { id:"pt_5",  type:"stars",  label:"Como avalia o tempo de espera?", defaultActive:true },
    { id:"pt_6",  type:"stars",  label:"Como avalia os produtos disponíveis?" },
    { id:"pt_7",  type:"stars",  label:"Como avalia a variedade de ração e petiscos?" },
    { id:"pt_8",  type:"stars",  label:"Como avalia o ambiente para os animais?" },
    { id:"pt_9",  type:"stars",  label:"Como avalia o custo-benefício?" },
    { id:"pt_10", type:"stars",  label:"Como avalia o agendamento?" },
    { id:"pt_11", type:"choice", label:"O que achou do preço?", options:["Barato","Justo","Caro"], defaultActive:true },
    { id:"pt_12", type:"choice", label:"É sua primeira visita?", options:["Sim","Não"] },
    { id:"pt_13", type:"choice", label:"Qual serviço usou?", options:["Banho","Tosa","Banho e tosa","Consulta vet","Compra de produto","Outro"] },
    { id:"pt_14", type:"choice", label:"Seu pet ficou tranquilo durante o serviço?", options:["Sim","Um pouco agitado","Não sei"] },
    { id:"pt_15", type:"choice", label:"O resultado da tosa/banho ficou como esperado?", options:["Sim, ótimo","Razoável","Não"] },
    { id:"pt_16", type:"choice", label:"Como nos conheceu?", options:["Indicação","Google","Instagram","Mora perto","Outro"] },
    { id:"pt_17", type:"choice", label:"Você voltaria?", options:["Com certeza","Talvez","Provavelmente não"] },
    { id:"pt_18", type:"choice", label:"Indicaria para amigos?", options:["Com certeza","Talvez","Não"] },
    { id:"pt_19", type:"staff",  label:"Quem cuidou do seu pet?", options:[] },
    { id:"pt_20", type:"choice", label:"Você se sentiu seguro(a) deixando seu pet?", options:["Sim","Razoável","Fiquei preocupado(a)"] },
    { id:"pt_21", type:"choice", label:"O pet voltou com cheiro e aparência ótimos?", options:["Sim","Razoável","Não"] },
    { id:"pt_22", type:"choice", label:"Encontrou o produto que precisava?", options:["Sim","Maioria","Não"] },
    { id:"pt_23", type:"choice", label:"Com que frequência traz seu pet?", options:["Primeira vez","Mensalmente","A cada 2 meses","Raramente"] },
    { id:"pt_24", type:"choice", label:"O local tem serviço de táxi dog?", options:["Sim e é ótimo","Sim mas não usei","Não tem"] },
    { id:"pt_25", type:"choice", label:"O horário agendado foi cumprido?", options:["Sim","Pequeno atraso","Muito atraso"] },
    { id:"pt_26", type:"choice", label:"O que mais gostou?", options:["Cuidado com o pet","Resultado","Preço","Atendimento","Variedade"] },
    { id:"pt_27", type:"choice", label:"Qual animal tem?", options:["Cachorro","Gato","Ave","Roedor","Outro"] },
    { id:"pt_28", type:"choice", label:"O espaço é adequado para o porte do seu animal?", options:["Sim","Razoável","Não"] },
    { id:"pt_29", type:"choice", label:"O profissional demonstra amor pelos animais?", options:["Sim, claramente","Razoável","Não percebi"] },
    { id:"pt_30", type:"choice", label:"O que te faria vir mais vezes?", options:["Promoções","Pacotes","Agendamento mais fácil","Horários amplos"] },
    { id:"pt_nps", type:"nps",  label:"De 0 a 10, o quanto nos indicaria?", defaultActive:true },
    { id:"pt_sug", type:"text", label:"Alguma sugestão ou elogio?", defaultActive:true },
  ],
  "Farmácia": [
    { id:"fm_1",  type:"stars",  label:"Como avalia o atendimento?", defaultActive:true },
    { id:"fm_2",  type:"stars",  label:"Como avalia a disponibilidade dos produtos?", defaultActive:true },
    { id:"fm_3",  type:"stars",  label:"Como avalia a agilidade no atendimento?", defaultActive:true },
    { id:"fm_4",  type:"stars",  label:"Como avalia o conhecimento dos atendentes?", defaultActive:true },
    { id:"fm_5",  type:"stars",  label:"Como avalia a limpeza e organização?", defaultActive:true },
    { id:"fm_6",  type:"stars",  label:"Como avalia o preço dos produtos?" },
    { id:"fm_7",  type:"stars",  label:"Como avalia a variedade de produtos?" },
    { id:"fm_8",  type:"stars",  label:"Como avalia o conforto da loja?" },
    { id:"fm_9",  type:"stars",  label:"Como avalia o serviço de entrega (se usou)?" },
    { id:"fm_10", type:"stars",  label:"Como avalia o custo-benefício geral?" },
    { id:"fm_11", type:"choice", label:"O que achou do preço?", options:["Barato","Justo","Caro"], defaultActive:true },
    { id:"fm_12", type:"choice", label:"É sua primeira visita?", options:["Sim","Não"] },
    { id:"fm_13", type:"choice", label:"O que veio buscar?", options:["Medicamento","Produto de beleza","Vitamina","Higiene","Outro"] },
    { id:"fm_14", type:"choice", label:"Encontrou o que precisava?", options:["Sim, tudo","Maioria","Não encontrei"] },
    { id:"fm_15", type:"choice", label:"O atendente ajudou bem?", options:["Sim, muito","Razoável","Não precisei de ajuda"] },
    { id:"fm_16", type:"choice", label:"Recebeu orientação sobre o medicamento?", options:["Sim","Parcial","Não"] },
    { id:"fm_17", type:"choice", label:"O tempo de espera no caixa foi:", options:["Rápido","Razoável","Demorado"] },
    { id:"fm_18", type:"choice", label:"Como nos conheceu?", options:["Mora perto","Indicação","Google","Outro"] },
    { id:"fm_19", type:"choice", label:"Você voltaria?", options:["Com certeza","Talvez","Provavelmente não"] },
    { id:"fm_20", type:"choice", label:"Indicaria para amigos?", options:["Com certeza","Talvez","Não"] },
    { id:"fm_21", type:"staff",  label:"Quem te atendeu?", options:[] },
    { id:"fm_22", type:"choice", label:"O atendimento foi discreto e respeitoso?", options:["Sim","Razoável","Não"] },
    { id:"fm_23", type:"choice", label:"A farmácia tem aferição de pressão/glicemia?", options:["Sim e é bom","Sim mas demora","Não tem"] },
    { id:"fm_24", type:"choice", label:"Aceita delivery?", options:["Sim e funciona bem","Sim mas demora","Não"] },
    { id:"fm_25", type:"choice", label:"O que mais gostou?", options:["Atendimento","Preço","Disponibilidade","Localização","Rapidez"] },
    { id:"fm_26", type:"choice", label:"Com que frequência você compra aqui?", options:["Primeira vez","Raramente","Mensalmente","Frequentemente"] },
    { id:"fm_27", type:"choice", label:"Há estacionamento fácil?", options:["Sim","Difícil","Não tem"] },
    { id:"fm_28", type:"choice", label:"O local aceita convênios/farmácias populares?", options:["Sim","Não sei","Não"] },
    { id:"fm_29", type:"choice", label:"A vitrine/exposição de produtos estava boa?", options:["Sim","Razoável","Não"] },
    { id:"fm_30", type:"choice", label:"O que te faria preferir esta farmácia?", options:["Preço menor","Mais variedade","Entrega rápida","Atendimento melhor"] },
    { id:"fm_nps", type:"nps",  label:"De 0 a 10, o quanto nos indicaria?", defaultActive:true },
    { id:"fm_sug", type:"text", label:"Alguma sugestão ou elogio?", defaultActive:true },
  ],
  "Academia": [
    { id:"ac_1",  type:"stars",  label:"Como avalia a qualidade dos equipamentos?", defaultActive:true },
    { id:"ac_2",  type:"stars",  label:"Como avalia a limpeza da academia?", defaultActive:true },
    { id:"ac_3",  type:"stars",  label:"Como avalia os vestiários?", defaultActive:true },
    { id:"ac_4",  type:"stars",  label:"Como avalia o atendimento da equipe?", defaultActive:true },
    { id:"ac_5",  type:"stars",  label:"Como avalia os professores/personal?", defaultActive:true },
    { id:"ac_6",  type:"stars",  label:"Como avalia as aulas coletivas?" },
    { id:"ac_7",  type:"stars",  label:"Como avalia o ambiente/climatização?" },
    { id:"ac_8",  type:"stars",  label:"Como avalia a variedade de equipamentos?" },
    { id:"ac_9",  type:"stars",  label:"Como avalia o custo-benefício?" },
    { id:"ac_10", type:"stars",  label:"Como avalia a musculação/zona de peso?" },
    { id:"ac_11", type:"choice", label:"O que achou do preço da mensalidade?", options:["Barato","Justo","Caro"], defaultActive:true },
    { id:"ac_12", type:"choice", label:"Há quanto tempo é aluno?", options:["Hoje é meu primeiro dia","Menos de 3 meses","3 a 12 meses","Mais de 1 ano"] },
    { id:"ac_13", type:"choice", label:"Qual período você costuma treinar?", options:["Manhã","Tarde","Noite"] },
    { id:"ac_14", type:"choice", label:"Os equipamentos estavam disponíveis quando precisou?", options:["Sim, todos","Maioria","Fila grande"] },
    { id:"ac_15", type:"choice", label:"As aulas coletivas são variadas o suficiente?", options:["Sim","Podia ter mais opções","Não faço coletivas"] },
    { id:"ac_16", type:"choice", label:"O professor acompanha o treino individualmente?", options:["Sim, sempre","Às vezes","Não"] },
    { id:"ac_17", type:"choice", label:"Como nos conheceu?", options:["Indicação","Google","Instagram","Mora perto","Outro"] },
    { id:"ac_18", type:"choice", label:"Você indicaria para amigos?", options:["Com certeza","Talvez","Não"] },
    { id:"ac_19", type:"staff",  label:"Qual professor te atende?", options:[] },
    { id:"ac_20", type:"choice", label:"O app/sistema de agendamento funciona bem?", options:["Sim","Razoável","Não tem"] },
    { id:"ac_21", type:"choice", label:"A academia tem estacionamento?", options:["Sim","Difícil","Não tem"] },
    { id:"ac_22", type:"choice", label:"O que mais valoriza?", options:["Equipamentos","Limpeza","Professores","Preço","Localização"] },
    { id:"ac_23", type:"choice", label:"A academia tem nutricionista?", options:["Sim e é ótimo","Tem mas não uso","Não tem"] },
    { id:"ac_24", type:"choice", label:"Há bebedouro e área de descanso?", options:["Sim, bom","Razoável","Não tem"] },
    { id:"ac_25", type:"choice", label:"O ambiente te motiva a treinar?", options:["Sim, muito","Razoável","Não muito"] },
    { id:"ac_26", type:"choice", label:"Você voltaria a renovar a matrícula?", options:["Com certeza","Talvez","Provavelmente não"] },
    { id:"ac_27", type:"choice", label:"O cadastro/matrícula foi fácil?", options:["Sim","Razoável","Complicado"] },
    { id:"ac_28", type:"choice", label:"Os horários de funcionamento atendem sua rotina?", options:["Sim","Podia ser mais amplo","Não"] },
    { id:"ac_29", type:"choice", label:"A limpeza dos equipamentos após uso é respeitada?", options:["Sim, todos limpam","Maioria","Raramente"] },
    { id:"ac_30", type:"choice", label:"O que te faria indicar?", options:["Preço","Professores","Equipamentos","Limpeza","Ambiente"] },
    { id:"ac_nps", type:"nps",  label:"De 0 a 10, o quanto nos indicaria?", defaultActive:true },
    { id:"ac_sug", type:"text", label:"Alguma sugestão ou elogio?", defaultActive:true },
  ],
  "Posto de Gasolina": [
    { id:"pg_1",  type:"stars",  label:"Como avalia o atendimento dos frentistas?", defaultActive:true },
    { id:"pg_2",  type:"stars",  label:"Como avalia a agilidade no abastecimento?", defaultActive:true },
    { id:"pg_3",  type:"stars",  label:"Como avalia a limpeza do posto?", defaultActive:true },
    { id:"pg_4",  type:"stars",  label:"Como avalia a limpeza dos banheiros?", defaultActive:true },
    { id:"pg_5",  type:"stars",  label:"Como avalia a conveniência (loja)?", defaultActive:true },
    { id:"pg_6",  type:"stars",  label:"Como avalia os produtos da loja?" },
    { id:"pg_7",  type:"stars",  label:"Como avalia o preço do combustível?" },
    { id:"pg_8",  type:"stars",  label:"Como avalia a segurança do local?" },
    { id:"pg_9",  type:"stars",  label:"Como avalia o serviço de lavagem (se usou)?" },
    { id:"pg_10", type:"stars",  label:"Como avalia o custo-benefício geral?" },
    { id:"pg_11", type:"choice", label:"O que achou do preço do combustível?", options:["Barato","Justo","Caro"], defaultActive:true },
    { id:"pg_12", type:"choice", label:"É sua primeira visita?", options:["Sim","Não"] },
    { id:"pg_13", type:"choice", label:"Qual combustível abasteceu?", options:["Gasolina comum","Gasolina aditivada","Etanol","Diesel","Elétrico"] },
    { id:"pg_14", type:"choice", label:"O frentista calibrou os pneus?", options:["Sim, pedi e fez bem","Sim mas sem cuidado","Não pedi"] },
    { id:"pg_15", type:"choice", label:"Usou a loja de conveniência?", options:["Sim","Não desta vez"] },
    { id:"pg_16", type:"choice", label:"O banheiro estava limpo?", options:["Sim","Razoável","Não"] },
    { id:"pg_17", type:"choice", label:"O frentista perguntou sobre o nível do óleo?", options:["Sim","Não"] },
    { id:"pg_18", type:"choice", label:"Você voltaria?", options:["Com certeza","Talvez","Provavelmente não"] },
    { id:"pg_19", type:"staff",  label:"Quem te atendeu?", options:[] },
    { id:"pg_20", type:"choice", label:"Indicaria para amigos?", options:["Com certeza","Talvez","Não"] },
    { id:"pg_21", type:"choice", label:"Como nos conheceu?", options:["Mora perto","Indicação","Google","Passando","Outro"] },
    { id:"pg_22", type:"choice", label:"O atendimento foi educado e cuidadoso?", options:["Sim","Razoável","Não"] },
    { id:"pg_23", type:"choice", label:"O marcador de combustível foi zerado corretamente?", options:["Sim","Não prestei atenção","Não"] },
    { id:"pg_24", type:"choice", label:"Há serviço de lavagem de carro?", options:["Sim e é bom","Sim mas demorado","Não tem"] },
    { id:"pg_25", type:"choice", label:"O que mais gostou?", options:["Atendimento","Preço","Limpeza","Agilidade","Conveniência"] },
    { id:"pg_26", type:"choice", label:"Com que frequência abastece aqui?", options:["Primeira vez","Semanalmente","Sempre que passo","Raramente"] },
    { id:"pg_27", type:"choice", label:"A loja de conveniência tem bons produtos?", options:["Sim","Razoável","Poucas opções"] },
    { id:"pg_28", type:"choice", label:"O posto tem horário 24h?", options:["Sim","Não sei","Não"] },
    { id:"pg_29", type:"choice", label:"O estacionamento/acesso é fácil?", options:["Sim","Razoável","Difícil"] },
    { id:"pg_30", type:"choice", label:"O que te faria preferir este posto?", options:["Preço menor","Melhor atendimento","Programa de pontos","Loja melhor"] },
    { id:"pg_nps", type:"nps",  label:"De 0 a 10, o quanto nos indicaria?", defaultActive:true },
    { id:"pg_sug", type:"text", label:"Alguma sugestão ou elogio?", defaultActive:true },
  ],
  "Imobiliária": [
    { id:"im_1",  type:"stars",  label:"Como avalia o atendimento do corretor?", defaultActive:true },
    { id:"im_2",  type:"stars",  label:"Como avalia o conhecimento do corretor?", defaultActive:true },
    { id:"im_3",  type:"stars",  label:"Como avalia as opções de imóveis apresentadas?", defaultActive:true },
    { id:"im_4",  type:"stars",  label:"Como avalia a agilidade no processo?", defaultActive:true },
    { id:"im_5",  type:"stars",  label:"Como avalia a transparência nas informações?", defaultActive:true },
    { id:"im_6",  type:"stars",  label:"Como avalia o suporte na documentação?" },
    { id:"im_7",  type:"stars",  label:"Como avalia a comunicação durante o processo?" },
    { id:"im_8",  type:"stars",  label:"Como avalia o pós-venda/acompanhamento?" },
    { id:"im_9",  type:"stars",  label:"Como avalia o custo-benefício da comissão?" },
    { id:"im_10", type:"stars",  label:"Como avalia a experiência geral?" },
    { id:"im_11", type:"choice", label:"O que achou dos honorários/comissão?", options:["Justo","Um pouco alto","Caro"], defaultActive:true },
    { id:"im_12", type:"choice", label:"É sua primeira experiência com esta imobiliária?", options:["Sim","Não"] },
    { id:"im_13", type:"choice", label:"Qual o motivo do atendimento?", options:["Compra","Venda","Aluguel","Avaliação de imóvel"] },
    { id:"im_14", type:"choice", label:"O corretor entendeu bem o que você buscava?", options:["Sim, perfeitamente","Razoável","Não"] },
    { id:"im_15", type:"choice", label:"As opções apresentadas estavam dentro do seu perfil?", options:["Sim, todas","Algumas","Não"] },
    { id:"im_16", type:"choice", label:"Como nos conheceu?", options:["Indicação","Google","Instagram","Placa de imóvel","Outro"] },
    { id:"im_17", type:"choice", label:"Você voltaria?", options:["Com certeza","Talvez","Provavelmente não"] },
    { id:"im_18", type:"choice", label:"Indicaria para amigos?", options:["Com certeza","Talvez","Não"] },
    { id:"im_19", type:"staff",  label:"Qual corretor te atendeu?", options:[] },
    { id:"im_20", type:"choice", label:"O processo de documentação foi claro?", options:["Sim","Razoável","Muito confuso"] },
    { id:"im_21", type:"choice", label:"O corretor retornou suas mensagens com agilidade?", options:["Sim, sempre","Às vezes","Demorava muito"] },
    { id:"im_22", type:"choice", label:"Houve alguma surpresa negativa no processo?", options:["Não","Custo extra inesperado","Prazo não cumprido","Outro"] },
    { id:"im_23", type:"choice", label:"O negócio foi fechado?", options:["Sim","Ainda em andamento","Não desta vez"] },
    { id:"im_24", type:"choice", label:"Você se sentiu pressionado a fechar?", options:["Não","Um pouco","Sim"] },
    { id:"im_25", type:"choice", label:"O que mais valoriza num corretor?", options:["Honestidade","Agilidade","Conhecimento","Comunicação","Preço"] },
    { id:"im_26", type:"choice", label:"O site/app da imobiliária é fácil de usar?", options:["Sim","Razoável","Não uso"] },
    { id:"im_27", type:"choice", label:"O imóvel estava conforme descrito?", options:["Sim","Pequenas diferenças","Muito diferente"] },
    { id:"im_28", type:"choice", label:"O processo levou quanto tempo?", options:["Rápido (menos de 1 mês)","Médio (1–3 meses)","Longo (mais de 3 meses)"] },
    { id:"im_29", type:"choice", label:"Recebeu suporte após o fechamento?", options:["Sim","Parcial","Não"] },
    { id:"im_30", type:"choice", label:"O que te faria recomendar esta imobiliária?", options:["Honestidade","Preço justo","Processo rápido","Boas opções"] },
    { id:"im_nps", type:"nps",  label:"De 0 a 10, o quanto nos indicaria?", defaultActive:true },
    { id:"im_sug", type:"text", label:"Alguma sugestão ou elogio?", defaultActive:true },
  ],
  "Hotel": [
    { id:"ht_1",  type:"stars",  label:"Como avalia o conforto do quarto?", defaultActive:true },
    { id:"ht_2",  type:"stars",  label:"Como avalia a limpeza do quarto?", defaultActive:true },
    { id:"ht_3",  type:"stars",  label:"Como avalia a limpeza das áreas comuns?", defaultActive:true },
    { id:"ht_4",  type:"stars",  label:"Como avalia o atendimento da recepção?", defaultActive:true },
    { id:"ht_5",  type:"stars",  label:"Como avalia o check-in/check-out?", defaultActive:true },
    { id:"ht_6",  type:"stars",  label:"Como avalia o café da manhã?" },
    { id:"ht_7",  type:"stars",  label:"Como avalia a cama e roupa de cama?" },
    { id:"ht_8",  type:"stars",  label:"Como avalia o Wi-Fi?" },
    { id:"ht_9",  type:"stars",  label:"Como avalia o custo-benefício?" },
    { id:"ht_10", type:"stars",  label:"Como avalia a localização?" },
    { id:"ht_11", type:"choice", label:"O que achou do preço da diária?", options:["Barato","Justo","Caro"], defaultActive:true },
    { id:"ht_12", type:"choice", label:"É sua primeira estadia aqui?", options:["Sim","Não"] },
    { id:"ht_13", type:"choice", label:"Qual o motivo da sua viagem?", options:["Turismo","Negócios","Evento","Família","Lua de mel"] },
    { id:"ht_14", type:"choice", label:"Quantas noites ficou?", options:["1 noite","2 a 3 noites","4 a 7 noites","Mais de 1 semana"] },
    { id:"ht_15", type:"choice", label:"O check-in foi ágil?", options:["Sim","Razoável","Demorado"] },
    { id:"ht_16", type:"choice", label:"O quarto estava limpo na chegada?", options:["Sim, perfeito","Razoável","Não"] },
    { id:"ht_17", type:"choice", label:"O Wi-Fi funcionou bem?", options:["Sim","Razoável","Muito lento"] },
    { id:"ht_18", type:"choice", label:"Como nos conheceu?", options:["Booking","Google","Indicação","Instagram","Outro"] },
    { id:"ht_19", type:"choice", label:"Você voltaria?", options:["Com certeza","Talvez","Provavelmente não"] },
    { id:"ht_20", type:"choice", label:"Indicaria para amigos?", options:["Com certeza","Talvez","Não"] },
    { id:"ht_21", type:"choice", label:"O café da manhã foi satisfatório?", options:["Sim, ótimo","Razoável","Não incluído"] },
    { id:"ht_22", type:"choice", label:"A climatização (AC/ventilador) funcionou bem?", options:["Sim","Razoável","Não"] },
    { id:"ht_23", type:"choice", label:"O barulho externo/corredor incomodou?", options:["Não","Um pouco","Sim, muito"] },
    { id:"ht_24", type:"staff",  label:"Quem fez seu check-in?", options:[] },
    { id:"ht_25", type:"choice", label:"A piscina/área de lazer estava em boas condições?", options:["Sim","Razoável","Não tem"] },
    { id:"ht_26", type:"choice", label:"O estacionamento foi adequado?", options:["Sim","Podia melhorar","Não tem"] },
    { id:"ht_27", type:"choice", label:"O que mais gostou?", options:["Conforto","Limpeza","Localização","Atendimento","Café"] },
    { id:"ht_28", type:"choice", label:"O banheiro do quarto estava em boas condições?", options:["Sim","Razoável","Não"] },
    { id:"ht_29", type:"choice", label:"Algum pedido especial foi atendido?", options:["Sim, perfeitamente","Parcialmente","Não fiz pedidos"] },
    { id:"ht_30", type:"choice", label:"O que te faria voltar?", options:["Preço melhor","Mais comodidades","Excelente localização","Ótimo atendimento"] },
    { id:"ht_nps", type:"nps",  label:"De 0 a 10, o quanto nos indicaria?", defaultActive:true },
    { id:"ht_sug", type:"text", label:"Alguma sugestão ou elogio?", defaultActive:true },
  ],
  "Supermercado": [
    { id:"sm_1",  type:"stars",  label:"Como avalia o atendimento?", defaultActive:true },
    { id:"sm_2",  type:"stars",  label:"Como avalia a variedade de produtos?", defaultActive:true },
    { id:"sm_3",  type:"stars",  label:"Como avalia a organização das prateleiras?", defaultActive:true },
    { id:"sm_4",  type:"stars",  label:"Como avalia a limpeza?", defaultActive:true },
    { id:"sm_5",  type:"stars",  label:"Como avalia a agilidade nos caixas?", defaultActive:true },
    { id:"sm_6",  type:"stars",  label:"Como avalia o setor de hortifrúti?" },
    { id:"sm_7",  type:"stars",  label:"Como avalia o setor de açougue/peixaria?" },
    { id:"sm_8",  type:"stars",  label:"Como avalia o setor de padaria/frios?" },
    { id:"sm_9",  type:"stars",  label:"Como avalia o preço dos produtos?" },
    { id:"sm_10", type:"stars",  label:"Como avalia o custo-benefício geral?" },
    { id:"sm_11", type:"choice", label:"O que achou do preço?", options:["Barato","Justo","Caro"], defaultActive:true },
    { id:"sm_12", type:"choice", label:"É sua primeira visita?", options:["Sim","Não"] },
    { id:"sm_13", type:"choice", label:"Encontrou tudo o que precisava?", options:["Sim","Maioria","Não"] },
    { id:"sm_14", type:"choice", label:"A fila do caixa foi:", options:["Rápida","Razoável","Demorada"] },
    { id:"sm_15", type:"choice", label:"Com que frequência você compra aqui?", options:["Primeira vez","Semanalmente","Todo dia","Raramente"] },
    { id:"sm_16", type:"choice", label:"Como nos conheceu?", options:["Mora perto","Indicação","Google","Panfleto","Outro"] },
    { id:"sm_17", type:"choice", label:"Algum produto estava fora do prazo ou estragado?", options:["Não","Sim"] },
    { id:"sm_18", type:"choice", label:"Os funcionários estavam disponíveis para ajudar?", options:["Sim","Maioria","Difícil achar alguém"] },
    { id:"sm_19", type:"choice", label:"Você voltaria?", options:["Com certeza","Talvez","Provavelmente não"] },
    { id:"sm_20", type:"choice", label:"O estacionamento é fácil?", options:["Sim","Difícil","Não tem"] },
    { id:"sm_21", type:"staff",  label:"Quem te atendeu no caixa?", options:[] },
    { id:"sm_22", type:"choice", label:"Os preços estavam bem sinalizados?", options:["Sim","Maioria","Não"] },
    { id:"sm_23", type:"choice", label:"Indicaria para amigos?", options:["Com certeza","Talvez","Não"] },
    { id:"sm_24", type:"choice", label:"O que mais gostou?", options:["Preço","Variedade","Limpeza","Localização","Atendimento"] },
    { id:"sm_25", type:"choice", label:"Faltou algum produto que procurou?", options:["Não","Sim, frequentemente","Às vezes"] },
    { id:"sm_26", type:"choice", label:"O delivery/compra online funciona bem?", options:["Sim","Razoável","Não tem"] },
    { id:"sm_27", type:"choice", label:"Há programa de fidelidade/pontos?", options:["Sim e uso","Sim mas não uso","Não tem"] },
    { id:"sm_28", type:"choice", label:"O horário de funcionamento atende sua rotina?", options:["Sim","Precisava de mais horas","Fecha cedo"] },
    { id:"sm_29", type:"choice", label:"A sinalização interna dos setores é clara?", options:["Sim","Razoável","Me perco fácil"] },
    { id:"sm_30", type:"choice", label:"O que te faria preferir este supermercado?", options:["Preço menor","Mais variedade","Caixa mais rápido","Delivery"] },
    { id:"sm_nps", type:"nps",  label:"De 0 a 10, o quanto nos indicaria?", defaultActive:true },
    { id:"sm_sug", type:"text", label:"Alguma sugestão ou elogio?", defaultActive:true },
  ],
  "Confeitaria": [
    { id:"ct_1",  type:"stars",  label:"Como avalia a qualidade dos bolos/doces?", defaultActive:true },
    { id:"ct_2",  type:"stars",  label:"Como avalia o sabor dos produtos?", defaultActive:true },
    { id:"ct_3",  type:"stars",  label:"Como avalia a apresentação/decoração dos bolos?", defaultActive:true },
    { id:"ct_4",  type:"stars",  label:"Como avalia a variedade de produtos?", defaultActive:true },
    { id:"ct_5",  type:"stars",  label:"Como avalia o atendimento?", defaultActive:true },
    { id:"ct_6",  type:"stars",  label:"Como avalia a agilidade no atendimento?" },
    { id:"ct_7",  type:"stars",  label:"Como avalia a limpeza e higiene?" },
    { id:"ct_8",  type:"stars",  label:"Como avalia o ambiente?" },
    { id:"ct_9",  type:"stars",  label:"Como avalia a frescura/qualidade dos ingredientes?" },
    { id:"ct_10", type:"stars",  label:"Como avalia o custo-benefício?" },
    { id:"ct_11", type:"choice", label:"O que achou do preço?", options:["Barato","Justo","Caro"], defaultActive:true },
    { id:"ct_12", type:"choice", label:"É sua primeira visita?", options:["Sim","Não"] },
    { id:"ct_13", type:"choice", label:"O que comprou?", options:["Bolo personalizado","Doces finos","Bem-casados","Cupcakes","Brigadeiros","Outro"] },
    { id:"ct_14", type:"choice", label:"Qual a ocasião?", options:["Aniversário","Casamento","Chá de bebê","Confraternização","Consumo próprio","Outro"] },
    { id:"ct_15", type:"choice", label:"O produto ficou como pedido?", options:["Sim, perfeito","Próximo do esperado","Não"] },
    { id:"ct_16", type:"choice", label:"A entrega foi no prazo?", options:["Sim","Com pequeno atraso","Com muito atraso","Retirei no local"] },
    { id:"ct_17", type:"choice", label:"Como nos conheceu?", options:["Indicação","Instagram","Google","Outro"] },
    { id:"ct_18", type:"choice", label:"Você voltaria?", options:["Com certeza","Talvez","Provavelmente não"] },
    { id:"ct_19", type:"choice", label:"Indicaria para amigos?", options:["Com certeza","Talvez","Não"] },
    { id:"ct_20", type:"staff",  label:"Quem te atendeu?", options:[] },
    { id:"ct_21", type:"choice", label:"A embalagem protegeu bem o produto?", options:["Sim","Razoável","Não"] },
    { id:"ct_22", type:"choice", label:"O produto tem opções sem glúten/lactose?", options:["Sim","Poucas","Não"] },
    { id:"ct_23", type:"choice", label:"O prazo de entrega informado foi cumprido?", options:["Sim","Quase","Não"] },
    { id:"ct_24", type:"choice", label:"O tamanho/quantidade foi adequado?", options:["Sim","Podia ser maior","Excessivo"] },
    { id:"ct_25", type:"choice", label:"A precificação foi transparente?", options:["Sim","Razoável","Ficou confuso"] },
    { id:"ct_26", type:"choice", label:"Aceitaria encomenda de novo?", options:["Sim, com certeza","Talvez","Não"] },
    { id:"ct_27", type:"choice", label:"Qual canal usou para encomendar?", options:["WhatsApp","Instagram","Pessoalmente","Site","Outro"] },
    { id:"ct_28", type:"choice", label:"O que mais gostou?", options:["Sabor","Decoração","Apresentação","Preço","Atendimento"] },
    { id:"ct_29", type:"choice", label:"Há variedade de opções sem açúcar?", options:["Sim","Poucas","Não"] },
    { id:"ct_30", type:"choice", label:"O que te faria encomendar mais vezes?", options:["Promoções","Novidades","Prazo menor","Mais sabores"] },
    { id:"ct_nps", type:"nps",  label:"De 0 a 10, o quanto nos indicaria?", defaultActive:true },
    { id:"ct_sug", type:"text", label:"Alguma sugestão ou elogio?", defaultActive:true },
  ],
  "Spa / Estética": [
    { id:"sp_1",  type:"stars",  label:"Como avalia o resultado do serviço?", defaultActive:true },
    { id:"sp_2",  type:"stars",  label:"Como avalia a habilidade do profissional?", defaultActive:true },
    { id:"sp_3",  type:"stars",  label:"Como avalia o relaxamento/bem-estar gerado?", defaultActive:true },
    { id:"sp_4",  type:"stars",  label:"Como avalia o atendimento?", defaultActive:true },
    { id:"sp_5",  type:"stars",  label:"Como avalia a limpeza e higiene?", defaultActive:true },
    { id:"sp_6",  type:"stars",  label:"Como avalia o ambiente/decoração?" },
    { id:"sp_7",  type:"stars",  label:"Como avalia os produtos utilizados?" },
    { id:"sp_8",  type:"stars",  label:"Como avalia o conforto durante o serviço?" },
    { id:"sp_9",  type:"stars",  label:"Como avalia o custo-benefício?" },
    { id:"sp_10", type:"stars",  label:"Como avalia o agendamento?" },
    { id:"sp_11", type:"choice", label:"O que achou do preço?", options:["Barato","Justo","Caro"], defaultActive:true },
    { id:"sp_12", type:"choice", label:"É sua primeira visita?", options:["Sim","Não"] },
    { id:"sp_13", type:"choice", label:"Qual serviço fez?", options:["Massagem","Drenagem","Depilação","Facial","Manicure/Pedicure","Outro"] },
    { id:"sp_14", type:"choice", label:"O resultado ficou como esperado?", options:["Sim, perfeito","Próximo","Não"] },
    { id:"sp_15", type:"choice", label:"O horário agendado foi cumprido?", options:["Sim, pontual","Pequeno atraso","Muito atraso"] },
    { id:"sp_16", type:"choice", label:"Como nos conheceu?", options:["Indicação","Google","Instagram","Outro"] },
    { id:"sp_17", type:"choice", label:"Você voltaria?", options:["Com certeza","Talvez","Provavelmente não"] },
    { id:"sp_18", type:"choice", label:"Indicaria para amigos?", options:["Com certeza","Talvez","Não"] },
    { id:"sp_19", type:"staff",  label:"Quem te atendeu?", options:[] },
    { id:"sp_20", type:"choice", label:"O profissional escutou bem o que você queria?", options:["Sim, muito bem","Razoável","Não"] },
    { id:"sp_21", type:"choice", label:"O ambiente é silencioso e relaxante?", options:["Sim","Razoável","Muito barulhento"] },
    { id:"sp_22", type:"choice", label:"A temperatura do local estava agradável?", options:["Sim","Muito quente","Muito frio"] },
    { id:"sp_23", type:"choice", label:"Como agendou?", options:["WhatsApp","App","Telefone","Pessoalmente"] },
    { id:"sp_24", type:"choice", label:"Com que frequência você vem?", options:["Primeira vez","Mensalmente","A cada 2 meses","Raramente"] },
    { id:"sp_25", type:"choice", label:"O local tem estacionamento?", options:["Sim","Difícil","Não tem"] },
    { id:"sp_26", type:"choice", label:"Há opções de pacotes/combos?", options:["Sim e são bons","Sim mas podia melhorar","Não tem"] },
    { id:"sp_27", type:"choice", label:"Os produtos usados causaram alguma reação?", options:["Não","Leve irritação","Sim"] },
    { id:"sp_28", type:"choice", label:"O que mais gostou?", options:["Resultado","Profissional","Ambiente","Preço","Relaxamento"] },
    { id:"sp_29", type:"choice", label:"A higienização dos equipamentos é visível?", options:["Sim, sempre","Às vezes","Não percebi"] },
    { id:"sp_30", type:"choice", label:"O que te faria voltar mais vezes?", options:["Promoções","Pacotes","Novos serviços","Horários flexíveis"] },
    { id:"sp_nps", type:"nps",  label:"De 0 a 10, o quanto nos indicaria?", defaultActive:true },
    { id:"sp_sug", type:"text", label:"Alguma sugestão ou elogio?", defaultActive:true },
  ],
  "Pousada": [
    { id:"po_1",  type:"stars",  label:"Como avalia o conforto do quarto?", defaultActive:true },
    { id:"po_2",  type:"stars",  label:"Como avalia a limpeza?", defaultActive:true },
    { id:"po_3",  type:"stars",  label:"Como avalia o atendimento?", defaultActive:true },
    { id:"po_4",  type:"stars",  label:"Como avalia o café da manhã?", defaultActive:true },
    { id:"po_5",  type:"stars",  label:"Como avalia o custo-benefício?", defaultActive:true },
    { id:"po_6",  type:"stars",  label:"Como avalia a localização?" },
    { id:"po_7",  type:"stars",  label:"Como avalia a área de lazer/piscina?" },
    { id:"po_8",  type:"stars",  label:"Como avalia o Wi-Fi?" },
    { id:"po_9",  type:"stars",  label:"Como avalia a segurança?" },
    { id:"po_10", type:"stars",  label:"Como avalia o check-in/check-out?" },
    { id:"po_11", type:"choice", label:"O que achou do preço da diária?", options:["Barato","Justo","Caro"], defaultActive:true },
    { id:"po_12", type:"choice", label:"É sua primeira estadia aqui?", options:["Sim","Não"] },
    { id:"po_13", type:"choice", label:"Qual o motivo da viagem?", options:["Férias","Final de semana","Lua de mel","Evento","Negócios"] },
    { id:"po_14", type:"choice", label:"Quantas noites ficou?", options:["1 noite","2 a 3 noites","4 a 7 noites","Mais de 1 semana"] },
    { id:"po_15", type:"choice", label:"O quarto estava limpo na chegada?", options:["Sim, perfeito","Razoável","Não"] },
    { id:"po_16", type:"choice", label:"O café da manhã foi satisfatório?", options:["Sim, ótimo","Razoável","Não incluído"] },
    { id:"po_17", type:"choice", label:"O Wi-Fi funcionou bem?", options:["Sim","Razoável","Muito lento"] },
    { id:"po_18", type:"choice", label:"Como nos conheceu?", options:["Booking","Google","Indicação","Instagram","Outro"] },
    { id:"po_19", type:"choice", label:"Você voltaria?", options:["Com certeza","Talvez","Provavelmente não"] },
    { id:"po_20", type:"choice", label:"Indicaria para amigos?", options:["Com certeza","Talvez","Não"] },
    { id:"po_21", type:"staff",  label:"Quem fez seu check-in?", options:[] },
    { id:"po_22", type:"choice", label:"A climatização funcionou bem?", options:["Sim","Razoável","Não"] },
    { id:"po_23", type:"choice", label:"O barulho externo incomodou?", options:["Não","Um pouco","Sim, muito"] },
    { id:"po_24", type:"choice", label:"A piscina/área de lazer estava boa?", options:["Sim","Razoável","Não tem"] },
    { id:"po_25", type:"choice", label:"O estacionamento foi adequado?", options:["Sim","Podia melhorar","Não tem"] },
    { id:"po_26", type:"choice", label:"Com quem você veio?", options:["Sozinho","Casal","Família","Amigos"] },
    { id:"po_27", type:"choice", label:"A pousada é pet friendly?", options:["Sim e é ótimo","Sim mas limitado","Não aceita pets"] },
    { id:"po_28", type:"choice", label:"O que mais gostou?", options:["Conforto","Limpeza","Localização","Atendimento","Café da manhã"] },
    { id:"po_29", type:"choice", label:"Algum pedido especial foi atendido?", options:["Sim, perfeitamente","Parcialmente","Não fiz pedidos"] },
    { id:"po_30", type:"choice", label:"O que te faria voltar?", options:["Preço melhor","Mais comodidades","Ótima localização","Excelente atendimento"] },
    { id:"po_nps", type:"nps",  label:"De 0 a 10, o quanto nos indicaria?", defaultActive:true },
    { id:"po_sug", type:"text", label:"Alguma sugestão ou elogio?", defaultActive:true },
  ],
  "Hostel": [
    { id:"hs_1",  type:"stars",  label:"Como avalia o conforto da cama/quarto?", defaultActive:true },
    { id:"hs_2",  type:"stars",  label:"Como avalia a limpeza?", defaultActive:true },
    { id:"hs_3",  type:"stars",  label:"Como avalia o atendimento da recepção?", defaultActive:true },
    { id:"hs_4",  type:"stars",  label:"Como avalia o custo-benefício?", defaultActive:true },
    { id:"hs_5",  type:"stars",  label:"Como avalia a localização?", defaultActive:true },
    { id:"hs_6",  type:"stars",  label:"Como avalia o Wi-Fi?" },
    { id:"hs_7",  type:"stars",  label:"Como avalia a área comum/cozinha?" },
    { id:"hs_8",  type:"stars",  label:"Como avalia a segurança dos armários?" },
    { id:"hs_9",  type:"stars",  label:"Como avalia o banheiro compartilhado?" },
    { id:"hs_10", type:"stars",  label:"Como avalia o ambiente social?" },
    { id:"hs_11", type:"choice", label:"O que achou do preço?", options:["Barato","Justo","Caro"], defaultActive:true },
    { id:"hs_12", type:"choice", label:"É sua primeira estadia aqui?", options:["Sim","Não"] },
    { id:"hs_13", type:"choice", label:"Qual tipo de quarto?", options:["Dorm compartilhado","Quarto privativo","Dorm feminino"] },
    { id:"hs_14", type:"choice", label:"Qual o motivo da viagem?", options:["Turismo","Mochilão","Trabalho","Intercâmbio","Outro"] },
    { id:"hs_15", type:"choice", label:"Quantas noites ficou?", options:["1 noite","2 a 3 noites","4 a 7 noites","Mais de 1 semana"] },
    { id:"hs_16", type:"choice", label:"O Wi-Fi funcionou bem?", options:["Sim","Razoável","Muito lento"] },
    { id:"hs_17", type:"choice", label:"O armário/guarda-volumes é seguro?", options:["Sim","Razoável","Não"] },
    { id:"hs_18", type:"choice", label:"Como nos conheceu?", options:["Hostelworld","Booking","Google","Indicação","Outro"] },
    { id:"hs_19", type:"choice", label:"Você voltaria?", options:["Com certeza","Talvez","Provavelmente não"] },
    { id:"hs_20", type:"choice", label:"Indicaria para amigos?", options:["Com certeza","Talvez","Não"] },
    { id:"hs_21", type:"staff",  label:"Quem fez seu check-in?", options:[] },
    { id:"hs_22", type:"choice", label:"O ambiente é bom para socializar?", options:["Sim","Razoável","Prefiro privacidade"] },
    { id:"hs_23", type:"choice", label:"O barulho no quarto/dormitório foi:", options:["Tranquilo","Razoável","Muito barulhento"] },
    { id:"hs_24", type:"choice", label:"Há opções de tour/atividades?", options:["Sim e são boas","Sim mas poucas","Não tem"] },
    { id:"hs_25", type:"choice", label:"A cozinha compartilhada estava limpa?", options:["Sim","Razoável","Não"] },
    { id:"hs_26", type:"choice", label:"Com que frequência você usa hostels?", options:["Primeira vez","Às vezes","Sempre viajo assim"] },
    { id:"hs_27", type:"choice", label:"O check-in foi ágil?", options:["Sim","Razoável","Demorado"] },
    { id:"hs_28", type:"choice", label:"O que mais gostou?", options:["Preço","Localização","Ambiente social","Limpeza","Atendimento"] },
    { id:"hs_29", type:"choice", label:"Há espaço para trabalho/estudo?", options:["Sim","Razoável","Não tem"] },
    { id:"hs_30", type:"choice", label:"O que te faria voltar?", options:["Preço","Localização","Ambiente","Atividades","Limpeza"] },
    { id:"hs_nps", type:"nps",  label:"De 0 a 10, o quanto nos indicaria?", defaultActive:true },
    { id:"hs_sug", type:"text", label:"Alguma sugestão ou elogio?", defaultActive:true },
  ],
  "Loja de Roupas": [
    { id:"lr_1",  type:"stars",  label:"Como avalia a qualidade das peças?", defaultActive:true },
    { id:"lr_2",  type:"stars",  label:"Como avalia a variedade de produtos?", defaultActive:true },
    { id:"lr_3",  type:"stars",  label:"Como avalia o atendimento?", defaultActive:true },
    { id:"lr_4",  type:"stars",  label:"Como avalia a organização da loja?", defaultActive:true },
    { id:"lr_5",  type:"stars",  label:"Como avalia o custo-benefício?", defaultActive:true },
    { id:"lr_6",  type:"stars",  label:"Como avalia a limpeza?" },
    { id:"lr_7",  type:"stars",  label:"Como avalia o ambiente/decoração?" },
    { id:"lr_8",  type:"stars",  label:"Como avalia as opções de tamanhos?" },
    { id:"lr_9",  type:"stars",  label:"Como avalia o provador?" },
    { id:"lr_10", type:"stars",  label:"Como avalia as promoções/descontos?" },
    { id:"lr_11", type:"choice", label:"O que achou do preço?", options:["Barato","Justo","Caro"], defaultActive:true },
    { id:"lr_12", type:"choice", label:"É sua primeira visita?", options:["Sim","Não"] },
    { id:"lr_13", type:"choice", label:"O que comprou?", options:["Roupas casuais","Roupas sociais","Roupas íntimas","Acessórios","Não comprei hoje"] },
    { id:"lr_14", type:"choice", label:"Encontrou o que procurava?", options:["Sim, tudo","Maioria","Não"] },
    { id:"lr_15", type:"choice", label:"O atendente ajudou na escolha?", options:["Sim, muito","Razoável","Preferi sozinho"] },
    { id:"lr_16", type:"choice", label:"Como nos conheceu?", options:["Indicação","Instagram","Google","Passando","Outro"] },
    { id:"lr_17", type:"choice", label:"Você voltaria?", options:["Com certeza","Talvez","Provavelmente não"] },
    { id:"lr_18", type:"choice", label:"Indicaria para amigos?", options:["Com certeza","Talvez","Não"] },
    { id:"lr_19", type:"staff",  label:"Quem te atendeu?", options:[] },
    { id:"lr_20", type:"choice", label:"As peças têm boa qualidade de costura?", options:["Sim","Razoável","Não"] },
    { id:"lr_21", type:"choice", label:"Há variedade de tamanhos?", options:["Sim, ótima","Razoável","Muito limitado"] },
    { id:"lr_22", type:"choice", label:"O provador estava limpo e disponível?", options:["Sim","Razoável","Não"] },
    { id:"lr_23", type:"choice", label:"A loja tem opções plus size?", options:["Sim","Poucas","Não"] },
    { id:"lr_24", type:"choice", label:"Com que frequência você compra aqui?", options:["Primeira vez","Raramente","Mensalmente","Frequentemente"] },
    { id:"lr_25", type:"choice", label:"Qual estilo mais se identifica com a loja?", options:["Casual","Social","Esportivo","Moda autoral","Misto"] },
    { id:"lr_26", type:"choice", label:"A loja aceita troca facilmente?", options:["Sim","Razoável","Não sei"] },
    { id:"lr_27", type:"choice", label:"O que mais gostou?", options:["Variedade","Preço","Atendimento","Qualidade","Ambiente"] },
    { id:"lr_28", type:"choice", label:"Há estacionamento fácil?", options:["Sim","Difícil","Não tem"] },
    { id:"lr_29", type:"choice", label:"A loja tem loja online/delivery?", options:["Sim e é bom","Sim mas não uso","Não tem"] },
    { id:"lr_30", type:"choice", label:"O que te faria comprar mais?", options:["Promoções","Novidades frequentes","Mais tamanhos","Programa de fidelidade"] },
    { id:"lr_nps", type:"nps",  label:"De 0 a 10, o quanto nos indicaria?", defaultActive:true },
    { id:"lr_sug", type:"text", label:"Alguma sugestão ou elogio?", defaultActive:true },
  ],
  "Calçados": [
    { id:"cal_1",  type:"stars",  label:"Como avalia a qualidade dos calçados?", defaultActive:true },
    { id:"cal_2",  type:"stars",  label:"Como avalia a variedade de modelos?", defaultActive:true },
    { id:"cal_3",  type:"stars",  label:"Como avalia o atendimento?", defaultActive:true },
    { id:"cal_4",  type:"stars",  label:"Como avalia a organização da loja?", defaultActive:true },
    { id:"cal_5",  type:"stars",  label:"Como avalia o custo-benefício?", defaultActive:true },
    { id:"cal_6",  type:"stars",  label:"Como avalia a limpeza?" },
    { id:"cal_7",  type:"stars",  label:"Como avalia a variedade de tamanhos?" },
    { id:"cal_8",  type:"stars",  label:"Como avalia o conforto dos produtos?" },
    { id:"cal_9",  type:"stars",  label:"Como avalia as promoções?" },
    { id:"cal_10", type:"stars",  label:"Como avalia o ambiente da loja?" },
    { id:"cal_11", type:"choice", label:"O que achou do preço?", options:["Barato","Justo","Caro"], defaultActive:true },
    { id:"cal_12", type:"choice", label:"É sua primeira visita?", options:["Sim","Não"] },
    { id:"cal_13", type:"choice", label:"O que comprou?", options:["Tênis","Sandália","Sapato social","Bota","Chinelo","Não comprei hoje"] },
    { id:"cal_14", type:"choice", label:"Encontrou o número que precisava?", options:["Sim","Quase","Não"] },
    { id:"cal_15", type:"choice", label:"O atendente trouxe opções adequadas?", options:["Sim, muito bem","Razoável","Não"] },
    { id:"cal_16", type:"choice", label:"Como nos conheceu?", options:["Indicação","Instagram","Google","Passando","Outro"] },
    { id:"cal_17", type:"choice", label:"Você voltaria?", options:["Com certeza","Talvez","Provavelmente não"] },
    { id:"cal_18", type:"choice", label:"Indicaria para amigos?", options:["Com certeza","Talvez","Não"] },
    { id:"cal_19", type:"staff",  label:"Quem te atendeu?", options:[] },
    { id:"cal_20", type:"choice", label:"O calçado é confortável?", options:["Sim","Razoável","Não"] },
    { id:"cal_21", type:"choice", label:"Há variedade de números?", options:["Sim","Razoável","Muito limitado"] },
    { id:"cal_22", type:"choice", label:"A loja tem opções de tamanhos especiais?", options:["Sim","Poucas","Não"] },
    { id:"cal_23", type:"choice", label:"Com que frequência você compra aqui?", options:["Primeira vez","Raramente","Mensalmente","Frequentemente"] },
    { id:"cal_24", type:"choice", label:"O calçado atendeu às expectativas?", options:["Sim, perfeito","Razoável","Não"] },
    { id:"cal_25", type:"choice", label:"A loja aceita troca?", options:["Sim","Razoável","Não sei"] },
    { id:"cal_26", type:"choice", label:"O que mais gostou?", options:["Variedade","Preço","Atendimento","Qualidade","Conforto"] },
    { id:"cal_27", type:"choice", label:"Há estacionamento fácil?", options:["Sim","Difícil","Não tem"] },
    { id:"cal_28", type:"choice", label:"A vitrine estava atrativa?", options:["Sim","Razoável","Não"] },
    { id:"cal_29", type:"choice", label:"A loja tem venda online?", options:["Sim e é bom","Sim mas não uso","Não tem"] },
    { id:"cal_30", type:"choice", label:"O que te faria comprar mais?", options:["Promoções","Mais modelos","Mais tamanhos","Programa de fidelidade"] },
    { id:"cal_nps", type:"nps",  label:"De 0 a 10, o quanto nos indicaria?", defaultActive:true },
    { id:"cal_sug", type:"text", label:"Alguma sugestão ou elogio?", defaultActive:true },
  ],
  "Ótica": [
    { id:"ot_1",  type:"stars",  label:"Como avalia o atendimento?", defaultActive:true },
    { id:"ot_2",  type:"stars",  label:"Como avalia a variedade de armações?", defaultActive:true },
    { id:"ot_3",  type:"stars",  label:"Como avalia a qualidade das lentes?", defaultActive:true },
    { id:"ot_4",  type:"stars",  label:"Como avalia o prazo de entrega?", defaultActive:true },
    { id:"ot_5",  type:"stars",  label:"Como avalia o custo-benefício?", defaultActive:true },
    { id:"ot_6",  type:"stars",  label:"Como avalia a limpeza e organização?" },
    { id:"ot_7",  type:"stars",  label:"Como avalia o exame de vista?" },
    { id:"ot_8",  type:"stars",  label:"Como avalia a qualidade do óculos recebido?" },
    { id:"ot_9",  type:"stars",  label:"Como avalia o serviço de ajuste/manutenção?" },
    { id:"ot_10", type:"stars",  label:"Como avalia o ambiente?" },
    { id:"ot_11", type:"choice", label:"O que achou do preço?", options:["Barato","Justo","Caro"], defaultActive:true },
    { id:"ot_12", type:"choice", label:"É sua primeira visita?", options:["Sim","Não"] },
    { id:"ot_13", type:"choice", label:"O que comprou/fez?", options:["Óculos de grau","Óculos de sol","Lentes de contato","Exame de vista","Manutenção"] },
    { id:"ot_14", type:"choice", label:"Seu plano/convênio é aceito?", options:["Sim","Pago particular","Não aceita meu plano"] },
    { id:"ot_15", type:"choice", label:"O prazo de entrega foi cumprido?", options:["Sim","Com pequeno atraso","Com muito atraso"] },
    { id:"ot_16", type:"choice", label:"Como nos conheceu?", options:["Indicação","Google","Instagram","Passando","Outro"] },
    { id:"ot_17", type:"choice", label:"Você voltaria?", options:["Com certeza","Talvez","Provavelmente não"] },
    { id:"ot_18", type:"choice", label:"Indicaria para amigos?", options:["Com certeza","Talvez","Não"] },
    { id:"ot_19", type:"staff",  label:"Quem te atendeu?", options:[] },
    { id:"ot_20", type:"choice", label:"O optometrista/ótico explicou bem as opções?", options:["Sim","Razoável","Não"] },
    { id:"ot_21", type:"choice", label:"As armações têm boa variedade?", options:["Sim","Razoável","Muito limitado"] },
    { id:"ot_22", type:"choice", label:"O óculos ficou como esperado?", options:["Sim, perfeito","Razoável","Precisou de ajuste"] },
    { id:"ot_23", type:"choice", label:"O ajuste/manutenção é feito na hora?", options:["Sim, rápido","Razoável","Demorou"] },
    { id:"ot_24", type:"choice", label:"Com que frequência você troca os óculos?", options:["A cada ano","A cada 2 anos","Só quando quebra","Primeira vez"] },
    { id:"ot_25", type:"choice", label:"A loja tem opções de óculos de sol?", options:["Sim, boas","Poucas","Não tem"] },
    { id:"ot_26", type:"choice", label:"O que mais gostou?", options:["Atendimento","Variedade","Preço","Qualidade","Agilidade"] },
    { id:"ot_27", type:"choice", label:"Há estacionamento fácil?", options:["Sim","Difícil","Não tem"] },
    { id:"ot_28", type:"choice", label:"A garantia das lentes é clara?", options:["Sim","Razoável","Não explicaram bem"] },
    { id:"ot_29", type:"choice", label:"O exame de vista foi completo?", options:["Sim","Razoável","Não fiz"] },
    { id:"ot_30", type:"choice", label:"O que te faria voltar?", options:["Preço","Variedade","Atendimento","Prazo menor","Convênio aceito"] },
    { id:"ot_nps", type:"nps",  label:"De 0 a 10, o quanto nos indicaria?", defaultActive:true },
    { id:"ot_sug", type:"text", label:"Alguma sugestão ou elogio?", defaultActive:true },
  ],
  "Joalheria": [
    { id:"jo_1",  type:"stars",  label:"Como avalia a qualidade das joias/acessórios?", defaultActive:true },
    { id:"jo_2",  type:"stars",  label:"Como avalia a variedade de produtos?", defaultActive:true },
    { id:"jo_3",  type:"stars",  label:"Como avalia o atendimento?", defaultActive:true },
    { id:"jo_4",  type:"stars",  label:"Como avalia a apresentação/vitrine?", defaultActive:true },
    { id:"jo_5",  type:"stars",  label:"Como avalia o custo-benefício?", defaultActive:true },
    { id:"jo_6",  type:"stars",  label:"Como avalia a limpeza e organização?" },
    { id:"jo_7",  type:"stars",  label:"Como avalia a exclusividade dos produtos?" },
    { id:"jo_8",  type:"stars",  label:"Como avalia o embrulho/embalagem?" },
    { id:"jo_9",  type:"stars",  label:"Como avalia o prazo de entrega (se encomenda)?" },
    { id:"jo_10", type:"stars",  label:"Como avalia o ambiente da loja?" },
    { id:"jo_11", type:"choice", label:"O que achou do preço?", options:["Justo","Um pouco alto","Caro"], defaultActive:true },
    { id:"jo_12", type:"choice", label:"É sua primeira visita?", options:["Sim","Não"] },
    { id:"jo_13", type:"choice", label:"O que comprou?", options:["Anel","Brinco","Colar","Pulseira","Relógio","Personalizado","Outro"] },
    { id:"jo_14", type:"choice", label:"Qual a ocasião?", options:["Presente","Casamento/noivado","Aniversário","Consumo próprio","Outro"] },
    { id:"jo_15", type:"choice", label:"O produto é de qual material?", options:["Ouro","Prata","Aço inox","Semijoia","Bijuteria"] },
    { id:"jo_16", type:"choice", label:"Como nos conheceu?", options:["Indicação","Instagram","Google","Passando","Outro"] },
    { id:"jo_17", type:"choice", label:"Você voltaria?", options:["Com certeza","Talvez","Provavelmente não"] },
    { id:"jo_18", type:"choice", label:"Indicaria para amigos?", options:["Com certeza","Talvez","Não"] },
    { id:"jo_19", type:"staff",  label:"Quem te atendeu?", options:[] },
    { id:"jo_20", type:"choice", label:"O atendente ajudou na escolha?", options:["Sim, muito","Razoável","Preferi sozinho"] },
    { id:"jo_21", type:"choice", label:"A joia/acessório veio com certificado?", options:["Sim","Não","Não precisava"] },
    { id:"jo_22", type:"choice", label:"A embalagem para presente foi adequada?", options:["Sim, linda","Razoável","Não tinha"] },
    { id:"jo_23", type:"choice", label:"Há opções de personalização?", options:["Sim e são boas","Sim mas limitadas","Não tem"] },
    { id:"jo_24", type:"choice", label:"O produto tinha garantia?", options:["Sim","Não sei","Não"] },
    { id:"jo_25", type:"choice", label:"A loja aceita conserto/reforma?", options:["Sim","Não sei","Não"] },
    { id:"jo_26", type:"choice", label:"O que mais gostou?", options:["Qualidade","Variedade","Atendimento","Preço","Exclusividade"] },
    { id:"jo_27", type:"choice", label:"Há estacionamento fácil?", options:["Sim","Difícil","Não tem"] },
    { id:"jo_28", type:"choice", label:"A vitrine estava atrativa?", options:["Sim","Razoável","Não"] },
    { id:"jo_29", type:"choice", label:"A loja tem vendas online?", options:["Sim e é bom","Sim mas não uso","Não tem"] },
    { id:"jo_30", type:"choice", label:"O que te faria voltar?", options:["Promoções","Novidades","Personalização","Atendimento","Variedade"] },
    { id:"jo_nps", type:"nps",  label:"De 0 a 10, o quanto nos indicaria?", defaultActive:true },
    { id:"jo_sug", type:"text", label:"Alguma sugestão ou elogio?", defaultActive:true },
  ],
  "Papelaria": [
    { id:"pa_1",  type:"stars",  label:"Como avalia a variedade de produtos?", defaultActive:true },
    { id:"pa_2",  type:"stars",  label:"Como avalia a qualidade dos produtos?", defaultActive:true },
    { id:"pa_3",  type:"stars",  label:"Como avalia o atendimento?", defaultActive:true },
    { id:"pa_4",  type:"stars",  label:"Como avalia a organização da loja?", defaultActive:true },
    { id:"pa_5",  type:"stars",  label:"Como avalia o custo-benefício?", defaultActive:true },
    { id:"pa_6",  type:"stars",  label:"Como avalia a limpeza?" },
    { id:"pa_7",  type:"stars",  label:"Como avalia os serviços de impressão/cópia?" },
    { id:"pa_8",  type:"stars",  label:"Como avalia as opções de papelaria personalizada?" },
    { id:"pa_9",  type:"stars",  label:"Como avalia a agilidade?" },
    { id:"pa_10", type:"stars",  label:"Como avalia o ambiente?" },
    { id:"pa_11", type:"choice", label:"O que achou do preço?", options:["Barato","Justo","Caro"], defaultActive:true },
    { id:"pa_12", type:"choice", label:"É sua primeira visita?", options:["Sim","Não"] },
    { id:"pa_13", type:"choice", label:"O que comprou/usou?", options:["Material escolar","Material de escritório","Impressão","Encadernação","Presentes","Outro"] },
    { id:"pa_14", type:"choice", label:"Encontrou o que precisava?", options:["Sim, tudo","Maioria","Não"] },
    { id:"pa_15", type:"choice", label:"O serviço de impressão foi de qualidade?", options:["Sim","Razoável","Não usei"] },
    { id:"pa_16", type:"choice", label:"Como nos conheceu?", options:["Mora perto","Indicação","Google","Outro"] },
    { id:"pa_17", type:"choice", label:"Você voltaria?", options:["Com certeza","Talvez","Provavelmente não"] },
    { id:"pa_18", type:"choice", label:"Indicaria para amigos?", options:["Com certeza","Talvez","Não"] },
    { id:"pa_19", type:"staff",  label:"Quem te atendeu?", options:[] },
    { id:"pa_20", type:"choice", label:"O atendente conhecia bem os produtos?", options:["Sim","Razoável","Não"] },
    { id:"pa_21", type:"choice", label:"A loja tem serviço de encadernação?", options:["Sim e é bom","Sim mas demorado","Não tem"] },
    { id:"pa_22", type:"choice", label:"O prazo do serviço foi cumprido?", options:["Sim","Com pequeno atraso","Com muito atraso","Não usei serviço"] },
    { id:"pa_23", type:"choice", label:"Com que frequência você vem?", options:["Primeira vez","Raramente","Mensalmente","Frequentemente"] },
    { id:"pa_24", type:"choice", label:"A loja tem produtos de arte/craft?", options:["Sim","Poucas","Não tem"] },
    { id:"pa_25", type:"choice", label:"O que mais gostou?", options:["Variedade","Preço","Atendimento","Agilidade","Localização"] },
    { id:"pa_26", type:"choice", label:"Há estacionamento fácil?", options:["Sim","Difícil","Não tem"] },
    { id:"pa_27", type:"choice", label:"A loja tem opções para escola/universidade?", options:["Sim","Razoável","Poucas"] },
    { id:"pa_28", type:"choice", label:"A fila/espera foi:", options:["Rápida","Razoável","Demorada"] },
    { id:"pa_29", type:"choice", label:"A loja aceita pedidos personalizados?", options:["Sim","Não sei","Não"] },
    { id:"pa_30", type:"choice", label:"O que te faria vir mais vezes?", options:["Preço","Mais variedade","Serviços mais rápidos","Programa de fidelidade"] },
    { id:"pa_nps", type:"nps",  label:"De 0 a 10, o quanto nos indicaria?", defaultActive:true },
    { id:"pa_sug", type:"text", label:"Alguma sugestão ou elogio?", defaultActive:true },
  ],
  "Floricultura": [
    { id:"fl_1",  type:"stars",  label:"Como avalia a qualidade das flores/plantas?", defaultActive:true },
    { id:"fl_2",  type:"stars",  label:"Como avalia a variedade de produtos?", defaultActive:true },
    { id:"fl_3",  type:"stars",  label:"Como avalia o atendimento?", defaultActive:true },
    { id:"fl_4",  type:"stars",  label:"Como avalia a montagem/arranjo?", defaultActive:true },
    { id:"fl_5",  type:"stars",  label:"Como avalia o custo-benefício?", defaultActive:true },
    { id:"fl_6",  type:"stars",  label:"Como avalia a frescura das flores?" },
    { id:"fl_7",  type:"stars",  label:"Como avalia a criatividade dos arranjos?" },
    { id:"fl_8",  type:"stars",  label:"Como avalia a embalagem/presenteação?" },
    { id:"fl_9",  type:"stars",  label:"Como avalia o prazo de entrega?" },
    { id:"fl_10", type:"stars",  label:"Como avalia o ambiente da loja?" },
    { id:"fl_11", type:"choice", label:"O que achou do preço?", options:["Barato","Justo","Caro"], defaultActive:true },
    { id:"fl_12", type:"choice", label:"É sua primeira visita?", options:["Sim","Não"] },
    { id:"fl_13", type:"choice", label:"O que comprou?", options:["Buquê","Arranjo","Planta","Coroa/Sympathy","Decoração evento","Outro"] },
    { id:"fl_14", type:"choice", label:"Qual a ocasião?", options:["Aniversário","Casamento","Velório","Decoração","Presente","Outro"] },
    { id:"fl_15", type:"choice", label:"O arranjo ficou como pedido?", options:["Sim, perfeito","Próximo","Não"] },
    { id:"fl_16", type:"choice", label:"A entrega foi no prazo?", options:["Sim","Com pequeno atraso","Com muito atraso","Retirei no local"] },
    { id:"fl_17", type:"choice", label:"Como nos conheceu?", options:["Indicação","Instagram","Google","Passando","Outro"] },
    { id:"fl_18", type:"choice", label:"Você voltaria?", options:["Com certeza","Talvez","Provavelmente não"] },
    { id:"fl_19", type:"choice", label:"Indicaria para amigos?", options:["Com certeza","Talvez","Não"] },
    { id:"fl_20", type:"staff",  label:"Quem te atendeu?", options:[] },
    { id:"fl_21", type:"choice", label:"As flores chegaram frescas?", options:["Sim","Razoável","Não"] },
    { id:"fl_22", type:"choice", label:"A embalagem protegeu bem?", options:["Sim","Razoável","Não"] },
    { id:"fl_23", type:"choice", label:"Há opções de plantas para decoração?", options:["Sim","Poucas","Não tem"] },
    { id:"fl_24", type:"choice", label:"O atendente deu dicas de conservação?", options:["Sim","Parcialmente","Não"] },
    { id:"fl_25", type:"choice", label:"Com que frequência você compra flores?", options:["Raramente","Mensalmente","Para datas especiais","Frequentemente"] },
    { id:"fl_26", type:"choice", label:"A loja tem delivery?", options:["Sim e é bom","Sim mas demorado","Não tem"] },
    { id:"fl_27", type:"choice", label:"O que mais gostou?", options:["Qualidade","Variedade","Atendimento","Criatividade","Preço"] },
    { id:"fl_28", type:"choice", label:"Há cartão/mensagem incluso?", options:["Sim","Precisei pedir","Não tinha"] },
    { id:"fl_29", type:"choice", label:"A loja aceita encomendas com antecedência?", options:["Sim","Não sei","Não"] },
    { id:"fl_30", type:"choice", label:"O que te faria voltar?", options:["Preço","Variedade","Criatividade","Entrega rápida","Frescor"] },
    { id:"fl_nps", type:"nps",  label:"De 0 a 10, o quanto nos indicaria?", defaultActive:true },
    { id:"fl_sug", type:"text", label:"Alguma sugestão ou elogio?", defaultActive:true },
  ],
  "Escola / Curso": [
    { id:"ec_1",  type:"stars",  label:"Como avalia a qualidade do ensino?", defaultActive:true },
    { id:"ec_2",  type:"stars",  label:"Como avalia os professores/instrutores?", defaultActive:true },
    { id:"ec_3",  type:"stars",  label:"Como avalia o atendimento da secretaria?", defaultActive:true },
    { id:"ec_4",  type:"stars",  label:"Como avalia a estrutura/infraestrutura?", defaultActive:true },
    { id:"ec_5",  type:"stars",  label:"Como avalia o custo-benefício?", defaultActive:true },
    { id:"ec_6",  type:"stars",  label:"Como avalia o material didático?" },
    { id:"ec_7",  type:"stars",  label:"Como avalia o ambiente/salas?" },
    { id:"ec_8",  type:"stars",  label:"Como avalia a clareza nas explicações?" },
    { id:"ec_9",  type:"stars",  label:"Como avalia a pontualidade das aulas?" },
    { id:"ec_10", type:"stars",  label:"Como avalia o suporte ao aluno?" },
    { id:"ec_11", type:"choice", label:"O que achou do preço?", options:["Barato","Justo","Caro"], defaultActive:true },
    { id:"ec_12", type:"choice", label:"É sua primeira experiência aqui?", options:["Sim","Não"] },
    { id:"ec_13", type:"choice", label:"Qual tipo de curso/aula?", options:["Idiomas","Profissionalizante","Reforço escolar","Tecnologia","Arte","Outro"] },
    { id:"ec_14", type:"choice", label:"Qual modalidade?", options:["Presencial","Online","Híbrido"] },
    { id:"ec_15", type:"choice", label:"O conteúdo atende às expectativas?", options:["Sim, muito","Razoável","Não"] },
    { id:"ec_16", type:"choice", label:"O professor é didático e claro?", options:["Sim, muito","Razoável","Não"] },
    { id:"ec_17", type:"choice", label:"Como nos conheceu?", options:["Indicação","Google","Instagram","Outro"] },
    { id:"ec_18", type:"choice", label:"Você continuaria estudando aqui?", options:["Com certeza","Talvez","Provavelmente não"] },
    { id:"ec_19", type:"choice", label:"Indicaria para amigos?", options:["Com certeza","Talvez","Não"] },
    { id:"ec_20", type:"staff",  label:"Qual professor/instrutor te atende?", options:[] },
    { id:"ec_21", type:"choice", label:"As aulas são pontuais?", options:["Sim, sempre","Às vezes atrasam","Frequentemente atrasam"] },
    { id:"ec_22", type:"choice", label:"Há suporte fora do horário de aula?", options:["Sim","Às vezes","Não"] },
    { id:"ec_23", type:"choice", label:"O material didático é adequado?", options:["Sim","Razoável","Não"] },
    { id:"ec_24", type:"choice", label:"A turma tem tamanho adequado?", options:["Sim","Um pouco grande","Muito grande"] },
    { id:"ec_25", type:"choice", label:"Há plataforma online/app de suporte?", options:["Sim e é bom","Sim mas razoável","Não tem"] },
    { id:"ec_26", type:"choice", label:"O que mais gostou?", options:["Professores","Método","Preço","Estrutura","Suporte"] },
    { id:"ec_27", type:"choice", label:"A secretaria resolve problemas com agilidade?", options:["Sim","Razoável","Não"] },
    { id:"ec_28", type:"choice", label:"Há estacionamento/acesso fácil?", options:["Sim","Difícil","Não tem"] },
    { id:"ec_29", type:"choice", label:"A certificação/diploma é reconhecida?", options:["Sim","Não sei","Não"] },
    { id:"ec_30", type:"choice", label:"O que te faria indicar?", options:["Qualidade do ensino","Preço","Professores","Estrutura","Suporte"] },
    { id:"ec_nps", type:"nps",  label:"De 0 a 10, o quanto nos indicaria?", defaultActive:true },
    { id:"ec_sug", type:"text", label:"Alguma sugestão ou elogio?", defaultActive:true },
  ],
  "Oficina / Auto": [
    { id:"of_1",  type:"stars",  label:"Como avalia a qualidade do serviço?", defaultActive:true },
    { id:"of_2",  type:"stars",  label:"Como avalia o diagnóstico do problema?", defaultActive:true },
    { id:"of_3",  type:"stars",  label:"Como avalia o atendimento?", defaultActive:true },
    { id:"of_4",  type:"stars",  label:"Como avalia o prazo de entrega?", defaultActive:true },
    { id:"of_5",  type:"stars",  label:"Como avalia o custo-benefício?", defaultActive:true },
    { id:"of_6",  type:"stars",  label:"Como avalia a transparência no orçamento?" },
    { id:"of_7",  type:"stars",  label:"Como avalia a limpeza da oficina?" },
    { id:"of_8",  type:"stars",  label:"Como avalia a qualidade das peças usadas?" },
    { id:"of_9",  type:"stars",  label:"Como avalia a confiança no serviço?" },
    { id:"of_10", type:"stars",  label:"Como avalia a comunicação durante o processo?" },
    { id:"of_11", type:"choice", label:"O que achou do preço?", options:["Barato","Justo","Caro"], defaultActive:true },
    { id:"of_12", type:"choice", label:"É sua primeira visita?", options:["Sim","Não"] },
    { id:"of_13", type:"choice", label:"Qual serviço fez?", options:["Revisão","Troca de óleo","Suspensão","Freios","Elétrica","Funilaria","Outro"] },
    { id:"of_14", type:"choice", label:"O orçamento foi aprovado antes do serviço?", options:["Sim","Parcialmente","Não"] },
    { id:"of_15", type:"choice", label:"O prazo de entrega foi cumprido?", options:["Sim","Com pequeno atraso","Com muito atraso"] },
    { id:"of_16", type:"choice", label:"O problema foi resolvido?", options:["Sim, completamente","Parcialmente","Não"] },
    { id:"of_17", type:"choice", label:"Como nos conheceu?", options:["Indicação","Google","Passando","Outro"] },
    { id:"of_18", type:"choice", label:"Você voltaria?", options:["Com certeza","Talvez","Provavelmente não"] },
    { id:"of_19", type:"choice", label:"Indicaria para amigos?", options:["Com certeza","Talvez","Não"] },
    { id:"of_20", type:"staff",  label:"Quem te atendeu?", options:[] },
    { id:"of_21", type:"choice", label:"A oficina manteve você informado?", options:["Sim, sempre","Às vezes","Não"] },
    { id:"of_22", type:"choice", label:"O carro foi entregue limpo?", options:["Sim","Razoável","Não"] },
    { id:"of_23", type:"choice", label:"A garantia do serviço foi explicada?", options:["Sim","Parcialmente","Não"] },
    { id:"of_24", type:"choice", label:"Houve alguma cobrança surpresa?", options:["Não","Pequena diferença","Sim, valor diferente"] },
    { id:"of_25", type:"choice", label:"A oficina aceita cartão?", options:["Sim","Só dinheiro/PIX","Não sei"] },
    { id:"of_26", type:"choice", label:"Com que frequência você usa esta oficina?", options:["Primeira vez","Raramente","Sempre venho aqui"] },
    { id:"of_27", type:"choice", label:"O que mais gostou?", options:["Qualidade","Preço","Honestidade","Prazo","Atendimento"] },
    { id:"of_28", type:"choice", label:"Há estacionamento para deixar o carro?", options:["Sim","Razoável","Difícil"] },
    { id:"of_29", type:"choice", label:"A oficina deu dicas de manutenção preventiva?", options:["Sim","Não","Não precisava"] },
    { id:"of_30", type:"choice", label:"O que te faria recomendar?", options:["Qualidade","Honestidade","Preço","Prazo","Comunicação"] },
    { id:"of_nps", type:"nps",  label:"De 0 a 10, o quanto nos indicaria?", defaultActive:true },
    { id:"of_sug", type:"text", label:"Alguma sugestão ou elogio?", defaultActive:true },
  ],
  "Lavanderia": [
    { id:"lv_1",  type:"stars",  label:"Como avalia a qualidade da lavagem?", defaultActive:true },
    { id:"lv_2",  type:"stars",  label:"Como avalia o atendimento?", defaultActive:true },
    { id:"lv_3",  type:"stars",  label:"Como avalia o prazo de entrega?", defaultActive:true },
    { id:"lv_4",  type:"stars",  label:"Como avalia a passagem/acabamento?", defaultActive:true },
    { id:"lv_5",  type:"stars",  label:"Como avalia o custo-benefício?", defaultActive:true },
    { id:"lv_6",  type:"stars",  label:"Como avalia a limpeza da lavanderia?" },
    { id:"lv_7",  type:"stars",  label:"Como avalia os produtos utilizados?" },
    { id:"lv_8",  type:"stars",  label:"Como avalia a embalagem/entrega?" },
    { id:"lv_9",  type:"stars",  label:"Como avalia o serviço de coleta/entrega?" },
    { id:"lv_10", type:"stars",  label:"Como avalia a conservação das roupas?" },
    { id:"lv_11", type:"choice", label:"O que achou do preço?", options:["Barato","Justo","Caro"], defaultActive:true },
    { id:"lv_12", type:"choice", label:"É sua primeira visita?", options:["Sim","Não"] },
    { id:"lv_13", type:"choice", label:"Qual serviço usou?", options:["Lavagem simples","Lavagem a seco","Passadoria","Higienização","Edredom/cobertor","Outro"] },
    { id:"lv_14", type:"choice", label:"O prazo de entrega foi cumprido?", options:["Sim","Com pequeno atraso","Com muito atraso"] },
    { id:"lv_15", type:"choice", label:"As roupas voltaram limpas e sem manchas?", options:["Sim","Maioria","Não"] },
    { id:"lv_16", type:"choice", label:"Alguma peça foi danificada?", options:["Não","Sim, levemente","Sim, danificada"] },
    { id:"lv_17", type:"choice", label:"Como nos conheceu?", options:["Mora perto","Indicação","Google","Outro"] },
    { id:"lv_18", type:"choice", label:"Você voltaria?", options:["Com certeza","Talvez","Provavelmente não"] },
    { id:"lv_19", type:"choice", label:"Indicaria para amigos?", options:["Com certeza","Talvez","Não"] },
    { id:"lv_20", type:"staff",  label:"Quem te atendeu?", options:[] },
    { id:"lv_21", type:"choice", label:"A lavanderia faz coleta e entrega?", options:["Sim e é bom","Sim mas demorado","Não tem"] },
    { id:"lv_22", type:"choice", label:"As roupas voltaram bem passadas?", options:["Sim","Razoável","Não"] },
    { id:"lv_23", type:"choice", label:"Com que frequência você usa lavanderia?", options:["Primeira vez","Raramente","Mensalmente","Frequentemente"] },
    { id:"lv_24", type:"choice", label:"A embalagem das roupas foi adequada?", options:["Sim","Razoável","Não"] },
    { id:"lv_25", type:"choice", label:"O atendente verificou peças delicadas?", options:["Sim","Não precisou","Não"] },
    { id:"lv_26", type:"choice", label:"O que mais gostou?", options:["Qualidade","Preço","Prazo","Atendimento","Comodidade"] },
    { id:"lv_27", type:"choice", label:"A lavanderia tem horário flexível?", options:["Sim","Razoável","Fecha cedo"] },
    { id:"lv_28", type:"choice", label:"Há desconto para volume/quantidade?", options:["Sim","Não sei","Não"] },
    { id:"lv_29", type:"choice", label:"O cheiro das roupas ficou agradável?", options:["Sim","Razoável","Não"] },
    { id:"lv_30", type:"choice", label:"O que te faria usar mais vezes?", options:["Preço","Prazo menor","Coleta/entrega","Qualidade maior"] },
    { id:"lv_nps", type:"nps",  label:"De 0 a 10, o quanto nos indicaria?", defaultActive:true },
    { id:"lv_sug", type:"text", label:"Alguma sugestão ou elogio?", defaultActive:true },
  ],
  "Delivery": [
    { id:"dv_1",  type:"stars",  label:"Como avalia a qualidade do produto recebido?", defaultActive:true },
    { id:"dv_2",  type:"stars",  label:"Como avalia o tempo de entrega?", defaultActive:true },
    { id:"dv_3",  type:"stars",  label:"Como avalia o atendimento/suporte?", defaultActive:true },
    { id:"dv_4",  type:"stars",  label:"Como avalia a embalagem?", defaultActive:true },
    { id:"dv_5",  type:"stars",  label:"Como avalia o custo-benefício?", defaultActive:true },
    { id:"dv_6",  type:"stars",  label:"Como avalia a apresentação do produto?" },
    { id:"dv_7",  type:"stars",  label:"Como avalia a temperatura do produto na entrega?" },
    { id:"dv_8",  type:"stars",  label:"Como avalia a facilidade de pedido?" },
    { id:"dv_9",  type:"stars",  label:"Como avalia o entregador?" },
    { id:"dv_10", type:"stars",  label:"Como avalia a experiência geral?" },
    { id:"dv_11", type:"choice", label:"O que achou do preço?", options:["Barato","Justo","Caro"], defaultActive:true },
    { id:"dv_12", type:"choice", label:"É seu primeiro pedido aqui?", options:["Sim","Não"] },
    { id:"dv_13", type:"choice", label:"Como fez o pedido?", options:["App próprio","iFood","Rappi","WhatsApp","Telefone"] },
    { id:"dv_14", type:"choice", label:"O pedido chegou correto?", options:["Sim, tudo certo","Faltou item","Item errado","Outro"] },
    { id:"dv_15", type:"choice", label:"O tempo de entrega foi:", options:["Dentro do prazo","Um pouco além","Muito além do prazo"] },
    { id:"dv_16", type:"choice", label:"A embalagem manteve bem o produto?", options:["Sim","Razoável","Não"] },
    { id:"dv_17", type:"choice", label:"Como nos conheceu?", options:["Indicação","App de delivery","Instagram","Google","Outro"] },
    { id:"dv_18", type:"choice", label:"Você pediria novamente?", options:["Com certeza","Talvez","Provavelmente não"] },
    { id:"dv_19", type:"choice", label:"Indicaria para amigos?", options:["Com certeza","Talvez","Não"] },
    { id:"dv_20", type:"choice", label:"O entregador foi educado?", options:["Sim","Razoável","Não"] },
    { id:"dv_21", type:"choice", label:"A temperatura do produto na entrega foi:", options:["Perfeita","Razoável","Errada"] },
    { id:"dv_22", type:"choice", label:"O rastreamento do pedido funcionou?", options:["Sim","Razoável","Não tinha"] },
    { id:"dv_23", type:"choice", label:"Com que frequência você pede aqui?", options:["Primeira vez","Raramente","Semanalmente","Frequentemente"] },
    { id:"dv_24", type:"choice", label:"O atendimento foi ágil quando precisou?", options:["Sim","Razoável","Não precisei"] },
    { id:"dv_25", type:"choice", label:"Houve problema resolvido rapidamente?", options:["Sim","Parcialmente","Não houve problema"] },
    { id:"dv_26", type:"choice", label:"A taxa de entrega é justa?", options:["Sim","Um pouco alta","Muito cara"] },
    { id:"dv_27", type:"choice", label:"O que mais gostou?", options:["Rapidez","Produto","Preço","Atendimento","Embalagem"] },
    { id:"dv_28", type:"choice", label:"Há promoções/combos frequentes?", options:["Sim","Às vezes","Raramente"] },
    { id:"dv_29", type:"choice", label:"O app/sistema de pedido é fácil de usar?", options:["Sim","Razoável","Difícil"] },
    { id:"dv_30", type:"choice", label:"O que te faria pedir mais vezes?", options:["Preço menor","Entrega mais rápida","Mais promoções","Mais opções"] },
    { id:"dv_nps", type:"nps",  label:"De 0 a 10, o quanto nos indicaria?", defaultActive:true },
    { id:"dv_sug", type:"text", label:"Alguma sugestão ou elogio?", defaultActive:true },
  ],
"Clínica Veterinária": [
    { id:"vc_1",  type:"stars",  label:"Como avalia o atendimento do veterinário?", defaultActive:true },
    { id:"vc_2",  type:"stars",  label:"Como avalia o cuidado com seu animal?", defaultActive:true },
    { id:"vc_3",  type:"stars",  label:"Como avalia a clareza nas explicações?", defaultActive:true },
    { id:"vc_4",  type:"stars",  label:"Como avalia o atendimento da recepção?", defaultActive:true },
    { id:"vc_5",  type:"stars",  label:"Como avalia o tempo de espera?", defaultActive:true },
    { id:"vc_6",  type:"stars",  label:"Como avalia a limpeza e higiene?" },
    { id:"vc_7",  type:"stars",  label:"Como avalia a estrutura/equipamentos?" },
    { id:"vc_8",  type:"stars",  label:"Como avalia o custo-benefício?" },
    { id:"vc_9",  type:"stars",  label:"Como avalia o agendamento?" },
    { id:"vc_10", type:"stars",  label:"Como avalia a confiança no diagnóstico?" },
    { id:"vc_11", type:"choice", label:"O que achou do preço?", options:["Acessível","Justo","Caro"], defaultActive:true },
    { id:"vc_12", type:"choice", label:"É sua primeira consulta aqui?", options:["Sim","Não"] },
    { id:"vc_13", type:"choice", label:"Qual serviço fez?", options:["Consulta","Vacinação","Cirurgia","Exame","Internação","Outro"] },
    { id:"vc_14", type:"choice", label:"O horário agendado foi cumprido?", options:["Sim, pontual","Pequeno atraso","Muito atraso"] },
    { id:"vc_15", type:"choice", label:"O veterinário explicou o diagnóstico?", options:["Sim, claramente","Razoável","Não"] },
    { id:"vc_16", type:"choice", label:"Como nos conheceu?", options:["Indicação","Google","Instagram","Outro"] },
    { id:"vc_17", type:"choice", label:"Você voltaria?", options:["Com certeza","Talvez","Provavelmente não"] },
    { id:"vc_18", type:"choice", label:"Indicaria para amigos?", options:["Com certeza","Talvez","Não"] },
    { id:"vc_19", type:"staff",  label:"Qual veterinário atendeu?", options:[] },
    { id:"vc_20", type:"choice", label:"Qual animal tem?", options:["Cachorro","Gato","Ave","Roedor","Réptil","Outro"] },
    { id:"vc_21", type:"choice", label:"Você se sentiu seguro deixando seu animal?", options:["Sim","Razoável","Fiquei preocupado"] },
    { id:"vc_22", type:"choice", label:"O veterinário demonstra amor pelos animais?", options:["Sim, claramente","Razoável","Não percebi"] },
    { id:"vc_23", type:"choice", label:"As orientações pós-consulta foram claras?", options:["Sim","Razoável","Não"] },
    { id:"vc_24", type:"choice", label:"Como agendou?", options:["Telefone","WhatsApp","App","Pessoalmente"] },
    { id:"vc_25", type:"choice", label:"A clínica tem plantão/emergência?", options:["Sim","Não sei","Não"] },
    { id:"vc_26", type:"choice", label:"O que mais gostou?", options:["Atenção ao animal","Diagnóstico","Explicações","Preço","Ambiente"] },
    { id:"vc_27", type:"choice", label:"A recepção foi cordial?", options:["Sim","Razoável","Não"] },
    { id:"vc_28", type:"choice", label:"Há estacionamento fácil?", options:["Sim","Difícil","Não tem"] },
    { id:"vc_29", type:"choice", label:"O retorno/resultado foi entregue no prazo?", options:["Sim","Com atraso","Ainda aguardo"] },
    { id:"vc_30", type:"choice", label:"O que te faria recomendar?", options:["Atenção ao animal","Preço","Diagnóstico preciso","Pontualidade","Estrutura"] },
    { id:"vc_nps", type:"nps",  label:"De 0 a 10, o quanto nos indicaria?", defaultActive:true },
    { id:"vc_sug", type:"text", label:"Alguma sugestão ou elogio?", defaultActive:true },
  ],
  "Fisioterapia": [
    { id:"ft_1",  type:"stars",  label:"Como avalia o atendimento do fisioterapeuta?", defaultActive:true },
    { id:"ft_2",  type:"stars",  label:"Como avalia a evolução do tratamento?", defaultActive:true },
    { id:"ft_3",  type:"stars",  label:"Como avalia as explicações sobre o tratamento?", defaultActive:true },
    { id:"ft_4",  type:"stars",  label:"Como avalia o atendimento da recepção?", defaultActive:true },
    { id:"ft_5",  type:"stars",  label:"Como avalia o tempo de espera?", defaultActive:true },
    { id:"ft_6",  type:"stars",  label:"Como avalia a limpeza e higiene?" },
    { id:"ft_7",  type:"stars",  label:"Como avalia os equipamentos?" },
    { id:"ft_8",  type:"stars",  label:"Como avalia o custo-benefício?" },
    { id:"ft_9",  type:"stars",  label:"Como avalia o conforto durante o atendimento?" },
    { id:"ft_10", type:"stars",  label:"Como avalia o agendamento?" },
    { id:"ft_11", type:"choice", label:"O que achou do preço?", options:["Acessível","Justo","Caro"], defaultActive:true },
    { id:"ft_12", type:"choice", label:"É sua primeira sessão aqui?", options:["Sim","Não"] },
    { id:"ft_13", type:"choice", label:"Qual o motivo do tratamento?", options:["Dor lombar","Lesão muscular","Pós-cirúrgico","Hérnia","Lesão esportiva","Outro"] },
    { id:"ft_14", type:"choice", label:"O horário agendado foi cumprido?", options:["Sim, pontual","Pequeno atraso","Muito atraso"] },
    { id:"ft_15", type:"choice", label:"O fisioterapeuta explicou os exercícios?", options:["Sim, claramente","Razoável","Não"] },
    { id:"ft_16", type:"choice", label:"Como nos conheceu?", options:["Indicação médica","Google","Instagram","Indicação de amigo","Outro"] },
    { id:"ft_17", type:"choice", label:"Você continuaria o tratamento aqui?", options:["Com certeza","Talvez","Provavelmente não"] },
    { id:"ft_18", type:"choice", label:"Indicaria para amigos?", options:["Com certeza","Talvez","Não"] },
    { id:"ft_19", type:"staff",  label:"Qual fisioterapeuta te atende?", options:[] },
    { id:"ft_20", type:"choice", label:"Sentiu melhora após as sessões?", options:["Sim, muito","Razoável","Ainda não percebi"] },
    { id:"ft_21", type:"choice", label:"O plano de saúde é aceito?", options:["Sim","Pago particular","Não aceita meu plano"] },
    { id:"ft_22", type:"choice", label:"Os exercícios domiciliares foram orientados?", options:["Sim","Parcialmente","Não"] },
    { id:"ft_23", type:"choice", label:"A sala é privativa durante o atendimento?", options:["Sim","Parcialmente","Não"] },
    { id:"ft_24", type:"choice", label:"Como agendou?", options:["Telefone","WhatsApp","App","Pessoalmente"] },
    { id:"ft_25", type:"choice", label:"A clínica tem estacionamento?", options:["Sim","Difícil","Não tem"] },
    { id:"ft_26", type:"choice", label:"O que mais gostou?", options:["Profissional","Resultado","Ambiente","Preço","Pontualidade"] },
    { id:"ft_27", type:"choice", label:"A duração da sessão foi adequada?", options:["Sim","Curta demais","Muito longa"] },
    { id:"ft_28", type:"choice", label:"Você se sentiu acolhido desde a chegada?", options:["Sim","Razoável","Não"] },
    { id:"ft_29", type:"choice", label:"O tratamento segue um plano definido?", options:["Sim","Razoável","Não explicaram"] },
    { id:"ft_30", type:"choice", label:"O que te faria recomendar?", options:["Resultado","Profissional","Preço","Pontualidade","Estrutura"] },
    { id:"ft_nps", type:"nps",  label:"De 0 a 10, o quanto nos indicaria?", defaultActive:true },
    { id:"ft_sug", type:"text", label:"Alguma sugestão ou elogio?", defaultActive:true },
  ],
  "Psicologia": [
    { id:"psi_1",  type:"stars",  label:"Como avalia o acolhimento do psicólogo?", defaultActive:true },
    { id:"psi_2",  type:"stars",  label:"Como avalia a escuta e atenção?", defaultActive:true },
    { id:"psi_3",  type:"stars",  label:"Como avalia a pontualidade?", defaultActive:true },
    { id:"psi_4",  type:"stars",  label:"Como avalia o ambiente/consultório?", defaultActive:true },
    { id:"psi_5",  type:"stars",  label:"Como avalia o custo-benefício?", defaultActive:true },
    { id:"psi_6",  type:"stars",  label:"Como avalia a clareza nas explicações?" },
    { id:"psi_7",  type:"stars",  label:"Como avalia a confidencialidade percebida?" },
    { id:"psi_8",  type:"stars",  label:"Como avalia o agendamento?" },
    { id:"psi_9",  type:"stars",  label:"Como avalia o conforto no consultório?" },
    { id:"psi_10", type:"stars",  label:"Como avalia a evolução percebida?" },
    { id:"psi_11", type:"choice", label:"O que achou do preço?", options:["Acessível","Justo","Caro"], defaultActive:true },
    { id:"psi_12", type:"choice", label:"É sua primeira consulta aqui?", options:["Sim","Não"] },
    { id:"psi_13", type:"choice", label:"Qual modalidade?", options:["Presencial","Online","Híbrido"] },
    { id:"psi_14", type:"choice", label:"O horário foi cumprido?", options:["Sim, pontual","Pequeno atraso","Muito atraso"] },
    { id:"psi_15", type:"choice", label:"O plano de saúde é aceito?", options:["Sim","Pago particular","Não aceita meu plano"] },
    { id:"psi_16", type:"choice", label:"Como nos conheceu?", options:["Indicação","Google","Instagram","Plataforma online","Outro"] },
    { id:"psi_17", type:"choice", label:"Você continuaria o acompanhamento?", options:["Com certeza","Talvez","Provavelmente não"] },
    { id:"psi_18", type:"choice", label:"Indicaria para amigos?", options:["Com certeza","Talvez","Não"] },
    { id:"psi_19", type:"staff",  label:"Com qual psicólogo você consulta?", options:[] },
    { id:"psi_20", type:"choice", label:"Você se sentiu confortável para falar?", options:["Sim, muito","Razoável","Não totalmente"] },
    { id:"psi_21", type:"choice", label:"A sessão tem duração adequada?", options:["Sim","Curta demais","Muito longa"] },
    { id:"psi_22", type:"choice", label:"A abordagem terapêutica te agrada?", options:["Sim","Estou me adaptando","Preferiria outra"] },
    { id:"psi_23", type:"choice", label:"O consultório é silencioso/privativo?", options:["Sim","Razoável","Não"] },
    { id:"psi_24", type:"choice", label:"Como agendou?", options:["Telefone","WhatsApp","App","Plataforma online"] },
    { id:"psi_25", type:"choice", label:"A agenda tem horários compatíveis?", options:["Sim","Razoável","Difícil encaixar"] },
    { id:"psi_26", type:"choice", label:"O que mais valoriza no atendimento?", options:["Escuta","Acolhimento","Técnica","Pontualidade","Ambiente"] },
    { id:"psi_27", type:"choice", label:"Percebeu evolução no seu bem-estar?", options:["Sim","Início de melhora","Ainda não"] },
    { id:"psi_28", type:"choice", label:"Há estacionamento fácil?", options:["Sim","Difícil","Não tem"] },
    { id:"psi_29", type:"choice", label:"O atendimento online funciona bem (se aplicável)?", options:["Sim","Razoável","Prefiro presencial"] },
    { id:"psi_30", type:"choice", label:"O que te faria recomendar?", options:["Acolhimento","Resultado","Preço","Pontualidade","Abordagem"] },
    { id:"psi_nps", type:"nps",  label:"De 0 a 10, o quanto nos indicaria?", defaultActive:true },
    { id:"psi_sug", type:"text", label:"Alguma sugestão ou elogio?", defaultActive:true },
  ],
  "Nutrição": [
    { id:"nt_1",  type:"stars",  label:"Como avalia o atendimento do nutricionista?", defaultActive:true },
    { id:"nt_2",  type:"stars",  label:"Como avalia a clareza do plano alimentar?", defaultActive:true },
    { id:"nt_3",  type:"stars",  label:"Como avalia a escuta dos seus objetivos?", defaultActive:true },
    { id:"nt_4",  type:"stars",  label:"Como avalia a pontualidade?", defaultActive:true },
    { id:"nt_5",  type:"stars",  label:"Como avalia o custo-benefício?", defaultActive:true },
    { id:"nt_6",  type:"stars",  label:"Como avalia o ambiente/consultório?" },
    { id:"nt_7",  type:"stars",  label:"Como avalia o suporte entre consultas?" },
    { id:"nt_8",  type:"stars",  label:"Como avalia a praticidade do plano?" },
    { id:"nt_9",  type:"stars",  label:"Como avalia a evolução percebida?" },
    { id:"nt_10", type:"stars",  label:"Como avalia o agendamento?" },
    { id:"nt_11", type:"choice", label:"O que achou do preço?", options:["Acessível","Justo","Caro"], defaultActive:true },
    { id:"nt_12", type:"choice", label:"É sua primeira consulta aqui?", options:["Sim","Não"] },
    { id:"nt_13", type:"choice", label:"Qual o seu objetivo?", options:["Emagrecimento","Ganho de massa","Saúde geral","Doença específica","Performance esportiva","Outro"] },
    { id:"nt_14", type:"choice", label:"Qual modalidade?", options:["Presencial","Online","Híbrido"] },
    { id:"nt_15", type:"choice", label:"O plano alimentar é fácil de seguir?", options:["Sim","Razoável","Difícil"] },
    { id:"nt_16", type:"choice", label:"Como nos conheceu?", options:["Indicação","Google","Instagram","Plataforma online","Outro"] },
    { id:"nt_17", type:"choice", label:"Você continuaria o acompanhamento?", options:["Com certeza","Talvez","Provavelmente não"] },
    { id:"nt_18", type:"choice", label:"Indicaria para amigos?", options:["Com certeza","Talvez","Não"] },
    { id:"nt_19", type:"staff",  label:"Qual nutricionista te atende?", options:[] },
    { id:"nt_20", type:"choice", label:"O plano respeita suas preferências alimentares?", options:["Sim","Razoável","Não"] },
    { id:"nt_21", type:"choice", label:"O plano de saúde é aceito?", options:["Sim","Pago particular","Não aceita meu plano"] },
    { id:"nt_22", type:"choice", label:"Percebeu resultados até agora?", options:["Sim","Início de resultado","Ainda não"] },
    { id:"nt_23", type:"choice", label:"Há suporte via WhatsApp/app?", options:["Sim","Às vezes","Não"] },
    { id:"nt_24", type:"choice", label:"Como agendou?", options:["Telefone","WhatsApp","App","Plataforma online"] },
    { id:"nt_25", type:"choice", label:"A agenda tem horários compatíveis?", options:["Sim","Razoável","Difícil encaixar"] },
    { id:"nt_26", type:"choice", label:"O nutricionista usa tecnologia (apps, bioimpedância)?", options:["Sim","Parcialmente","Não"] },
    { id:"nt_27", type:"choice", label:"O que mais gostou?", options:["Plano personalizado","Atenção","Resultado","Preço","Suporte"] },
    { id:"nt_28", type:"choice", label:"Há estacionamento fácil?", options:["Sim","Difícil","Não tem"] },
    { id:"nt_29", type:"choice", label:"O atendimento online funciona bem (se aplicável)?", options:["Sim","Razoável","Prefiro presencial"] },
    { id:"nt_30", type:"choice", label:"O que te faria recomendar?", options:["Resultado","Personalização","Preço","Suporte","Pontualidade"] },
    { id:"nt_nps", type:"nps",  label:"De 0 a 10, o quanto nos indicaria?", defaultActive:true },
    { id:"nt_sug", type:"text", label:"Alguma sugestão ou elogio?", defaultActive:true },
  ],
  "Advocacia": [
    { id:"ad_1",  type:"stars",  label:"Como avalia o atendimento do advogado?", defaultActive:true },
    { id:"ad_2",  type:"stars",  label:"Como avalia a clareza nas explicações jurídicas?", defaultActive:true },
    { id:"ad_3",  type:"stars",  label:"Como avalia a agilidade no serviço?", defaultActive:true },
    { id:"ad_4",  type:"stars",  label:"Como avalia a transparência nos honorários?", defaultActive:true },
    { id:"ad_5",  type:"stars",  label:"Como avalia a confiança transmitida?", defaultActive:true },
    { id:"ad_6",  type:"stars",  label:"Como avalia a comunicação durante o processo?" },
    { id:"ad_7",  type:"stars",  label:"Como avalia o conhecimento técnico?" },
    { id:"ad_8",  type:"stars",  label:"Como avalia o ambiente do escritório?" },
    { id:"ad_9",  type:"stars",  label:"Como avalia o retorno às suas mensagens?" },
    { id:"ad_10", type:"stars",  label:"Como avalia o custo-benefício?" },
    { id:"ad_11", type:"choice", label:"O que achou dos honorários?", options:["Justo","Um pouco alto","Caro"], defaultActive:true },
    { id:"ad_12", type:"choice", label:"É sua primeira experiência aqui?", options:["Sim","Não"] },
    { id:"ad_13", type:"choice", label:"Qual área do direito?", options:["Trabalhista","Família","Cível","Criminal","Empresarial","Outro"] },
    { id:"ad_14", type:"choice", label:"O advogado explicou o processo com clareza?", options:["Sim, muito","Razoável","Não"] },
    { id:"ad_15", type:"choice", label:"Os prazos foram cumpridos?", options:["Sim","Com pequeno atraso","Com atraso significativo"] },
    { id:"ad_16", type:"choice", label:"Como nos conheceu?", options:["Indicação","Google","OAB","Outro"] },
    { id:"ad_17", type:"choice", label:"Você voltaria para outro caso?", options:["Com certeza","Talvez","Provavelmente não"] },
    { id:"ad_18", type:"choice", label:"Indicaria para amigos?", options:["Com certeza","Talvez","Não"] },
    { id:"ad_19", type:"staff",  label:"Qual advogado te atendeu?", options:[] },
    { id:"ad_20", type:"choice", label:"O advogado retornou as mensagens rapidamente?", options:["Sim, sempre","Às vezes demorava","Demorava muito"] },
    { id:"ad_21", type:"choice", label:"Os documentos foram entregues no prazo?", options:["Sim","Com pequeno atraso","Com muito atraso"] },
    { id:"ad_22", type:"choice", label:"Houve alguma surpresa negativa nos honorários?", options:["Não","Pequena diferença","Valor bem diferente"] },
    { id:"ad_23", type:"choice", label:"Você se sentiu bem representado?", options:["Sim","Razoável","Não"] },
    { id:"ad_24", type:"choice", label:"Qual o resultado do caso (se concluído)?", options:["Favorável","Parcialmente favorável","Desfavorável","Em andamento"] },
    { id:"ad_25", type:"choice", label:"O escritório aceita consulta online?", options:["Sim","Às vezes","Não"] },
    { id:"ad_26", type:"choice", label:"O que mais gostou?", options:["Conhecimento","Comunicação","Transparência","Resultado","Pontualidade"] },
    { id:"ad_27", type:"choice", label:"Há estacionamento fácil?", options:["Sim","Difícil","Não tem"] },
    { id:"ad_28", type:"choice", label:"O escritório manteve você informado do processo?", options:["Sim, sempre","Às vezes","Raramente"] },
    { id:"ad_29", type:"choice", label:"Os documentos foram organizados e entregues?", options:["Sim","Razoável","Não"] },
    { id:"ad_30", type:"choice", label:"O que te faria recomendar?", options:["Resultado","Honestidade","Comunicação","Preço","Agilidade"] },
    { id:"ad_nps", type:"nps",  label:"De 0 a 10, o quanto nos indicaria?", defaultActive:true },
    { id:"ad_sug", type:"text", label:"Alguma sugestão ou elogio?", defaultActive:true },
  ],
  "Contabilidade": [
    { id:"co_1",  type:"stars",  label:"Como avalia o atendimento do contador?", defaultActive:true },
    { id:"co_2",  type:"stars",  label:"Como avalia a clareza nas informações?", defaultActive:true },
    { id:"co_3",  type:"stars",  label:"Como avalia a agilidade no serviço?", defaultActive:true },
    { id:"co_4",  type:"stars",  label:"Como avalia o cumprimento de prazos?", defaultActive:true },
    { id:"co_5",  type:"stars",  label:"Como avalia o custo-benefício?", defaultActive:true },
    { id:"co_6",  type:"stars",  label:"Como avalia a organização dos documentos?" },
    { id:"co_7",  type:"stars",  label:"Como avalia a proatividade da equipe?" },
    { id:"co_8",  type:"stars",  label:"Como avalia o suporte em dúvidas fiscais?" },
    { id:"co_9",  type:"stars",  label:"Como avalia o retorno às mensagens?" },
    { id:"co_10", type:"stars",  label:"Como avalia a confiança transmitida?" },
    { id:"co_11", type:"choice", label:"O que achou dos honorários?", options:["Justo","Um pouco alto","Caro"], defaultActive:true },
    { id:"co_12", type:"choice", label:"É seu primeiro ano como cliente?", options:["Sim","Não"] },
    { id:"co_13", type:"choice", label:"Qual tipo de serviço?", options:["MEI","Simples Nacional","Lucro Presumido","Lucro Real","Pessoa Física","Outro"] },
    { id:"co_14", type:"choice", label:"Os prazos fiscais foram cumpridos?", options:["Sim, sempre","Quase sempre","Houve atrasos"] },
    { id:"co_15", type:"choice", label:"Você é alertado sobre obrigações com antecedência?", options:["Sim","Às vezes","Raramente"] },
    { id:"co_16", type:"choice", label:"Como nos conheceu?", options:["Indicação","Google","Sindicato/associação","Outro"] },
    { id:"co_17", type:"choice", label:"Você renovaria o contrato?", options:["Com certeza","Talvez","Provavelmente não"] },
    { id:"co_18", type:"choice", label:"Indicaria para amigos?", options:["Com certeza","Talvez","Não"] },
    { id:"co_19", type:"staff",  label:"Qual contador te atende?", options:[] },
    { id:"co_20", type:"choice", label:"O contador retorna rapidamente?", options:["Sim, sempre","Às vezes","Demorava muito"] },
    { id:"co_21", type:"choice", label:"As guias/boletos são enviados com antecedência?", options:["Sim","Às vezes","Raramente"] },
    { id:"co_22", type:"choice", label:"Há portal/sistema online para documentos?", options:["Sim e é bom","Sim mas razoável","Não tem"] },
    { id:"co_23", type:"choice", label:"Você entende bem os relatórios enviados?", options:["Sim","Razoável","Não entendo bem"] },
    { id:"co_24", type:"choice", label:"A contabilidade é proativa em sugerir melhorias?", options:["Sim","Às vezes","Raramente"] },
    { id:"co_25", type:"choice", label:"Houve algum erro nos documentos?", options:["Não","Pequeno erro corrigido","Erro relevante"] },
    { id:"co_26", type:"choice", label:"O que mais gostou?", options:["Pontualidade","Comunicação","Conhecimento","Preço","Proatividade"] },
    { id:"co_27", type:"choice", label:"Há assessoria para abertura/encerramento?", options:["Sim","Não sei","Não"] },
    { id:"co_28", type:"choice", label:"O escritório tem atendimento presencial?", options:["Sim","Só online","Híbrido"] },
    { id:"co_29", type:"choice", label:"A equipe explica as obrigações fiscais?", options:["Sim","Razoável","Não"] },
    { id:"co_30", type:"choice", label:"O que te faria recomendar?", options:["Pontualidade","Comunicação","Preço","Conhecimento","Proatividade"] },
    { id:"co_nps", type:"nps",  label:"De 0 a 10, o quanto nos indicaria?", defaultActive:true },
    { id:"co_sug", type:"text", label:"Alguma sugestão ou elogio?", defaultActive:true },
  ],
  "Tecnologia / TI": [
    { id:"ti_1",  type:"stars",  label:"Como avalia a qualidade do serviço prestado?", defaultActive:true },
    { id:"ti_2",  type:"stars",  label:"Como avalia o diagnóstico do problema?", defaultActive:true },
    { id:"ti_3",  type:"stars",  label:"Como avalia o atendimento?", defaultActive:true },
    { id:"ti_4",  type:"stars",  label:"Como avalia o prazo de resolução?", defaultActive:true },
    { id:"ti_5",  type:"stars",  label:"Como avalia o custo-benefício?", defaultActive:true },
    { id:"ti_6",  type:"stars",  label:"Como avalia a clareza nas explicações técnicas?" },
    { id:"ti_7",  type:"stars",  label:"Como avalia o suporte pós-serviço?" },
    { id:"ti_8",  type:"stars",  label:"Como avalia a confiança no profissional?" },
    { id:"ti_9",  type:"stars",  label:"Como avalia a comunicação durante o serviço?" },
    { id:"ti_10", type:"stars",  label:"Como avalia o conhecimento técnico?" },
    { id:"ti_11", type:"choice", label:"O que achou do preço?", options:["Barato","Justo","Caro"], defaultActive:true },
    { id:"ti_12", type:"choice", label:"É sua primeira experiência aqui?", options:["Sim","Não"] },
    { id:"ti_13", type:"choice", label:"Qual serviço fez?", options:["Formatação/manutenção","Rede/internet","Desenvolvimento","Suporte remoto","Segurança","Outro"] },
    { id:"ti_14", type:"choice", label:"O problema foi resolvido?", options:["Sim, completamente","Parcialmente","Não"] },
    { id:"ti_15", type:"choice", label:"O prazo foi cumprido?", options:["Sim","Com pequeno atraso","Com muito atraso"] },
    { id:"ti_16", type:"choice", label:"Como nos conheceu?", options:["Indicação","Google","Instagram","LinkedIn","Outro"] },
    { id:"ti_17", type:"choice", label:"Você voltaria?", options:["Com certeza","Talvez","Provavelmente não"] },
    { id:"ti_18", type:"choice", label:"Indicaria para amigos?", options:["Com certeza","Talvez","Não"] },
    { id:"ti_19", type:"staff",  label:"Quem te atendeu?", options:[] },
    { id:"ti_20", type:"choice", label:"O profissional explicou o que foi feito?", options:["Sim","Razoável","Não"] },
    { id:"ti_21", type:"choice", label:"Houve cobrança surpresa?", options:["Não","Pequena diferença","Sim, valor diferente"] },
    { id:"ti_22", type:"choice", label:"O atendimento foi remoto ou presencial?", options:["Presencial","Remoto","Ambos"] },
    { id:"ti_23", type:"choice", label:"Há suporte após o serviço?", options:["Sim e é bom","Sim mas limitado","Não tem"] },
    { id:"ti_24", type:"choice", label:"O profissional foi pontual?", options:["Sim","Pequeno atraso","Muito atraso"] },
    { id:"ti_25", type:"choice", label:"Com que frequência você usa este serviço?", options:["Primeira vez","Raramente","Regularmente","Contrato mensal"] },
    { id:"ti_26", type:"choice", label:"O que mais gostou?", options:["Solução rápida","Conhecimento","Comunicação","Preço","Suporte"] },
    { id:"ti_27", type:"choice", label:"O equipamento/sistema ficou melhor que antes?", options:["Sim, muito melhor","Razoável","Igual"] },
    { id:"ti_28", type:"choice", label:"O profissional cumpriu o orçamento?", options:["Sim","Com pequena diferença","Não"] },
    { id:"ti_29", type:"choice", label:"Há garantia no serviço prestado?", options:["Sim","Não sei","Não"] },
    { id:"ti_30", type:"choice", label:"O que te faria recomendar?", options:["Solução rápida","Conhecimento","Honestidade","Preço","Suporte"] },
    { id:"ti_nps", type:"nps",  label:"De 0 a 10, o quanto nos indicaria?", defaultActive:true },
    { id:"ti_sug", type:"text", label:"Alguma sugestão ou elogio?", defaultActive:true },
  ],
  "Fotografia": [
    { id:"fg_1",  type:"stars",  label:"Como avalia a qualidade das fotos?", defaultActive:true },
    { id:"fg_2",  type:"stars",  label:"Como avalia o atendimento/simpatia?", defaultActive:true },
    { id:"fg_3",  type:"stars",  label:"Como avalia a criatividade e visão artística?", defaultActive:true },
    { id:"fg_4",  type:"stars",  label:"Como avalia o prazo de entrega?", defaultActive:true },
    { id:"fg_5",  type:"stars",  label:"Como avalia o custo-benefício?", defaultActive:true },
    { id:"fg_6",  type:"stars",  label:"Como avalia o equipamento utilizado?" },
    { id:"fg_7",  type:"stars",  label:"Como avalia a edição das fotos?" },
    { id:"fg_8",  type:"stars",  label:"Como avalia a pontualidade?" },
    { id:"fg_9",  type:"stars",  label:"Como avalia a organização do ensaio?" },
    { id:"fg_10", type:"stars",  label:"Como avalia a entrega (galeria/arquivo)?" },
    { id:"fg_11", type:"choice", label:"O que achou do preço?", options:["Barato","Justo","Caro"], defaultActive:true },
    { id:"fg_12", type:"choice", label:"É sua primeira sessão com este fotógrafo?", options:["Sim","Não"] },
    { id:"fg_13", type:"choice", label:"Qual tipo de ensaio?", options:["Casamento","Gestante","Newborn","Família","15 anos","Corporativo","Outro"] },
    { id:"fg_14", type:"choice", label:"As fotos ficaram como esperado?", options:["Sim, superaram","Próximo","Não"] },
    { id:"fg_15", type:"choice", label:"O prazo de entrega foi cumprido?", options:["Sim","Com pequeno atraso","Com muito atraso"] },
    { id:"fg_16", type:"choice", label:"Como nos conheceu?", options:["Indicação","Instagram","Google","Casamento/evento","Outro"] },
    { id:"fg_17", type:"choice", label:"Você contraria novamente?", options:["Com certeza","Talvez","Provavelmente não"] },
    { id:"fg_18", type:"choice", label:"Indicaria para amigos?", options:["Com certeza","Talvez","Não"] },
    { id:"fg_19", type:"choice", label:"A edição das fotos é de qualidade?", options:["Sim, excelente","Razoável","Podia melhorar"] },
    { id:"fg_20", type:"choice", label:"A quantidade de fotos entregues foi adequada?", options:["Sim","Poucas","Muitas"] },
    { id:"fg_21", type:"choice", label:"O fotógrafo direcionou bem o ensaio?", options:["Sim, muito","Razoável","Preferia mais direção"] },
    { id:"fg_22", type:"choice", label:"Como foram entregues as fotos?", options:["Galeria online","Pen drive","Álbum físico","Nuvem"] },
    { id:"fg_23", type:"choice", label:"Houve contrato assinado?", options:["Sim","Não","Não sei"] },
    { id:"fg_24", type:"choice", label:"O local do ensaio foi adequado?", options:["Sim","Razoável","Poderia ser melhor"] },
    { id:"fg_25", type:"choice", label:"O fotógrafo chegou no horário?", options:["Sim","Pequeno atraso","Muito atraso"] },
    { id:"fg_26", type:"choice", label:"O que mais gostou?", options:["Qualidade das fotos","Criatividade","Atendimento","Edição","Prazo"] },
    { id:"fg_27", type:"choice", label:"Há opções de álbum/impressão?", options:["Sim","Não sei","Não tem"] },
    { id:"fg_28", type:"choice", label:"A experiência foi confortável?", options:["Sim, muito","Razoável","Fiquei tenso"] },
    { id:"fg_29", type:"choice", label:"O orçamento foi transparente?", options:["Sim","Razoável","Havia itens ocultos"] },
    { id:"fg_30", type:"choice", label:"O que te faria contratar novamente?", options:["Qualidade","Criatividade","Prazo","Preço","Atendimento"] },
    { id:"fg_nps", type:"nps",  label:"De 0 a 10, o quanto nos indicaria?", defaultActive:true },
    { id:"fg_sug", type:"text", label:"Alguma sugestão ou elogio?", defaultActive:true },
  ],
  "Escola de Música": [
    { id:"em_1",  type:"stars",  label:"Como avalia a qualidade do ensino?", defaultActive:true },
    { id:"em_2",  type:"stars",  label:"Como avalia o professor?", defaultActive:true },
    { id:"em_3",  type:"stars",  label:"Como avalia a didática das aulas?", defaultActive:true },
    { id:"em_4",  type:"stars",  label:"Como avalia o ambiente/salas?", defaultActive:true },
    { id:"em_5",  type:"stars",  label:"Como avalia o custo-benefício?", defaultActive:true },
    { id:"em_6",  type:"stars",  label:"Como avalia os instrumentos disponíveis?" },
    { id:"em_7",  type:"stars",  label:"Como avalia o material didático?" },
    { id:"em_8",  type:"stars",  label:"Como avalia a pontualidade das aulas?" },
    { id:"em_9",  type:"stars",  label:"Como avalia o agendamento?" },
    { id:"em_10", type:"stars",  label:"Como avalia a evolução percebida?" },
    { id:"em_11", type:"choice", label:"O que achou do preço?", options:["Barato","Justo","Caro"], defaultActive:true },
    { id:"em_12", type:"choice", label:"É sua primeira experiência aqui?", options:["Sim","Não"] },
    { id:"em_13", type:"choice", label:"Qual instrumento/modalidade?", options:["Violão/Guitarra","Piano/Teclado","Bateria","Canto","Baixo","Outro"] },
    { id:"em_14", type:"choice", label:"Qual modalidade de aula?", options:["Individual","Em grupo","Online","Híbrido"] },
    { id:"em_15", type:"choice", label:"As aulas são no horário combinado?", options:["Sim, sempre","Às vezes atrasam","Frequentemente atrasam"] },
    { id:"em_16", type:"choice", label:"Como nos conheceu?", options:["Indicação","Google","Instagram","Passando","Outro"] },
    { id:"em_17", type:"choice", label:"Você continuaria estudando aqui?", options:["Com certeza","Talvez","Provavelmente não"] },
    { id:"em_18", type:"choice", label:"Indicaria para amigos?", options:["Com certeza","Talvez","Não"] },
    { id:"em_19", type:"staff",  label:"Qual professor te atende?", options:[] },
    { id:"em_20", type:"choice", label:"Percebeu evolução no aprendizado?", options:["Sim, muito","Razoável","Ainda não"] },
    { id:"em_21", type:"choice", label:"O professor adapta o ensino ao seu ritmo?", options:["Sim","Razoável","Não"] },
    { id:"em_22", type:"choice", label:"A escola oferece apresentações/recitais?", options:["Sim","Às vezes","Não"] },
    { id:"em_23", type:"choice", label:"O estúdio/sala tem boa acústica?", options:["Sim","Razoável","Não"] },
    { id:"em_24", type:"choice", label:"A escola tem instrumentos para praticar?", options:["Sim","Parcialmente","Não"] },
    { id:"em_25", type:"choice", label:"Com que frequência você tem aulas?", options:["Semanal","Quinzenal","Mensal","Irregular"] },
    { id:"em_26", type:"choice", label:"O que mais gostou?", options:["Professor","Método","Ambiente","Preço","Evolução"] },
    { id:"em_27", type:"choice", label:"Há acesso a partituras/materiais?", options:["Sim","Às vezes","Não"] },
    { id:"em_28", type:"choice", label:"Há estacionamento fácil?", options:["Sim","Difícil","Não tem"] },
    { id:"em_29", type:"choice", label:"O local é silencioso para estudar?", options:["Sim","Razoável","Muito barulhento"] },
    { id:"em_30", type:"choice", label:"O que te faria continuar?", options:["Qualidade do ensino","Professor","Preço","Variedade de estilos","Flexibilidade"] },
    { id:"em_nps", type:"nps",  label:"De 0 a 10, o quanto nos indicaria?", defaultActive:true },
    { id:"em_sug", type:"text", label:"Alguma sugestão ou elogio?", defaultActive:true },
  ],
  "Escape Room / Lazer": [
    { id:"er_1",  type:"stars",  label:"Como avalia a experiência geral?", defaultActive:true },
    { id:"er_2",  type:"stars",  label:"Como avalia a temática/cenário?", defaultActive:true },
    { id:"er_3",  type:"stars",  label:"Como avalia os puzzles/desafios?", defaultActive:true },
    { id:"er_4",  type:"stars",  label:"Como avalia o atendimento?", defaultActive:true },
    { id:"er_5",  type:"stars",  label:"Como avalia o custo-benefício?", defaultActive:true },
    { id:"er_6",  type:"stars",  label:"Como avalia a imersão/ambientação?" },
    { id:"er_7",  type:"stars",  label:"Como avalia a dificuldade dos desafios?" },
    { id:"er_8",  type:"stars",  label:"Como avalia a limpeza e manutenção?" },
    { id:"er_9",  type:"stars",  label:"Como avalia a segurança?" },
    { id:"er_10", type:"stars",  label:"Como avalia o suporte do game master?" },
    { id:"er_11", type:"choice", label:"O que achou do preço?", options:["Barato","Justo","Caro"], defaultActive:true },
    { id:"er_12", type:"choice", label:"É sua primeira vez aqui?", options:["Sim","Não"] },
    { id:"er_13", type:"choice", label:"Com quantas pessoas vieram?", options:["2 pessoas","3 a 4","5 a 6","Mais de 6"] },
    { id:"er_14", type:"choice", label:"Qual a ocasião?", options:["Lazer","Aniversário","Team building","Encontro de amigos","Outro"] },
    { id:"er_15", type:"choice", label:"Conseguiram escapar?", options:["Sim!","Quase","Não desta vez"] },
    { id:"er_16", type:"choice", label:"A dificuldade estava adequada?", options:["Perfeita","Muito fácil","Muito difícil"] },
    { id:"er_17", type:"choice", label:"Como nos conheceu?", options:["Indicação","Instagram","Google","Passando","Outro"] },
    { id:"er_18", type:"choice", label:"Você voltaria para outra sala?", options:["Com certeza","Talvez","Provavelmente não"] },
    { id:"er_19", type:"choice", label:"Indicaria para amigos?", options:["Com certeza","Talvez","Não"] },
    { id:"er_20", type:"staff",  label:"Quem foi o seu game master?", options:[] },
    { id:"er_21", type:"choice", label:"O cenário era imersivo e realista?", options:["Sim, muito","Razoável","Não"] },
    { id:"er_22", type:"choice", label:"O game master deu dicas adequadas?", options:["Sim","Razoável","Não precisamos"] },
    { id:"er_23", type:"choice", label:"Há opções de salas diferentes?", options:["Sim, várias","Poucas","Só uma"] },
    { id:"er_24", type:"choice", label:"O agendamento foi fácil?", options:["Sim","Razoável","Difícil"] },
    { id:"er_25", type:"choice", label:"Há área de descanso/lanche?", options:["Sim","Razoável","Não tem"] },
    { id:"er_26", type:"choice", label:"O check-in foi ágil?", options:["Sim","Razoável","Demorado"] },
    { id:"er_27", type:"choice", label:"O que mais gostou?", options:["Imersão","Puzzles","Atendimento","Tema","Adrenalina"] },
    { id:"er_28", type:"choice", label:"Há estacionamento fácil?", options:["Sim","Difícil","Não tem"] },
    { id:"er_29", type:"choice", label:"A experiência durou o tempo certo?", options:["Sim","Curta demais","Muito longa"] },
    { id:"er_30", type:"choice", label:"O que te faria voltar?", options:["Nova sala","Promoções","Tema novo","Com outras pessoas","Desafio maior"] },
    { id:"er_nps", type:"nps",  label:"De 0 a 10, o quanto nos indicaria?", defaultActive:true },
    { id:"er_sug", type:"text", label:"Alguma sugestão ou elogio?", defaultActive:true },
  ],
      ],
     "Comida Japonesa": [
    { id:"jp_1",  type:"stars",  label:"Como avalia a qualidade do peixe/frutos do mar?", defaultActive:true },
    { id:"jp_2",  type:"stars",  label:"Como avalia o sabor dos pratos?", defaultActive:true },
    { id:"jp_3",  type:"stars",  label:"Como avalia a apresentação dos pratos?", defaultActive:true },
    { id:"jp_4",  type:"stars",  label:"Como avalia a variedade do cardápio?", defaultActive:true },
    { id:"jp_5",  type:"stars",  label:"Como avalia o atendimento?", defaultActive:true },
    { id:"jp_6",  type:"stars",  label:"Como avalia a agilidade no serviço?" },
    { id:"jp_7",  type:"stars",  label:"Como avalia o ambiente?" },
    { id:"jp_8",  type:"stars",  label:"Como avalia a limpeza?" },
    { id:"jp_9",  type:"stars",  label:"Como avalia as bebidas (saquê, chás, drinks)?" },
    { id:"jp_10", type:"stars",  label:"Como avalia o custo-benefício?" },
    { id:"jp_11", type:"choice", label:"O que achou do preço?", options:["Barato","Justo","Caro"], defaultActive:true },
    { id:"jp_12", type:"choice", label:"É sua primeira visita?", options:["Sim","Não"] },
    { id:"jp_13", type:"choice", label:"O que pediu?", options:["Sushi/Sashimi","Temaki","Hot roll","Combinado","Prato quente","Rodízio"] },
    { id:"jp_14", type:"choice", label:"Como pediu?", options:["No local","Delivery","App"] },
    { id:"jp_15", type:"choice", label:"Com quantas pessoas veio?", options:["Sozinho","2 pessoas","3 a 5","Mais de 5"] },
    { id:"jp_16", type:"choice", label:"O peixe estava fresco?", options:["Sim, muito","Razoável","Não"] },
    { id:"jp_17", type:"choice", label:"O tempo de espera foi:", options:["Rápido","Razoável","Demorado"] },
    { id:"jp_18", type:"choice", label:"Como nos conheceu?", options:["Indicação","Google","Instagram","Outro"] },
    { id:"jp_19", type:"choice", label:"Você voltaria?", options:["Com certeza","Talvez","Provavelmente não"] },
    { id:"jp_20", type:"choice", label:"A embalagem do delivery manteve bem?", options:["Sim","Podia melhorar","Não"] },
    { id:"jp_21", type:"choice", label:"Indicaria para amigos?", options:["Com certeza","Talvez","Não"] },
    { id:"jp_22", type:"choice", label:"O cardápio tem opções para quem não come peixe?", options:["Sim","Poucas","Não"] },
    { id:"jp_23", type:"choice", label:"O ambiente remete à culinária japonesa?", options:["Sim","Um pouco","Não"] },
    { id:"jp_24", type:"staff",  label:"Quem te atendeu?", options:[] },
    { id:"jp_25", type:"choice", label:"O wasabi/gengibre/shoyu foram servidos corretamente?", options:["Sim","Faltou algo","Não"] },
    { id:"jp_26", type:"choice", label:"O que mais gostou?", options:["Peixe fresco","Sabor","Variedade","Apresentação","Atendimento"] },
    { id:"jp_27", type:"choice", label:"As porções são adequadas para o preço?", options:["Sim","Razoáveis","Pequenas"] },
    { id:"jp_28", type:"choice", label:"O local tem opções vegetarianas/veganas?", options:["Sim","Poucas","Não"] },
    { id:"jp_29", type:"choice", label:"O rodízio tinha boa reposição?", options:["Sim","Demorava","Não pedi rodízio"] },
    { id:"jp_30", type:"choice", label:"Qual dia da semana prefere vir?", options:["Semana","Sexta","Sábado","Domingo"] },
    { id:"jp_31", type:"choice", label:"A mesa estava limpa quando você chegou?", options:["Sim","Precisou pedir para limpar","Não"] },
    { id:"jp_nps", type:"nps",  label:"De 0 a 10, o quanto nos indicaria?", defaultActive:true },
    { id:"jp_sug", type:"text", label:"Alguma sugestão ou elogio?", defaultActive:true },
  ],
  "Comida Mexicana": [
    { id:"mx_1",  type:"stars",  label:"Como avalia o sabor dos pratos?", defaultActive:true },
    { id:"mx_2",  type:"stars",  label:"Como avalia a autenticidade da culinária?", defaultActive:true },
    { id:"mx_3",  type:"stars",  label:"Como avalia a variedade do cardápio?", defaultActive:true },
    { id:"mx_4",  type:"stars",  label:"Como avalia o atendimento?", defaultActive:true },
    { id:"mx_5",  type:"stars",  label:"Como avalia o ambiente/decoração?", defaultActive:true },
    { id:"mx_6",  type:"stars",  label:"Como avalia a agilidade no serviço?" },
    { id:"mx_7",  type:"stars",  label:"Como avalia as bebidas (margaritas, drinks)?" },
    { id:"mx_8",  type:"stars",  label:"Como avalia a limpeza?" },
    { id:"mx_9",  type:"stars",  label:"Como avalia o nível de picância das opções?" },
    { id:"mx_10", type:"stars",  label:"Como avalia o custo-benefício?" },
    { id:"mx_11", type:"choice", label:"O que achou do preço?", options:["Barato","Justo","Caro"], defaultActive:true },
    { id:"mx_12", type:"choice", label:"É sua primeira visita?", options:["Sim","Não"] },
    { id:"mx_13", type:"choice", label:"O que pediu?", options:["Tacos","Burritos","Nachos","Quesadillas","Combo","Outro"] },
    { id:"mx_14", type:"choice", label:"O nível de picância estava:", options:["Perfeito","Muito forte","Fraco demais"] },
    { id:"mx_15", type:"choice", label:"Com quantas pessoas veio?", options:["Sozinho","2 pessoas","3 a 5","Mais de 5"] },
    { id:"mx_16", type:"choice", label:"O tempo de espera foi:", options:["Rápido","Razoável","Demorado"] },
    { id:"mx_17", type:"choice", label:"Como nos conheceu?", options:["Indicação","Google","Instagram","Outro"] },
    { id:"mx_18", type:"choice", label:"Você voltaria?", options:["Com certeza","Talvez","Provavelmente não"] },
    { id:"mx_19", type:"choice", label:"O cardápio tem opções vegetarianas?", options:["Sim","Poucas","Não"] },
    { id:"mx_20", type:"choice", label:"A decoração/ambiente é temático?", options:["Sim, muito","Um pouco","Não"] },
    { id:"mx_21", type:"staff",  label:"Quem te atendeu?", options:[] },
    { id:"mx_22", type:"choice", label:"As porções são adequadas?", options:["Grandes","No tamanho certo","Pequenas"] },
    { id:"mx_23", type:"choice", label:"Indicaria para amigos?", options:["Com certeza","Talvez","Não"] },
    { id:"mx_24", type:"choice", label:"Como pediu?", options:["No local","Delivery","App"] },
    { id:"mx_25", type:"choice", label:"O que mais gostou?", options:["Sabor","Bebidas","Ambiente","Atendimento","Preço"] },
    { id:"mx_26", type:"choice", label:"A música/clima estava agradável?", options:["Sim","Alto demais","Sem graça"] },
    { id:"mx_27", type:"choice", label:"Os nachos/chips estavam frescos?", options:["Sim","Razoável","Não"] },
    { id:"mx_28", type:"choice", label:"Há opções sem glúten?", options:["Sim","Poucas","Não sei"] },
    { id:"mx_29", type:"choice", label:"O local aceita reservas?", options:["Sim e funciona","Sim mas complica","Não"] },
    { id:"mx_30", type:"choice", label:"Qual horário prefere vir?", options:["Almoço","Jantar","Final de semana"] },
    { id:"mx_31", type:"choice", label:"A mesa estava limpa quando você chegou?", options:["Sim","Precisou pedir para limpar","Não"] },
    { id:"mx_nps", type:"nps",  label:"De 0 a 10, o quanto nos indicaria?", defaultActive:true },
    { id:"mx_sug", type:"text", label:"Alguma sugestão ou elogio?", defaultActive:true },
  ],
  "Comida Chinesa": [
    { id:"cn_1",  type:"stars",  label:"Como avalia o sabor dos pratos?", defaultActive:true },
    { id:"cn_2",  type:"stars",  label:"Como avalia a variedade do cardápio?", defaultActive:true },
    { id:"cn_3",  type:"stars",  label:"Como avalia a qualidade dos ingredientes?", defaultActive:true },
    { id:"cn_4",  type:"stars",  label:"Como avalia o atendimento?", defaultActive:true },
    { id:"cn_5",  type:"stars",  label:"Como avalia a agilidade?", defaultActive:true },
    { id:"cn_6",  type:"stars",  label:"Como avalia o ambiente?" },
    { id:"cn_7",  type:"stars",  label:"Como avalia a limpeza?" },
    { id:"cn_8",  type:"stars",  label:"Como avalia as bebidas?" },
    { id:"cn_9",  type:"stars",  label:"Como avalia o custo-benefício?" },
    { id:"cn_10", type:"stars",  label:"Como avalia as porções?" },
    { id:"cn_11", type:"choice", label:"O que achou do preço?", options:["Barato","Justo","Caro"], defaultActive:true },
    { id:"cn_12", type:"choice", label:"É sua primeira visita?", options:["Sim","Não"] },
    { id:"cn_13", type:"choice", label:"O que pediu?", options:["Frango","Pato","Frutos do mar","Yakisoba","Lamen","Dim sum","Outro"] },
    { id:"cn_14", type:"choice", label:"Como pediu?", options:["No local","Delivery","App","Telefone"] },
    { id:"cn_15", type:"choice", label:"O tempo de espera foi:", options:["Rápido","Razoável","Demorado"] },
    { id:"cn_16", type:"choice", label:"Como nos conheceu?", options:["Indicação","Google","Instagram","Outro"] },
    { id:"cn_17", type:"choice", label:"Você voltaria?", options:["Com certeza","Talvez","Provavelmente não"] },
    { id:"cn_18", type:"choice", label:"A embalagem do delivery manteve bem?", options:["Sim","Podia melhorar","Não"] },
    { id:"cn_19", type:"choice", label:"Indicaria para amigos?", options:["Com certeza","Talvez","Não"] },
    { id:"cn_20", type:"staff",  label:"Quem te atendeu?", options:[] },
    { id:"cn_21", type:"choice", label:"O ambiente remete à culinária chinesa?", options:["Sim","Um pouco","Não"] },
    { id:"cn_22", type:"choice", label:"O que mais gostou?", options:["Sabor","Variedade","Atendimento","Preço","Apresentação"] },
    { id:"cn_23", type:"choice", label:"As porções são adequadas para o preço?", options:["Sim","Razoáveis","Pequenas"] },
    { id:"cn_24", type:"choice", label:"O local tem opções vegetarianas?", options:["Sim","Poucas","Não"] },
    { id:"cn_25", type:"choice", label:"Com quantas pessoas veio?", options:["Sozinho","2 pessoas","3 a 5","Mais de 5"] },
    { id:"cn_26", type:"choice", label:"O rodízio (se aplicável) tinha boa reposição?", options:["Sim","Demorava","Não pedi rodízio"] },
    { id:"cn_27", type:"choice", label:"A música/ambiente estava agradável?", options:["Sim","Alto demais","Sem graça"] },
    { id:"cn_28", type:"choice", label:"Há opções sem glúten?", options:["Sim","Poucas","Não sei"] },
    { id:"cn_29", type:"choice", label:"Pretende voltar para um evento/comemoração?", options:["Sim","Talvez","Não"] },
    { id:"cn_30", type:"choice", label:"Qual dia da semana prefere vir?", options:["Semana","Sexta","Sábado","Domingo"] },
    { id:"cn_31", type:"choice", label:"A mesa estava limpa quando você chegou?", options:["Sim","Precisou pedir para limpar","Não"] },
    { id:"cn_nps", type:"nps",  label:"De 0 a 10, o quanto nos indicaria?", defaultActive:true },
    { id:"cn_sug", type:"text", label:"Alguma sugestão ou elogio?", defaultActive:true },
  ],
  "Sorveteria": [
    { id:"sv_1",  type:"stars",  label:"Como avalia o sabor do sorvete?", defaultActive:true },
    { id:"sv_2",  type:"stars",  label:"Como avalia a variedade de sabores?", defaultActive:true },
    { id:"sv_3",  type:"stars",  label:"Como avalia a qualidade/textura do sorvete?", defaultActive:true },
    { id:"sv_4",  type:"stars",  label:"Como avalia os complementos (caldas, toppings)?", defaultActive:true },
    { id:"sv_5",  type:"stars",  label:"Como avalia o atendimento?", defaultActive:true },
    { id:"sv_6",  type:"stars",  label:"Como avalia a agilidade?" },
    { id:"sv_7",  type:"stars",  label:"Como avalia a limpeza?" },
    { id:"sv_8",  type:"stars",  label:"Como avalia o ambiente?" },
    { id:"sv_9",  type:"stars",  label:"Como avalia a apresentação/montagem?" },
    { id:"sv_10", type:"stars",  label:"Como avalia o custo-benefício?" },
    { id:"sv_11", type:"choice", label:"O que achou do preço?", options:["Barato","Justo","Caro"], defaultActive:true },
    { id:"sv_12", type:"choice", label:"É sua primeira visita?", options:["Sim","Não"] },
    { id:"sv_13", type:"choice", label:"O que pediu?", options:["Casquinha","Copo","Sundae","Milkshake","Waffle","Outro"] },
    { id:"sv_14", type:"choice", label:"Com quem veio?", options:["Sozinho","Com amigos","Em família","Em casal"] },
    { id:"sv_15", type:"choice", label:"Como nos conheceu?", options:["Indicação","Google","Instagram","Passando","Outro"] },
    { id:"sv_16", type:"choice", label:"O sorvete estava na consistência certa?", options:["Sim","Muito mole","Muito duro"] },
    { id:"sv_17", type:"choice", label:"Você voltaria?", options:["Com certeza","Talvez","Provavelmente não"] },
    { id:"sv_18", type:"choice", label:"Indicaria para amigos?", options:["Com certeza","Talvez","Não"] },
    { id:"sv_19", type:"choice", label:"Há opções sem lactose?", options:["Sim","Poucas","Não"] },
    { id:"sv_20", type:"choice", label:"Há opções veganas?", options:["Sim","Poucas","Não"] },
    { id:"sv_21", type:"staff",  label:"Quem te atendeu?", options:[] },
    { id:"sv_22", type:"choice", label:"O que mais gostou?", options:["Sabor","Variedade","Complementos","Atendimento","Preço"] },
    { id:"sv_23", type:"choice", label:"O local é adequado para crianças?", options:["Sim","Razoável","Não"] },
    { id:"sv_24", type:"choice", label:"A quantidade foi adequada ao preço?", options:["Sim","Podia ser mais","Excessiva"] },
    { id:"sv_25", type:"choice", label:"O ambiente é agradável para ficar?", options:["Sim","Prefiro levar","Não tem espaço"] },
    { id:"sv_26", type:"choice", label:"Qual período veio?", options:["Manhã","Tarde","Noite"] },
    { id:"sv_27", type:"choice", label:"Há novidades frequentes no cardápio?", options:["Sim","Raramente","Não"] },
    { id:"sv_28", type:"choice", label:"Os funcionários sabem explicar os sabores?", options:["Sim","Razoável","Não"] },
    { id:"sv_29", type:"choice", label:"A vitrine estava bem organizada?", options:["Sim","Razoável","Não"] },
    { id:"sv_30", type:"choice", label:"O que você mais pede?", options:["Sorvete simples","Com cobertura","Combinado","Milk-shake"] },
    { id:"sv_31", type:"choice", label:"A mesa estava limpa quando você chegou?", options:["Sim","Precisou pedir para limpar","Não"] },
    { id:"sv_nps", type:"nps",  label:"De 0 a 10, o quanto nos indicaria?", defaultActive:true },
    { id:"sv_sug", type:"text", label:"Alguma sugestão ou elogio?", defaultActive:true },
  ],
  "Açaí": [
    { id:"acai_1",  type:"stars",  label:"Como avalia o sabor do açaí?", defaultActive:true },
    { id:"acai_2",  type:"stars",  label:"Como avalia a consistência/textura do açaí?", defaultActive:true },
    { id:"acai_3",  type:"stars",  label:"Como avalia a variedade de complementos?", defaultActive:true },
    { id:"acai_4",  type:"stars",  label:"Como avalia a qualidade das frutas?", defaultActive:true },
    { id:"acai_5",  type:"stars",  label:"Como avalia o atendimento?", defaultActive:true },
    { id:"acai_6",  type:"stars",  label:"Como avalia a agilidade?" },
    { id:"acai_7",  type:"stars",  label:"Como avalia a limpeza?" },
    { id:"acai_8",  type:"stars",  label:"Como avalia a montagem/apresentação?" },
    { id:"acai_9",  type:"stars",  label:"Como avalia o custo-benefício?" },
    { id:"acai_10", type:"stars",  label:"Como avalia o tamanho das porções?" },
    { id:"acai_11", type:"choice", label:"O que achou do preço?", options:["Barato","Justo","Caro"], defaultActive:true },
    { id:"acai_12", type:"choice", label:"É sua primeira visita?", options:["Sim","Não"] },
    { id:"acai_13", type:"choice", label:"Qual tamanho pediu?", options:["300ml","500ml","700ml","1L ou mais"] },
    { id:"acai_14", type:"choice", label:"O açaí estava na consistência certa?", options:["Sim","Muito líquido","Muito grosso"] },
    { id:"acai_15", type:"choice", label:"Como nos conheceu?", options:["Indicação","Google","Instagram","Passando","Outro"] },
    { id:"acai_16", type:"choice", label:"Você costuma personalizar o açaí?", options:["Sim, bastante","Um pouco","Não, padrão mesmo"] },
    { id:"acai_17", type:"choice", label:"Você voltaria?", options:["Com certeza","Talvez","Provavelmente não"] },
    { id:"acai_18", type:"choice", label:"Com quem veio?", options:["Sozinho","Com amigos","Em família","Em casal"] },
    { id:"acai_19", type:"choice", label:"Indicaria para amigos?", options:["Com certeza","Talvez","Não"] },
    { id:"acai_20", type:"choice", label:"O que mais gostou?", options:["Sabor","Complementos","Tamanho","Preço","Atendimento"] },
    { id:"acai_21", type:"staff",  label:"Quem te atendeu?", options:[] },
    { id:"acai_22", type:"choice", label:"Como pediu?", options:["No local","Delivery","App"] },
    { id:"acai_23", type:"choice", label:"A embalagem do delivery estava boa?", options:["Sim","Vazou um pouco","Não"] },
    { id:"acai_24", type:"choice", label:"Há opções sem açúcar/diet?", options:["Sim","Poucas","Não"] },
    { id:"acai_25", type:"choice", label:"O local tem granola sem glúten?", options:["Sim","Não sei","Não"] },
    { id:"acai_26", type:"choice", label:"Qual período veio?", options:["Manhã","Tarde","Noite"] },
    { id:"acai_27", type:"choice", label:"A fila/espera foi:", options:["Rápida","Razoável","Demorada"] },
    { id:"acai_28", type:"choice", label:"O ambiente é agradável para ficar?", options:["Sim","Prefiro levar","Não tem espaço"] },
    { id:"acai_29", type:"choice", label:"Faltou algum complemento que queria?", options:["Não","Sim"] },
    { id:"acai_30", type:"choice", label:"Com que frequência você come açaí?", options:["Todo dia","Algumas vezes por semana","Raramente"] },
    { id:"acai_31", type:"choice", label:"A mesa estava limpa quando você chegou?", options:["Sim","Precisou pedir para limpar","Não"] },
    { id:"acai_nps", type:"nps",  label:"De 0 a 10, o quanto nos indicaria?", defaultActive:true },
    { id:"acai_sug", type:"text", label:"Alguma sugestão ou elogio?", defaultActive:true },
  ],
  "Padaria": [
    { id:"pd_1",  type:"stars",  label:"Como avalia a qualidade dos pães?", defaultActive:true },
    { id:"pd_2",  type:"stars",  label:"Como avalia a variedade dos pães e salgados?", defaultActive:true },
    { id:"pd_3",  type:"stars",  label:"Como avalia os doces e bolos?", defaultActive:true },
    { id:"pd_4",  type:"stars",  label:"Como avalia o café e bebidas?", defaultActive:true },
    { id:"pd_5",  type:"stars",  label:"Como avalia o atendimento?", defaultActive:true },
    { id:"pd_6",  type:"stars",  label:"Como avalia a agilidade?" },
    { id:"pd_7",  type:"stars",  label:"Como avalia a limpeza?" },
    { id:"pd_8",  type:"stars",  label:"Como avalia o ambiente?" },
    { id:"pd_9",  type:"stars",  label:"Como avalia a frescura dos produtos?" },
    { id:"pd_10", type:"stars",  label:"Como avalia o custo-benefício?" },
    { id:"pd_11", type:"choice", label:"O que achou do preço?", options:["Barato","Justo","Caro"], defaultActive:true },
    { id:"pd_12", type:"choice", label:"É sua primeira visita?", options:["Sim","Não"] },
    { id:"pd_13", type:"choice", label:"O que comprou?", options:["Pão francês","Salgado","Bolo","Café","Marmita","Combo café da manhã"] },
    { id:"pd_14", type:"choice", label:"Os pães estavam frescos?", options:["Sim, quentinhos","Razoável","Não"] },
    { id:"pd_15", type:"choice", label:"Como nos conheceu?", options:["Indicação","Google","Mora perto","Instagram","Outro"] },
    { id:"pd_16", type:"choice", label:"Qual período veio?", options:["Manhã","Tarde","Noite"] },
    { id:"pd_17", type:"choice", label:"O tempo de espera no caixa foi:", options:["Rápido","Razoável","Demorado"] },
    { id:"pd_18", type:"choice", label:"Você compra aqui com que frequência?", options:["Primeira vez","Raramente","Semanalmente","Todo dia"] },
    { id:"pd_19", type:"choice", label:"Você voltaria?", options:["Com certeza","Talvez","Provavelmente não"] },
    { id:"pd_20", type:"choice", label:"Indicaria para amigos?", options:["Com certeza","Talvez","Não"] },
    { id:"pd_21", type:"staff",  label:"Quem te atendeu?", options:[] },
    { id:"pd_22", type:"choice", label:"O que mais gostou?", options:["Pão","Salgados","Bolos","Atendimento","Preço"] },
    { id:"pd_23", type:"choice", label:"Há opções sem glúten?", options:["Sim","Poucas","Não"] },
    { id:"pd_24", type:"choice", label:"O local aceita encomendas?", options:["Sim","Não sei","Não"] },
    { id:"pd_25", type:"choice", label:"O caixa foi eficiente?", options:["Sim","Razoável","Demorou"] },
    { id:"pd_26", type:"choice", label:"A vitrine estava bem organizada?", options:["Sim","Razoável","Não"] },
    { id:"pd_27", type:"choice", label:"Faltou algum produto que procurou?", options:["Não","Sim","Às vezes"] },
    { id:"pd_28", type:"choice", label:"O ambiente é confortável para comer no local?", options:["Sim","Razoável","Prefiro levar"] },
    { id:"pd_29", type:"choice", label:"Há marmitas/refeições completas disponíveis?", options:["Sim","Poucas opções","Não"] },
    { id:"pd_30", type:"choice", label:"As embalagens para viagem são adequadas?", options:["Sim","Podia melhorar","Não"] },
    { id:"pd_31", type:"choice", label:"A mesa estava limpa quando você chegou?", options:["Sim","Precisou pedir para limpar","Não"] },
    { id:"pd_nps", type:"nps",  label:"De 0 a 10, o quanto nos indicaria?", defaultActive:true },
    { id:"pd_sug", type:"text", label:"Alguma sugestão ou elogio?", defaultActive:true },
  ],
};

const RAMO_PARA_BANCO = {
  "Hamburgueria":"Hamburgueria","Pizzaria":"Pizzaria","Restaurante":"Restaurante",
  "Cafeteria":"Cafeteria","Café":"Cafeteria","Lanchonete":"Lanchonete",
  "Bar":"Bar","Bar / Pub":"Bar",
  "Churrascaria":"Churrascaria",
  "Comida Japonesa":"Comida Japonesa","Sushi/Japonês":"Comida Japonesa",
  "Comida Mexicana":"Comida Mexicana",
  "Comida Chinesa":"Comida Chinesa",
  "Sorveteria":"Sorveteria","Sorveteria / Açaí":"Açaí",
  "Açaí":"Açaí",
  "Padaria":"Padaria","Confeitaria":"Confeitaria",
  "Salão de Beleza":"Salão de Beleza","Barbearia":"Barbearia","Spa / Estética":"Spa / Estética",
  "Clínica Médica":"Clínica Médica","Clínica":"Clínica Médica",
  "Clínica Odontológica":"Clínica Odontológica","Clínica Dentista":"Clínica Odontológica",
  "Fisioterapia":"Fisioterapia","Psicologia":"Psicologia","Nutrição":"Nutrição",
  "Pet Shop":"Pet Shop","Petshop":"Pet Shop","Clínica Veterinária":"Clínica Veterinária",
  "Farmácia":"Farmácia","Academia":"Academia","Posto de Gasolina":"Posto de Gasolina",
  "Imobiliária":"Imobiliária",
  "Hotel":"Hotel","Pousada":"Pousada","Hostel":"Hostel",
  "Supermercado":"Supermercado",
  "Loja de Roupas":"Loja de Roupas","Calçados":"Calçados",
  "Ótica":"Ótica","Joalheria":"Joalheria",
  "Papelaria":"Papelaria","Floricultura":"Floricultura",
  "Escola / Curso":"Escola / Curso","Escola de Música":"Escola de Música",
  "Oficina / Auto":"Oficina / Auto","Lavanderia":"Lavanderia",
  "Delivery":"Delivery",
  "Advocacia":"Advocacia","Contabilidade":"Contabilidade",
  "Tecnologia / TI":"Tecnologia / TI","Fotografia":"Fotografia",
  "Escape Room / Lazer":"Escape Room / Lazer",
};

  function bancoPerguntasParaQuestions(ramo, activePerguntaIds = null) {
  const bancoKey = RAMO_PARA_BANCO[ramo];
  if (!bancoKey || !PERGUNTAS_POR_NICHO[bancoKey]) return makeDefaultQuestions();
  const banco = PERGUNTAS_POR_NICHO[bancoKey];
  const ativas = activePerguntaIds
    ? banco.filter(p => activePerguntaIds.includes(p.id))
    : banco.filter(p => p.defaultActive);
  return ativas.map(p => ({
    id: p.id, type: p.type, label: p.label,
    options: p.options || [], required: true,
    allowOther: p.allowOther || false, emoji: "",
  }));
}

function QuestionBankSelector({ ramo, activeIds, onChangeIds }) {
  const bancoKey = RAMO_PARA_BANCO[ramo];
  const banco = bancoKey ? PERGUNTAS_POR_NICHO[bancoKey] : null;
  if (!banco) return (
    <div style={{ padding:"12px 14px", background:"var(--d2)", borderRadius:10, fontSize:13, color:"var(--muted2)" }}>
      Banco de perguntas não disponível para este ramo. Use o editor manual abaixo.
    </div>
  );
  const cats = [...new Set(banco.map(p => p.cat))];
  const defaultIds = banco.filter(p => p.defaultActive).map(p => p.id);
  const currentActive = activeIds || defaultIds;
  const toggle = (id) => {
    const next = currentActive.includes(id) ? currentActive.filter(x => x !== id) : [...currentActive, id];
    onChangeIds(next);
  };
  const TYPE_ICON = { stars:"⭐", choice:"☑️", nps:"📊", text:"📝", staff:"👤" };
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12, flexWrap:"wrap", gap:8 }}>
        <div style={{ fontSize:12, color:"var(--muted2)" }}>
          <strong style={{color:"var(--ac)"}}>{currentActive.length}</strong> ativa{currentActive.length!==1?"s":""} de {banco.length} disponíveis
        </div>
        <div style={{ display:"flex", gap:6 }}>
          <button className="btn-sm btn-sm-ghost" onClick={() => onChangeIds(defaultIds)} style={{fontSize:11}}>↺ Restaurar padrão</button>
          <button className="btn-sm btn-sm-ghost" onClick={() => onChangeIds(banco.map(p=>p.id))} style={{fontSize:11}}>✓ Todas</button>
        </div>
      </div>
      {cats.map(cat => (
        <div key={cat} style={{ marginBottom:14 }}>
          <div style={{ fontSize:10, fontWeight:800, letterSpacing:2, textTransform:"uppercase", color:"var(--muted)", marginBottom:6 }}>{cat}</div>
          {banco.filter(p => p.cat === cat).map(p => {
            const ativo = currentActive.includes(p.id);
            return (
              <div key={p.id} onClick={() => toggle(p.id)}
                style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:ativo?"var(--ac)11":"var(--d2)", border:`1.5px solid ${ativo?"var(--ac)55":"var(--border)"}`, borderRadius:10, marginBottom:5, cursor:"pointer", transition:"all 0.15s" }}>
                <div style={{ width:20, height:20, borderRadius:6, border:`2px solid ${ativo?"var(--ac)":"var(--muted)"}`, background:ativo?"var(--ac)":"transparent", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}>
                  {ativo && <span style={{fontSize:11,color:"#fff",fontWeight:900}}>✓</span>}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:ativo?700:500, color:ativo?"var(--text)":"var(--muted2)" }}>{p.label}</div>
                </div>
                <span style={{ fontSize:11, color:"var(--muted)", flexShrink:0 }}>{TYPE_ICON[p.type]}</span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

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
    feedbacks: [], plano: "R$ 129/mês", desde: "01/05/2026",
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

async function loadMasterPass() {
  try {
    const { data } = await supabase.from("config").select("value").eq("key", "master_pass").single();
    if (data?.value) MASTER.pass = data.value;
  } catch {}
}

async function saveMasterPass(newPass) {
  await supabase.from("config").upsert({ key: "master_pass", value: newPass });
  MASTER.pass = newPass;
}
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
  .bottom-nav { display: none; position: fixed; bottom: 0; left: 0; right: 0; z-index: 400; background: var(--d1); border-top: 1px solid var(--border); padding: 8px 4px; padding-bottom: max(8px, env(safe-area-inset-bottom)); }
  .bottom-nav-inner { display: flex; justify-content: space-around; align-items: center; }
  .bottom-tab { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 6px 10px; border-radius: 10px; cursor: pointer; border: none; background: none; color: var(--muted); font-family: var(--ff-body); font-size: 10px; font-weight: 700; transition: all 0.15s; min-width: 52px; }
  .bottom-tab.on { color: var(--ac); background: var(--ac)15; }
  .bottom-tab-icon { font-size: 20px; }
  @media (max-width: 768px) { .bottom-nav { display: block; } .main { padding-bottom: 80px !important; } }
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
  return data.map(e => {
    // Se não tem perguntas salvas, usa o banco do nicho
    // Se tem perguntas genéricas (IDs q_atend, q_amb etc), migra para o banco do nicho
    const isGeneric = !e.questions || e.questions.some(q => q.id === "q_atend" || q.id === "q_amb");
    const questions = isGeneric ? bancoPerguntasParaQuestions(e.ramo) : e.questions;
    return {
      ...e,
      questions,
      prizes: e.prizes || [],
      feedbacks: [],
      slug: e.slug || makeSlug(e.name),
      cardapio: e.cardapio || null,
    };
  });
}
async function loadFeedbacks(estId) {
  const { data, error } = await supabase.from("feedbacks").select("*").eq("estabelecimento_id", estId).order("created_at", { ascending: false });
  if (error) return [];
  return data.map(f => ({ id: f.id, nome: f.nome, data: new Date(f.created_at).toLocaleString("pt-BR"), answers: f.answers, premio: f.premio, brinde_entregue: f.brinde_entregue || false }));
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
  await supabase.from("cupons").delete().eq("estabelecimento_id", id);
  await supabase.from("estabelecimentos").delete().eq("id", id);
}
async function marcarBrindeEntregue(feedbackId) {
  await supabase.from("feedbacks").update({ brinde_entregue: true }).eq("id", feedbackId);
}
async function saveCupom(estId, codigo, premio, nomeCliente) {
  const { error } = await supabase.from("cupons").insert({
    id: uid(),
    estabelecimento_id: estId,
    codigo,
    premio,
    nome_cliente: nomeCliente,
    usado: false,
  });
  return !error;
}
async function validarCupom(codigo, estId) {
  const { data, error } = await supabase.from("cupons").select("*").eq("codigo", codigo).eq("estabelecimento_id", estId).single();
  if (error || !data) return { valido: false, motivo: "Cupom não encontrado." };
  if (data.usado) return { valido: false, motivo: "Este cupom já foi utilizado." };
  return { valido: true, cupom: data };
}
async function marcarCupomUsado(codigo, estId) {
  await supabase.from("cupons").update({ usado: true }).eq("codigo", codigo).eq("estabelecimento_id", estId);
}
async function createEstabelecimento(est) {
  const { feedbacks, ...data } = est;
  const { error } = await supabase.from("estabelecimentos").insert(data);
  if (error) console.error("Erro Supabase:", error.message, error.details);
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
      <div className="q-label">{q.emoji ? <span style={{marginRight:6}}>{q.emoji}</span> : null}{q.label}</div>
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
  const url = `https://app.notacheia.com.br/${slug}`;
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
  const temCardapio = est && temCardapioPorPlano(est.plano);
  const navs = isMaster
    ? [{ id: "ests", icon: "🏢", lbl: "Estabelecimentos" }, { id: "metricas", icon: "📊", lbl: "Métricas gerais" }, { id: "prospeccao", icon: "🗺️", lbl: "Prospecção" }, { id: "contrato", icon: "📄", lbl: "Gerar contrato" }, { id: "senha", icon: "🔑", lbl: "Trocar senha" }]
    : [
        { id: "overview", icon: "📊", lbl: "Visão Geral" },
        { id: "feedbacks", icon: "💬", lbl: "Feedbacks" },
        { id: "clientes", icon: "👥", lbl: "Clientes" },
        { id: "insights", icon: "💡", lbl: "Insights" },
        { id: "relatorio", icon: "📋", lbl: "Relatório" },
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
        <button onClick={onLogout} style={{ background:"none", border:"1px solid var(--border)", borderRadius:8, color:"var(--muted2)", fontSize:11, fontWeight:700, padding:"5px 10px", cursor:"pointer", fontFamily:"var(--ff-body)", whiteSpace:"nowrap" }}>← Sair</button>
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
      {/* Bottom Nav Mobile */}
      {!isMaster && (
        <div className="bottom-nav">
          <div className="bottom-nav-inner">
            {[
              { id: "overview", icon: "📊", lbl: "Início" },
              { id: "feedbacks", icon: "💬", lbl: "Feedbacks" },
              { id: "brindes", icon: "🎁", lbl: "Brindes" },
              { id: "qrcode", icon: "📱", lbl: "QR Code" },
            ].map(n => (
              <button key={n.id} className={`bottom-tab ${tab === n.id ? "on" : ""}`} onClick={() => setTab(n.id)}>
                <span className="bottom-tab-icon">{n.icon}</span>
                <span>{n.lbl}</span>
              </button>
            ))}
            <button className={`bottom-tab ${["insights","clientes","relatorio","cardapio","setup","senha"].includes(tab) ? "on" : ""}`} onClick={() => setOpen(true)}>
              <span className="bottom-tab-icon">☰</span>
              <span>Mais</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ============================================================
// CLIENT APP — fluxo do cliente
// ============================================================
function ClientApp({ est, onSubmit, masterMode = false }) {
  const interval = est.feedbackInterval || 30;
  const temCardapio = temCardapioPorPlano(est.plano) && est.cardapio;
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
            if (!masterMode) await saveCupom(est.id, coupon, p.label, savedNome);
            markFeedbackDone(est.id, masterMode);
            setSaving(false);
            if (!masterMode && avgStars > 0 && avgStars < 4 && est.owner) {
              const npsQ = est.questions.find(q => q.type === "nps");
              const nps = npsQ && savedAnswers?.[npsQ.id] !== undefined ? savedAnswers[npsQ.id] : "-";
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
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent("https://notacheia.com.br/validar/" + est.id + "/" + coupon)}&bgcolor=1a1a1a&color=f0ede8&margin=8`} alt="QR Validação" style={{ borderRadius: 8, width: 100, height: 100 }} />
            <div style={{ fontSize: 10, color: "var(--muted)", textAlign: "center" }}>Dono: escaneie para validar</div>
          </div>
        </div>
        <button className="btn-download" onClick={() => { const txt = `NotaCheia ⭐\n${est.name}\n\nPrêmio: ${prize.label}\nCupom: ${coupon}\nVálido até: ${addDays(7)}\n\nApresente ao atendente para resgatar.`; const blob = new Blob([txt], { type: "text/plain" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `premio-${coupon}.txt`; a.click(); }}>⬇️ Baixar comprovante</button>
        {est.googleUrl && savedAnswers && (() => { const npsQ = est.questions.find(q => q.type === "nps"); const npsVal = npsQ ? savedAnswers[npsQ.id] : undefined; return npsVal >= 9; })() && (
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
  const [qEmojiOpen, setQEmojiOpen] = useState(null);
  const [qEmojiCat, setQEmojiCat] = useState(Object.keys(WA_CATS)[0]);
  const [newP, setNewP] = useState({ label: "", emoji: "🎁", color: "#e63946" });
  const [filter, setFilter] = useState("todos");
  const [newPass, setNewPass] = useState({ atual: "", nova: "", confirma: "" });
  const [passMsg, setPassMsg] = useState("");
  const [newEmail, setNewEmail] = useState({ atual: "", novo: "", confirma: "" });
  const [emailMsg, setEmailMsg] = useState("");
  const [relatorioEnviando, setRelatorioEnviando] = useState(false);
  const [relatorioEnviado, setRelatorioEnviado] = useState(false);
  const COLORS = ["#e63946", "#f4a261", "#2a9d8f", "#457b9d", "#6d597a", "#e76f51", "#264653", "#e9c46a", "#f72585", "#4cc9f0", "#111", "#333"];
  const starQs = est.questions.filter(q => q.type === "stars");
  const npsId = (est.questions.find(q => q.type === "nps")?.id) || "q_nps";
  const staffId = (est.questions.find(q => q.type === "staff")?.id) || "q_atend";
  const starAvg = (key) => { const v = est.feedbacks.map(f => f.answers?.[key]).filter(v => typeof v === "number" && v > 0); return v.length ? (v.reduce((a, b) => a + b, 0) / v.length).toFixed(1) : "-"; };
  const overall = () => { if (!starQs.length || !est.feedbacks.length) return "-"; const v = est.feedbacks.flatMap(f => starQs.map(q => f.answers?.[q.id] || 0).filter(v => v > 0)); return v.length ? (v.reduce((a, b) => a + b, 0) / v.length).toFixed(1) : "-"; };
  const npsAvg = () => { const v = est.feedbacks.map(f => f.answers?.[npsId]).filter(v => v !== undefined); return v.length ? (v.reduce((a, b) => a + b, 0) / v.length).toFixed(1) : "-"; };
  const staffRanking = () => { const map = {}; est.feedbacks.forEach(f => { const atd = f.answers?.q_atend; if (!atd) return; if (!map[atd]) map[atd] = { total: 0, count: 0 }; const s = starQs.map(q => f.answers?.[q.id] || 0).filter(v => v > 0); if (s.length) { map[atd].total += s.reduce((a, b) => a + b, 0) / s.length; map[atd].count++; } }); return Object.entries(map).map(([name, d]) => ({ name, avg: d.count ? (d.total / d.count).toFixed(1) : 0 })).sort((a, b) => b.avg - a.avg); };
  const howKnew = () => { const map = {}; est.feedbacks.forEach(f => { const v = f.answers?.q_como; if (v) map[v] = (map[v] || 0) + 1; }); return Object.entries(map).sort((a, b) => b[1] - a[1]); };
  const chartData = (() => { const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"], result = []; for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const lbl = days[d.getDay()], dateStr = d.toLocaleDateString("pt-BR"); result.push({ lbl, val: est.feedbacks.filter(f => f.data?.includes(dateStr)).length }); } return result; })();
  const insights = () => { const list = [], ov = parseFloat(overall()), nps = parseFloat(npsAvg()); if (ov >= 4.5) list.push({ icon: "🏆", text: <><strong>Excelente!</strong> Nota acima de 4.5.</> }); if (nps >= 8) list.push({ icon: "📈", text: <><strong>NPS alto!</strong> Clientes vão indicar seu negócio.</> }); const esp = parseFloat(starAvg("q_esp")); if (esp && esp < 3.5) list.push({ icon: "⚠️", text: <><strong>Tempo de espera!</strong> Nota {esp}.</> }); const pv = est.feedbacks.map(f => f.answers?.q_preco).filter(Boolean); const caro = pv.filter(v => v === "Caro pelo que oferece").length; if (caro > pv.length * 0.3) list.push({ icon: "💰", text: <><strong>{Math.round(caro / pv.length * 100)}% acham caro.</strong></> }); const prim = est.feedbacks.filter(f => f.answers?.q_first === "Sim").length; if (prim > 0) list.push({ icon: "🆕", text: <><strong>{prim} cliente{prim > 1 ? "s" : ""} novo{prim > 1 ? "s" : ""}</strong> recentemente!</> }); if (list.length === 0) list.push({ icon: "📊", text: <>Continue coletando feedbacks para receber insights.</> }); return list; };
  // Auto-envio segunda-feira
  React.useEffect(() => {
    const hoje = new Date();
    if (hoje.getDay() !== 1) return; // só segunda-feira
    const chave = `relatorio_${est.id}_${hoje.toLocaleDateString("pt-BR")}`;
    try {
      if (localStorage.getItem(chave)) return;
      localStorage.setItem(chave, "1");
      setTimeout(() => enviarRelatorio(), 3000);
    } catch {}
  }, []);

  const filteredFeedbacks = () => { if (filter === "positivos") return est.feedbacks.filter(f => (f.answers?.[npsId] || 0) >= 9); if (filter === "negativos") return est.feedbacks.filter(f => (f.answers?.[npsId] || 0) <= 6); if (filter === "neutros") return est.feedbacks.filter(f => { const n = f.answers?.[npsId]; return n === 7 || n === 8; }); return est.feedbacks; };
  const save = async () => { setSaving(true); await saveEstabelecimento(ed); onUpdate(ed); setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const addQ = () => { if (!newQ.label) return; const opts = newQ.options.split(",").map(s => s.trim()).filter(Boolean); setEd(e => ({ ...e, questions: [...e.questions, { id: uid(), ...newQ, options: opts, required: true }] })); setNewQ({ label: "", type: "stars", options: "" }); };
  const removeQ = id => setEd(e => ({ ...e, questions: e.questions.filter(q => q.id !== id) }));
  const addP = () => { if (!newP.label) return; setEd(e => ({ ...e, prizes: [...e.prizes, { id: uid(), ...newP }] })); setNewP({ label: "", emoji: "🎁", color: "#e63946" }); };
  const removeP = id => setEd(e => ({ ...e, prizes: e.prizes.filter(p => p.id !== id) }));
  const trocarSenha = async () => { if (newPass.atual !== est.pass) { setPassMsg("❌ Senha incorreta."); setTimeout(() => setPassMsg(""), 3000); return; } if (newPass.nova.length < 6) { setPassMsg("❌ Mínimo 6 caracteres."); setTimeout(() => setPassMsg(""), 3000); return; } if (newPass.nova !== newPass.confirma) { setPassMsg("❌ Senhas não coincidem."); setTimeout(() => setPassMsg(""), 3000); return; } const u = { ...est, pass: newPass.nova }; await saveEstabelecimento(u); onUpdate(u); setPassMsg("✅ Senha alterada!"); setNewPass({ atual: "", nova: "", confirma: "" }); setTimeout(() => setPassMsg(""), 3000); };
  const trocarEmail = async () => {
    if (newEmail.atual !== est.owner) { setEmailMsg("❌ E-mail atual incorreto."); setTimeout(() => setEmailMsg(""), 3000); return; }
    if (!newEmail.novo.includes("@")) { setEmailMsg("❌ E-mail inválido."); setTimeout(() => setEmailMsg(""), 3000); return; }
    if (newEmail.novo !== newEmail.confirma) { setEmailMsg("❌ E-mails não coincidem."); setTimeout(() => setEmailMsg(""), 3000); return; }
    const u = { ...est, owner: newEmail.novo };
    await saveEstabelecimento(u);
    onUpdate(u);
    setEmailMsg("✅ E-mail alterado com sucesso!");
    setNewEmail({ atual: "", novo: "", confirma: "" });
    setTimeout(() => setEmailMsg(""), 3000);
  };

  const getFeedbacksSemana = (semanaAtras = 0) => {
    const agora = new Date();
    const inicio = new Date(agora); inicio.setDate(inicio.getDate() - (7 * (semanaAtras + 1)));
    const fim = new Date(agora); fim.setDate(fim.getDate() - (7 * semanaAtras));
    return est.feedbacks.filter(f => {
      if (!f.data) return false;
      try {
        const partes = f.data.split(/[/, :]/);
        const d = new Date(partes[2], partes[1]-1, partes[0]);
        return d >= inicio && d < fim;
      } catch { return false; }
    });
  };

  const gerarHTMLRelatorio = (fbSemana, fbSemanaAnterior) => {
    const ac = est.color || "#e63946";
    const totalAtual = fbSemana.length;
    const totalAnterior = fbSemanaAnterior.length;
    const diffTotal = totalAtual - totalAnterior;
    const sqs = est.questions.filter(q => q.type === "stars");
    const _npsId = est.questions.find(q => q.type === "nps")?.id || "q_nps";
    const _textId = est.questions.find(q => q.type === "text")?.id || "q_sug";
    const calcNps = (fbs) => { const v = fbs.map(f => f.answers?.[_npsId]).filter(v => v !== undefined); return v.length ? (v.reduce((a,b)=>a+b,0)/v.length).toFixed(1) : "-"; };
    const calcNota = (fbs) => { if (!sqs.length || !fbs.length) return "-"; const v = fbs.flatMap(f => sqs.map(q => f.answers?.[q.id]||0).filter(v=>v>0)); return v.length ? (v.reduce((a,b)=>a+b,0)/v.length).toFixed(1) : "-"; };
    const npsAtual = calcNps(fbSemana);
    const npsAnterior = calcNps(fbSemanaAnterior);
    const notaAtual = calcNota(fbSemana);
    const notaAnterior = calcNota(fbSemanaAnterior);
    const negativos = fbSemana.filter(f => (f.answers?.[_npsId]||0) <= 6 && f.answers?.[_npsId] !== undefined);
    const promotores = fbSemana.filter(f => (f.answers?.[_npsId]||0) >= 9);
    const staffQ = est.questions.find(q => q.type === "staff");
    const staffMap = {};
    if (staffQ) fbSemana.forEach(f => { const n = f.answers?.[staffQ.id]; if (!n) return; if (!staffMap[n]) staffMap[n] = {t:0,c:0}; const s=sqs.map(q=>f.answers?.[q.id]||0).filter(v=>v>0); if(s.length){staffMap[n].t+=s.reduce((a,b)=>a+b,0)/s.length;staffMap[n].c++;} });
    const ranking = Object.entries(staffMap).map(([n,d])=>({n,avg:d.c?(d.t/d.c).toFixed(1):0})).sort((a,b)=>b.avg-a.avg).slice(0,3);
    const comoMap = {};
    fbSemana.forEach(f => { const comoQ = est.questions.find(q => q.label.toLowerCase().includes("conheceu")); const v = comoQ ? f.answers?.[comoQ.id] : null; if (v) comoMap[v] = (comoMap[v]||0)+1; });
    const comoList = Object.entries(comoMap).sort((a,b)=>b[1]-a[1]).slice(0,4);
    const comentarios = fbSemana.filter(f => f.answers?.[_textId] && f.answers[_textId].trim().length > 5).slice(0,3);
    const precoMap = {};
    fbSemana.forEach(f => { const precoQ = est.questions.find(q => q.label.toLowerCase().includes("preço") && q.type === "choice"); const v = precoQ ? f.answers?.[precoQ.id] : null; if (v) precoMap[v] = (precoMap[v]||0)+1; });
    const dataInicio = new Date(); dataInicio.setDate(dataInicio.getDate()-7);
    const dataFim = new Date(); dataFim.setDate(dataFim.getDate()-1);
    const fmt = (d) => d.toLocaleDateString("pt-BR");
    const seta = (atual, ant) => { if (ant === "-" || atual === "-") return ""; const d = parseFloat(atual) - parseFloat(ant); if (d > 0) return `<span style="color:#4ade80;font-size:12px;">▲ +${d.toFixed(1)}</span>`; if (d < 0) return `<span style="color:#f87171;font-size:12px;">▼ ${d.toFixed(1)}</span>`; return `<span style="color:#888;font-size:12px;">= igual</span>`; };

    return `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:0;background:#0d0d0d;color:#f0ede8;border-radius:18px;overflow:hidden;">
      <div style="background:${ac};padding:24px 28px;">
        <div style="font-size:28px;margin-bottom:6px;">${est.emoji}</div>
        <div style="font-size:22px;font-weight:900;letter-spacing:1px;">${est.name}</div>
        <div style="font-size:13px;opacity:0.85;margin-top:4px;">📋 Relatório semanal · ${fmt(dataInicio)} a ${fmt(dataFim)}</div>
      </div>

      <div style="padding:24px 28px;">
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:24px;">
          <div style="background:#181818;border-radius:12px;padding:16px;text-align:center;">
            <div style="font-size:28px;font-weight:900;color:${ac};">${totalAtual}</div>
            <div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-top:4px;">Feedbacks</div>
            <div style="margin-top:4px;">${diffTotal > 0 ? `<span style="color:#4ade80;font-size:11px;">▲ +${diffTotal} vs semana ant.</span>` : diffTotal < 0 ? `<span style="color:#f87171;font-size:11px;">▼ ${diffTotal} vs semana ant.</span>` : `<span style="color:#888;font-size:11px;">= igual à semana ant.</span>`}</div>
          </div>
          <div style="background:#181818;border-radius:12px;padding:16px;text-align:center;">
            <div style="font-size:28px;font-weight:900;color:${notaAtual >= 4 ? "#4ade80" : notaAtual >= 3 ? "#f0c96e" : "#f87171"};">⭐ ${notaAtual}</div>
            <div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-top:4px;">Nota média</div>
            <div style="margin-top:4px;">${seta(notaAtual, notaAnterior)}</div>
          </div>
          <div style="background:#181818;border-radius:12px;padding:16px;text-align:center;">
            <div style="font-size:28px;font-weight:900;color:${parseFloat(npsAtual) >= 8 ? "#4ade80" : parseFloat(npsAtual) >= 6 ? "#f0c96e" : "#f87171"};">📊 ${npsAtual}</div>
            <div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-top:4px;">NPS médio</div>
            <div style="margin-top:4px;">${seta(npsAtual, npsAnterior)}</div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:24px;">
          <div style="background:#181818;border-radius:12px;padding:14px;text-align:center;">
            <div style="font-size:22px;font-weight:900;color:#4ade80;">${promotores.length}</div>
            <div style="font-size:10px;color:#888;text-transform:uppercase;margin-top:4px;">😍 Promotores</div>
          </div>
          <div style="background:#181818;border-radius:12px;padding:14px;text-align:center;">
            <div style="font-size:22px;font-weight:900;color:#f0c96e;">${fbSemana.filter(f=>{const n=f.answers?.[_npsId];return n===7||n===8;}).length}</div>
            <div style="font-size:10px;color:#888;text-transform:uppercase;margin-top:4px;">😐 Neutros</div>
          </div>
          <div style="background:#181818;border-radius:12px;padding:14px;text-align:center;">
            <div style="font-size:22px;font-weight:900;color:#f87171;">${negativos.length}</div>
            <div style="font-size:10px;color:#888;text-transform:uppercase;margin-top:4px;">😞 Detratores</div>
          </div>
        </div>

        ${negativos.length > 0 ? `<div style="background:#1a0505;border:1px solid #f8717133;border-radius:12px;padding:16px;margin-bottom:20px;">
          <div style="font-size:13px;font-weight:800;color:#f87171;margin-bottom:8px;">⚠️ ${negativos.length} feedback${negativos.length>1?"s negativos":"negativo"} esta semana</div>
          ${negativos.slice(0,2).map(f=>`<div style="background:#111;border-radius:8px;padding:10px;margin-bottom:6px;font-size:12px;"><strong>${f.nome||"Anônimo"}</strong> · NPS ${f.answers?.[_npsId]??"-"}${f.answers?.[_textId]?`<br/><span style="color:#aaa;font-style:italic;">"${f.answers[_textId]}"</span>`:""}</div>`).join("")}
        </div>` : `<div style="background:#0a1f0a;border:1px solid #4ade8033;border-radius:12px;padding:14px;margin-bottom:20px;text-align:center;">
          <div style="font-size:13px;font-weight:800;color:#4ade80;">✅ Nenhum feedback negativo esta semana!</div>
        </div>`}

        ${ranking.length > 0 ? `<div style="margin-bottom:20px;">
          <div style="font-size:12px;font-weight:800;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">🏆 Ranking de colaboradores</div>
          ${ranking.map((r,i)=>`<div style="display:flex;align-items:center;gap:10px;background:#181818;border-radius:10px;padding:10px 14px;margin-bottom:6px;"><span style="font-size:16px;font-weight:900;color:#888;width:20px;">${i+1}</span><span style="flex:1;font-weight:700;font-size:13px;">${r.n}</span><span style="font-size:16px;font-weight:900;color:${ac};">⭐ ${r.avg}</span></div>`).join("")}
        </div>` : ""}

        ${comoList.length > 0 ? `<div style="margin-bottom:20px;">
          <div style="font-size:12px;font-weight:800;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">📍 Como chegaram</div>
          ${comoList.map(([k,v])=>`<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid #222;font-size:13px;"><span style="color:#ccc;">${k.replace("Outro:","")}</span><span style="font-weight:800;color:${ac};">${v}</span></div>`).join("")}
        </div>` : ""}

        ${Object.keys(precoMap).length > 0 ? `<div style="margin-bottom:20px;">
          <div style="font-size:12px;font-weight:800;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">💰 Percepção de preço</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            ${Object.entries(precoMap).map(([k,v])=>`<div style="background:#181818;border-radius:20px;padding:6px 12px;font-size:12px;"><span style="color:#888;">${k.replace(" pelo que oferece","")}</span> <strong style="color:${ac};">${v}</strong></div>`).join("")}
          </div>
        </div>` : ""}

        ${comentarios.length > 0 ? `<div style="margin-bottom:20px;">
          <div style="font-size:12px;font-weight:800;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">💬 Comentários da semana</div>
          ${comentarios.map(f=>`<div style="background:#181818;border-left:3px solid ${ac};border-radius:0 10px 10px 0;padding:10px 14px;margin-bottom:8px;font-size:13px;font-style:italic;color:#ccc;">"${f.answers[_textId]}"<div style="font-size:11px;color:#555;margin-top:4px;font-style:normal;">${f.nome||"Anônimo"}</div></div>`).join("")}
        </div>` : ""}

        <div style="text-align:center;padding-top:16px;border-top:1px solid #222;">
          <a href="https://nota-cheia.vercel.app" style="display:inline-block;background:${ac};color:#fff;padding:12px 28px;border-radius:12px;font-weight:800;font-size:14px;text-decoration:none;">Ver painel completo →</a>
          <p style="font-size:11px;color:#444;margin-top:14px;">NotaCheia ⭐ · notacheia.com.br</p>
        </div>
      </div>
    </div>`;
  };

  const enviarRelatorio = async () => {
    if (!est.owner) { alert("E-mail do dono não cadastrado."); return; }
    setRelatorioEnviando(true);
    const fbSemana = getFeedbacksSemana(0);
    const fbAnterior = getFeedbacksSemana(1);
    const html = gerarHTMLRelatorio(fbSemana, fbAnterior);
    const dataInicio = new Date(); dataInicio.setDate(dataInicio.getDate()-7);
    const dataFim = new Date(); dataFim.setDate(dataFim.getDate()-1);
    const fmt = (d) => d.toLocaleDateString("pt-BR");
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": "Bearer re_3kBjVHJT_MhYrCC7g7x5U9B8TMfJYTmev", "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "NotaCheia <notificacoes@notacheia.com.br>",
          to: [est.owner],
          subject: `📋 Relatório semanal — ${est.name} · ${fmt(dataInicio)} a ${fmt(dataFim)}`,
          html,
        }),
      });
      if (res.ok) { setRelatorioEnviado(true); setTimeout(() => setRelatorioEnviado(false), 4000); }
      else { alert("Erro ao enviar. Verifique o e-mail cadastrado."); }
    } catch { alert("Erro de conexão."); }
    setRelatorioEnviando(false);
  };

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
            <div className="metric"><div className="metric-val">{est.feedbacks.filter(f => (f.answers?.[npsId] || 0) >= 9).length}</div><div className="metric-lbl">Promotores</div></div>
            <div className="metric"><div className="metric-val">{est.feedbacks.filter(f => { const prim = est.questions.find(q => q.type === "choice" && q.label.toLowerCase().includes("primeira")); return prim && f.answers?.[prim.id] === "Sim"; }).length}</div><div className="metric-lbl">Clientes novos</div></div>
            <div className="metric"><div className="metric-val" style={{ fontSize: 20 }}>{est.googleUrl ? "✅" : "❌"}</div><div className="metric-lbl">Google Reviews</div></div>
          </div>
          <div className="chart-wrap"><div className="chart-title">📅 Feedbacks — últimos 7 dias</div><MiniBarChart data={chartData} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 8, marginBottom: 14 }}>
            {starQs.map(q => { const s = starAvg(q.id); return (<div key={q.id} style={{ background: "var(--d1)", border: "1px solid var(--border)", borderRadius: 12, padding: 14, textAlign: "center" }}><div style={{ fontFamily: "var(--ff-head)", fontSize: 22, color: s >= 4 ? "var(--green)" : s >= 3 ? "var(--yellow)" : "var(--red)" }}>{s}</div><div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", marginTop: 4 }}>{q.label.replace("Como avalia nosso ", "").replace("Como avalia a qualidade dos ", "").replace("Como avalia a qualidade das ", "").replace("Como avalia o ", "").replace("?", "")}</div><div style={{ height: 3, background: "var(--d3)", borderRadius: 2, marginTop: 6 }}><div style={{ height: "100%", width: `${(parseFloat(s) / 5) * 100}%`, background: "var(--ac)", borderRadius: 2 }} /></div></div>); })}
          </div>
          {staffRanking().length > 0 && (<div className="chart-wrap"><div className="chart-title">🏆 Ranking colaboradores</div>{staffRanking().map((s, i) => (<div className="rank-row" key={s.name}><div className="rank-num">{i + 1}</div><div className="rank-name">{s.name}</div><div className="rank-bar"><div className="rank-fill" style={{ width: `${(s.avg / 5) * 100}%` }} /></div><div className="rank-score">{s.avg}</div></div>))}</div>)}
          {howKnew().length > 0 && (<div className="chart-wrap"><div className="chart-title">📍 Como chegaram</div><MiniBarChart data={howKnew().map(([lbl, val]) => ({ lbl: lbl.slice(0, 10), val }))} color="var(--green)" /></div>)}

          {/* ── MÉTRICAS AGREGADAS POR PERGUNTA ── */}
          {est.feedbacks.length > 0 && (() => {
            const choiceQs = est.questions.filter(q => q.type === "choice");
            const textQs = est.questions.filter(q => q.type === "text");
            const staffQs = est.questions.filter(q => q.type === "staff");

            // Ranking de staff com IDs do banco
            const staffMetrics = staffQs.map(q => {
              const map = {};
              est.feedbacks.forEach(f => {
                const nome = f.answers?.[q.id];
                if (!nome) return;
                if (!map[nome]) map[nome] = { total: 0, count: 0 };
                const s = starQs.map(sq => f.answers?.[sq.id] || 0).filter(v => v > 0);
                if (s.length) { map[nome].total += s.reduce((a, b) => a + b, 0) / s.length; map[nome].count++; }
              });
              const ranking = Object.entries(map).map(([nome, d]) => ({ nome, avg: d.count ? (d.total / d.count).toFixed(1) : 0 })).sort((a, b) => b.avg - a.avg);
              return { q, ranking };
            }).filter(x => x.ranking.length > 0);

            // Métricas de múltipla escolha
            const choiceMetrics = choiceQs.map(q => {
              const total = est.feedbacks.filter(f => f.answers?.[q.id]).length;
              if (total === 0) return null;
              const counts = {};
              est.feedbacks.forEach(f => { const v = f.answers?.[q.id]; if (v) counts[v] = (counts[v] || 0) + 1; });
              const opts = q.options.map(opt => ({ opt, count: counts[opt] || 0, pct: total > 0 ? Math.round(((counts[opt] || 0) / total) * 100) : 0 }));
              return { q, opts, total };
            }).filter(Boolean);

            // Últimos comentários de texto
            const textMetrics = textQs.map(q => {
              const respostas = est.feedbacks.map(f => ({ texto: f.answers?.[q.id], nome: f.nome, data: f.data })).filter(r => r.texto && r.texto.trim().length > 3).slice(0, 3);
              return { q, respostas };
            }).filter(x => x.respostas.length > 0);

            return (<>
              {/* Staff com IDs do banco */}
              {staffMetrics.map(({ q, ranking }) => (
                <div className="chart-wrap" key={q.id}>
                  <div className="chart-title">👤 {q.label}</div>
                  {ranking.map((r, i) => (
                    <div className="rank-row" key={r.nome}>
                      <div className="rank-num">{i + 1}</div>
                      <div className="rank-name">{r.nome}</div>
                      <div className="rank-bar"><div className="rank-fill" style={{ width: `${(r.avg / 5) * 100}%` }} /></div>
                      <div className="rank-score">{r.avg}</div>
                    </div>
                  ))}
                </div>
              ))}

              {/* Múltipla escolha */}
              {choiceMetrics.map(({ q, opts, total }) => (
                <div className="chart-wrap" key={q.id}>
                  <div className="chart-title">☑️ {q.label}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 10 }}>{total} resposta{total !== 1 ? "s" : ""}</div>
                  {opts.filter(o => o.count > 0).sort((a, b) => b.count - a.count).map(({ opt, count, pct }) => (
                    <div key={opt} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13 }}>
                        <span style={{ color: "var(--text)", fontWeight: 600 }}>{opt.replace("Outro:", "")}</span>
                        <span style={{ color: "var(--ac)", fontWeight: 800 }}>{pct}% <span style={{ color: "var(--muted)", fontWeight: 400 }}>({count})</span></span>
                      </div>
                      <div style={{ height: 6, background: "var(--d3)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: pct >= 70 ? "var(--green)" : pct >= 40 ? "var(--ac)" : "var(--muted)", borderRadius: 3, transition: "width 0.4s ease" }} />
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {/* Comentários de texto */}
              {textMetrics.map(({ q, respostas }) => (
                <div className="chart-wrap" key={q.id}>
                  <div className="chart-title">💬 {q.label}</div>
                  {respostas.map((r, i) => (
                    <div key={i} style={{ borderLeft: "3px solid var(--ac)44", padding: "8px 12px", background: "var(--dark)", borderRadius: "0 8px 8px 0", marginBottom: 8, fontSize: 13, fontStyle: "italic", color: "#bbb" }}>
                      "{r.texto}"
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3, fontStyle: "normal" }}>{r.nome || "Anônimo"} · {r.data?.split(" ")?.[0] || ""}</div>
                    </div>
                  ))}
                </div>
              ))}
            </>);
          })()}
        </>)}
        {tab === "feedbacks" && (<>
          <div className="main-title">💬 Feedbacks</div>
          <div className="filter-row">{[["todos", "Todos"], ["positivos", "😍 Promotores"], ["neutros", "😐 Neutros"], ["negativos", "😞 Detratores"]].map(([k, l]) => (<button key={k} className={`filter-btn ${filter === k ? "on" : ""}`} onClick={() => setFilter(k)}>{l}</button>))}</div>
          {filteredFeedbacks().length === 0 && <div style={{ color: "var(--muted)", textAlign: "center", marginTop: 40 }}>Nenhum feedback neste filtro.</div>}
          {filteredFeedbacks().map((f, i) => { const nps = f.answers?.[npsId]; const npsColor = nps >= 9 ? "var(--green)" : nps >= 7 ? "var(--yellow)" : "var(--red)"; const textQ = est.questions.find(q => q.type === "text"); const sugVal = textQ ? f.answers?.[textQ.id] : null; return (<div className="fb" key={f.id || i}><div className="fb-top"><div style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--d3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>👤</div><div><div className="fb-name">{f.nome}</div><div className="fb-date">{f.data || "Agora"}</div></div></div>{nps !== undefined && (<div style={{ background: "var(--d3)", border: `1px solid ${npsColor}44`, borderRadius: 10, padding: "4px 10px", textAlign: "center" }}><div style={{ fontSize: 14, fontFamily: "var(--ff-head)", color: npsColor }}>{nps}</div><div style={{ fontSize: 9, color: "var(--muted)", textTransform: "uppercase" }}>NPS</div></div>)}</div><div style={{ background: "var(--dark)", borderRadius: 8, padding: "8px 10px", marginBottom: 6 }}>{starQs.map(q => { const v = f.answers?.[q.id]; if (!v) return null; const sn = q.label.replace(/^Como avalia (o |a |os |as |nosso |nossa )?/i, "").replace("?", "").slice(0,28); return (<div key={q.id} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}><span style={{ fontSize: 11, color: "var(--muted)", minWidth: 90, fontWeight: 600 }}>{sn}</span><div style={{ display: "flex", gap: 2 }}>{[1, 2, 3, 4, 5].map(s => <span key={s} style={{ fontSize: 12, filter: s <= v ? "none" : "grayscale(1) opacity(0.2)" }}>⭐</span>)}</div><span style={{ fontSize: 10, fontWeight: 800, color: v >= 4 ? "var(--green)" : v >= 3 ? "var(--yellow)" : "var(--red)" }}>{["", "Ruim", "Regular", "Bom", "Ótimo", "Excelente"][v]}</span></div>); })}</div>{sugVal && <div className="fb-comment">💬 "{sugVal}"</div>}{f.premio && <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}><div className="fb-prize">🎁 {f.premio}</div>{!f.brinde_entregue ? (<button className="btn-sm btn-sm-ghost" style={{ fontSize: 11 }} onClick={async () => { await marcarBrindeEntregue(f.id); onUpdate({ ...est, feedbacks: est.feedbacks.map(fb => fb.id === f.id ? { ...fb, brinde_entregue: true } : fb) }); }}>Marcar brinde entregue</button>) : (<span style={{ fontSize: 11, color: "var(--green)", fontWeight: 700 }}>✅ Brinde entregue</span>)}</div>}</div>); })}
        </>)}
        {tab === "insights" && (<>
          <div className="main-title">💡 Insights</div>
          {insights().map((ins, i) => (<div className="insight" key={i}><div className="insight-icon">{ins.icon}</div><div className="insight-text">{ins.text}</div></div>))}
          <div className="chart-wrap" style={{ marginTop: 16 }}><div className="chart-title">📊 Distribuição NPS</div><div style={{ display: "flex", gap: 10 }}>{[["😍 Promotores", "9-10", "var(--green)", est.feedbacks.filter(f => (f.answers?.[npsId] || 0) >= 9).length], ["😐 Neutros", "7-8", "var(--yellow)", est.feedbacks.filter(f => { const n = f.answers?.[npsId]; return n === 7 || n === 8; }).length], ["😞 Detratores", "0-6", "var(--red)", est.feedbacks.filter(f => (f.answers?.[npsId] || 0) <= 6 && f.answers?.[npsId] !== undefined).length]].map(([lbl, range, color, count]) => (<div key={lbl} style={{ flex: 1, background: "var(--d2)", border: `1px solid ${color}33`, borderRadius: 10, padding: 12, textAlign: "center" }}><div style={{ fontSize: 20, fontFamily: "var(--ff-head)", color }}>{count}</div><div style={{ fontSize: 10, color: "var(--muted)", marginTop: 3 }}>{lbl}</div><div style={{ fontSize: 9, color, marginTop: 2 }}>NPS {range}</div></div>))}</div></div>
          <div className="chart-wrap"><div className="chart-title">💰 Percepção de preço</div><MiniBarChart data={["Barato pelo que oferece", "Ideal pelo que oferece", "Caro pelo que oferece"].map(v => ({ lbl: v === "Barato pelo que oferece" ? "Barato" : v === "Ideal pelo que oferece" ? "Ideal" : "Caro", val: est.feedbacks.filter(f => f.answers?.q_preco === v).length }))} color="var(--yellow)" /></div>
        </>)}
        {tab === "qrcode" && (<><div className="main-title">📱 Meu QR Code</div><QRCodeView est={est} /></>)}

        {tab === "relatorio" && (() => {
          const fbSemana = getFeedbacksSemana(0);
          const fbAnterior = getFeedbacksSemana(1);
          const sqs = est.questions.filter(q => q.type === "stars");
          const _nid = est.questions.find(q => q.type === "nps")?.id || "q_nps";
          const _tid = est.questions.find(q => q.type === "text")?.id || "q_sug";
          const calcNota = (fbs) => { if (!sqs.length || !fbs.length) return "-"; const v = fbs.flatMap(f => sqs.map(q => f.answers?.[q.id]||0).filter(v=>v>0)); return v.length ? (v.reduce((a,b)=>a+b,0)/v.length).toFixed(1) : "-"; };
          const calcNps = (fbs) => { const v = fbs.map(f => f.answers?.[_nid]).filter(v => v !== undefined); return v.length ? (v.reduce((a,b)=>a+b,0)/v.length).toFixed(1) : "-"; };
          const notaAtual = calcNota(fbSemana); const notaAnterior = calcNota(fbAnterior);
          const npsAtual = calcNps(fbSemana); const npsAnterior = calcNps(fbAnterior);
          const diff = fbSemana.length - fbAnterior.length;
          const negativos = fbSemana.filter(f => (f.answers?.[_nid]||0) <= 6 && f.answers?.[_nid] !== undefined);
          const promotores = fbSemana.filter(f => (f.answers?.[_nid]||0) >= 9);
          const seta = (a, b) => { if (a==="-"||b==="-") return null; const d = parseFloat(a)-parseFloat(b); return d > 0 ? <span style={{color:"var(--green)",fontSize:11}}>▲ +{d.toFixed(1)}</span> : d < 0 ? <span style={{color:"var(--red)",fontSize:11}}>▼ {d.toFixed(1)}</span> : <span style={{color:"var(--muted)",fontSize:11}}>= igual</span>; };
          const dataInicio = new Date(); dataInicio.setDate(dataInicio.getDate()-7);
          const dataFim = new Date(); dataFim.setDate(dataFim.getDate()-1);
          const fmt = (d) => d.toLocaleDateString("pt-BR");
          const staffQ = est.questions.find(q => q.type === "staff");
          const staffMap = {};
          if (staffQ) fbSemana.forEach(f => { const n = f.answers?.[staffQ.id]; if (!n) return; if (!staffMap[n]) staffMap[n]={t:0,c:0}; const s=sqs.map(q=>f.answers?.[q.id]||0).filter(v=>v>0); if(s.length){staffMap[n].t+=s.reduce((a,b)=>a+b,0)/s.length;staffMap[n].c++;} });
          const ranking = Object.entries(staffMap).map(([n,d])=>({n,avg:d.c?(d.t/d.c).toFixed(1):0})).sort((a,b)=>b.avg-a.avg).slice(0,3);
          const comentarios = fbSemana.filter(f => f.answers?.[_tid] && f.answers[_tid].trim().length > 5).slice(0,3);
          return (<>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:10}}>
              <div className="main-title" style={{marginBottom:0}}>📋 Relatório Semanal</div>
              <button className="btn-sm btn-sm-red" onClick={enviarRelatorio} disabled={relatorioEnviando}>
                {relatorioEnviando ? "⏳ Enviando..." : relatorioEnviado ? "✅ Enviado!" : "📧 Enviar por e-mail"}
              </button>
            </div>
            <div style={{fontSize:12,color:"var(--muted)",marginBottom:16}}>📅 Semana: {fmt(dataInicio)} a {fmt(dataFim)}</div>

            <div className="metrics" style={{marginBottom:16}}>
              <div className="metric"><div className="metric-val" style={{color:"var(--ac)"}}>{fbSemana.length}</div><div className="metric-lbl">Feedbacks</div><div style={{marginTop:4}}>{diff > 0 ? <span style={{color:"var(--green)",fontSize:11}}>▲ +{diff} vs ant.</span> : diff < 0 ? <span style={{color:"var(--red)",fontSize:11}}>▼ {diff} vs ant.</span> : <span style={{color:"var(--muted)",fontSize:11}}>= igual</span>}</div></div>
              <div className="metric"><div className="metric-val">⭐ {notaAtual}</div><div className="metric-lbl">Nota média</div><div style={{marginTop:4}}>{seta(notaAtual, notaAnterior)}</div></div>
              <div className="metric"><div className="metric-val">📊 {npsAtual}</div><div className="metric-lbl">NPS médio</div><div style={{marginTop:4}}>{seta(npsAtual, npsAnterior)}</div></div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
              <div style={{background:"var(--d1)",border:"1px solid var(--green)33",borderRadius:12,padding:14,textAlign:"center"}}><div style={{fontFamily:"var(--ff-head)",fontSize:22,color:"var(--green)"}}>{promotores.length}</div><div style={{fontSize:10,color:"var(--muted)",textTransform:"uppercase",marginTop:4}}>😍 Promotores</div></div>
              <div style={{background:"var(--d1)",border:"1px solid var(--yellow)33",borderRadius:12,padding:14,textAlign:"center"}}><div style={{fontFamily:"var(--ff-head)",fontSize:22,color:"var(--yellow)"}}>{fbSemana.filter(f=>{const n=f.answers?.[_nid];return n===7||n===8;}).length}</div><div style={{fontSize:10,color:"var(--muted)",textTransform:"uppercase",marginTop:4}}>😐 Neutros</div></div>
              <div style={{background:"var(--d1)",border:"1px solid var(--red)33",borderRadius:12,padding:14,textAlign:"center"}}><div style={{fontFamily:"var(--ff-head)",fontSize:22,color:"var(--red)"}}>{negativos.length}</div><div style={{fontSize:10,color:"var(--muted)",textTransform:"uppercase",marginTop:4}}>😞 Detratores</div></div>
            </div>

            {negativos.length > 0 && (<div style={{background:"#1a0505",border:"1px solid var(--red)33",borderRadius:12,padding:16,marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:800,color:"var(--red)",marginBottom:8}}>⚠️ {negativos.length} feedback{negativos.length>1?"s negativos":"negativo"} esta semana</div>
              {negativos.slice(0,2).map((f,i)=>(<div key={i} style={{background:"var(--dark)",borderRadius:8,padding:10,marginBottom:6,fontSize:12}}><strong>{f.nome||"Anônimo"}</strong> · NPS {f.answers?.[_nid]??"-"}{f.answers?.[_tid]&&<div style={{color:"var(--muted2)",fontStyle:"italic",marginTop:3}}>"{f.answers[_tid]}"</div>}</div>))}
            </div>)}
            {negativos.length === 0 && fbSemana.length > 0 && (<div style={{background:"#0a1f0a",border:"1px solid var(--green)33",borderRadius:12,padding:14,marginBottom:14,textAlign:"center",fontSize:13,fontWeight:800,color:"var(--green)"}}>✅ Nenhum feedback negativo esta semana!</div>)}

            {ranking.length > 0 && (<div className="chart-wrap"><div className="chart-title">🏆 Ranking de colaboradores</div>{ranking.map((r,i)=>(<div className="rank-row" key={r.n}><div className="rank-num">{i+1}</div><div className="rank-name">{r.n}</div><div className="rank-bar"><div className="rank-fill" style={{width:`${(r.avg/5)*100}%`}}/></div><div className="rank-score">{r.avg}</div></div>))}</div>)}

            {comentarios.length > 0 && (<div className="chart-wrap"><div className="chart-title">💬 Comentários da semana</div>{comentarios.map((f,i)=>(<div key={i} style={{borderLeft:"3px solid var(--ac)",padding:"8px 12px",background:"var(--dark)",borderRadius:"0 8px 8px 0",marginBottom:8,fontSize:13,fontStyle:"italic",color:"#bbb"}}>"{f.answers[_tid]}"<div style={{fontSize:11,color:"var(--muted)",marginTop:3,fontStyle:"normal"}}>{f.nome||"Anônimo"}</div></div>))}</div>)}

            {fbSemana.length === 0 && (<div style={{textAlign:"center",padding:40,color:"var(--muted)",fontSize:14}}>Nenhum feedback recebido esta semana.<br/><span style={{fontSize:12}}>O relatório mostra os dados dos últimos 7 dias.</span></div>)}

            <div style={{padding:"12px 14px",background:"var(--d2)",borderRadius:10,fontSize:12,color:"var(--muted2)",lineHeight:1.7,marginTop:8}}>
              💡 <strong style={{color:"var(--text)"}}>Envio automático:</strong> o e-mail é disparado toda segunda-feira quando você abre o painel. Ou clique em "📧 Enviar por e-mail" para enviar agora.
            </div>
          </>);
        })()}

        {tab === "cardapio" && (<>
          <div className="main-title">🍽️ Cardápio Digital</div>
          {!temCardapioPorPlano(est.plano) && (
            <div style={{ padding: 20, background: "var(--d1)", border: "1px solid var(--border)", borderRadius: 14, color: "var(--muted2)", fontSize: 13 }}>
              O cardápio digital está disponível no <strong style={{color:"var(--text)"}}>Plano Pro R$ 129/mês</strong>. Solicite ao administrador a mudança de plano.
            </div>
          )}
          {temCardapioPorPlano(est.plano) && (
            <>
              <div style={{ padding: "10px 14px", background: "var(--ac)11", border: "1px solid var(--ac)33", borderRadius: 10, fontSize: 12, color: "var(--muted2)", marginBottom: 16 }}>
                🍽️ <strong style={{ color: "var(--text)" }}>Plano Pro R$ 129,90/mês</strong> — Cardápio digital integrado. Seus clientes veem o cardápio antes de avaliar.
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
              <span style={{ fontSize: 12, color: "var(--muted)", whiteSpace: "nowrap" }}>notacheia.com.br/</span>
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
            <div className="setup-box-title">❓ Perguntas do Questionário</div>
            {RAMO_PARA_BANCO[est.ramo] && (
              <>
                <div style={{ padding:"10px 14px", background:"var(--ac)11", border:"1px solid var(--ac)33", borderRadius:10, fontSize:12, color:"var(--muted2)", marginBottom:14, lineHeight:1.6 }}>
                  📋 <strong style={{color:"var(--text)"}}>Banco de perguntas para {est.ramo}</strong> — Ative ou desative as perguntas que fazem sentido para o seu negócio. O sistema gera as métricas automaticamente.
                </div>
                <QuestionBankSelector
                  ramo={est.ramo}
                  activeIds={ed.activePerguntaIds || null}
                  onChangeIds={(ids) => {
                    const novasQuestions = bancoPerguntasParaQuestions(est.ramo, ids);
                    setEd(e => ({ ...e, activePerguntaIds: ids, questions: novasQuestions }));
                  }}
                />
                <div style={{ height:1, background:"var(--border)", margin:"14px 0" }} />
                <div style={{ fontSize:11, fontWeight:800, letterSpacing:1.5, textTransform:"uppercase", color:"var(--muted)", marginBottom:10 }}>➕ Perguntas extras (opcional)</div>
                <div style={{ fontSize:12, color:"var(--muted2)", marginBottom:10 }}>Adicione perguntas personalizadas além do banco padrão.</div>
              </>
            )}
            {ed.questions.filter(q => !Object.values(PERGUNTAS_POR_NICHO).flat().some(bp => bp.id === q.id)).map(q => (
              <div className="pill-row" key={q.id} style={{ position: "relative" }}>
                <button
                  onClick={() => setQEmojiOpen(qEmojiOpen === q.id ? null : q.id)}
                  style={{ width: 32, height: 32, fontSize: 18, border: "1.5px solid var(--border)", borderRadius: 8, background: "var(--d3)", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                  title={q.emoji ? "Trocar emoji" : "Adicionar emoji"}>
                  {q.emoji || <span style={{fontSize:12,color:"var(--muted)"}}>😊</span>}
                </button>
                {qEmojiOpen === q.id && (
                  <div style={{ position: "absolute", top: 40, left: 0, zIndex: 999, background: "var(--d1)", border: "1px solid var(--border)", borderRadius: 12, padding: 10, width: 260, boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
                    <div style={{ display: "flex", gap: 3, overflowX: "auto", marginBottom: 8 }}>
                      {Object.keys(WA_CATS).map(k => (
                        <button key={k} onClick={() => setQEmojiCat(k)} style={{ padding: "3px 7px", fontSize: 11, border: `1px solid ${qEmojiCat===k?"var(--ac)":"var(--border)"}`, borderRadius: 20, cursor: "pointer", background: qEmojiCat===k?"var(--ac)22":"none", color: qEmojiCat===k?"var(--text)":"var(--muted)", whiteSpace: "nowrap", flexShrink: 0, fontFamily: "var(--ff-body)" }}>{k.split(" ")[0]}</button>
                      ))}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, maxHeight: 160, overflowY: "auto" }}>
                      {(WA_CATS[qEmojiCat]||[]).map(e => (
                        <button key={e} onClick={() => { setEd(ed => ({ ...ed, questions: ed.questions.map(x => x.id === q.id ? { ...x, emoji: e } : x) })); setQEmojiOpen(null); }}
                          style={{ width: 30, height: 30, fontSize: 17, border: "none", background: q.emoji===e?"var(--ac)22":"none", borderRadius: 6, cursor: "pointer" }}>
                          {e}
                        </button>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                      {q.emoji && <button className="btn-sm btn-sm-danger" style={{fontSize:11}} onClick={() => { setEd(ed => ({ ...ed, questions: ed.questions.map(x => x.id === q.id ? { ...x, emoji: "" } : x) })); setQEmojiOpen(null); }}>✕ Remover</button>}
                      <button className="btn-sm btn-sm-ghost" style={{fontSize:11}} onClick={() => setQEmojiOpen(null)}>Fechar</button>
                    </div>
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="pill-lbl">{q.emoji ? <span style={{marginRight:4}}>{q.emoji}</span> : null}{q.label}</div>
                  <div className="pill-sub">{q.type}</div>
                </div>
                <button className="btn-sm btn-sm-danger" onClick={() => removeQ(q.id)}>✕</button>
              </div>
            ))}
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
          <div className="main-title">🔑 Acesso</div>

          <div className="setup-box" style={{ maxWidth: 420 }}>
            <div className="setup-box-title">📧 Alterar e-mail de acesso</div>
            <div style={{ padding: "10px 14px", borderRadius: 10, marginBottom: 14, fontSize: 12, color: "var(--muted2)", background: "var(--d2)", border: "1px solid var(--border)", lineHeight: 1.6 }}>
              E-mail atual: <strong style={{ color: "var(--text)" }}>{est.owner}</strong>
            </div>
            {emailMsg && <div style={{ padding: "10px 14px", borderRadius: 10, marginBottom: 14, fontSize: 13, fontWeight: 700, background: emailMsg.includes("✅") ? "#0a2a0a" : "#1a0505", color: emailMsg.includes("✅") ? "var(--green)" : "var(--red)", border: `1px solid ${emailMsg.includes("✅") ? "var(--green)" : "var(--red)"}33` }}>{emailMsg}</div>}
            <label className="lbl">E-mail atual</label>
            <input className="field" type="email" placeholder="seu@email.com" value={newEmail.atual} onChange={e => setNewEmail(s => ({ ...s, atual: e.target.value }))} />
            <label className="lbl">Novo e-mail</label>
            <input className="field" type="email" placeholder="novo@email.com" value={newEmail.novo} onChange={e => setNewEmail(s => ({ ...s, novo: e.target.value }))} />
            <label className="lbl">Confirmar novo e-mail</label>
            <input className="field" type="email" placeholder="novo@email.com" value={newEmail.confirma} onChange={e => setNewEmail(s => ({ ...s, confirma: e.target.value }))} />
            <button className="btn btn-red" style={{ maxWidth: 220 }} onClick={trocarEmail}>Alterar e-mail</button>
          </div>

          <div className="setup-box" style={{ maxWidth: 420 }}>
            <div className="setup-box-title">🔑 Alterar senha de acesso</div>
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

const RAMOS = ["Hamburgueria","Pizzaria","Restaurante","Cafeteria","Lanchonete","Bar","Sorveteria","Padaria","Churrascaria","Comida Japonesa","Comida Mexicana","Comida Chinesa","Açaí","Confeitaria","Salão de Beleza","Barbearia","Spa / Estética","Clínica Médica","Clínica Odontológica","Pet Shop","Farmácia","Academia","Posto de Gasolina","Imobiliária","Hotel","Pousada","Hostel","Supermercado","Loja de Roupas","Calçados","Ótica","Joalheria","Papelaria","Floricultura","Escola / Curso","Oficina / Auto","Lavanderia","Delivery","Clínica Veterinária","Fisioterapia","Psicologia","Nutrição","Advocacia","Contabilidade","Tecnologia / TI","Fotografia","Escola de Música","Escape Room / Lazer","Outro"];
const PLANOS = ["R$ 99/mês", "R$ 129/mês", "Personalizado"];

function MasterPanel({ establishments, setEstablishments, onLogout }) {
  const [tab, setTab] = useState("ests");
  const [viewEst, setViewEst] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editEst, setEditEst] = useState(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editSaved, setEditSaved] = useState(false);
  const [masterSearch, setMasterSearch] = useState("");
  const [masterCityFilter, setMasterCityFilter] = useState("todas");
  const EMPTY_EST = { name: "", emoji: "🏪", owner: "", pass: "", color: "#e63946", googleUrl: "", slug: "", responsavel: "", cidade: "", ramo: "Restaurante", telefone: "", whatsapp: "", plano: "R$ 99/mês" };
  const [newEst, setNewEst] = useState(EMPTY_EST);
  const [actionLoading, setActionLoading] = useState(false);
  const [demoEst, setDemoEst] = useState(null);
  const [copied, setCopied] = useState(null);
  const [enviando, setEnviando] = useState(null);
  const [enviado, setEnviado] = useState(null);

  const enviarCredenciais = async (e) => {
    if (!e.owner) { alert("Este estabelecimento não tem e-mail cadastrado."); return; }
    setEnviando(e.id);
    const slug = e.slug || makeSlug(e.name);
    const linkPainel = "https://nota-cheia.vercel.app";
    const linkQR = `https://notacheia.com.br/${slug}`;
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": "Bearer re_3kBjVHJT_MhYrCC7g7x5U9B8TMfJYTmev", "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "NotaCheia <notificacoes@notacheia.com.br>",
          to: [e.owner],
          subject: `🎉 Bem-vindo ao NotaCheia — ${e.name}`,
          html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:28px;background:#0d0d0d;color:#f0ede8;border-radius:18px;">
            <div style="text-align:center;margin-bottom:24px;">
              <div style="font-size:36px;margin-bottom:6px;">${e.emoji}</div>
              <h1 style="font-size:22px;margin:0;color:#e63946;">Bem-vindo ao NotaCheia!</h1>
              <p style="color:#888;font-size:13px;margin-top:6px;">Seu painel de feedbacks está pronto 🚀</p>
            </div>
            <div style="background:#181818;border-radius:12px;padding:20px;margin-bottom:16px;">
              <p style="margin:0 0 14px;font-size:13px;color:#888;font-weight:700;text-transform:uppercase;letter-spacing:1px;">📋 Dados de acesso</p>
              <div style="display:flex;justify-content:space-between;margin-bottom:10px;font-size:14px;"><span style="color:#888;">Estabelecimento</span><strong>${e.name}</strong></div>
              <div style="display:flex;justify-content:space-between;margin-bottom:10px;font-size:14px;"><span style="color:#888;">E-mail</span><strong>${e.owner}</strong></div>
              <div style="display:flex;justify-content:space-between;font-size:14px;"><span style="color:#888;">Senha</span><strong style="background:#222;padding:2px 10px;border-radius:6px;letter-spacing:2px;">${e.pass}</strong></div>
            </div>
            <div style="margin-bottom:12px;">
              <a href="${linkPainel}" style="display:block;text-align:center;background:#e63946;color:#fff;padding:14px;border-radius:12px;font-weight:800;font-size:15px;text-decoration:none;margin-bottom:10px;">Acessar meu painel →</a>
              <a href="${linkQR}" style="display:block;text-align:center;background:#181818;color:#e63946;padding:12px;border-radius:12px;font-weight:700;font-size:13px;text-decoration:none;border:1px solid #e6394633;">🔗 Link do meu QR Code</a>
            </div>
            <div style="background:#181818;border-radius:10px;padding:14px;margin-bottom:16px;font-size:12px;color:#888;line-height:1.7;">
              <strong style="color:#f0ede8;">💡 Primeiros passos:</strong><br/>
              1. Acesse o painel com seu e-mail e senha<br/>
              2. Baixe o QR Code em <strong style="color:#f0ede8;">📱 Meu QR Code</strong><br/>
              3. Imprima e coloque nas mesas ou balcão<br/>
              4. Seus clientes já podem avaliar e ganhar brindes!
            </div>
            <p style="text-align:center;font-size:12px;color:#444;margin:0;">Qualquer dúvida, fale com a gente 💬<br/>WhatsApp: (41) 99675-6776</p>
            <p style="text-align:center;font-size:11px;color:#333;margin-top:14px;">NotaCheia ⭐ · notacheia.com.br</p>
          </div>`,
        }),
      });
      if (res.ok) {
        setEnviado(e.id);
        setTimeout(() => setEnviado(null), 4000);
      } else {
        alert("Erro ao enviar e-mail. Verifique o e-mail cadastrado.");
      }
    } catch (err) {
      alert("Erro de conexão ao enviar e-mail.");
    }
    setEnviando(null);
  };
  const [masterPass, setMasterPass] = useState({ atual: "", nova: "", confirma: "" });
  const [masterPassMsg, setMasterPassMsg] = useState("");
  const [contrato, setContrato] = useState({ estId: "", plano: "R$ 99/mês", setup: "200,00", aviso: "15", dataContrato: new Date().toLocaleDateString("pt-BR") });
  const [prospects, setProspects] = useState(() => { try { return JSON.parse(localStorage.getItem("nc_prospects") || "[]"); } catch { return []; } });
  const [showAddProspect, setShowAddProspect] = useState(false);
  const [prospectFiltro, setProspectFiltro] = useState("todos");
  const EMPTY_PROSPECT = { nome: "", ramo: "Hamburgueria", endereco: "", telefone: "", responsavel: "", status: "prospectar", falou: "", interesse: "", obs: "", dataVisita: "" };
  const [newProspect, setNewProspect] = useState(EMPTY_PROSPECT);
  const [editProspect, setEditProspect] = useState(null);

  const saveProspects = (list) => { setProspects(list); try { localStorage.setItem("nc_prospects", JSON.stringify(list)); } catch {} };
  const addProspect = () => {
    if (!newProspect.nome) return;
    const novo = { ...newProspect, id: uid(), dataVisita: new Date().toLocaleDateString("pt-BR") };
    saveProspects([...prospects, novo]);
    setNewProspect(EMPTY_PROSPECT);
    setShowAddProspect(false);
  };
  const updateProspectStatus = (id, status) => saveProspects(prospects.map(p => p.id === id ? { ...p, status, dataVisita: new Date().toLocaleDateString("pt-BR") } : p));
  const deleteProspect = (id) => { if (!window.confirm("Remover este prospect?")) return; saveProspects(prospects.filter(p => p.id !== id)); };
  const saveEditProspect = () => { saveProspects(prospects.map(p => p.id === editProspect.id ? editProspect : p)); setEditProspect(null); };
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
    const temCardapio = temCardapioPorPlano(newEst.plano);
    const novo = {
      ...newEst, slug, id: "est_" + uid(), ativo: true, logoUrl: "", feedbackInterval: 30,
      questions: bancoPerguntasParaQuestions(newEst.ramo),
      prizes: [{ id: uid(), label: "Brinde Grátis", emoji: "🎁", color: newEst.color }, { id: uid(), label: "10% Desconto", emoji: "🏷️", color: "#333" }, { id: uid(), label: "Surpresa!", emoji: "🎉", color: "#6d597a" }],
      cardapio: temCardapio ? makeDefaultCardapio() : null,
      feedbacks: [], desde: new Date().toLocaleDateString("pt-BR")
    };
    const ok = await createEstabelecimento(novo);
    if (!ok) {
      alert("❌ Erro ao salvar. Verifique sua conexão e tente novamente.");
      setActionLoading(false);
      return;
    }
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
    await saveMasterPass(masterPass.nova);
    setMasterPass({ atual: "", nova: "", confirma: "" });
    setMasterPassMsg("✅ Senha salva no banco! Vai persistir mesmo após recarregar.");
    setTimeout(() => setMasterPassMsg(""), 5000);
  };

  const copyLink = (e) => {
    const slug = e.slug || makeSlug(e.name);
    navigator.clipboard.writeText(`https://notacheia.com.br/${slug}`);
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
          <span className="slug-text">notacheia.com.br/{slug}</span>
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
          <button className="btn-sm btn-sm-green" onClick={() => enviarCredenciais(e)} disabled={enviando === e.id} title="Enviar e-mail com login e senha para o dono">{enviando === e.id ? "⏳..." : enviado === e.id ? "✅ Enviado!" : "📧 Credenciais"}</button>
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
          {/* Busca + Filtro por cidade */}
          <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
            <input
              className="field-inline"
              placeholder="🔍 Buscar por nome..."
              value={masterSearch}
              onChange={e => setMasterSearch(e.target.value)}
              style={{ flex:1, minWidth:180 }}
            />
            <select
              className="type-sel"
              value={masterCityFilter}
              onChange={e => setMasterCityFilter(e.target.value)}
              style={{ minWidth:140 }}
            >
              <option value="todas">📍 Todas as cidades</option>
              {[...new Set(establishments.map(e => e.cidade).filter(Boolean))].sort().map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {(masterSearch || masterCityFilter !== "todas") && (
              <button className="btn-sm btn-sm-ghost" onClick={() => { setMasterSearch(""); setMasterCityFilter("todas"); }}>✕ Limpar</button>
            )}
          </div>
          {(() => {
            const filtered = establishments.filter(e => {
              const matchName = !masterSearch || e.name.toLowerCase().includes(masterSearch.toLowerCase()) || (e.responsavel||"").toLowerCase().includes(masterSearch.toLowerCase());
              const matchCity = masterCityFilter === "todas" || e.cidade === masterCityFilter;
              return matchName && matchCity;
            });
            if (filtered.length === 0) return (
              <div style={{ textAlign:"center", color:"var(--muted)", padding:40, fontSize:14 }}>Nenhum estabelecimento encontrado.</div>
            );
            return (<>
          <div className="tbl-wrap" id="master-table">
            <div className="tbl-head" style={{ gridTemplateColumns: "1.6fr 1.2fr 0.9fr 0.9fr 70px 80px 90px", minWidth: 650 }}>
              <span>Estabelecimento</span><span>Responsável</span><span>Cidade</span><span>Plano</span><span>Feedbacks</span><span>Status</span><span>Ações</span>
            </div>
            {filtered.map(e => {
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
                    <button className="btn-sm btn-sm-green" title="Enviar credenciais por e-mail" style={{ padding: "5px 7px" }} onClick={() => enviarCredenciais(e)} disabled={enviando === e.id}>{enviando === e.id ? "⏳" : enviado === e.id ? "✅" : "📧"}</button>
                    <button className={`btn-sm ${e.ativo ? "btn-sm-danger" : "btn-sm-green"}`} style={{ padding: "5px 7px" }} onClick={() => toggleAtivo(e.id)}>{e.ativo ? "🔒" : "✅"}</button>
                    <button className="btn-sm btn-sm-danger" style={{ padding: "5px 7px" }} onClick={() => deleteEst(e.id)}>🗑️</button>
                  </div>
                </div>
              );
            })}
          </div>
          <div id="master-cards">
            {filtered.map(e => <EstCard key={e.id} e={e} />)}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>💡 Clique em 🎯 para fazer uma demo sem bloqueio de tempo</div>
          </>);
          })()}
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
        {tab === "prospeccao" && (() => {
          const STATUS = {
            prospectar: { icon: "🎯", label: "A visitar",   color: "#457b9d" },
            contatado:  { icon: "📞", label: "Contatado",   color: "#f4a261" },
            demo:       { icon: "🎪", label: "Demo feita",  color: "#6d597a" },
            fechou:     { icon: "✅", label: "Fechou!",     color: "#2a9d8f" },
            descartado: { icon: "❌", label: "Descartado",  color: "#555" },
          };
          const INTERESSE = { alto: { label: "Alto 🔥", color: "var(--green)" }, medio: { label: "Médio ⚡", color: "var(--yellow)" }, baixo: { label: "Baixo 🧊", color: "var(--muted)" } };
          const filtrados = prospectFiltro === "todos"
            ? prospects.filter(p => p.status !== "descartado")
            : prospectFiltro === "descartados"
            ? prospects.filter(p => p.status === "descartado")
            : prospects.filter(p => p.status === prospectFiltro);

          return (<>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
              <div className="main-title" style={{ marginBottom: 0 }}>🗺️ Prospecção</div>
              <button className="btn-sm btn-sm-red" onClick={() => setShowAddProspect(true)}>+ Novo prospect</button>
            </div>

            {/* Métricas rápidas */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(90px,1fr))", gap: 8, marginBottom: 16 }}>
              {Object.entries(STATUS).map(([k,v]) => (
                <div key={k} style={{ background: "var(--d1)", border: `1px solid ${v.color}44`, borderRadius: 12, padding: "10px 8px", textAlign: "center", cursor: "pointer" }} onClick={() => setProspectFiltro(k)}>
                  <div style={{ fontSize: 20, fontFamily: "var(--ff-head)", color: v.color }}>{prospects.filter(p => p.status === k).length}</div>
                  <div style={{ fontSize: 9, color: "var(--muted)", textTransform: "uppercase", marginTop: 3, fontWeight: 700 }}>{v.icon} {v.label}</div>
                </div>
              ))}
            </div>

            {/* Filtros */}
            <div className="filter-row">
              {[["todos","Ativos"],["prospectar","🎯 A visitar"],["contatado","📞 Contatados"],["demo","🎪 Demo feita"],["fechou","✅ Fecharam"],["descartados","❌ Descartados"]].map(([k,l]) => (
                <button key={k} className={`filter-btn ${prospectFiltro === k ? "on" : ""}`} onClick={() => setProspectFiltro(k)}>{l}</button>
              ))}
            </div>

            {/* Lista */}
            {filtrados.length === 0 && <div style={{ textAlign: "center", color: "var(--muted)", padding: 40, fontSize: 14 }}>Nenhum prospect aqui ainda.</div>}
            {filtrados.map(p => (
              <div key={p.id} style={{ background: "var(--d1)", border: `1px solid ${STATUS[p.status]?.color || "var(--border)"}44`, borderRadius: 14, padding: 16, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 15 }}>{p.nome}</div>
                    <div style={{ fontSize: 12, color: "var(--muted2)", marginTop: 2 }}>🏷️ {p.ramo}{p.endereco ? ` · 📍 ${p.endereco}` : ""}</div>
                    {p.responsavel && <div style={{ fontSize: 12, color: "var(--muted2)" }}>👤 {p.responsavel}</div>}
                    {p.telefone && <div style={{ fontSize: 12, color: "var(--muted2)" }}>📱 {p.telefone}</div>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                    <span style={{ background: `${STATUS[p.status]?.color}22`, border: `1px solid ${STATUS[p.status]?.color}66`, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700, color: STATUS[p.status]?.color, whiteSpace: "nowrap" }}>
                      {STATUS[p.status]?.icon} {STATUS[p.status]?.label}
                    </span>
                    {p.interesse && <span style={{ fontSize: 11, color: INTERESSE[p.interesse]?.color, fontWeight: 700 }}>{INTERESSE[p.interesse]?.label}</span>}
                  </div>
                </div>

                {/* Tags rápidas */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                  {p.falou === "sim" && <span style={{ background: "var(--d3)", borderRadius: 20, padding: "2px 8px", fontSize: 11, color: "var(--green)" }}>✓ Falou c/ responsável</span>}
                  {p.falou === "funcionario" && <span style={{ background: "var(--d3)", borderRadius: 20, padding: "2px 8px", fontSize: 11, color: "var(--yellow)" }}>⚠️ Só c/ funcionário</span>}
                  {p.falou === "nao" && <span style={{ background: "var(--d3)", borderRadius: 20, padding: "2px 8px", fontSize: 11, color: "var(--muted)" }}>✗ Não encontrou</span>}
                  {p.dataVisita && <span style={{ background: "var(--d3)", borderRadius: 20, padding: "2px 8px", fontSize: 11, color: "var(--muted)" }}>🗓️ {p.dataVisita}</span>}
                </div>

                {p.obs && <div style={{ background: "var(--dark)", borderLeft: "3px solid var(--ac)44", borderRadius: "0 8px 8px 0", padding: "8px 12px", fontSize: 12, color: "var(--muted2)", fontStyle: "italic", marginBottom: 10 }}>💬 {p.obs}</div>}

                {/* Botões de status rápido */}
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
                  {Object.entries(STATUS).filter(([k]) => k !== p.status).map(([k,v]) => (
                    <button key={k} className="btn-sm btn-sm-ghost" style={{ fontSize: 11, padding: "4px 10px" }} onClick={() => updateProspectStatus(p.id, k)}>
                      {v.icon} {v.label}
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn-sm btn-sm-ghost" onClick={() => setEditProspect({ ...p })}>✏️ Editar</button>
                  {p.telefone && <a href={`https://wa.me/55${p.telefone.replace(/\D/g,"")}`} target="_blank" rel="noreferrer" style={{ background: "#25d366", color: "#fff", borderRadius: 8, padding: "5px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer", textDecoration: "none" }}>💬 WhatsApp</a>}
                  <button className="btn-sm btn-sm-danger" onClick={() => deleteProspect(p.id)}>🗑️</button>
                </div>
              </div>
            ))}

            {/* Modal novo prospect */}
            {showAddProspect && (
              <div className="modal-bg" onClick={() => setShowAddProspect(false)}>
                <div className="modal" onClick={e => e.stopPropagation()}>
                  <div className="modal-title">🎯 Novo Prospect</div>
                  <label className="lbl">Nome do estabelecimento *</label>
                  <input className="field" placeholder="Ex: Pizzaria Bella" value={newProspect.nome} onChange={e => setNewProspect(s => ({ ...s, nome: e.target.value }))} />
                  <label className="lbl">Ramo</label>
                  <select className="field" value={newProspect.ramo} onChange={e => setNewProspect(s => ({ ...s, ramo: e.target.value }))}>
                    {RAMOS.map(r => <option key={r}>{r}</option>)}
                  </select>
                  <label className="lbl">Endereço / Bairro</label>
                  <input className="field" placeholder="Ex: Rua das Flores, 123 — Centro" value={newProspect.endereco} onChange={e => setNewProspect(s => ({ ...s, endereco: e.target.value }))} />
                  <label className="lbl">Nome do responsável</label>
                  <input className="field" placeholder="Ex: João" value={newProspect.responsavel} onChange={e => setNewProspect(s => ({ ...s, responsavel: e.target.value }))} />
                  <label className="lbl">Telefone / WhatsApp</label>
                  <input className="field" placeholder="(41) 99999-0000" value={newProspect.telefone} onChange={e => setNewProspect(s => ({ ...s, telefone: e.target.value }))} />
                  <label className="lbl">Observação</label>
                  <textarea className="textarea" placeholder="Ex: Voltar sexta de manhã, falar com a Ana..." value={newProspect.obs} onChange={e => setNewProspect(s => ({ ...s, obs: e.target.value }))} />
                  <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                    <button className="btn btn-red" onClick={addProspect} disabled={!newProspect.nome}>Adicionar</button>
                    <button className="btn btn-ghost" onClick={() => setShowAddProspect(false)}>Cancelar</button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal editar prospect */}
            {editProspect && (
              <div className="modal-bg" onClick={() => setEditProspect(null)}>
                <div className="modal" onClick={e => e.stopPropagation()}>
                  <div className="modal-title">✏️ Editar Prospect</div>
                  <label className="lbl">Nome</label>
                  <input className="field" value={editProspect.nome} onChange={e => setEditProspect(s => ({ ...s, nome: e.target.value }))} />
                  <label className="lbl">Ramo</label>
                  <select className="field" value={editProspect.ramo} onChange={e => setEditProspect(s => ({ ...s, ramo: e.target.value }))}>
                    {RAMOS.map(r => <option key={r}>{r}</option>)}
                  </select>
                  <label className="lbl">Endereço / Bairro</label>
                  <input className="field" value={editProspect.endereco || ""} onChange={e => setEditProspect(s => ({ ...s, endereco: e.target.value }))} />
                  <label className="lbl">Nome do responsável</label>
                  <input className="field" value={editProspect.responsavel || ""} onChange={e => setEditProspect(s => ({ ...s, responsavel: e.target.value }))} />
                  <label className="lbl">Telefone / WhatsApp</label>
                  <input className="field" value={editProspect.telefone || ""} onChange={e => setEditProspect(s => ({ ...s, telefone: e.target.value }))} />
                  <label className="lbl">Falou com o responsável?</label>
                  <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                    {[["sim","✓ Sim"],["funcionario","⚠️ Só funcionário"],["nao","✗ Não encontrou"]].map(([v,l]) => (
                      <button key={v} onClick={() => setEditProspect(s => ({ ...s, falou: v }))}
                        style={{ padding: "7px 12px", borderRadius: 10, fontFamily: "var(--ff-body)", fontSize: 12, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${editProspect.falou === v ? "var(--ac)" : "var(--border)"}`, background: editProspect.falou === v ? "var(--ac)22" : "var(--d3)", color: editProspect.falou === v ? "var(--text)" : "var(--muted2)" }}>{l}</button>
                    ))}
                  </div>
                  <label className="lbl">Nível de interesse</label>
                  <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                    {[["alto","Alto 🔥"],["medio","Médio ⚡"],["baixo","Baixo 🧊"]].map(([v,l]) => (
                      <button key={v} onClick={() => setEditProspect(s => ({ ...s, interesse: v }))}
                        style={{ padding: "7px 12px", borderRadius: 10, fontFamily: "var(--ff-body)", fontSize: 12, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${editProspect.interesse === v ? "var(--ac)" : "var(--border)"}`, background: editProspect.interesse === v ? "var(--ac)22" : "var(--d3)", color: editProspect.interesse === v ? "var(--text)" : "var(--muted2)" }}>{l}</button>
                    ))}
                  </div>
                  <label className="lbl">Observação</label>
                  <textarea className="textarea" value={editProspect.obs || ""} onChange={e => setEditProspect(s => ({ ...s, obs: e.target.value }))} />
                  <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                    <button className="btn btn-red" onClick={saveEditProspect}>Salvar</button>
                    <button className="btn btn-ghost" onClick={() => setEditProspect(null)}>Cancelar</button>
                  </div>
                </div>
              </div>
            )}
          </>);
        })()}

        {tab === "contrato" && (() => {
          const estSel = establishments.find(e => e.id === contrato.estId) || null;
          const hoje = contrato.dataContrato;
          const valorMensal = contrato.plano === "R$ 99/mês" ? "99,90" : contrato.plano === "R$ 129/mês" ? "129,90" : "—";
          const nomePlano = contrato.plano === "R$ 99/mês" ? "Basic" : contrato.plano === "R$ 129/mês" ? "Pro" : "Personalizado";
          const itensPlano = contrato.plano === "R$ 99/mês"
            ? ["Sistema de feedback com QR Code personalizado", "Roleta de prêmios para os clientes", "Painel de análise com métricas e NPS", "Relatório semanal por e-mail", "Base de clientes com histórico de visitas e WhatsApp", "Suporte via WhatsApp"]
            : ["Tudo do Plano Basic", "Cardápio digital integrado", "Montagem do cardápio inclusa", "Layouts e paletas de cores personalizadas", "Suporte via WhatsApp"];

          const imprimirContrato = () => {
            const win = window.open("", "_blank");
            win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Contrato NotaCheia</title><style>
              *{box-sizing:border-box;margin:0;padding:0}
              body{font-family:'Arial',sans-serif;color:#111;background:#fff;padding:40px;max-width:800px;margin:0 auto;font-size:13px;line-height:1.6}
              .header{text-align:center;border-bottom:3px solid #e63946;padding-bottom:20px;margin-bottom:28px}
              .logo-text{font-size:28px;font-weight:900;color:#e63946;letter-spacing:2px}
              .logo-sub{font-size:12px;color:#888;margin-top:4px}
              h2{font-size:14px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:#e63946;margin:24px 0 10px;border-bottom:1px solid #eee;padding-bottom:6px}
              .row{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #f0f0f0;font-size:13px}
              .row span:first-child{color:#555;font-weight:600}
              .row span:last-child{font-weight:700}
              .destaque{background:#fff5f5;border:1.5px solid #e63946;border-radius:10px;padding:16px;margin:16px 0}
              .destaque-titulo{font-weight:900;color:#e63946;font-size:14px;margin-bottom:8px}
              .item{padding:5px 0;font-size:13px}
              .item::before{content:"✓ ";color:#e63946;font-weight:900}
              .clausula{margin-bottom:14px;font-size:13px;line-height:1.7}
              .clausula strong{color:#111}
              .assinatura-area{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:50px}
              .assinatura-box{text-align:center}
              .assinatura-linha{border-bottom:1.5px solid #111;margin-bottom:8px;height:50px}
              .assinatura-nome{font-size:12px;font-weight:700}
              .assinatura-cargo{font-size:11px;color:#888}
              .rodape{text-align:center;margin-top:36px;font-size:11px;color:#aaa;border-top:1px solid #eee;padding-top:14px}
              @media print{body{padding:20px}@page{margin:1.5cm}}
            </style></head><body>
              <div class="header">
                <div class="logo-text">NotaCheia ⭐</div>
                <div class="logo-sub">Sistema de Feedback e Fidelização · notacheia.com.br</div>
              </div>

              <h2>Contrato de Prestação de Serviços</h2>
              <p class="clausula">Por meio deste instrumento, as partes abaixo identificadas celebram o presente Contrato de Prestação de Serviços de plataforma digital de coleta de feedbacks e fidelização de clientes.</p>

              <h2>1. Identificação das Partes</h2>
              <div class="row"><span>Prestador de serviços</span><span>Hudson Nagano — NotaCheia</span></div>
              <div class="row"><span>WhatsApp</span><span>(41) 99675-6776</span></div>
              <div class="row"><span>Site</span><span>notacheia.com.br</span></div>
              <div class="row"><span>Contratante</span><span>${estSel ? estSel.name : "___________________________"}</span></div>
              <div class="row"><span>Responsável</span><span>${estSel ? (estSel.responsavel || "___________________________") : "___________________________"}</span></div>
              <div class="row"><span>Ramo</span><span>${estSel ? (estSel.ramo || "___________________________") : "___________________________"}</span></div>
              <div class="row"><span>Cidade</span><span>${estSel ? (estSel.cidade || "___________________________") : "___________________________"}</span></div>
              <div class="row"><span>Telefone</span><span>${estSel ? (estSel.telefone || "___________________________") : "___________________________"}</span></div>
              <div class="row"><span>E-mail</span><span>${estSel ? (estSel.owner || "___________________________") : "___________________________"}</span></div>

              <h2>2. Plano Contratado</h2>
              <div class="destaque">
                <div class="destaque-titulo">Plano ${nomePlano} — R$ ${valorMensal}/mês</div>
                ${itensPlano.map(i => `<div class="item">${i}</div>`).join("")}
              </div>
              <div class="row"><span>Taxa de implementação (setup)</span><span>R$ ${contrato.setup} — pagamento único no ato</span></div>
              <div class="row"><span>Primeiro mês</span><span>R$ ${valorMensal} — pago no ato da contratação</span></div>
              <div class="row"><span>Vencimento mensal</span><span>Todo dia 5 de cada mês — R$ ${valorMensal}</span></div>
              <div class="row" style="border-top:2px solid #e63946;margin-top:6px;padding-top:10px;"><span style="font-weight:900;">Total pago no ato</span><span style="color:#e63946;font-size:15px;font-weight:900;">R$ ${contrato.setup} + R$ ${valorMensal}</span></div>
              <div class="row"><span>Data de início</span><span>${hoje}</span></div>

              <h2>3. Condições do Serviço</h2>
              <p class="clausula"><strong>3.1 Pagamento:</strong> No ato da contratação, o contratante realiza o pagamento da taxa de implementação (setup) e do primeiro mês do plano. A partir do mês seguinte, a mensalidade vence todo dia 5 de cada mês. O sistema segue o princípio <strong>pagou, usou</strong> — o acesso é liberado somente após a confirmação do pagamento.</p>
              <p class="clausula"><strong>3.2 Cancelamento:</strong> O contratante pode solicitar o cancelamento a qualquer momento, com aviso prévio de ${contrato.aviso} dias. Não há multa ou fidelidade mínima.</p>
              <p class="clausula"><strong>3.3 Suspensão:</strong> Em caso de inadimplência, o acesso ao sistema poderá ser suspenso até a regularização do pagamento.</p>
              <p class="clausula"><strong>3.4 Entregáveis:</strong> O prestador irá configurar o sistema, gerar o QR Code personalizado e entregar as instruções de uso em até 24 horas após o pagamento do setup.</p>
              <p class="clausula"><strong>3.5 Dúvidas:</strong> Em caso de dúvidas sobre o sistema, o contratante pode entrar em contato pelo WhatsApp (41) 99675-6776.</p>
              <p class="clausula"><strong>3.6 Dados:</strong> Os dados coletados pelos feedbacks são de propriedade do contratante e não serão compartilhados com terceiros.</p>

              <h2>4. Assinaturas</h2>
              <p style="font-size:12px;color:#888;margin-bottom:20px;">Matinhos — PR, ${hoje}</p>
              <div class="assinatura-area">
                <div class="assinatura-box">
                  <div class="assinatura-linha"></div>
                  <div class="assinatura-nome">Hudson Nagano</div>
                  <div class="assinatura-cargo">Prestador — NotaCheia</div>
                </div>
                <div class="assinatura-box">
                  <div class="assinatura-linha"></div>
                  <div class="assinatura-nome">${estSel ? (estSel.responsavel || "Contratante") : "Contratante"}</div>
                  <div class="assinatura-cargo">${estSel ? estSel.name : "Estabelecimento"}</div>
                </div>
              </div>

              <div class="rodape">NotaCheia ⭐ · notacheia.com.br · (41) 99675-6776 · notificacoes@notacheia.com.br</div>
            </body></html>`);
            win.document.close();
            setTimeout(() => win.print(), 500);
          };

          return (<>
            <div className="main-title">📄 Gerar Contrato</div>

            <div className="setup-box" style={{ maxWidth: 500 }}>
              <div className="setup-box-title">Dados do contrato</div>

              <label className="lbl">Estabelecimento</label>
              <select className="field" value={contrato.estId} onChange={e => setContrato(s => ({ ...s, estId: e.target.value }))}>
                <option value="">— Selecione o estabelecimento —</option>
                {establishments.filter(e => e.id !== "est_demo").map(e => (
                  <option key={e.id} value={e.id}>{e.emoji} {e.name} — {e.responsavel || e.owner}</option>
                ))}
              </select>

              <label className="lbl">Plano</label>
              <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                {[["R$ 99/mês","Basic — R$ 99,90/mês"],["R$ 129/mês","Pro — R$ 129,90/mês"]].map(([v,l]) => (
                  <button key={v} onClick={() => setContrato(s => ({ ...s, plano: v }))}
                    style={{ padding: "9px 16px", borderRadius: 10, fontFamily: "var(--ff-body)", fontSize: 13, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${contrato.plano === v ? "var(--ac)" : "var(--border)"}`, background: contrato.plano === v ? "var(--ac)22" : "var(--d3)", color: contrato.plano === v ? "var(--text)" : "var(--muted2)" }}>{l}</button>
                ))}
              </div>

              <label className="lbl">Taxa de setup (R$)</label>
              <input className="field" value={contrato.setup} onChange={e => setContrato(s => ({ ...s, setup: e.target.value }))} placeholder="200,00" />

              <label className="lbl">Aviso prévio para cancelamento (dias)</label>
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                {["7","15","30"].map(d => (
                  <button key={d} onClick={() => setContrato(s => ({ ...s, aviso: d }))}
                    style={{ padding: "8px 16px", borderRadius: 10, fontFamily: "var(--ff-body)", fontSize: 13, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${contrato.aviso === d ? "var(--ac)" : "var(--border)"}`, background: contrato.aviso === d ? "var(--ac)22" : "var(--d3)", color: contrato.aviso === d ? "var(--text)" : "var(--muted2)" }}>{d} dias</button>
                ))}
              </div>

              <label className="lbl">Data do contrato</label>
              <input className="field" value={contrato.dataContrato} onChange={e => setContrato(s => ({ ...s, dataContrato: e.target.value }))} />
            </div>

            {estSel && (
              <div style={{ background: "var(--d2)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 16px", marginBottom: 14, fontSize: 13 }}>
                <div style={{ fontWeight: 800, marginBottom: 6 }}>{estSel.emoji} {estSel.name}</div>
                <div style={{ color: "var(--muted2)", fontSize: 12, lineHeight: 1.8 }}>
                  👤 {estSel.responsavel || "—"} · 📍 {estSel.cidade || "—"} · 🏷️ {estSel.ramo || "—"}<br/>
                  📧 {estSel.owner} · 📞 {estSel.telefone || "—"}
                </div>
              </div>
            )}

            <button className="btn btn-red" style={{ maxWidth: 280 }} onClick={imprimirContrato} disabled={!contrato.estId}>
              🖨️ Gerar e imprimir contrato
            </button>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 10, lineHeight: 1.6 }}>
              Abrirá uma nova aba com o contrato formatado para impressão. Use <strong style={{ color: "var(--text)" }}>Ctrl+P</strong> para imprimir ou salvar como PDF.
            </div>
          </>);
        })()}

        {tab === "senha" && (<>
          <div className="main-title">🔑 Trocar Senha Master</div>
          <div className="setup-box" style={{ maxWidth: 420 }}>
            <div className="setup-box-title">Alterar senha de acesso Master</div>
            <div style={{ padding: "10px 14px", borderRadius: 10, marginBottom: 14, fontSize: 12, color: "var(--muted2)", background: "var(--d2)", border: "1px solid var(--border)", lineHeight: 1.6 }}>
              ✅ A senha fica salva no banco de dados e <strong style={{ color: "var(--green)" }}>persiste mesmo após recarregar a página</strong>.
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
          <span style={{ fontSize: 11, color: "var(--muted)", whiteSpace: "nowrap" }}>notacheia.com.br/</span>
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
          <span style={{ fontSize: 11, color: "var(--muted)", whiteSpace: "nowrap" }}>notacheia.com.br/</span>
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



// ============================================================
// VALIDAR CUPOM — página acessada pelo dono ao escanear o QR
// ============================================================
function ValidarCupom({ ests }) {
  const path = window.location.pathname;
  const m = path.match(/\/validar\/([^/]+)\/([^/]+)/);
  const estId = m?.[1];
  const codigo = m?.[2];
  const est = ests.find(e => e.id === estId);
  const [status, setStatus] = useState("loading");
  const [cupom, setCupom] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!estId || !codigo) { setStatus("erro"); setMsg("Link inválido."); return; }
    validarCupom(codigo, estId).then(res => {
      if (res.valido) { setCupom(res.cupom); setStatus("valido"); }
      else { setMsg(res.motivo); setStatus("invalido"); }
    });
  }, []);

  const confirmar = async () => {
    setStatus("confirmando");
    await marcarCupomUsado(codigo, estId);
    setStatus("entregue");
  };

  const ac = est?.color || "#e63946";

  return (
    <div className="page page-center fade-up" style={{ background: `radial-gradient(ellipse at 50% 0%, ${ac}20, transparent 60%), var(--dark)` }}>
      <div className="card" style={{ textAlign: "center" }}>
        <div style={{ fontSize: 24, marginBottom: 6 }}>{est?.emoji || "🎁"}</div>
        <div style={{ fontFamily: "var(--ff-head)", fontSize: 18, marginBottom: 4 }}>{est?.name || "NotaCheia"}</div>
        <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 20 }}>Validação de Cupom</div>
        <div className="div" />

        {status === "loading" && <div style={{ color: "var(--muted)", padding: 20 }}>Verificando cupom...</div>}

        {status === "valido" && cupom && (
          <>
            <div style={{ fontSize: 52, marginBottom: 8 }}>✅</div>
            <div style={{ fontFamily: "var(--ff-head)", fontSize: 22, color: "var(--green)", marginBottom: 6 }}>CUPOM VÁLIDO!</div>
            <div style={{ background: "var(--d2)", border: "2px dashed var(--green)88", borderRadius: 14, padding: 16, margin: "14px 0" }}>
              <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Prêmio</div>
              <div style={{ fontFamily: "var(--ff-head)", fontSize: 24, color: "var(--text)" }}>{cupom.premio}</div>
              <div style={{ fontSize: 12, color: "var(--muted2)", marginTop: 6 }}>👤 {cupom.nome_cliente || "Anônimo"}</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>Código: {cupom.codigo}</div>
            </div>
            <button className="btn btn-red" onClick={confirmar} style={{ background: "var(--green)", marginBottom: 8 }}>
              ✅ Confirmar entrega do brinde
            </button>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>Clique para marcar como entregue e invalidar o cupom.</div>
          </>
        )}

        {status === "confirmando" && <div style={{ color: "var(--muted)", padding: 20 }}>Registrando...</div>}

        {status === "entregue" && (
          <>
            <div style={{ fontSize: 52, marginBottom: 8 }}>🎁</div>
            <div style={{ fontFamily: "var(--ff-head)", fontSize: 22, color: "var(--ac)", marginBottom: 8 }}>Brinde entregue!</div>
            <div style={{ fontSize: 14, color: "var(--muted2)", lineHeight: 1.7 }}>Cupom marcado como utilizado.<br />Não pode ser usado novamente.</div>
          </>
        )}

        {status === "invalido" && (
          <>
            <div style={{ fontSize: 52, marginBottom: 8 }}>❌</div>
            <div style={{ fontFamily: "var(--ff-head)", fontSize: 22, color: "var(--red)", marginBottom: 8 }}>Cupom inválido</div>
            <div style={{ fontSize: 14, color: "var(--muted2)" }}>{msg}</div>
          </>
        )}

        {status === "erro" && (
          <>
            <div style={{ fontSize: 52, marginBottom: 8 }}>⚠️</div>
            <div style={{ fontSize: 14, color: "var(--muted2)" }}>{msg}</div>
          </>
        )}

        <div style={{ fontSize: 11, color: "#444", marginTop: 20 }}>NotaCheia ⭐ · Validação de cupom</div>
      </div>
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
    const path = window.location.pathname;
    const validarMatch = path.match(/^\/validar\/([^/]+)\/([^/]+)/);
    if (validarMatch) { setMode("validar"); }
    const slug = path.match(/^\/([^/]+)/)?.[1];
    async function init() {
      await loadMasterPass();
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
        {mode === "client" && (
          <div className="top-bar" style={{ justifyContent: "flex-start" }}>
            <select style={{ background: "var(--d2)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px", fontFamily: "var(--ff-body)", fontSize: 12, cursor: "pointer" }}
              value={activeEst?.id} onChange={e => setActiveEst(ests.find(x => x.id === e.target.value))}>
              {ests.map(e => <option key={e.id} value={e.id}>{e.emoji} {e.name}</option>)}
            </select>
            <button className="top-btn top-btn-ghost" onClick={() => setMode("ownerGateway")}>🏪 Dono</button>
            <button className="top-btn top-btn-red" onClick={() => setMode("masterLogin")}>👑 Master</button>
          </div>
        )}
        {mode === "client" && activeEst && <ClientApp est={activeEst} onSubmit={addFeedback} key={activeEst.id} />}
        {mode === "ownerGateway" && <OwnerGateway onDemo={() => { const demo = ests.find(e => e.id === "est_demo") || SEED.find(e => e.id === "est_demo"); setLoggedEst(demo); setMode("ownerDash"); }} onLogin={() => setMode("ownerLogin")} />}
        {mode === "ownerLogin" && <LoginScreen title="ACESSO DO PROPRIETÁRIO" hint="" onLogin={(email, pass) => { const found = ests.find(e => e.owner === email && e.pass === pass); if (found) { setLoggedEst(found); setMode("ownerDash"); return true; } return false; }} />}
        {mode === "ownerDash" && loggedEst && <OwnerDash est={loggedEst} onUpdate={updateEst} onLogout={() => { setLoggedEst(null); setMode("client"); }} />}
        {mode === "masterLogin" && <LoginScreen title="PAINEL MASTER" hint="" prefillEmail="master@notacheia.com.br" prefillPass="hu2001" onLogin={(email, pass) => { if (email === MASTER.user && pass === MASTER.pass) { setMode("masterDash"); return true; } return false; }} />}
        {mode === "masterDash" && <MasterPanel establishments={ests} setEstablishments={setEsts} onLogout={() => setMode("client")} />}
        {mode === "validar" && <ValidarCupom ests={ests} />}
      </div>
    </>
  );
}
