export type NovaIntent =
  | 'greet' | 'smalltalk' | 'style_advice' | 'outfit_request'
  | 'product_search' | 'account' | 'help' | 'unknown';

export type NovaEntities = {
  occasion?: string; season?: string; colors?: string[];
  budgetMax?: number; gender?: 'male'|'female'|'neutral';
  categories?: string[]; archetypes?: string[];
};

export type NovaMessage = { role:'user'|'nova'|'tool'; content:string; ts:number };

type ToolCtx = {
  profile: any; // onboarding-profiel
  history: NovaMessage[];
};
export type NovaToolResult = { type:string; payload:any };

export const NovaMemory = {
  readProfile(){ try{ return JSON.parse(localStorage.getItem('fitfi.profile')||'null'); }catch{return null;}},
  writeProfile(p:any){ localStorage.setItem('fitfi.profile', JSON.stringify(p)); },
  readHistory(){ try{ return JSON.parse(sessionStorage.getItem('nova.history')||'[]'); }catch{return [];} },
  writeHistory(h:NovaMessage[]){ sessionStorage.setItem('nova.history', JSON.stringify(h.slice(-30))); }
};

// ── Intent + entities (very light, upgrade in Prompt 2)
export function detectIntent(input:string): NovaIntent {
  const q=input.toLowerCase();
  if (/hallo|hey|hi|hoi/.test(q)) return 'greet';
  if (/help|hulp|support|faq/.test(q)) return 'help';
  if (/account|inloggen|logout|wachtwoord/.test(q)) return 'account';
  if (/(outfit|look|setje)/.test(q)) return 'outfit_request';
  if (/(broek|jurk|sneaker|shirt|jas)/.test(q)) return 'product_search';
  if (/(stijl|advies|combineren|matchen)/.test(q)) return 'style_advice';
  return 'unknown';
}

export function extractEntities(input:string): NovaEntities {
  const { findColorMatch, findOccasionMatch, findCategoryMatch, BUDGET_PATTERNS, SEASONS } = require('./nl-lexicon');
  
  const q = input.toLowerCase();
  
  // Enhanced color detection met synoniemen
  const colors: string[] = [];
  const colorMatch = findColorMatch(input);
  if (colorMatch) colors.push(colorMatch);
  
  // Enhanced budget detection
  let budgetMax: number | undefined;
  for (const pattern of BUDGET_PATTERNS) {
    const match = q.match(pattern);
    if (match) {
      budgetMax = Number(match[1]);
      break;
    }
  }
  
  // Enhanced occasion detection
  const occasion = findOccasionMatch(input);
  
  // Enhanced season detection
  const seasonMatch = SEASONS.find(s => q.includes(s));
  
  // Enhanced category detection
  const categories: string[] = [];
  const categoryMatch = findCategoryMatch(input);
  if (categoryMatch) categories.push(categoryMatch);
  
  return {
    colors: colors.length ? colors : undefined,
    budgetMax,
    occasion,
    season: seasonMatch,
    categories: categories.length ? categories : undefined
  };
}

// ── Tool registry (mock-friendly; echte engine calls waar mogelijk)
export const NovaTools = {
  async generate_outfits(ctx:ToolCtx, args:NovaEntities):Promise<NovaToolResult>{
    const { getCurrentSeason } = await import('@/engine/helpers');
    const { generateRecommendations } = await import('@/engine/recommendationEngine');
    const user = ctx.profile || { gender:'neutral', stylePreferences:{}, isPremium:false };
    const opts:any = {
      count: 3,
      preferredOccasions: args.occasion?[args.occasion]:undefined,
      preferredSeasons: [ (args.season as any) || getCurrentSeason() ],
      realtime: false
    };
    const outfits = await generateRecommendations(user, opts);
    return { type:'outfits', payload: outfits };
  },
  async explain_outfit(_:ToolCtx, { outfit }:any):Promise<NovaToolResult>{
    const { generateOutfitExplanation } = await import('@/engine/explainOutfit');
    return { type:'explanation', payload: generateOutfitExplanation(outfit) };
  },
  async search_products(_:ToolCtx, args:NovaEntities):Promise<NovaToolResult>{
    const { getZalandoProducts } = await import('@/data/zalandoProductsAdapter');
    const all = await getZalandoProducts();
    const filtered=all.filter(p=>{
      const okColor = !args.colors?.length || args.colors?.some(c=>p.name.toLowerCase().includes(c)||p.color?.toLowerCase()==c);
      const okBudget = !args.budgetMax || p.price<=args.budgetMax;
      return okColor && okBudget;
    }).slice(0,12);
    return { type:'products', payload: filtered };
  },
  async save(_:ToolCtx, { id }:{id:string}){ const { toggleSave } = await import('@/services/engagement'); return {type:'saved', payload: toggleSave(id)}; },
  async dislike(_:ToolCtx, { id }:{id:string}){ const { dislike } = await import('@/services/engagement'); dislike(id); return {type:'disliked', payload:id}; },
  async similar(_:ToolCtx, { base, all }:{base:any; all:any[]}){
    const { getSimilarOutfits } = await import('@/services/engagement');
    return { type:'outfits', payload: getSimilarOutfits(all, base, 3) };
  },
  async navigate(_:ToolCtx, { to }:{to:string}){ return { type:'navigate', payload: to }; }
};

