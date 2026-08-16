// Turns the brief + your answers + your calibration reactions into a ranked pool.
// Every sentence shown in the results is generated from a matched criterion + a piece of
// candidate evidence — nothing about a candidate is hand-written.

const Engine = (function () {
  const TIER_WEIGHT = { must: 3, prioritize: 2, nice: 1, flexible: 0.25 };

  // --- criteria read out of the brief + JD + company profile -----------------

  function baseCriteria() {
    return [
      { id: 'c-ent',   label: 'Enterprise or B2B product experience', signal: 'enterpriseB2B', tier: 'must',       weight: 1, source: 'jd',      sourceNote: 'From the job description' },
      { id: 'c-sen',   label: 'Senior IC ownership',                  signal: null, kind: 'seniority', tier: 'must', weight: 1, source: 'prompt', sourceNote: 'You said senior' },
      { id: 'c-loc',   label: 'Bangalore, or willing to relocate',    signal: null, kind: 'location',  tier: 'must', weight: 1, source: 'prompt', sourceNote: 'You said Bangalore' },

      { id: 'c-0to1',  label: '0→1 ownership',                        signal: 'zeroToOne',   tier: 'prioritize', weight: 1, source: 'prompt', sourceNote: 'You said ambiguous 0→1 problems' },
      { id: 'c-flow',  label: 'Complex workflow design',              signal: 'complexWorkflows', tier: 'prioritize', weight: 1, source: 'company', sourceNote: 'Your product is workflow software' },
      { id: 'c-xfn',   label: 'Cross-functional leadership',          signal: 'crossFunctionalLeadership', tier: 'prioritize', weight: 1, source: 'prompt', sourceNote: 'You said works closely with PM and engineering' },

      { id: 'c-ai',    label: 'AI product experience',                signal: 'aiProducts',  tier: 'nice', weight: 1, source: 'prompt', sourceNote: 'You said AI analytics product' },
      { id: 'c-dom',   label: 'Analytics or data-dense products',     signal: 'domainDepth', tier: 'nice', weight: 1, source: 'jd',     sourceNote: 'From the job description' },

      { id: 'c-title', label: 'Exact job title',           signal: null, tier: 'flexible', weight: 1, source: 'inferred', sourceNote: 'Scope matters more than title' },
      { id: 'c-yrs',   label: 'Exact years of experience', signal: null, tier: 'flexible', weight: 1, source: 'inferred', sourceNote: 'Evidence matters more than tenure' },
      { id: 'c-ind',   label: 'Specific industry',         signal: null, tier: 'flexible', weight: 1, source: 'inferred', sourceNote: 'Adjacent environments are acceptable' },
    ];
  }

  // Backfill builds its criteria from the previous person rather than from a template.
  // The spectrum (0 = find someone like them, 100 = evolve the role) decides whether what
  // you preserved or what you want added carries more weight — that is the whole point of
  // asking, so it has to actually move the ranking.
  function backfillCriteria({ preserve = [], evolve = [], spectrum = 50 }) {
    const keep = 1 + (1 - spectrum / 100) * 1.1;
    const add  = 1 + (spectrum / 100) * 1.1;

    let out = baseCriteria().filter(c =>
      c.tier === 'must' || c.tier === 'flexible' || c.id === 'c-dom');

    // One criterion per signal, always. If the brief already produced this dimension,
    // reweight it in place — a second criterion for the same signal would score it twice.
    const upsert = (sig, tier, weight, note) => {
      const existing = out.find(c => c.signal === sig);
      if (existing) {
        out = out.map(c => c.signal === sig
          ? { ...c, weight, sourceNote: note, source: 'scenario', tier: c.tier === 'must' ? 'must' : tier }
          : c);
      } else {
        out = [...out, {
          id: `c-${sig}`, label: SIGNAL_LABEL[sig], signal: sig,
          tier, weight, source: 'scenario', sourceNote: note,
        }];
      }
    };

    // what you want added wins over what you kept, if you picked both
    preserve.filter(sig => !evolve.includes(sig))
      .forEach(sig => upsert(sig, 'prioritize', +keep.toFixed(2), 'Worked in the last person'));
    evolve
      .forEach(sig => upsert(sig, spectrum >= 65 ? 'must' : 'prioritize', +add.toFixed(2), 'Missing last time'));

    return out;
  }

  // The scripted conversation moves between two states. The wording is written;
  // these weights are not — they are what actually reorders the pool.
  function scriptCriteria(phase, opts = {}) {
    const base = [
      { id: 'c-ent',  label: 'Enterprise or B2B product experience', signal: 'enterpriseB2B', tier: 'must', weight: 1, source: 'scenario', sourceNote: 'Kept from the last person' },
      { id: 'c-sen',  label: 'Senior IC ownership', signal: null, kind: 'seniority', tier: 'must', weight: 1, source: 'prompt', sourceNote: 'You said senior' },
      { id: 'c-loc',  label: 'Bangalore, or willing to relocate', signal: null, kind: 'location', tier: 'must', weight: 1, source: 'prompt', sourceNote: 'Your hiring location' },
      { id: 'c-flow', label: 'Complex workflow design', signal: 'complexWorkflows', tier: 'prioritize', weight: 1, source: 'company', sourceNote: 'Your product is workflow software' },
      { id: 'c-ai',   label: 'AI product experience', signal: 'aiProducts', tier: 'nice', weight: 1, source: 'prompt', sourceNote: 'The role is on an AI product' },
      { id: 'c-title', label: 'Exact job title', signal: null, tier: 'flexible', weight: 1, source: 'inferred', sourceNote: 'Scope matters more than title' },
      { id: 'c-yrs',   label: 'Exact years of experience', signal: null, tier: 'flexible', weight: 1, source: 'inferred', sourceNote: 'Evidence matters more than tenure' },
      { id: 'c-ind',   label: 'Specific industry', signal: null, tier: 'flexible', weight: 1, source: 'inferred', sourceNote: 'Adjacent environments are acceptable' },
    ];

    const zeroToOne = w => ({
      id: 'c-0to1', label: '0→1 ownership', signal: 'zeroToOne', tier: 'prioritize',
      weight: w, source: 'prompt', sourceNote: 'You want direction, not just execution',
    });

    if (phase === 'opening') return [...base, zeroToOne(1.8)];

    const out = [...base, zeroToOne(2.2)];
    if (opts.process) {
      out.push({
        id: 'c-proc', label: 'Survived enterprise process', signal: 'enterpriseProcess',
        tier: 'must', weight: 1.5, source: 'calibration',
        sourceNote: 'From your read of the four profiles',
      });
    }
    return out;
  }

  // --- per-criterion fit, 0..1 ----------------------------------------------

  const SENIORITY_FIT = { mid: 0.4, 'senior-ic': 1, lead: 1, staff: 1, principal: 0.9, director: 0.7 };
  const LOCATION_FIT  = { 'in-city': 1, 'open-to-relocate': 0.85, 'in-country-remote': 0.5, outside: 0.15 };

  function fit(candidate, crit, filters) {
    if (crit.kind === 'seniority') return SENIORITY_FIT[candidate.seniority] ?? 0.5;
    if (crit.kind === 'location') {
      if (filters && filters.locationStrict === 'bangalore-only')
        return candidate.locationFit === 'in-city' ? 1 : 0;
      if (filters && filters.locationStrict === 'india-remote')
        return candidate.locationFit === 'outside' ? 0.15 : 1;
      return LOCATION_FIT[candidate.locationFit] ?? 0.5;
    }
    if (!crit.signal) return 0.5;
    return (candidate.signals[crit.signal] ?? 0) / 5;
  }

  // company context is a bonus, never a filter
  const RELEVANT_ENVS = ['enterprise-b2b-saas', 'workflow', 'regulated', 'ai-native', 'developer-tools', 'high-growth'];

  // widening after calibration is a real change to what counts as a relevant background,
  // not a cosmetic one — it is why the fintech candidate climbs
  const WIDENED_ENVS = [...RELEVANT_ENVS, 'fintech', 'healthtech'];

  function companyBonus(candidate, filters) {
    const envs = filters && filters.widened ? WIDENED_ENVS : RELEVANT_ENVS;
    const hits = candidate.companyEnvironments.filter(e => envs.includes(e)).length;
    return (hits / envs.length) * 1.6;
  }

  // --- scoring ---------------------------------------------------------------

  // weights can go negative — "too consumer" is a real thing to say about a candidate,
  // and it has to be able to push someone down rather than just failing to lift them
  function score(candidate, criteria, filters) {
    let total = 0, max = 0;
    criteria.forEach(crit => {
      const w = TIER_WEIGHT[crit.tier] * crit.weight;
      total += w * fit(candidate, crit, filters);
      max += TIER_WEIGHT[crit.tier] * Math.abs(crit.weight);
    });
    const base = max > 0 ? (total / max) * 10 : 0;
    return base + companyBonus(candidate, filters);
  }

  function mustsMet(candidate, criteria, filters) {
    return criteria.filter(c => c.tier === 'must').every(c => fit(candidate, c, filters) >= 0.6);
  }

  function unmetMusts(candidate, criteria, filters) {
    return criteria.filter(c => c.tier === 'must' && fit(candidate, c, filters) < 0.6);
  }

  // --- match tier, derived not stored ---------------------------------------

  function matchTier(candidate, criteria, filters) {
    const met = mustsMet(candidate, criteria, filters);
    const prioritize = criteria.filter(c => c.tier === 'prioritize');
    const coverage = prioritize.length
      ? prioritize.reduce((a, c) => a + fit(candidate, c, filters), 0) / prioritize.length
      : 0;
    const inEnterprise = candidate.companyEnvironments.includes('enterprise-b2b-saas');
    const scenarioStrong = (candidate.signals.zeroToOne >= 4) || (candidate.signals.aiProducts >= 4);

    // order matters — the interesting labels have to get first refusal, otherwise
    // everyone competent collapses into "Strong match" and the tier stops saying anything
    if (!inEnterprise && scenarioStrong && !met) return { label: 'Unexpected fit', variant: 'AIMagic' };
    if (!inEnterprise && coverage >= 0.78)       return { label: 'Strong adjacent match', variant: 'info' };
    if (met && coverage >= 0.85)                 return { label: 'Strong match', variant: 'success' };
    if (met && coverage >= 0.68)                 return { label: 'Good match', variant: 'unresolved' };
    return { label: 'Worth a look', variant: 'unresolved' };
  }

  // --- explanations, generated from criteria × evidence ----------------------

  function explain(candidate, criteria, filters) {
    const weighted = criteria
      .filter(c => c.signal && (c.tier === 'must' || c.tier === 'prioritize' || c.tier === 'nice'))
      .map(c => ({ crit: c, f: fit(candidate, c, filters), w: TIER_WEIGHT[c.tier] * c.weight }))
      .filter(x => x.f >= 0.7 && x.w > 0)
      .sort((a, b) => (b.w * b.f) - (a.w * a.f));

    const reasons = [];
    const nMust = criteria.filter(c => c.tier === 'must').length;
    if (mustsMet(candidate, criteria, filters)) reasons.push(`Meets all ${nMust} must-haves`);

    const used = new Set();
    weighted.forEach(({ crit }) => {
      if (reasons.length >= 4) return;
      const ev = candidate.evidence.find(e => e.signal === crit.signal && !used.has(e.text));
      if (ev) { used.add(ev.text); reasons.push(ev.text); }
    });

    if (reasons.length < 2) {
      candidate.evidence.slice(0, 2).forEach(e => {
        if (!used.has(e.text) && reasons.length < 3) { used.add(e.text); reasons.push(e.text); }
      });
    }

    const tradeoffs = [
      ...unmetMusts(candidate, criteria, filters).map(c => `Does not meet a must-have — ${c.label.toLowerCase()}`),
      ...candidate.tradeoffs,
    ].slice(0, 2);

    // portfolio depth is stated, never allowed to silently demote
    const p = candidate.portfolio;
    const portfolioNote = p && p.depth === 'thin'
      ? `Limited public portfolio — ${p.note.toLowerCase()}`
      : null;

    return { reasons, tradeoffs, portfolioNote, tier: matchTier(candidate, criteria, filters) };
  }

  function rank(candidates, criteria, filters) {
    return candidates
      .map(c => ({ candidate: c, score: score(c, criteria, filters), ...explain(c, criteria, filters) }))
      .sort((a, b) => b.score - a.score);
  }

  // --- learning from answers and calibration --------------------------------

  const SIGNAL_LABEL = {
    enterpriseB2B: 'Enterprise or B2B product experience', zeroToOne: '0→1 ownership',
    complexWorkflows: 'Complex workflow design', aiProducts: 'AI product experience',
    productStrategy: 'Product strategy', crossFunctionalLeadership: 'Cross-functional leadership',
    research: 'Research depth', designSystems: 'Design systems and craft',
    consumer: 'Consumer background', domainDepth: 'Analytics or data-dense products',
    execution: 'Execution strength', enterpriseProcess: 'Survived enterprise process',
  };

  // if calibration surfaces a dimension the brief never mentioned, it becomes a criterion
  // rather than being silently dropped
  function ensureCriterion(criteria, signal) {
    if (criteria.some(c => c.signal === signal)) return criteria;
    return [...criteria, {
      id: `c-${signal}`, label: SIGNAL_LABEL[signal] || signal, signal,
      tier: 'nice', weight: 0, source: 'calibration', sourceNote: 'From your reactions',
    }];
  }

  // returns a new criteria array — never mutates
  function applyDelta(criteria, signal, delta) {
    return ensureCriterion(criteria, signal)
      .map(c => c.signal === signal ? { ...c, weight: c.weight + delta } : c);
  }

  function promote(criteria, id, tier) {
    return criteria.map(c => c.id === id ? { ...c, tier, source: 'clarification', sourceNote: 'You answered this' } : c);
  }

  return { baseCriteria, backfillCriteria, scriptCriteria, rank, explain, score, matchTier, applyDelta, promote, fit, TIER_WEIGHT, unmetMusts, SIGNAL_LABEL, ensureCriterion };
})();