// ── Planner: intent → tool(s) → response
export async function planAndExecute(userText:string){
  const profile = NovaMemory.readProfile();
  const history = NovaMemory.readHistory();
  const intent = detectIntent(userText);
  const entities = extractEntities(userText);
  const ctx:ToolCtx={ profile, history };

  if (intent==='greet') return { reply: 'Hey! Waar heb je zin in vandaag—een outfitadvies, of iets specifieks zoeken?', cards:[] };
  if (intent==='help') return { reply:'Je kunt me vragen om outfits voor een gelegenheid, kleur of budget. Probeer: "Outfit voor kantoor onder €120 in zwart."', cards:[] };
  if (intent==='outfit_request' || intent==='style_advice'){
    const r = await NovaTools.generate_outfits(ctx, entities);
    return { reply: buildOutfitReply(entities), cards: r.payload, kind:'outfits' };
  }
  if (intent==='product_search'){
    const r = await NovaTools.search_products(ctx, entities);
    return { reply: buildProductReply(entities), cards: r.payload, kind:'products' };
  }
  return { reply: 'Ik kan outfits en producten voor je vinden. Noem een gelegenheid, kleur of budget 👍', cards:[] };
}

// ── Fallback copy generators (LLM-vrij)
function buildOutfitReply(e:NovaEntities){
  const bits = [
    e.occasion ? `voor ${e.occasion}` : '',
    e.colors?.length ? `in ${e.colors.join(' & ')}` : '',
    e.budgetMax ? `onder €${e.budgetMax}` : ''
  ].filter(Boolean).join(' ');
  
  const variants = [
    `Perfect! Ik heb outfits ${bits || 'die bij je stijl passen'} gevonden. Deze combinaties zijn zorgvuldig geselecteerd op basis van jouw profiel. Wil je een van deze outfits opslaan of meer vergelijkbare opties zien?`,
    `Hier zijn ${bits ? `stijlvolle looks ${bits}` : 'outfits die perfect bij je passen'}! Ik heb rekening gehouden met jouw voorkeuren en de huidige trends. Klik op "Leg uit" voor meer details of "Meer zoals dit" voor variaties.`,
    `Geweldig! Deze outfits ${bits || 'matchen jouw stijl'} zijn speciaal voor jou samengesteld. Ze combineren functionaliteit met jouw persoonlijke smaak. Bewaar je favorieten of vraag om uitleg bij elke look!`
  ];
  
  return variants[Math.floor(Math.random() * variants.length)];
}
function buildProductReply(e:NovaEntities){
  const bits = [
    e.categories?.[0] ? e.categories[0] : 'items',
    e.colors?.length ? `in ${e.colors[0]}` : '',
    e.budgetMax ? `onder €${e.budgetMax}` : ''
  ].filter(Boolean).join(' ');
  
  const variants = [
    `Mooi! Ik heb ${bits || 'geweldige items'} voor je geselecteerd. Deze producten passen perfect bij jouw stijl en budget. Wil je ze bewaren of zoeken naar specifieke gelegenheden?`,
    `Check deze ${bits || 'stijlvolle pieces'} uit! Ze zijn handpicked op basis van jouw voorkeuren. Klik op een product om meer details te zien of vraag me om te filteren op seizoen of gelegenheid.`,
    `Hier zijn ${bits || 'toffe items'} die bij je passen! Ik heb ze geselecteerd omdat ze matchen met jouw profiel. Bewaar je favorieten of laat me weten als je iets specifieks zoekt!`
  ];
  
  return variants[Math.floor(Math.random() * variants.length)];
}