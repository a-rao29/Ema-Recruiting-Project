// The conversation, scripted.
//
// UX prototype, not an agent. The exchange is written; clicking the composer prefills
// your next line. What is not faked: criteria, filters, pool count and ranking all move
// for real, and Ema's calibration reply is assembled from the reactions you gave.

const SCAN_TOTAL = '4,100';

// --- small primitives -------------------------------------------------------

function LinkedIn({ size = 16 }) {
  return <img src="assets/linkedin.svg" width={size} height={size} alt="LinkedIn" style={{ display: 'block', borderRadius: 3 }} />;
}

function Spinner() {
  return <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid var(--beige-400)', borderTopColor: 'var(--ai-magic)', display: 'inline-block', animation: 'emaspin 700ms linear infinite' }} />;
}

// Ema's turns are scannable: a lead line, then evidence as bullets, then the ask.
function Lead({ children }) {
  return <p style={{ margin: '0 0 10px', fontSize: 15, lineHeight: '24px', color: 'var(--fg1)' }}>{children}</p>;
}
function Bullets({ items }) {
  return (
    <ul style={{ margin: '0 0 14px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
      {items.map((t, i) => (
        <li key={i} style={{ display: 'flex', gap: 10, fontSize: 15, lineHeight: '24px', color: 'var(--fg1)' }}>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'currentColor', opacity: .45, marginTop: 10, flex: '0 0 auto' }} />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}
function Ask({ children }) {
  return (
    <p style={{ margin: '12px 0 0', paddingTop: 12, borderTop: '1px solid var(--beige-300)', fontSize: 15, lineHeight: '24px', color: 'var(--fg1)', fontWeight: 500 }}>
      {children}
    </p>
  );
}
function QuickReplies({ options, onChoose, delay = 0 }) {
  const [visible, setVisible] = React.useState(delay <= 0);
  React.useEffect(() => {
    if (delay <= 0) return;
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  if (!visible) return null;
  return (
    <div className="ema-quick-replies-in" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '-8px 0 22px' }}>
      {options.map((option, index) => (
        <Button key={option.label} variant={index === 0 ? 'primary' : 'secondary'} color="brand" size="sm"
          icon={option.icon} onClick={() => onChoose(option.text)}>
          {option.label}
        </Button>
      ))}
      <span style={{ alignSelf: 'center', marginLeft: 2, fontSize: 11, color: 'var(--fg3)' }}>or type a different answer</span>
    </div>
  );
}
const K = ({ children }) => <strong style={{ fontWeight: 700, color: 'var(--fg1)' }}>{children}</strong>;

function DailyTaskSuggestion({ task, onCreate, onViewTasks }) {
  const [time, setTime] = React.useState(task ? task.time : '09:00');
  const formatTime = value => {
    const [hours, minutes] = String(value).split(':').map(Number);
    return `${hours % 12 || 12}:${String(minutes || 0).padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`;
  };
  const shiftTime = delta => {
    const [hours, minutes] = String(time).split(':').map(Number);
    const next = (hours * 60 + minutes + delta + 1440) % 1440;
    setTime(`${String(Math.floor(next / 60)).padStart(2, '0')}:${String(next % 60).padStart(2, '0')}`);
  };

  return (
    <div style={{ margin: '-8px 0 28px', padding: 14, borderRadius: 12, border: `1px solid ${task ? 'var(--green-400, var(--green-500))' : 'var(--beige-400)'}`, background: task ? 'var(--green-50)' : 'var(--white)', boxShadow: 'var(--shadow-xs)', maxWidth: 600 }}>
      {task ? (
        <>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--green-200)', color: 'var(--green-800)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}><i className="ph ph-check" style={{ fontSize: 15, fontWeight: 700 }} /></span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg1)' }}>Daily search task created</div>
              <div style={{ marginTop: 3, fontSize: 12, lineHeight: '18px', color: 'var(--fg2)' }}>Every day at {formatTime(task.time)}, Ema will look for additional profiles matching at least {task.minMatch}% of the current criteria.</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, paddingTop: 11, borderTop: '1px solid var(--green-200)' }}>
            <span style={{ fontSize: 11, color: 'var(--fg3)' }}>Asia/Kolkata · New profiles in Ema</span>
            <span style={{ flex: 1 }} />
            <Button variant="secondary" color="brand" size="sm" icon="arrow-right" onClick={onViewTasks}>View task</Button>
          </div>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--beige-100)', color: 'var(--green-800)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}><i className="ph ph-clock-counter-clockwise" style={{ fontSize: 16 }} /></span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg1)' }}>Keep this search working for you</div>
              <p style={{ margin: '3px 0 0', fontSize: 12, lineHeight: '18px', color: 'var(--fg2)' }}>Turn the refined search into a daily task. Ema will share additional profiles that match at least 60% of the criteria.</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 13, paddingTop: 12, borderTop: '1px solid var(--beige-300)' }}>
            <span style={{ fontSize: 12, color: 'var(--fg2)' }}>Every day at</span>
            <div aria-label={`Daily search time ${formatTime(time)}`} style={{ height: 30, display: 'inline-flex', alignItems: 'center', border: '1px solid var(--beige-400)', borderRadius: 7, background: 'var(--white)', overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
              <button onClick={() => shiftTime(-30)} title="30 minutes earlier" style={{ width: 28, height: 30, padding: 0, border: 0, borderRight: '1px solid var(--beige-300)', background: 'transparent', color: 'var(--fg2)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><i className="ph ph-caret-left" style={{ fontSize: 11 }} /></button>
              <span style={{ width: 68, textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'var(--fg1)', fontVariantNumeric: 'tabular-nums' }}>{formatTime(time)}</span>
              <button onClick={() => shiftTime(30)} title="30 minutes later" style={{ width: 28, height: 30, padding: 0, border: 0, borderLeft: '1px solid var(--beige-300)', background: 'transparent', color: 'var(--fg2)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><i className="ph ph-caret-right" style={{ fontSize: 11 }} /></button>
            </div>
            <span style={{ fontSize: 11, color: 'var(--fg3)' }}>Asia/Kolkata</span>
            <span style={{ flex: 1 }} />
            <Button variant="primary" color="brand" size="sm" icon="plus" onClick={() => onCreate(time)}>Create task</Button>
          </div>
        </>
      )}
    </div>
  );
}

function EmaSays({ children, tight }) {
  return (
    <div style={{ marginBottom: tight ? 12 : 28 }}>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
}

function YouSay({ children, anchorRef }) {
  return (
    <div ref={anchorRef} style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 30, scrollMarginTop: 22 }}>
      <div style={{ maxWidth: '82%', padding: '12px 16px', background: 'var(--fg1)', border: '1px solid var(--fg1)', borderRadius: 12, fontSize: 15, lineHeight: '24px', color: 'var(--white)' }}>
        {children}
      </div>
    </div>
  );
}

function conversationText(node) {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(conversationText).filter(Boolean).join(' ');
  if (node.props) return conversationText(node.props.children);
  return '';
}

function streamWords(value, counter) {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value).split(/(\s+)/).map(part => {
      if (!part || /^\s+$/.test(part)) return part;
      const index = counter.current++;
      return <span key={`stream-${index}`} className="ema-stream-word" style={{ animationDelay: `${Math.min(index * 18, 1450)}ms` }}>{part}</span>;
    });
  }
  if (Array.isArray(value)) return value.map(item => streamWords(item, counter));
  if (!React.isValidElement(value)) return value;

  const nextProps = {};
  if (value.props.children !== undefined) nextProps.children = streamWords(value.props.children, counter);
  if (Array.isArray(value.props.items)) nextProps.items = value.props.items.map(item => streamWords(item, counter));
  return React.cloneElement(value, nextProps);
}

// Total time-to-last-word for a streamed body, so anything gated on "after the text finishes" can line up with it.
function streamDuration(wordCount) {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 0;
  return Math.min(Math.max(wordCount - 1, 0) * 18, 1450) + 260;
}

function Thinking({ text }) {
  return (
    <div style={{ margin: '0 0 30px 32px', minHeight: 24 }}>
      <span className="ema-thinking-shimmer" style={{ fontSize: 15, lineHeight: '24px', fontWeight: 500 }}>{text}</span>
    </div>
  );
}

function ThinkingDisclosure({ items }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ margin: '0 0 12px' }}>
      <button onClick={() => setOpen(value => !value)} aria-expanded={open}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minHeight: 26, padding: 0, border: 0, outline: 0, background: 'transparent', color: 'var(--fg1)', fontFamily: 'inherit', fontSize: 13, lineHeight: '20px', fontWeight: 500, cursor: 'pointer' }}>
        {open ? 'Hide thinking' : 'Show thinking'}
        <i className={`ph ph-caret-${open ? 'up' : 'down'}`} style={{ fontSize: 10, opacity: .65 }} />
      </button>
      {open && (
        <div style={{ maxWidth: 580, marginTop: 7 }}>
          {items.map((item, index) => (
            <p key={index} style={{ margin: index ? '6px 0 0' : 0, fontSize: 14, lineHeight: '22px', color: 'var(--fg1)' }}>{item}</p>
          ))}
        </div>
      )}
    </div>
  );
}

const COMPANY_DOMAINS = {
  'Atlassian': 'atlassian.com', 'CRED': 'cred.club', 'Chargebee': 'chargebee.com',
  'Darwinbox': 'darwinbox.com', 'Freshworks': 'freshworks.com', 'Google': 'google.com',
  'Icertis': 'icertis.com', 'Independent · previously Gojek': 'gojek.com',
  'Lollypop Design Studio': 'lollypop.design', 'Microsoft': 'microsoft.com',
  'Palantir': 'palantir.com', 'Postman': 'postman.com', 'Practo': 'practo.com',
  'Razorpay': 'razorpay.com', 'Rubrik': 'rubrik.com', 'Salesforce': 'salesforce.com',
  'Sarvam AI': 'sarvam.ai', 'ServiceNow': 'servicenow.com', 'Zoho': 'zoho.com',
};

function CompanyMark({ name, size = 22 }) {
  const [failed, setFailed] = React.useState(false);
  const domain = COMPANY_DOMAINS[name];
  if (domain && !failed) return (
    <span title={`${name} logo`} style={{ width: size, height: size, borderRadius: Math.max(4, size * .22), background: 'var(--white)', border: '1px solid var(--beige-300)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flex: '0 0 auto' }}>
      <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`} alt="" onError={() => setFailed(true)} style={{ width: size * .7, height: size * .7, objectFit: 'contain' }} />
    </span>
  );
  return (
    <span title={`${name} company mark`} style={{ width: size, height: size, borderRadius: Math.max(4, size * .22), background: 'var(--green-100, var(--beige-200))', border: '1px solid var(--green-300, var(--beige-400))', color: 'var(--green-800)', fontSize: Math.max(9, size * .42), fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
      {name[0]}
    </span>
  );
}

// Mirrors Engine's own strong/good/worth-a-look cutoffs (0.85 / 0.68) so pill color and tier label never disagree.
function matchTint(value) {
  if (value >= 85) return { bg: 'var(--green-100, var(--green-200))', bd: 'var(--green-400, var(--green-500))', fg: 'var(--green-800)' };
  if (value >= 68) return { bg: 'var(--orange-100, var(--orange-200))', bd: 'var(--orange-400, var(--orange-500))', fg: 'var(--orange-800)' };
  return { bg: 'var(--beige-100)', bd: 'var(--beige-400)', fg: 'var(--fg2)' };
}

function MatchScore({ value, compact = false, showLabel = false }) {
  const tint = matchTint(value);
  return (
    <span title={`${value}% criteria match`} style={{ minWidth: compact ? 42 : 48, height: compact ? 24 : 28, padding: compact ? '0 8px' : '0 9px', borderRadius: 7, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: tint.bg, color: tint.fg, fontSize: compact ? 11 : 12, lineHeight: 1, fontWeight: 700, whiteSpace: 'nowrap' }}>
      {value}%{showLabel ? ' match' : ''}
    </span>
  );
}

function composeBackfillDecision(previous, selection) {
  const firstName = previous ? previous.name.split(' ')[0] : 'their';
  return `I'd keep ${firstName}'s enterprise judgment and execution strength, but I want the next person to bring stronger 0→1 product direction and product strategy.`;
}

function deriveBackfillFromText(text, current, previous) {
  const lower = text.toLowerCase();
  const strengths = previous ? previous.understoodStrengths || [] : [];
  const gaps = previous ? previous.understoodGaps || [] : [];
  const mentions = {
    enterpriseB2B: /enterprise|b2b/, complexWorkflows: /complex|workflow/, execution: /execution|ship|delivery|craft/,
    crossFunctionalLeadership: /stakeholder|cross.functional|leadership/, domainDepth: /domain/,
    zeroToOne: /0.?→.?1|0.?to.?1|zero.?to.?one/, productStrategy: /strategy|direction/,
    aiProducts: /\bai\b|artificial intelligence/,
  };
  if (/similar|another sarah|replicate/.test(lower)) {
    return { preserve: strengths.map(x => x.signal), evolve: [] };
  }
  const preserve = strengths.filter(item => mentions[item.signal] && mentions[item.signal].test(lower)).map(item => item.signal);
  const evolve = gaps.filter(item => mentions[item.signal] && mentions[item.signal].test(lower)).map(item => item.signal);
  return {
    preserve: preserve.length ? preserve : current.preserve,
    evolve: evolve.length ? evolve : current.evolve,
  };
}

function criteriaMatchPercent(candidate, criteria, filters) {
  if (Number.isFinite(candidate.backfillMatchPercent)) return candidate.backfillMatchPercent;
  let earned = 0;
  let possible = 0;
  criteria.forEach(c => {
    const weight = (Engine.TIER_WEIGHT[c.tier] || 0) * Math.abs(c.weight || 1);
    if (!weight) return;
    earned += weight * Math.max(0, Math.min(1, Engine.fit(candidate, c, filters)));
    possible += weight;
  });
  return possible ? Math.round((earned / possible) * 100) : 0;
}

// Shared with the mini chat on the Outreach page, so the ranked pool and pending-task
// state read the same way wherever they're rendered.
function rankedResults(candidates, criteria, filters) {
  return Engine.rank(candidates, criteria, filters).map(result => ({
    ...result,
    matchPercent: criteriaMatchPercent(result.candidate, criteria, filters),
  })).sort((a,b)=>b.matchPercent-a.matchPercent||b.score-a.score);
}
function qualifiedPoolSize(candidates, criteria, filters) {
  return candidates.filter(c => Engine.unmetMusts(c, criteria, filters).length === 0).length;
}

// Every must-have here has no matching candidate signal, so Engine.fit() returns a flat
// .5 for all of them — below the .6 pass bar, which is what guarantees a zero-candidate
// pool for the "something else" no-match demo, not scripted set dressing.
function noMatchCriteria() {
  return [
    { id: 'c-unicorns', label: 'Shipped a category-defining AI product at 3 unicorns', signal: null, tier: 'must', weight: 1, source: 'prompt', sourceNote: 'From the brief' },
    { id: 'c-phd',      label: 'PhD in Machine Learning',                                signal: null, tier: 'must', weight: 1, source: 'prompt', sourceNote: 'From the brief' },
    { id: 'c-japanese', label: 'Fluent Japanese',                                        signal: null, tier: 'must', weight: 1, source: 'prompt', sourceNote: 'From the brief' },
    { id: 'c-reloc',    label: 'Relocate to Bangalore within a week',                    signal: null, tier: 'must', weight: 1, source: 'prompt', sourceNote: 'From the brief' },
    { id: 'c-comp',     label: '₹18 L compensation cap',                                 signal: null, tier: 'prioritize', weight: 1, source: 'prompt', sourceNote: 'From the brief' },
  ];
}
function applyDailyTask(state, time) {
  return {
    ...state,
    tasks: [
      ...(state.tasks || []).filter(task => !(task.searchId === state.id && task.cadence === 'daily')),
      {
        id: `task-${state.id}-daily`, searchId: state.id, title: 'Daily candidate discovery',
        searchName: 'Senior product designer', cadence: 'daily', time,
        timezone: 'Asia/Kolkata', minMatch: 60, delivery: 'New profiles in Ema', status: 'active',
      },
    ],
  };
}

// --- calibration ------------------------------------------------------------

// Three deliberately different readings of the role are enough to calibrate the search.
// The consumer-AI profile was directionally redundant with the 0→1 profile and made
// this moment feel like a shortlist review rather than a quick taste-setting exercise.
const CALIBRATION_IDS = ['c-003', 'c-002', 'c-007'];

const REACTIONS = [
  { id: 'fit',   label: 'Right direction', icon: 'thumbs-up' },
  { id: 'maybe', label: 'Partly',          icon: 'scales' },
  { id: 'no',    label: 'Wrong direction', icon: 'thumbs-down' },
];

const REASONS = {
  'c-003': [
    { label: 'Too close to Sarah',    signal: 'zeroToOne',       effect: 'lacks' },
    { label: 'Not enough 0→1',        signal: 'zeroToOne',       effect: 'lacks' },
    { label: 'Enterprise depth',      signal: 'enterpriseB2B',   effect: 'boost' },
    { label: 'Stakeholder strength',  signal: 'crossFunctionalLeadership', effect: 'boost' },
  ],
  'c-002': [
    { label: 'Strong 0→1',              signal: 'zeroToOne',        effect: 'boost' },
    { label: 'AI depth',                signal: 'aiProducts',       effect: 'boost' },
    { label: 'No enterprise process',   signal: 'enterpriseProcess', effect: 'lacks' },
    { label: 'Too startup',             signal: 'enterpriseB2B',    effect: 'lacks' },
  ],
  'c-004': [
    { label: 'AI depth',      signal: 'aiProducts',                effect: 'boost' },
    { label: 'Leadership',    signal: 'crossFunctionalLeadership', effect: 'boost' },
    { label: 'Too consumer',  signal: 'consumer',                  effect: 'excess' },
    { label: 'Wrong domain',  signal: 'enterpriseB2B',             effect: 'lacks' },
  ],
  'c-007': [
    { label: 'Wouldn’t have found him', signal: 'enterpriseProcess', effect: 'boost' },
    { label: 'Complex workflows',            signal: 'complexWorkflows',  effect: 'boost' },
    { label: 'Regulated experience',         signal: 'enterpriseProcess', effect: 'boost' },
    { label: 'Wrong industry',               signal: 'enterpriseB2B',     effect: 'lacks' },
  ],
};

const ORDINAL = { 'c-003': 'First', 'c-002': 'Second', 'c-007': 'Third' };
const VERDICT = { fit: 'right direction', maybe: 'partly there', no: 'wrong direction' };

function calibrationLines(state) {
  return CALIBRATION_IDS.filter(id => state[id] && state[id].reaction).map(id => {
    const st = state[id];
    const why = (st.reasons || []).length ? ` — ${st.reasons.join(', ').toLowerCase()}` : '';
    return `${ORDINAL[id]} is ${VERDICT[st.reaction]}${why}.`;
  });
}

function composeReactions(state) {
  const note = (state.note || '').trim();
  return [...calibrationLines(state), note].filter(Boolean).join(' ');
}

function CalibrationPayload({ candidates, ranked, state, onReact, onReason, onView }) {
  const railRef = React.useRef(null);
  const [active, setActive] = React.useState(0);
  const move = direction => {
    const rail = railRef.current;
    if (!rail) return;
    const next = Math.max(0, Math.min(candidates.length - 1, active + direction));
    const card = rail.children[next];
    if (card) rail.scrollTo({ left: card.offsetLeft, behavior: 'smooth' });
    setActive(next);
  };
  const trackPosition = e => {
    const rail = e.currentTarget;
    const cards = [...rail.children];
    if (!cards.length) return;
    const nearest = cards.reduce((best, card, index) => Math.abs(card.offsetLeft - rail.scrollLeft) < best.distance
      ? { index, distance: Math.abs(card.offsetLeft - rail.scrollLeft) } : best, { index: 0, distance: Infinity });
    setActive(nearest.index);
  };
  return (
    <div className="ema-payload-enter" style={{ marginBottom: 30 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg1)' }}>Quick review</div>
          <div style={{ marginTop: 1, fontSize: 11, color: 'var(--fg3)' }}>Three different readings of the role</div>
        </div>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: 'var(--fg3)', fontVariantNumeric: 'tabular-nums' }}>{active + 1} of {candidates.length}</span>
        <IconButton icon="caret-left" size="sm" variant="secondary" title="Previous candidate" onClick={() => move(-1)} />
        <IconButton icon="caret-right" size="sm" variant="secondary" title="Next candidate" onClick={() => move(1)} />
      </div>

      <div ref={railRef} className="ema-review-rail" onScroll={trackPosition}
        style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollSnapType: 'x mandatory', scrollBehavior: 'smooth', padding: '2px 42px 8px 2px', marginRight: -14, overscrollBehaviorX: 'contain' }}>
        {candidates.map(c => {
        const st = state[c.id] || {};
        const result = ranked.find(r => r.candidate.id === c.id);
        const reason = result && (result.reasons.find(x => !/^Meets all /.test(x)) || result.reasons[0]);
        const watchout = result && result.tradeoffs && result.tradeoffs[0];
        return (
          <div key={c.id} style={{ flex: '0 0 calc(100% - 48px)', minWidth: 0, padding: 14, background: 'var(--white)', border: `1px solid ${st.reaction ? 'var(--beige-500)' : 'var(--beige-400)'}`, borderRadius: 10, boxShadow: 'var(--shadow-xs)', scrollSnapAlign: 'start', scrollSnapStop: 'always' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CompanyMark name={c.company} size={34} />
              <div style={{ minWidth: 0 }}>
                <button onClick={() => onView(c.id)} className="ema-name-link" style={{ border: 0, outline: 0, background: 'transparent', padding: 0, fontFamily: 'inherit', fontSize: 14, fontWeight: 700, color: 'var(--fg1)', cursor: 'pointer', textAlign: 'left' }}>{c.name}</button>
                <div style={{ marginTop: 2, fontSize: 12, lineHeight: '17px', color: 'var(--fg2)' }}>{c.title} · {c.company}</div>
              </div>
              <span style={{ flex: 1 }} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                {result && <MatchScore value={result.matchPercent} />}
                <a href={`https://${c.linkedin}`} target="_blank" rel="noreferrer" title={`Open ${c.name}'s LinkedIn profile`}
                  style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid var(--beige-300)', background: 'var(--white)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LinkedIn size={13} />
                </a>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, height: 24, padding: '0 8px', borderRadius: 9999, background: 'var(--beige-100)', color: 'var(--fg2)', fontSize: 11 }}><i className="ph ph-map-pin" />{c.location.replace(', India', '')}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, height: 24, padding: '0 8px', borderRadius: 9999, background: 'var(--beige-100)', color: 'var(--fg2)', fontSize: 11 }}><i className="ph ph-clock" />{c.availability}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, height: 24, padding: '0 8px', borderRadius: 9999, background: 'var(--beige-100)', color: 'var(--fg2)', fontSize: 11 }}><i className="ph ph-briefcase" />{c.yearsExperience} years</span>
              {c.mutuals > 0 && <span title={`${c.mutuals} shared connections`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, height: 24, padding: '0 8px', borderRadius: 9999, background: 'var(--beige-100)', color: 'var(--fg2)', fontSize: 11 }}><i className="ph ph-users" />{c.mutuals} shared</span>}
            </div>

            <div style={{ marginTop: 11, padding: '10px 11px', borderRadius: 8, background: 'linear-gradient(120deg, var(--green-100, var(--beige-100)) 0%, var(--blue-50, var(--beige-50)) 48%, var(--purple-100, var(--beige-100)) 100%)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--fg1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} style={{ color: 'var(--white)' }} width={10} height={10}>
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                  </svg>
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg1)' }}>Reason recommended</span>
              </div>
              <div style={{ fontSize: 12, lineHeight: '18px', color: 'var(--fg1)' }}>{reason || c.headline}</div>
            </div>

            {watchout && (
              <div style={{ display: 'flex', gap: 6, marginTop: 8, fontSize: 11, lineHeight: '17px', color: 'var(--fg3)' }}>
                <span style={{ fontWeight: 700, color: 'var(--fg2)', whiteSpace: 'nowrap' }}>Watch-out</span>
                <span>{watchout}</span>
              </div>
            )}

            <div style={{ height: 1, background: 'var(--beige-200)', marginTop: 11 }} />
            <div style={{ marginTop: 9, fontSize: 11, fontWeight: 600, color: 'var(--fg2)' }}>
              Does this feel like the right direction?
            </div>

            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
              {REACTIONS.map(r => {
                const on = st.reaction === r.id;
                return (
                  <button key={r.id} onClick={() => onReact(c.id, r.id)}
                    style={{
                      flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                      height: 30, borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit',
                      fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap',
                      background: on ? 'var(--beige-200)' : 'var(--white)',
                      border: `1px solid ${on ? 'var(--fg3)' : 'var(--beige-400)'}`,
                      color: on ? 'var(--fg1)' : 'var(--fg2)', transition: 'all 150ms',
                    }}>
                    <i className={`ph ph-${r.icon}`} style={{ fontSize: 13 }} />{r.label}
                  </button>
                );
              })}
            </div>

            {st.reaction && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 9 }}>
                {(REASONS[c.id] || []).map(ch => {
                  const on = (st.reasons || []).includes(ch.label);
                  return (
                    <button key={ch.label} onClick={() => onReason(c.id, ch.label)}
                      style={{
                        height: 26, padding: '0 10px', borderRadius: 9999, cursor: 'pointer', fontFamily: 'inherit',
                        fontSize: 12, fontWeight: 500,
                        background: on ? 'var(--green-200)' : 'var(--white)',
                        border: `1px solid ${on ? 'var(--green-500)' : 'var(--beige-400)'}`,
                        color: on ? 'var(--green-800)' : 'var(--fg2)', transition: 'all 150ms',
                      }}>{ch.label}</button>
                  );
                })}
              </div>
            )}
          </div>
        );
        })}
      </div>
    </div>
  );
}

// --- script -----------------------------------------------------------------

const widensIndustry = st => st['c-007'] && ['fit', 'maybe'].includes(st['c-007'].reaction);
const addsProcess = st => (st['c-002'] && ['maybe', 'no'].includes(st['c-002'].reaction))
  || (st['c-002'] && (st['c-002'].reasons || []).includes('No enterprise process'))
  || /security review|procurement|deployment/i.test(st.note || '');

const SCRIPT = [
  {
    who: 'ema',
    body: p => (
      <>
        <Lead>I went through <K>{p.previousName}</K>'s record{p.hasJD ? ' and compared it with the job description' : ''}.</Lead>
        <Lead>She looks like the person the team trusted when a complicated enterprise workflow needed to get shipped without drama.</Lead>
        <Bullets items={[
          'She owned the runbook builder and triage console—the two densest surfaces in the product',
          'She shipped 14 releases in three years with very little design-QA churn',
          'She worked directly with customers through three large enterprise deployments',
        ]} />
        <Lead>Most of that evidence is on established products. I can’t tell from her record whether you want the replacement to stay execution-heavy or take on more of the early product direction.</Lead>
        <Ask>What would you want to preserve from Sarah, and what should the next person bring that she didn’t have to?</Ask>
      </>
    ),
    thinking: p => `Reviewing ${p.previousName}'s record…`,
    thinkingItems: p => [
      `Reviewed ${p.previousName}'s role history and strongest work evidence.`,
      'Separated repeatable strengths from areas where the next hire could add something new.',
    ],
  },
  { who: 'you', composedBackfill: true },
  {
    who: 'ema',
    body: p => (
      <>
        <Lead>Understood. I won’t look for another version of {p.previousName}.</Lead>
        <Lead>I’ll keep her enterprise judgment, workflow depth and delivery bar as the foundation, then give more weight to people who have set product direction before the problem was well defined.</Lead>
        <Lead>Previous AI experience can help, but I won’t make it a hard requirement unless the evidence says it should be.</Lead>
        <Ask>One trade-off before I start: several of the strongest 0→1 people are titled Lead or Principal, and four aren’t in Bangalore. Keep them in?</Ask>
      </>
    ),
    quickReplies: [
      { label: 'Yes, keep them in', text: 'Yes, keep them in.', icon: 'check' },
      { label: 'No, keep it focused', text: 'No—keep it to Senior ICs in Bangalore.', icon: 'x' },
    ],
    effect: p => ({
      criteria: Engine.backfillCriteria({ preserve: p.backfill.preserve, evolve: p.backfill.evolve, spectrum: 50 }),
      filters: { locationStrict: 'bangalore-only' },
    }),
    thinking: () => 'Turning your answer into search criteria…',
    thinkingItems: () => [
      'Converted what should carry forward and what should evolve into weighted criteria.',
      'Kept AI experience helpful rather than mandatory because the evidence does not justify a hard filter.',
    ],
  },
  { who: 'you', id: 'scope-tradeoff', text: 'Yes, keep them in.' },
  {
    who: 'ema',
    body: p => (
      <>
        <Lead>{p.answers['scope-tradeoff'] === 'no'
          ? 'Understood. I’ll keep the first pass to Senior ICs in Bangalore.'
          : 'Done. I’ll keep strong Lead and Principal profiles—and people outside Bangalore—in the first pass.'}</Lead>
        <Lead>Two assumptions to correct if they're wrong:</Lead>
        <Bullets items={[
          <>Same band as your last two hires at this level — <K>₹68–85 L</K></>,
          'No relocation budget',
        ]} />
        <Lead>Sarah's last day is <K>12 September</K>. With typical notice periods, this is realistically a <K>December start</K> unless you take someone already out.</Lead>
      </>
    ),
    effect: p => ({ filters: p.answers['scope-tradeoff'] === 'no'
      ? { locationStrict: 'bangalore-only', levelOpen: false }
      : { locationStrict: null, levelOpen: true } }),
    thinking: () => 'Checking the title and location trade-off…',
    thinkingItems: p => [
      p.answers['scope-tradeoff'] === 'no'
        ? 'Kept the first pass to Senior ICs based in Bangalore.'
        : 'Opened the first pass to Lead and Principal profiles and candidates outside Bangalore.',
      'Checked how that choice changes the qualified pool before applying it.',
    ],
  },
  { who: 'you', text: "Band's right. December's fine, I'd rather wait for the right person." },
  {
    who: 'ema',
    body: () => (
      <>
        <Lead>Then I'll stop penalising long notice. I've scanned <K>{SCAN_TOTAL}</K> designer profiles against this.</Lead>
        <Ask>Three that represent genuinely different readings of the role—what you make of these tells me where to search, not who to hire.</Ask>
      </>
    ),
    payload: 'calibration',
    effect: () => ({ filters: { noticeIgnored: true, band: '₹68–85 L' } }),
    thinking: () => 'Updating timing, compensation and availability…',
    thinkingItems: () => [
      'Applied the agreed compensation band and stopped penalising longer notice periods.',
      `Compared the refined brief with ${SCAN_TOTAL} profiles and selected three contrasting examples.`,
    ],
  },
  { who: 'you', composed: true },
  {
    who: 'ema',
    body: p => (
      <>
        <Lead><K>{p.ranked.length} ranked</K>, {p.poolSize} clear every must-have.</Lead>
        <Bullets items={[
          <><K>{p.top}</K> first — {p.topReason}</>,
          p.adjacent ? <><K>{p.adjacent}</K> is in the top six, which wouldn't have happened an hour ago.</> : null,
          p.overBand > 0
            ? <>{p.overBand === 1 ? 'One of your top six is' : `${p.overBand} of your top six are`} above your band — a stretch or a level change.</>
            : <>Everyone in your top six is inside your band.</>,
        ].filter(Boolean)} />
        <Ask>You can ask me any follow-up questions about this list—change what the table shows, or ask why someone ranks where they do.</Ask>
      </>
    ),
    payload: 'results',
    effect: p => ({
      criteria: applyCalibrationCriteria(p.criteria, p.reactions),
      filters: { widened: widensIndustry(p.reactions) },
    }),
    thinking: () => 'Learning from your candidate reactions…',
    thinkingItems: () => [
      'Compared your reactions with the criteria that produced each recommendation.',
      'Adjusted the search toward the signals you endorsed and away from the patterns you rejected.',
    ],
  },
  { who: 'you', text: 'Can you add work experience as a field for me to review?' },
  {
    who: 'ema',
    body: () => (
      <>
        <Lead>Done—I added <K>Work experience</K> to the table.</Lead>
        <Lead>It shows total experience and the candidate’s most relevant recent organisations, so you can compare career depth without opening every profile.</Lead>
        <Ask>You can keep changing the view, or ask me to explain any ranking.</Ask>
      </>
    ),
    effect: () => ({ showExperience: true }),
    thinking: () => 'Re-ranking the candidate pool…',
    thinkingItems: () => [
      'Re-scored candidates against the latest Must have, Prioritise, Nice to have and Flexible criteria.',
      'Checked the top results for match strength, trade-offs and compensation exceptions.',
    ],
  },
  { who: 'you', text: 'Why does Maya rank higher than Ritika?' },
  {
    who: 'ema',
    body: p => {
      const maya = p.ranked.find(result => result.candidate.id === 'c-001');
      const ritika = p.ranked.find(result => result.candidate.id === 'c-003');
      return (
        <>
          <Lead>Maya ranks higher for <K>this brief</K>—not because she is universally the stronger designer.</Lead>
          <Bullets items={[
            <>Maya scores <K>{maya ? `${maya.matchPercent}%` : 'higher'}</K> because she combines enterprise workflow depth with two products taken from problem definition to launch.</>,
            <>Ritika scores <K>{ritika ? `${ritika.matchPercent}%` : 'lower'}</K>. Her enterprise execution and stakeholder leadership are stronger, but most of her evidence comes from improving mature products.</>,
            <>Your instruction to add more early product direction gives Maya’s 0→1 evidence more weight than Ritika’s additional enterprise tenure.</>,
          ]} />
          <Lead>If preserving Sarah’s execution certainty matters more than evolving the role, I can increase that weight and show you how the order changes.</Lead>
          <Ask>Want me to keep this search running and bring you additional matching profiles every day?</Ask>
        </>
      );
    },
    payload: 'schedule',
    thinking: () => 'Adding work experience to the review…',
    thinkingItems: () => [
      'Added total experience and recent organisations as a visible comparison field.',
      'Kept the ranking unchanged because this only changes the table view, not the criteria.',
    ],
  },
];

// Plays instead of SCRIPT when the brief comes from "Something else" — a deliberately
// unreasonable ask, so the pool of qualified candidates is genuinely zero (see
// noMatchCriteria) rather than staged. Ema still tries to understand the brief first,
// same as SCRIPT does, before explaining why nothing clears the bar and proposing
// criteria that actually work against the real candidate pool.
const NO_MATCH_SCRIPT = [
  {
    who: 'ema',
    body: () => (
      <>
        <Lead>Before I search, I want to make sure I'm reading this brief right. As written, it's asking for someone who has shipped a category-defining AI product at three different unicorns, holds a <K>PhD in Machine Learning</K>, is fluent in <K>Japanese</K>, can relocate to Bangalore within a week, and fits an <K>₹18 L</K> band.</Lead>
        <Ask>Is all of that truly non-negotiable, or is some of it a nice-to-have I should weight rather than filter on?</Ask>
      </>
    ),
    quickReplies: [
      { label: "It's all non-negotiable", text: "No, all of it is non-negotiable — that's exactly what we need.", icon: 'lock-simple' },
      { label: 'Some of it can flex', text: 'Some of it can flex, actually.', icon: 'sliders-horizontal' },
    ],
    thinking: () => 'Reading the brief against real candidate signals…',
    thinkingItems: () => [
      'Checked which parts of the ask map to signals I can actually verify against candidate data.',
      'Flagged the requirements with no matching signal before running a single search.',
    ],
  },
  { who: 'you', id: 'flex-check', text: "No, all of it is non-negotiable — that's exactly what we need." },
  {
    who: 'ema',
    body: p => (
      <>
        <Lead>{p.answers['flex-check'] === 'no'
          ? "Understood — I'll hold every one of those as a hard filter."
          : "Got it — I'll keep a couple of these as strong preferences rather than hard filters."}</Lead>
        <Ask>One more check before I scan the pool: is <K>₹18 L</K> the ceiling, or is there room to move for someone who clears every other bar?</Ask>
      </>
    ),
    quickReplies: [
      { label: '₹18 L is firm', text: "₹18 L is firm — that's the budget we have.", icon: 'currency-inr' },
      { label: "There's some room", text: "There's a little room if the person is exceptional.", icon: 'trend-up' },
    ],
    thinking: () => 'Checking whether compensation leaves any room…',
    thinkingItems: () => [
      'Compared the stated band against market rates for this seniority and skill combination.',
      'Held the other must-haves as declared while checking this one lever.',
    ],
  },
  { who: 'you', id: 'comp-check', text: "₹18 L is firm — that's the budget we have." },
  {
    who: 'ema',
    body: () => (
      <>
        <Lead>I scanned <K>{SCAN_TOTAL}</K> designer profiles against this, and nobody clears every must-have.</Lead>
        <Bullets items={[
          'No one in the pool has shipped a category-defining AI product at three separate unicorns — that combination is exceptionally rare at any compensation.',
          'Very few candidates with this profile also speak fluent Japanese, and none of those also clear the other must-haves.',
          'A one-week relocation window ruled out several strong candidates who were otherwise a fit.',
          '₹18 L is well below what this seniority and skill combination commands in this market.',
        ]} />
        <Ask>This combination isn't findable as written. Want me to propose criteria that would actually surface strong candidates?</Ask>
      </>
    ),
    payload: 'no-match',
    quickReplies: [
      { label: 'Yes, show me', text: 'Yes, show me what would actually work.', icon: 'sparkle' },
      { label: "I'll adjust it myself", text: 'I will adjust it myself instead.', icon: 'sliders-horizontal' },
    ],
    thinking: () => `Scanning ${SCAN_TOTAL} profiles against every must-have…`,
    thinkingItems: () => [
      `Ran all ${SCAN_TOTAL} profiles through the must-have filters exactly as stated.`,
      'Confirmed zero candidates clear all of them before saying so.',
    ],
  },
  { who: 'you', id: 'propose-check', text: 'Yes, show me what would actually work.' },
  {
    who: 'ema',
    body: p => (
      <>
        <Lead>Here's what I'd search on instead—same seniority bar, but must-haves that are actually verifiable and realistic for this budget.</Lead>
        <Bullets items={[
          'Senior product design ownership on enterprise or B2B products, based in Bangalore or open to relocating',
          '0→1 experience and AI product exposure carried as strong preferences, not hard filters',
          "Dropped the language and unicorn requirements—I can't verify them, and requiring them found nobody",
        ]} />
        <Lead><K>{p.ranked.length} ranked</K>, {p.poolSize} clear every must-have.</Lead>
        <Ask>You can ask me any follow-up questions about this list—change what the table shows, or ask why someone ranks where they do.</Ask>
      </>
    ),
    payload: 'results',
    effect: () => ({ criteria: Engine.baseCriteria() }),
    thinking: () => 'Rebuilding the criteria around verifiable signals…',
    thinkingItems: () => [
      'Dropped requirements with no matching signal in the candidate data.',
      'Kept seniority and domain fit as the hard bar, and moved 0→1 and AI experience to preferences.',
    ],
  },
];

// --- results ----------------------------------------------------------------

const TIER_ORDER = { 'Strong match': 0, 'Strong adjacent match': 1, 'Unexpected fit': 2, 'Good match': 3, 'Worth a look': 4 };
const stickyHead = { position: 'sticky', top: 0, zIndex: 1 };

function sortResults(results, sort) {
  // `results` has already been ranked by the match shown in the table. Keep that
  // order as the canonical rank so a 90% match cannot render below an 89% match
  // while still carrying the #1 label.
  const resultOrder = new Map(results.map((result, index) => [result.candidate.id, index]));
  const val = (r, key) => ({
    rank: resultOrder.get(r.candidate.id), name: r.candidate.name, tier: TIER_ORDER[r.tier.label] ?? 9, match: -r.matchPercent,
    title: r.candidate.title, company: r.candidate.company,
    location: r.candidate.location, available: r.candidate.availability,
  }[key]);
  return [...results].sort((a, b) => {
    const x = val(a, sort.key), y = val(b, sort.key);
    if (x === y) return resultOrder.get(a.candidate.id) - resultOrder.get(b.candidate.id);
    return (typeof x === 'string' ? x.localeCompare(y) : x - y) * (sort.dir === 'asc' ? 1 : -1);
  });
}

function SortHeader({ col, sort, onSort, onColumnDragStart, onColumnDragOver, onColumnDrop, onColumnDragEnd, dragging, dragOver }) {
  const active = sort.key === col.key;
  return (
    <TH draggable
      onDragStart={e => onColumnDragStart(e, col.key)}
      onDragOver={e => onColumnDragOver(e, col.key)}
      onDrop={e => onColumnDrop(e, col.key)}
      onDragEnd={onColumnDragEnd}
      title={`Drag to reorder the ${col.label} column`}
      style={{
        width: col.width, ...stickyHead, padding: 0, cursor: 'grab',
        animation: col.highlight ? 'emaColumnAdded 1.2s ease-out' : undefined,
        opacity: dragging ? .4 : 1,
        boxShadow: dragOver ? 'inset 2px 0 0 var(--green-700, var(--green-600))' : undefined,
      }}>
      <span onClick={col.sortable ? () => onSort(col.key) : undefined}
        style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '9px 12px', color: active ? 'var(--fg1)' : 'inherit', cursor: col.sortable ? 'pointer' : 'default', userSelect: 'none' }}>
        <i className="ph ph-dots-six-vertical" style={{ fontSize: 12, opacity: .4, flex: '0 0 auto' }} />
        {col.label}
        {col.sortable && <i className={`ph ph-${active ? (sort.dir === 'asc' ? 'arrow-up' : 'arrow-down') : 'arrows-down-up'}`} style={{ fontSize: 11, opacity: active ? 1 : .45 }} />}
      </span>
    </TH>
  );
}

// compact table that sits inside the thread
function experienceSummary(candidate) {
  const companies = (candidate.experience || []).map(job => job.company).filter((company, index, list) => list.indexOf(company) === index);
  return `${candidate.yearsExperience} yrs${companies.length ? ` · ${companies.slice(0, 2).join(', ')}${companies.length > 2 ? ` +${companies.length - 2}` : ''}` : ''}`;
}

function ResultsPayload({ results, onExpand, poolSize }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div className="ema-payload-enter" onClick={onExpand} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ marginBottom: 30, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, background: hover ? 'var(--beige-50)' : 'var(--white)', border: `1px solid ${hover ? 'var(--beige-500)' : 'var(--beige-400)'}`, borderRadius: 12, boxShadow: 'var(--shadow-xs)', cursor: 'pointer', transition: 'background 150ms, border-color 150ms' }}>
      <span style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--beige-100)', color: 'var(--fg2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
        <i className="ph ph-table" style={{ fontSize: 17 }} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg1)' }}>{results.length} candidates ranked</div>
        <div style={{ marginTop: 2, fontSize: 12, color: 'var(--fg3)' }}>{poolSize} clear every must-have. Open in the panel on the right.</div>
      </div>
      <i className="ph ph-arrow-square-out" style={{ fontSize: 15, color: 'var(--fg3)', flex: '0 0 auto' }} />
    </div>
  );
}

// Same card shape as ResultsPayload, so it reads as a sibling outcome rather than an
// error — just nothing to open, since the pool is empty.
function NoMatchPayload({ poolSize, scanned = SCAN_TOTAL }) {
  return (
    <div className="ema-payload-enter" style={{ marginBottom: 30, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--white)', border: '1px solid var(--beige-400)', borderRadius: 12, boxShadow: 'var(--shadow-xs)' }}>
      <span style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--beige-200)', color: 'var(--fg2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
        <i className="ph ph-funnel-x" style={{ fontSize: 17 }} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg1)' }}>{poolSize} of {scanned} profiles qualify</div>
        <div style={{ marginTop: 2, fontSize: 12, color: 'var(--fg3)' }}>Nobody clears every must-have as written.</div>
      </div>
    </div>
  );
}

const SPLIT_COLUMNS = [
  { key: 'rank',      label: '#',               sortable: true,  width: 46 },
  { key: 'name',      label: 'Candidate',       sortable: true,  width: 190 },
  { key: 'match',     label: 'Match',           sortable: true,  width: 150 },
  { key: 'why',       label: 'Why recommended', sortable: false, width: 290 },
  { key: 'company',   label: 'Organisation',    sortable: true,  width: 170 },
  { key: 'title',     label: 'Current role',    sortable: true,  width: 190 },
  { key: 'experience',label: 'Work experience', sortable: false, width: 190, optional: true, highlight: true },
  { key: 'contact',   label: 'Contact',         sortable: false, width: 82 },
  { key: 'location',  label: 'Location',        sortable: true,  width: 150 },
  { key: 'available', label: 'Available',       sortable: true,  width: 120 },
];

// Every column except rank (fixed leftmost) and shortlist (fixed rightmost, hardcoded in
// SplitRow) can be dragged to a new position; SplitTable tracks the order by key.
const REORDERABLE_COLUMNS = SPLIT_COLUMNS.slice(1);

const CELL_STYLES = {
  match: { whiteSpace: 'nowrap' },
  why: { fontSize: 12, lineHeight: '17px', color: 'var(--fg2)' },
  title: { fontSize: 12, lineHeight: '17px', color: 'var(--fg1)' },
  experience: { fontSize: 12, lineHeight: '17px', color: 'var(--fg2)', animation: 'emaColumnAdded 1.2s ease-out' },
  location: { fontSize: 12, lineHeight: '17px', color: 'var(--fg2)' },
  available: { fontSize: 12, lineHeight: '17px', color: 'var(--fg2)' },
};

const CELL_RENDERERS = {
  name: (c) => <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</span>,
  match: (c, result) => <MatchScore value={result.matchPercent} compact showLabel />,
  why: (c, result) => <span style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{result.reasons.find(x => !/^Meets all /.test(x)) || result.reasons[0]}</span>,
  company: (c) => <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><CompanyMark name={c.company} size={24} /><span style={{ fontSize: 12, color: 'var(--fg1)' }}>{c.company}</span></div>,
  title: (c) => c.title,
  experience: (c) => experienceSummary(c),
  contact: (c) => <ContactLink candidate={c} />,
  location: (c) => c.location,
  available: (c) => c.availability,
};

function SelectionCheckbox({ checked, indeterminate, onChange, label }) {
  return (
    <button type="button" role="checkbox" aria-checked={indeterminate ? 'mixed' : checked} aria-label={label} onClick={onChange}
      style={{ width: 20, height: 20, padding: 0, borderRadius: 5, border: `1px solid ${checked || indeterminate ? 'var(--green-700, var(--green-800))' : 'var(--beige-500)'}`, background: checked || indeterminate ? 'var(--green-800)' : 'var(--white)', color: 'var(--white)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', outline: 0, boxShadow: checked || indeterminate ? '0 0 0 2px var(--green-100)' : 'none', transition: 'all 130ms ease' }}>
      {(checked || indeterminate) && <i className={`ph ph-${indeterminate ? 'minus' : 'check'}`} style={{ fontSize: 12, fontWeight: 700 }} />}
    </button>
  );
}

function candidateEmail(candidate) {
  const [first, ...rest] = candidate.name.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(Boolean);
  return `${first}.${rest.join('.')}@gmail.com`;
}

function ContactLink({ candidate }) {
  const email = candidateEmail(candidate);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <a href={`https://${candidate.linkedin}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} title={`Open ${candidate.name}'s LinkedIn profile`}
        style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--beige-400)', background: 'var(--white)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
        <LinkedIn size={14} />
      </a>
      <a href={`mailto:${email}`} onClick={e => e.stopPropagation()} title={email}
        style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--beige-400)', background: 'var(--white)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg2)', flex: '0 0 auto' }}>
        <i className="ph ph-envelope-simple" style={{ fontSize: 14 }} />
      </a>
    </div>
  );
}

function ShortlistAction({ listed, onClick }) {
  return (
    <button onClick={onClick} title={listed ? 'Remove from shortlist' : 'Add to shortlist'}
      style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${listed ? 'var(--green-500)' : 'var(--beige-500)'}`, background: listed ? 'var(--green-200)' : 'var(--white)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: listed ? 'var(--green-800)' : 'var(--fg2)', boxShadow: listed ? '0 0 0 2px var(--green-100)' : 'var(--shadow-xs)', transition: 'all 140ms ease' }}>
      <i className={listed ? 'ph-bold ph-bookmark-simple' : 'ph ph-bookmark-simple'} style={{ fontSize: 15 }} />
    </button>
  );
}

function SplitTable({ results, shortlist, onShortlist, onSelect, selectedId, onClose, poolSize, showExperience,
  criteria, filters, total, updating, onFiltersChange, onCriteriaChange }) {
  const [sort, setSort] = React.useState({ key: 'rank', dir: 'asc' });
  const [query, setQuery] = React.useState('');
  const [minMatch, setMinMatch] = React.useState(60);
  const [showCriteria, setShowCriteria] = React.useState(false);
  const [selectedRows, setSelectedRows] = React.useState(() => new Set());
  const [columnOrder, setColumnOrder] = React.useState(() => REORDERABLE_COLUMNS.map(col => col.key));
  const [dragColumnKey, setDragColumnKey] = React.useState(null);
  const [dragOverColumnKey, setDragOverColumnKey] = React.useState(null);
  const [panelWidth, setPanelWidth] = React.useState(() => Math.max(520, Math.round((window.innerWidth - 255) * .52)));
  const [resizeHover, setResizeHover] = React.useState(false);
  const [resizing, setResizing] = React.useState(false);
  const tableViewportRef = React.useRef(null);
  const previousExperienceState = React.useRef(false);
  const onSort = key => setSort(s => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });
  const rankOf = new Map(results.map((r, i) => [r.candidate.id, i + 1]));
  const q = query.trim().toLowerCase();
  const matchFiltered = results.filter(r => r.matchPercent >= minMatch);
  const rows = sortResults(matchFiltered.filter(r => !q || [r.candidate.name, r.candidate.company, r.candidate.title, r.candidate.location].join(' ').toLowerCase().includes(q)), sort);
  const orderedColumns = columnOrder
    .map(key => REORDERABLE_COLUMNS.find(col => col.key === key))
    .filter(col => !col.optional || showExperience);
  const selectedResult = results.find(r => r.candidate.id === selectedId);
  const visibleIds = rows.map(r => r.candidate.id);
  const visibleSelected = visibleIds.filter(id => selectedRows.has(id));
  const shortlistableSelected = [...selectedRows].filter(id => !shortlist.includes(id));
  const allVisibleSelected = visibleIds.length > 0 && visibleSelected.length === visibleIds.length;
  const someVisibleSelected = visibleSelected.length > 0 && !allVisibleSelected;
  const toggleRow = id => setSelectedRows(current => {
    const next = new Set(current);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const toggleAllVisible = () => setSelectedRows(current => {
    const next = new Set(current);
    if (allVisibleSelected) visibleIds.forEach(id => next.delete(id));
    else visibleIds.forEach(id => next.add(id));
    return next;
  });
  const bulkShortlist = () => {
    [...selectedRows].filter(id => !shortlist.includes(id)).forEach(onShortlist);
    setSelectedRows(new Set());
  };

  const onColumnDragStart = (e, key) => {
    setDragColumnKey(key);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', key);
  };
  const onColumnDragOver = (e, key) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (key !== dragColumnKey) setDragOverColumnKey(key);
  };
  const onColumnDrop = (e, key) => {
    e.preventDefault();
    setDragColumnKey(null);
    setDragOverColumnKey(null);
    if (!dragColumnKey || dragColumnKey === key) return;
    setColumnOrder(current => {
      const next = current.filter(k => k !== dragColumnKey);
      next.splice(next.indexOf(key), 0, dragColumnKey);
      return next;
    });
  };
  const onColumnDragEnd = () => {
    setDragColumnKey(null);
    setDragOverColumnKey(null);
  };

  React.useEffect(() => {
    if (showExperience && !previousExperienceState.current && tableViewportRef.current) {
      const frame = requestAnimationFrame(() => tableViewportRef.current && tableViewportRef.current.scrollTo({ left: 405, behavior: 'smooth' }));
      previousExperienceState.current = showExperience;
      return () => cancelAnimationFrame(frame);
    }
    previousExperienceState.current = showExperience;
  }, [showExperience]);

  const beginResize = e => {
    e.preventDefault();
    setResizing(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    const move = event => {
      const min = 480;
      const max = Math.max(min, window.innerWidth - 520);
      setPanelWidth(Math.max(min, Math.min(max, window.innerWidth - event.clientX)));
    };
    const end = () => {
      setResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
  };

  return (
    <div style={{ width: panelWidth, flex: `0 0 ${panelWidth}px`, minWidth: 480, height: 'calc(100vh - 56px)', position: 'sticky', top: 0, display: 'flex', flexDirection: 'column', background: selectedResult ? 'var(--white)' : 'var(--beige-50)', borderLeft: '1px solid var(--beige-300)' }}>
      <div onPointerDown={beginResize} onMouseEnter={() => setResizeHover(true)} onMouseLeave={() => setResizeHover(false)} title="Drag to resize candidate panel"
        style={{ position: 'absolute', zIndex: 8, left: -10, top: 0, bottom: 0, width: 20, cursor: 'col-resize', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ width: 24, height: 34, borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--white)', border: '1px solid var(--beige-400)', boxShadow: 'var(--shadow-md)', color: 'var(--fg3)', opacity: resizeHover || resizing ? 1 : 0, transform: resizeHover || resizing ? 'scale(1)' : 'scale(.88)', transition: 'opacity 140ms ease, transform 140ms cubic-bezier(0.16,1,0.3,1)' }}>
          <i className="ph ph-dots-six-vertical" style={{ fontSize: 15 }} />
        </span>
      </div>

      <header style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderBottom: '1px solid var(--beige-300)', background: 'var(--white)', flex: '0 0 auto' }}>
        {selectedResult&&<IconButton icon="arrow-left" size="sm" title="Back to candidates" onClick={() => onSelect(null)} />}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg1)' }}>{selectedResult ? 'Candidate profile' : 'Search results'}</div>
          {selectedResult&&<div style={{ marginTop: 1, fontSize: 12, color: 'var(--fg3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedResult.candidate.name} · {selectedResult.matchPercent}% match</div>}
        </div>
        <span style={{ flex: 1 }} />
        <IconButton icon="x" size="sm" title="Close the list" onClick={onClose} />
      </header>
      {!selectedResult && <div style={{ minHeight: 52, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end', background: 'var(--beige-50)', borderBottom: '1px solid var(--beige-300)', flex: '0 0 auto' }}>
        <span style={{fontSize:11.5,color:'var(--fg3)',whiteSpace:'nowrap'}}>{rows.length} candidates · {matchFiltered.length} of {results.length} meet the match threshold</span>
        <span style={{flex:1}}/>
        <Input icon="magnifying-glass" placeholder="Search candidates…" value={query} onChange={setQuery} size="sm" style={{ width: 220 }} />
        <IconButton icon="sliders-horizontal" size="sm" active={showCriteria} title="View search criteria" onClick={() => setShowCriteria(v => !v)} />
      </div>}
      {showCriteria && !selectedResult && (
        <>
          <div onClick={() => setShowCriteria(false)} style={{ position: 'fixed', inset: 0, zIndex: 9 }} />
          <div style={{ position: 'absolute', top: 112, bottom: 24, right: 16, width: 330, minHeight: 320, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--beige-50)', border: '1px solid var(--beige-400)', borderRadius: 12, boxShadow: 'var(--shadow-lg, var(--shadow-md))', padding: 14, zIndex: 10 }}>
            <Rail criteria={criteria} filters={filters} poolSize={poolSize} total={total} updating={updating}
              selected={null} shortlist={shortlist} onShortlist={onShortlist} onClearSelected={() => {}}
              onFiltersChange={next=>{onFiltersChange(next);setShowCriteria(false);}} onCriteriaChange={next=>{onCriteriaChange(next);setShowCriteria(false);}} />
          </div>
        </>
      )}
      {!selectedResult && selectedRows.size === 0 && (
        <div style={{ minHeight: 44, padding: '7px 16px', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--beige-50)', borderBottom: '1px solid var(--beige-300)', flex: '0 0 auto' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg1)', whiteSpace: 'nowrap' }}>Criteria match</span>
          <input type="range" min={0} max={100} step={5} value={minMatch} onChange={e => setMinMatch(Number(e.target.value))}
            aria-label={`Candidates matching at least ${minMatch}% of criteria`}
            style={{ flex: '0 1 130px', accentColor: 'var(--green-700, var(--green-600))', cursor: 'pointer' }} />
          <span style={{ minWidth: 78, fontSize: 12, fontWeight: 700, color: 'var(--green-800)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{minMatch}% or higher</span>
          <span style={{ flex: 1 }} />
        </div>
      )}
      {selectedResult ? (
        <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px 32px', background: 'var(--white)' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <RailDetail result={selectedResult} shortlisted={shortlist.includes(selectedResult.candidate.id)} onShortlist={onShortlist} onBack={() => onSelect(null)} backLabel="Back to candidates" embedded />
          </div>
        </div>
      ) : (
        <div ref={tableViewportRef} style={{ flex: 1, overflow: 'auto' }}>
          <Table style={{ tableLayout: 'fixed', minWidth: showExperience ? 1654 : 1464 }}>
            <thead><tr>
              <TH style={{ width: 46, ...stickyHead, padding: 0, textAlign: 'center' }}>
                <span style={{ minHeight: 38, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SelectionCheckbox checked={allVisibleSelected} indeterminate={someVisibleSelected} label="Select all visible candidates" onChange={toggleAllVisible} />
                </span>
              </TH>
              {orderedColumns.map(col => (
                <SortHeader key={col.key} col={col} sort={sort} onSort={onSort}
                  onColumnDragStart={onColumnDragStart} onColumnDragOver={onColumnDragOver}
                  onColumnDrop={onColumnDrop} onColumnDragEnd={onColumnDragEnd}
                  dragging={dragColumnKey === col.key} dragOver={dragOverColumnKey === col.key} />
              ))}
              <TH title="Shortlist" style={{ width: 64, ...stickyHead, right: 0, zIndex: 3, padding: 0, textAlign: 'center', boxShadow: '-1px 0 var(--beige-300)' }}>
                <span style={{ minHeight: 38, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="ph ph-bookmark-simple" style={{ fontSize: 14, color: 'var(--fg3)' }} />
                </span>
              </TH>
            </tr></thead>
            <tbody>
              {rows.map(r => {
                const c = r.candidate, listed = shortlist.includes(c.id), on = selectedId === c.id;
                return <SplitRow key={c.id} result={r} rank={rankOf.get(c.id)} listed={listed} selected={on} columns={orderedColumns}
                  bulkSelected={selectedRows.has(c.id)} onToggleSelection={toggleRow} onSelect={onSelect} onShortlist={onShortlist} />;
              })}
            </tbody>
          </Table>
        </div>
      )}
      {!selectedResult && selectedRows.size > 0 && (
        <div style={{ minHeight: 56, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--white)', borderTop: '1px solid var(--beige-300)', boxShadow: '0 -6px 16px rgba(34,39,35,.06)', flex: '0 0 auto' }}>
          <SelectionCheckbox checked label={`Clear ${selectedRows.size} selected candidates`} onChange={() => setSelectedRows(new Set())} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg1)' }}>{selectedRows.size} selected</span>
          <span style={{ flex: 1 }} />
          <button onClick={() => setSelectedRows(new Set())} style={{ border: 0, background: 'transparent', padding: '4px 6px', fontFamily: 'inherit', fontSize: 12, color: 'var(--fg2)', cursor: 'pointer' }}>Clear</button>
          <Button variant="primary" color="brand" size="sm" icon="bookmark-simple" disabled={shortlistableSelected.length === 0} onClick={bulkShortlist}>
            {shortlistableSelected.length === 0 ? 'Already shortlisted' : 'Shortlist selected'}
          </Button>
        </div>
      )}
    </div>
  );
}

function SplitRow({ result, rank, listed, selected, bulkSelected, onToggleSelection, onSelect, onShortlist, columns }) {
  const c = result.candidate;
  const [hover, setHover] = React.useState(false);
  return (
    <tr aria-selected={bulkSelected} onClick={() => onSelect(c.id)} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ background: bulkSelected ? 'var(--green-50)' : selected ? 'var(--beige-200)' : hover ? 'var(--beige-100)' : 'transparent', cursor: 'pointer', transition: 'background 150ms' }}>
      <TD style={{ color: 'var(--fg3)', fontWeight: 700, fontSize: 12, textAlign: 'center', padding: '12px 8px' }}>
        {hover || bulkSelected ? (
          <SelectionCheckbox checked={bulkSelected} label={`${bulkSelected ? 'Deselect' : 'Select'} ${c.name}`} onChange={e => { e.stopPropagation(); onToggleSelection(c.id); }} />
        ) : rank}
      </TD>
      {columns.map(col => (
        <TD key={col.key} style={CELL_STYLES[col.key]}>{CELL_RENDERERS[col.key](c, result)}</TD>
      ))}
      <TD style={{ padding: '12px 8px', textAlign: 'center', position: 'sticky', right: 0, background: bulkSelected ? 'var(--green-50)' : selected ? 'var(--beige-200)' : hover ? 'var(--beige-100)' : 'var(--app-background)', boxShadow: '-1px 0 var(--beige-300)', zIndex: 1 }}>
        <ShortlistAction listed={listed} onClick={e => { e.stopPropagation(); onShortlist(c.id); }} />
      </TD>
    </tr>
  );
}

// --- rail -------------------------------------------------------------------

const TIER_META = { must: 'Must have', prioritize: 'Prioritise', nice: 'Nice to have', flexible: 'Flexible' };
const TIER_TINT = {
  must:       { bg: 'var(--green-200)', bd: 'var(--green-500)', fg: 'var(--green-800)' },
  prioritize: { bg: 'var(--beige-200)', bd: 'var(--beige-500)', fg: 'var(--fg1)' },
  nice:       { bg: 'var(--white)',     bd: 'var(--beige-400)', fg: 'var(--fg2)' },
  flexible:   { bg: 'transparent',      bd: 'var(--beige-400)', fg: 'var(--fg3)', bs: 'dashed' },
};

function RailCard({ icon, title, action, children, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => onClick && setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ background: hover ? 'var(--beige-100)' : 'var(--white)', border: `1px solid ${hover ? 'var(--beige-500)' : 'var(--beige-400)'}`, borderRadius: 12, padding: 14, marginBottom: 12, cursor: onClick ? 'pointer' : 'default', transition: 'background 150ms, border-color 150ms' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
        <i className={`ph ph-${icon}`} style={{ fontSize: 14, color: 'var(--fg3)' }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg1)' }}>{title}</span>
        <span style={{ flex: 1 }} />
        {action}
      </div>
      {children}
    </div>
  );
}

function ChipSkeleton({ w }) {
  return <span style={{ height: 26, width: w, borderRadius: 9999, background: 'var(--beige-200)', backgroundImage: 'var(--skeleton-gradient, linear-gradient(90deg, var(--beige-200), var(--beige-50), var(--beige-200)))', backgroundSize: '200% 100%', animation: 'emashimmer 1.1s ease-in-out infinite', display: 'inline-block' }} />;
}

function filterChips(filters) {
  const out = [];
  out.push(filters.locationStrict === 'bangalore-only' ? 'Bangalore only'
    : filters.locationStrict === 'india-remote' ? 'Anywhere in India' : 'Bangalore or relocating');
  out.push(filters.levelOpen ? 'Senior, Lead or Principal' : 'Senior IC');
  if (filters.noticeIgnored) out.push('Any notice period');
  if (filters.band) out.push(filters.band);
  out.push(filters.widened ? 'Enterprise, fintech, health, security' : 'Enterprise SaaS');
  return out;
}

function upsertCriterion(criteria, criterion) {
  const found = criteria.some(c => c.id === criterion.id);
  return found
    ? criteria.map(c => c.id === criterion.id ? { ...c, ...criterion } : c)
    : [...criteria, criterion];
}

// Filters and criteria are two views of the same search intent. A direct filter edit
// therefore also changes the visible hypothesis instead of only moving the pool count.
function adaptCriteriaToFilters(criteria, filters) {
  let next = [...criteria];

  const location = filters.locationStrict === 'bangalore-only'
    ? { label: 'Bangalore-based', tier: 'must', sourceNote: 'Current location filter' }
    : filters.locationStrict === 'india-remote'
      ? { label: 'Exact location', tier: 'flexible', sourceNote: 'You opened the search across India' }
      : { label: 'Exact location', tier: 'flexible', sourceNote: 'You kept people outside Bangalore in' };
  next = upsertCriterion(next, {
    id: 'c-loc', signal: null, kind: 'location', weight: 1,
    source: 'clarification', ...location,
  });

  next = upsertCriterion(next, filters.levelOpen
    ? { id: 'c-sen', label: 'Senior-level ownership', signal: null, kind: 'seniority', tier: 'must', weight: 1, source: 'clarification', sourceNote: 'Senior, Lead and Principal are all in scope' }
    : { id: 'c-sen', label: 'Senior IC ownership', signal: null, kind: 'seniority', tier: 'must', weight: 1, source: 'clarification', sourceNote: 'Current level filter' });

  next = next.filter(c => c.id !== 'c-notice' && c.id !== 'c-comp');
  if (filters.noticeIgnored) next = upsertCriterion(next, {
    id: 'c-notice', label: 'Notice period', signal: null, tier: 'flexible', weight: 1,
    source: 'clarification', sourceNote: 'You would rather wait for the right person',
  });
  if (filters.band) next = upsertCriterion(next, {
    id: 'c-comp', label: `${filters.band} compensation band`, signal: null, tier: 'prioritize', weight: 1,
    source: 'clarification', sourceNote: 'Current compensation filter',
  });

  return next;
}

function refineCriteriaFromText(criteria, text) {
  const said = (text || '').toLowerCase();
  let next = [...criteria];
  const revise = (id, patch) => { next = next.map(c => c.id === id ? { ...c, ...patch } : c); };

  if (/keep them in|outside bangalore|anywhere|remote|location.*flex/.test(said))
    revise('c-loc', { label: 'Exact location', tier: 'flexible', source: 'clarification', sourceNote: 'You kept people outside Bangalore in' });
  if (/senior,? lead|lead or principal|title.*flex/.test(said)) {
    revise('c-sen', { label: 'Senior-level ownership', source: 'clarification', sourceNote: 'Senior, Lead and Principal are all in scope' });
    revise('c-title', { tier: 'flexible', source: 'clarification', sourceNote: 'You are open on title' });
  }
  if (/december|rather wait|notice period|wait for the right/.test(said))
    next = upsertCriterion(next, { id: 'c-notice', label: 'Notice period', signal: null, tier: 'flexible', weight: 1, source: 'clarification', sourceNote: 'You would rather wait for the right person' });
  if (/ai.*(not|required|must|hard requirement)|don.t.*need.*ai/.test(said))
    revise('c-ai', { tier: /not|don.t/.test(said) ? 'flexible' : 'must', source: 'clarification', sourceNote: 'You clarified the AI requirement' });

  return next;
}

function applyCalibrationCriteria(criteria, reactions) {
  if (!addsProcess(reactions)) return criteria;
  return upsertCriterion(criteria, {
    id: 'c-enterpriseProcess', label: 'Survived enterprise process', signal: 'enterpriseProcess',
    tier: 'must', weight: 1.5, source: 'calibration', sourceNote: 'From your read of the profiles',
  });
}

function FilterField({ label, children }) {
  return (
    <label style={{ display: 'block', marginBottom: 14 }}>
      <span style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 500, color: 'var(--fg2)' }}>{label}</span>
      {children}
    </label>
  );
}

function FilterToggle({ label, description, checked, onChange }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      style={{
        width: '100%', padding: '9px 0', display: 'flex', alignItems: 'center', gap: 10,
        border: 0, borderTop: '1px solid var(--beige-200)', background: 'transparent',
        cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
      }}>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--fg1)' }}>{label}</span>
        <span style={{ display: 'block', marginTop: 2, fontSize: 11, lineHeight: '16px', color: 'var(--fg3)' }}>{description}</span>
      </span>
      <span style={{
        width: 30, height: 18, padding: 2, borderRadius: 9999, display: 'flex', alignItems: 'center',
        justifyContent: checked ? 'flex-end' : 'flex-start', background: checked ? 'var(--green-800)' : 'var(--beige-400)',
        transition: 'all 150ms cubic-bezier(0.16,1,0.3,1)',
      }}>
        <span style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--white)', boxShadow: 'var(--shadow-sm)' }} />
      </span>
    </button>
  );
}

function FilterEditor({ filters, onApply, onCancel }) {
  const [draft, setDraft] = React.useState(() => ({ ...filters }));
  const selectStyle = {
    width: '100%', height: 36, padding: '0 10px', borderRadius: 8,
    border: '1px solid var(--beige-400)', background: 'var(--white)',
    color: 'var(--fg1)', fontFamily: 'inherit', fontSize: 12, outline: 0,
  };
  const reset = () => setDraft({
    ...filters, locationStrict: null, levelOpen: true, noticeIgnored: false, band: null, widened: false,
  });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <button onClick={onCancel} title="Close filters" style={{ border: 0, background: 'transparent', padding: 0, display: 'inline-flex', color: 'var(--fg3)', cursor: 'pointer' }}>
          <i className="ph ph-arrow-left" style={{ fontSize: 15 }} />
        </button>
        <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: 'var(--fg1)' }}>Edit filters</span>
        <button onClick={reset} style={{ border: 0, background: 'transparent', fontFamily: 'inherit', fontSize: 12, color: 'var(--fg3)', cursor: 'pointer' }}>Reset</button>
      </div>

      <div style={{ padding: 14, background: 'var(--white)', border: '1px solid var(--beige-400)', borderRadius: 12 }}>
        <FilterField label="Location">
          <select value={draft.locationStrict || 'relocating'} onChange={e => setDraft(d => ({ ...d, locationStrict: e.target.value === 'relocating' ? null : e.target.value }))} style={selectStyle}>
            <option value="bangalore-only">Bangalore only</option>
            <option value="relocating">Bangalore or willing to relocate</option>
            <option value="india-remote">Anywhere in India</option>
          </select>
        </FilterField>

        <FilterField label="Level">
          <select value={draft.levelOpen ? 'open' : 'senior'} onChange={e => setDraft(d => ({ ...d, levelOpen: e.target.value === 'open' }))} style={selectStyle}>
            <option value="senior">Senior IC only</option>
            <option value="open">Senior, Lead or Principal</option>
          </select>
        </FilterField>

        <FilterField label="Compensation">
          <select value={draft.band || ''} onChange={e => setDraft(d => ({ ...d, band: e.target.value || null }))} style={selectStyle}>
            <option value="">No band selected</option>
            <option value="₹55–70 L">₹55–70 L</option>
            <option value="₹68–85 L">₹68–85 L</option>
            <option value="₹85–110 L">₹85–110 L</option>
          </select>
        </FilterField>

        <FilterToggle label="Include any notice period" description="Do not penalise candidates with longer notice periods."
          checked={!!draft.noticeIgnored} onChange={value => setDraft(d => ({ ...d, noticeIgnored: value }))} />
        <FilterToggle label="Include adjacent industries" description="Also consider fintech, healthcare and security backgrounds."
          checked={!!draft.widened} onChange={value => setDraft(d => ({ ...d, widened: value }))} />

        <div style={{ display: 'flex', gap: 8, marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--beige-200)' }}>
          <Button variant="secondary" color="brand" size="sm" onClick={onCancel}>Cancel</Button>
          <Button variant="primary" color="brand" size="sm" onClick={() => onApply(draft)}>Apply filters</Button>
        </div>
      </div>
      <p style={{ margin: '10px 2px 0', fontSize: 11, lineHeight: '16px', color: 'var(--fg3)' }}>Manual changes become part of the same search context Ema is refining.</p>
    </div>
  );
}

function CriteriaEditor({ criteria, onApply, onCancel }) {
  const order = ['must', 'prioritize', 'nice', 'flexible'];
  const [draft, setDraft] = React.useState(() => criteria.map(c => ({ ...c })));
  const [draggingId, setDraggingId] = React.useState(null);
  const [overTier, setOverTier] = React.useState(null);
  const [editingId, setEditingId] = React.useState(null);
  const [newLabel, setNewLabel] = React.useState('');

  const move = (id, tier) => setDraft(items => items.map(c => c.id === id
    ? { ...c, tier, source: 'clarification', sourceNote: 'Moved manually' }
    : c));
  const rename = (id, label) => setDraft(items => items.map(c => c.id === id
    ? { ...c, label, source: 'clarification', sourceNote: 'Edited manually' }
    : c));
  const remove = id => setDraft(items => items.filter(c => c.id !== id));
  const add = () => {
    const label = newLabel.trim();
    if (!label) return;
    setDraft(items => [...items, {
      id: `c-manual-${Date.now()}`, label, signal: null, tier: 'prioritize', weight: 1,
      source: 'clarification', sourceNote: 'Added manually',
    }]);
    setNewLabel('');
  };

  return (
    <div style={{height:'100%',minHeight:0,display:'flex',flexDirection:'column'}}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <button onClick={onCancel} title="Close criteria" style={{ border: 0, background: 'transparent', padding: 0, display: 'inline-flex', color: 'var(--fg3)', cursor: 'pointer' }}>
          <i className="ph ph-arrow-left" style={{ fontSize: 15 }} />
        </button>
        <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: 'var(--fg1)' }}>Edit criteria</span>
        <button onClick={() => setDraft(criteria.map(c => ({ ...c })))} style={{ border: 0, background: 'transparent', fontFamily: 'inherit', fontSize: 12, color: 'var(--fg3)', cursor: 'pointer' }}>Reset</button>
      </div>
      <div style={{flex:1,minHeight:0,overflowY:'auto',padding:'0 4px 12px 0',scrollbarGutter:'stable'}}>
      <p style={{ margin: '0 0 12px 23px', fontSize: 11, lineHeight: '16px', color: 'var(--fg3)' }}>Grab anywhere on a pill and drop it into a new priority.</p>

      {order.map(tier => {
        const tint = TIER_TINT[tier];
        const items = draft.filter(c => c.tier === tier);
        const active = overTier === tier;
        const receding = !!draggingId && !active;
        return (
          <section key={tier} aria-label={`${TIER_META[tier]} drop zone`} onDragEnter={e => { e.preventDefault(); if (draggingId) setOverTier(tier); }}
            onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; if (draggingId && overTier !== tier) setOverTier(tier); }}
            onDrop={e => {
              e.preventDefault();
              const id = e.dataTransfer.getData('text/plain') || draggingId;
              if (id) move(id, tier);
              setDraggingId(null); setOverTier(null);
            }}
            style={{
              marginBottom: 10, padding: active ? 10 : 9, minHeight: 64, borderRadius: 11,
              border: active ? '2px solid var(--green-500)' : '1px solid var(--beige-400)',
              background: active ? 'var(--green-50, var(--green-100))' : 'var(--white)',
              boxShadow: active ? '0 0 0 3px var(--green-100), var(--shadow-sm)' : 'none',
              opacity: receding ? .58 : 1, transform: active ? 'scale(1.012)' : 'scale(1)',
              transition: 'border 140ms ease, background 140ms ease, box-shadow 140ms ease, opacity 140ms ease, transform 140ms cubic-bezier(0.16,1,0.3,1)',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: items.length || active ? 8 : 0 }}>
              <span style={{ fontSize: 10, lineHeight: '14px', fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: active ? 'var(--green-800)' : tint.fg }}>{TIER_META[tier]}</span>
              <span style={{ fontSize: 10, color: 'var(--fg4)' }}>{items.length}</span>
              <span style={{ flex: 1 }} />
              {active && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: 'var(--green-800)' }}><i className="ph ph-arrow-bend-down-right" /> Drop here</span>}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 6 }}>
              {items.map(c => (
                <div key={c.id} draggable={editingId !== c.id}
                  onDragStart={e => {
                    setDraggingId(c.id); setEditingId(null);
                    e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', c.id);
                  }}
                  onDragEnd={() => { setDraggingId(null); setOverTier(null); }}
                  aria-grabbed={draggingId === c.id} title={editingId === c.id ? undefined : `Drag ${c.label}`}
                  style={{
                    maxWidth: '100%', minHeight: 32, display: 'inline-flex', alignItems: 'center', gap: 3,
                    padding: '3px 4px 3px 7px', borderRadius: 9999, background: tint.bg, border: `1px ${tint.bs || 'solid'} ${tint.bd}`,
                    color: tint.fg, cursor: editingId === c.id ? 'text' : draggingId === c.id ? 'grabbing' : 'grab',
                    opacity: draggingId === c.id ? .38 : 1,
                    transform: draggingId === c.id ? 'scale(.96)' : 'translateY(0)',
                    boxShadow: draggingId === c.id ? 'none' : '0 1px 1px rgba(30,36,31,.04)',
                    transition: 'opacity 120ms ease, transform 120ms ease, box-shadow 120ms ease',
                    userSelect: editingId === c.id ? 'text' : 'none',
                  }}>
                  <i className="ph ph-dots-six-vertical" style={{ fontSize: 13, color: 'var(--fg3)', flex: '0 0 auto', pointerEvents: 'none' }} />
                  {editingId === c.id ? (
                    <input autoFocus value={c.label} aria-label={`Rename ${c.label}`} onChange={e => rename(c.id, e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setEditingId(null); }}
                      onBlur={() => setEditingId(null)}
                      style={{ width: Math.min(190, Math.max(80, c.label.length * 6.2)), border: 0, outline: 0, background: 'transparent', color: tint.fg, fontFamily: 'inherit', fontSize: 11, fontWeight: 500, padding: '0 2px' }} />
                  ) : <span style={{ maxWidth: 190, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 11, fontWeight: 500 }}>{c.label}</span>}
                  <button onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); setEditingId(c.id); }} title={`Rename ${c.label}`} style={{ width: 21, height: 21, border: 0, borderRadius: '50%', background: 'transparent', color: 'var(--fg3)', cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="ph ph-pencil-simple" style={{ fontSize: 10 }} />
                  </button>
                  <button onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); remove(c.id); }} title={`Remove ${c.label}`} style={{ width: 21, height: 21, border: 0, borderRadius: '50%', background: 'transparent', color: 'var(--fg3)', cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="ph ph-x" style={{ fontSize: 11 }} />
                  </button>
                </div>
              ))}
              {!items.length && !active && <span style={{ fontSize: 11, color: 'var(--fg4)' }}>No criteria yet</span>}
              {active && <span style={{ width: '100%', height: 30, borderRadius: 8, border: '1px dashed var(--green-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, color: 'var(--green-800)', fontSize: 11, fontWeight: 600 }}><i className="ph ph-plus" /> Move to {TIER_META[tier]}</span>}
            </div>
          </section>
        );
      })}

      <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
        <input value={newLabel} onChange={e => setNewLabel(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} placeholder="Add your own criterion"
          style={{ flex: 1, minWidth: 0, height: 34, padding: '0 10px', borderRadius: 8, border: '1px solid var(--beige-400)', outline: 0, background: 'var(--white)', color: 'var(--fg1)', fontFamily: 'inherit', fontSize: 11 }} />
        <IconButton icon="plus" size="sm" title="Add criterion" onClick={add} />
      </div>
      </div>

      <div style={{ flex:'0 0 auto',display: 'flex', gap: 8, paddingTop: 12, borderTop: '1px solid var(--beige-300)', background:'var(--beige-50)',boxShadow:'0 -8px 14px rgba(249,248,245,.92)' }}>
        <Button variant="secondary" color="brand" size="sm" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" color="brand" size="sm" onClick={() => onApply(draft.filter(c => c.label.trim()))}>Apply criteria</Button>
      </div>
    </div>
  );
}

function Rail({ criteria, filters, poolSize, total, updating, selected, shortlist, onShortlist, onClearSelected, onFiltersChange, onCriteriaChange, hasResults, onOpenTable }) {
  const [editor, setEditor] = React.useState(null);
  if (selected) return <RailDetail result={selected} shortlisted={shortlist.includes(selected.candidate.id)} onShortlist={onShortlist} onBack={onClearSelected} backLabel="Back to review" />;
  if (editor === 'filters') return <FilterEditor filters={filters} onCancel={() => setEditor(null)} onApply={next => { onFiltersChange(next); setEditor(null); }} />;
  if (editor === 'criteria') return <CriteriaEditor criteria={criteria} onCancel={() => setEditor(null)} onApply={next => { onCriteriaChange(next); setEditor(null); }} />;
  const order = ['must', 'prioritize', 'nice', 'flexible'];
  const sorted = [...criteria].sort((a, b) => order.indexOf(a.tier) - order.indexOf(b.tier));

  return (
    <div>
      <RailCard icon="funnel" title="Filters"
        action={<button onClick={() => setEditor('filters')} style={{ border: 0, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, color: 'var(--fg3)' }}>Edit</button>}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {filterChips(filters).map(f => (
            <span key={f} style={{ height: 26, padding: '0 9px', borderRadius: 9999, background: 'var(--beige-100)', border: '1px solid var(--beige-400)', color: 'var(--fg2)', fontSize: 12, fontWeight: 500, display: 'inline-flex', alignItems: 'center' }}>{f}</span>
          ))}
        </div>
      </RailCard>

      <RailCard icon="sparkle" title="Criteria"
        action={<button onClick={() => setEditor('criteria')} style={{ border: 0, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, color: 'var(--fg3)' }}>Edit</button>}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, minHeight: 26 }}>
          {updating
            ? [148, 110, 132, 96, 120, 88].map((w, i) => <ChipSkeleton key={i} w={w} />)
            : sorted.map(c => {
                const t = TIER_TINT[c.tier];
                return (
                  <span key={c.id} title={`${TIER_META[c.tier]} · ${c.sourceNote}`}
                    style={{
                      display: 'inline-flex', alignItems: 'center', maxWidth: '100%', minHeight: 24,
                      padding: '3px 8px', borderRadius: 9999,
                      background: t.bg, border: `1px ${t.bs || 'solid'} ${t.bd}`, color: t.fg,
                      fontSize: 10.5, lineHeight: '15px', fontWeight: 500,
                      whiteSpace: 'normal', overflowWrap: 'anywhere', boxSizing: 'border-box',
                    }}>
                    {c.label}
                  </span>
                );
              })}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--beige-200)' }}>
          {order.map(t => (
            <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--fg3)' }}>
              <span style={{ width: 8, height: 8, borderRadius: 3, background: TIER_TINT[t].bg, border: `1px ${TIER_TINT[t].bs || 'solid'} ${TIER_TINT[t].bd}` }} />
              {TIER_META[t]}
            </span>
          ))}
        </div>
      </RailCard>

      {hasResults && (
        <RailCard icon="table" title="Search results" onClick={onOpenTable}
          action={<i className="ph ph-arrow-square-out" style={{ fontSize: 14, color: 'var(--fg3)' }} />}>
          <div style={{ display: 'flex' }}>
            <div style={{ flex: 1, paddingRight: 14 }}>
              <div style={{ fontSize: 28, lineHeight: '34px', fontWeight: 700, color: 'var(--fg1)' }}>{updating ? <ChipSkeleton w={48} /> : poolSize}</div>
              <div style={{ marginTop: 2, fontSize: 12, color: 'var(--fg3)' }}>qualified</div>
            </div>
            <div style={{ width: 1, background: 'var(--beige-200)' }} />
            <div style={{ flex: 1, paddingLeft: 14 }}>
              <div style={{ fontSize: 28, lineHeight: '34px', fontWeight: 700, color: shortlist.length ? 'var(--green-800)' : 'var(--fg1)' }}>{shortlist.length}</div>
              <div style={{ marginTop: 2, fontSize: 12, color: 'var(--fg3)' }}>shortlisted</div>
            </div>
          </div>
          <p style={{ margin: '10px 0 0', fontSize: 12, lineHeight: '18px', color: 'var(--fg3)' }}>
            {total} clear every must-have out of {SCAN_TOTAL} scanned. Shortlisted candidates stay saved even if criteria change.
          </p>
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--beige-200)', fontSize: 12, fontWeight: 600, color: 'var(--green-800)' }}>
            Open the results table
          </div>
        </RailCard>
      )}
    </div>
  );
}

function RailDetail({ result, shortlisted, onShortlist, onBack, backLabel = 'Back to search', embedded = false }) {
  const c = result.candidate;
  return (
    <div>
      {!embedded&&<button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, border: 0, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, color: 'var(--fg3)', padding: '0 0 10px' }}>
        <i className="ph ph-arrow-left" style={{ fontSize: 12 }} /> {backLabel}
      </button>}
      <div style={embedded?{background:'transparent'}:{background:'var(--white)',border:'1px solid var(--beige-400)',borderRadius:12,padding:14}}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <Avatar name={c.name} size={36} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg1)' }}>{c.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3, fontSize: 12, color: 'var(--fg2)' }}><CompanyMark name={c.company} size={18} />{c.title} at {c.company}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 7 }}>
            <MatchScore value={result.matchPercent} />
            <ContactLink candidate={c} />
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 10 }}>
          <Badge variant={result.tier.variant} size="sm">{result.tier.label}</Badge>
          {c.openToWork && <Badge variant="success" size="sm" icon="check-circle">Open to work</Badge>}
          {c.isYou && <Badge variant="success" size="sm" icon="user">This is you</Badge>}
        </div>
        <p style={{ margin: '10px 0 0', fontSize: 13, lineHeight: '19px', color: 'var(--fg1)' }}>{c.headline}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--beige-200)' }}>
          {[['Experience', `${c.yearsExperience} yrs`], ['Location', c.location.split(',')[0]],
            ['Available', c.availability], ['Comp', c.compensation],
            ['Work authorization', c.workAuth], ['Shared', `${c.mutuals} connections`]].map(([k, v]) => (
            <div key={k}>
              <div style={{ fontSize: 11, color: 'var(--fg3)' }}>{k}</div>
              <div style={{ fontSize: 12, color: 'var(--fg1)' }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: 'var(--fg3)', margin: '16px 0 7px' }}>Why they rank here</div>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {result.reasons.map((r, i) => (
            <li key={i} style={{ display: 'flex', gap: 7, fontSize: 12, lineHeight: '18px', color: 'var(--fg1)' }}>
              <i className="ph ph-check" style={{ fontSize: 12, color: 'var(--green-800)', marginTop: 3, flex: '0 0 auto' }} /><span>{r}</span>
            </li>
          ))}
        </ul>
        {c.evidence && c.evidence.length > 0 && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: 'var(--fg3)', margin: '16px 0 7px' }}>Relevant evidence</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {c.evidence.slice(0, 4).map((e, i) => (
                <div key={i} style={{ padding: '8px 9px', borderRadius: 8, background: 'var(--beige-50)', border: '1px solid var(--beige-300)' }}>
                  <div style={{ fontSize: 10, lineHeight: '14px', fontWeight: 700, color: 'var(--fg3)', textTransform: 'uppercase', letterSpacing: .5 }}>{(e.signal || '').replace(/([A-Z])/g, ' $1').trim()}</div>
                  <div style={{ marginTop: 3, fontSize: 12, lineHeight: '18px', color: 'var(--fg1)' }}>{e.text}</div>
                </div>
              ))}
            </div>
          </>
        )}
        {result.tradeoffs.length > 0 && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: 'var(--fg3)', margin: '14px 0 7px' }}>Trade-off</div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {result.tradeoffs.map((t, i) => (
                <li key={i} style={{ display: 'flex', gap: 7, fontSize: 12, lineHeight: '18px', color: 'var(--fg2)' }}>
                  <i className="ph ph-minus" style={{ fontSize: 12, color: 'var(--orange-800)', marginTop: 3, flex: '0 0 auto' }} /><span>{t}</span>
                </li>
              ))}
            </ul>
          </>
        )}
        {c.experience && c.experience.length > 0 && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: 'var(--fg3)', margin: '16px 0 8px' }}>Career history</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {c.experience.map((job, i) => (
                <div key={`${job.company}-${job.period}`} style={{ display: 'flex', gap: 9, paddingBottom: i === c.experience.length - 1 ? 0 : 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20, flex: '0 0 20px' }}>
                    <CompanyMark name={job.company} size={20} />
                    {i < c.experience.length - 1 && <span style={{ width: 1, flex: 1, minHeight: 18, marginTop: 4, background: 'var(--beige-300)' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg1)' }}>{job.title}</div>
                    <div style={{ marginTop: 1, fontSize: 11, color: 'var(--fg2)' }}>{job.company} · {job.period}</div>
                    <div style={{ marginTop: 3, fontSize: 11, lineHeight: '16px', color: 'var(--fg2)' }}>{job.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        <div style={{ marginTop: 14, padding: '10px 0 0', borderTop: '1px solid var(--beige-200)', fontSize: 11, lineHeight: '17px', color: 'var(--fg2)' }}>
          <div><strong style={{ color: 'var(--fg1)' }}>Portfolio:</strong> <a href={`https://${c.portfolio.url}`} target="_blank" rel="noreferrer" style={{ color: 'var(--green-800)', textDecoration: 'none' }}>{c.portfolio.url}</a> · {c.portfolio.note}</div>
          <div style={{ marginTop: 5 }}><strong style={{ color: 'var(--fg1)' }}>Education:</strong> {c.education}</div>
        </div>
        <div style={{ marginTop: 14 }}>
          <Button variant={shortlisted ? 'primary' : 'secondary'} color="brand" size="sm" block
            icon={shortlisted ? 'check' : 'bookmark-simple'} onClick={() => onShortlist(c.id)}>
            {shortlisted ? 'Shortlisted' : 'Shortlist'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// --- composer ---------------------------------------------------------------

function ChatComposer({ prefill, onSend, disabled }) {
  const [text, setText] = React.useState('');
  const [focus, setFocus] = React.useState(false);
  const [typingPrefill, setTypingPrefill] = React.useState(false);
  const ref = React.useRef(null);
  const typingTimerRef = React.useRef(null);
  const lastPrefillRef = React.useRef('');
  const userEditedRef = React.useRef(false);

  const stopPrefillTyping = () => {
    if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current);
    typingTimerRef.current = null;
    setTypingPrefill(false);
  };

  const startPrefillTyping = () => {
    if (disabled || !prefill || text || typingTimerRef.current || prefill === lastPrefillRef.current) return;
    lastPrefillRef.current = prefill;
    userEditedRef.current = false;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setText(prefill);
      return;
    }
    let cursor = 0;
    setText('');
    setTypingPrefill(true);
    const typeNextCharacter = () => {
      cursor = Math.min(prefill.length, cursor + 1);
      setText(prefill.slice(0, cursor));
      if (cursor >= prefill.length) {
        stopPrefillTyping();
        return;
      }
      const character=prefill[cursor-1];
      const delay=/[.!?]/.test(character)?105:/[,;:—]/.test(character)?70:character===' '?28:18+Math.round(Math.random()*12);
      typingTimerRef.current=window.setTimeout(typeNextCharacter,delay);
    };
    typingTimerRef.current=window.setTimeout(typeNextCharacter,120);
  };

  React.useEffect(() => {
    if (prefill === lastPrefillRef.current) return;
    stopPrefillTyping();
    if (!userEditedRef.current) setText('');
    lastPrefillRef.current = '';
  }, [prefill]);
  React.useEffect(() => () => {
    if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current);
  }, []);

  // grow with the content, then scroll
  const resize = () => {
    const el = ref.current; if (!el) return;
    el.style.height = 'auto';
    const maxHeight = 168;
    el.style.height = Math.min(el.scrollHeight, maxHeight) + 'px';
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
  };
  React.useEffect(resize, [text]);

  const send = () => { if (!text.trim()) return; stopPrefillTyping(); onSend(text.trim()); setText(''); userEditedRef.current=false; lastPrefillRef.current=''; };
  return (
    <div style={{ position: 'sticky', bottom: 0, background: 'var(--app-background)', paddingBottom: 20, paddingTop: 8 }}>
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: 8, padding: '8px 10px 8px 14px',
        background: 'var(--white)', borderRadius: 12,
        border: `1px solid ${focus ? 'var(--green-500)' : 'var(--beige-400)'}`,
        boxShadow: focus ? 'var(--shadow-focus)' : 'var(--shadow-sm)',
        opacity: disabled ? .55 : 1, transition: 'border-color 150ms, box-shadow 150ms',
      }}>
        <textarea ref={ref} value={text} rows={1} disabled={disabled} aria-busy={typingPrefill}
          onChange={e => { stopPrefillTyping(); userEditedRef.current=true; setText(e.target.value); }}
          onFocus={() => setFocus(true)}
          onClick={startPrefillTyping}
          onBlur={() => setFocus(false)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if(typingPrefill){stopPrefillTyping();setText(prefill);}else send(); } }}
          placeholder={disabled ? 'Ema is working…' : 'Tell Ema what you think…'}
          style={{ flex: 1, border: 0, outline: 0, background: 'transparent', resize: 'none', overflowY: 'hidden', fontFamily: 'inherit', fontSize: 14, lineHeight: '22px', color: 'var(--fg1)', padding: '6px 0', height: 34 }} />
        <IconButton icon="paperclip" size="sm" title="Attach" />
        <IconButton icon="arrow-up" variant="primary" color="brand" size="sm" title="Send" onClick={send} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function OutreachHandoffCard({ shortlist, candidates, group, drafts, onCreate, onEdit, onReview }) {
  const people = shortlist.map(id => candidates.find(c => c.id === id)).filter(Boolean);
  if (!people.length) return null;
  const groupPeople = group ? group.candidateIds.map(id => candidates.find(c => c.id === id)).filter(Boolean) : [];
  const ready = groupPeople.filter(c => drafts[c.id] && drafts[c.id].status === 'ready' && !drafts[c.id].approved && !drafts[c.id].removed).length;
  const review = groupPeople.filter(c => drafts[c.id] && drafts[c.id].status === 'needs-review' && !drafts[c.id].removed).length;
  const weak = groupPeople.filter(c => drafts[c.id] && drafts[c.id].status === 'weak-fit' && !drafts[c.id].removed).length;
  const approved = groupPeople.filter(c => drafts[c.id] && drafts[c.id].approved && !drafts[c.id].removed).length;
  const names = people.slice(0, 3).map(p => firstName(p)).join(', ');

  return <>
    <EmaSays tight>
      <Lead>{group
        ? `Outreach for ${people.length === 1 ? 'your shortlisted candidate' : `your ${people.length} shortlisted candidates`} is ready for review.`
        : `You've shortlisted ${people.length} candidate${people.length === 1 ? '' : 's'} — want me to put together outreach for them?`}</Lead>
    </EmaSays>
    <div style={{ margin:'0 0 30px',maxWidth:650 }}>
    <div style={{ border:'1px solid var(--beige-400)',borderRadius:12,background:'var(--white)',boxShadow:'var(--shadow-sm)',overflow:'hidden' }}>
      <div style={{ padding:'15px 16px',display:'flex',gap:12,alignItems:'center',borderBottom:'1px solid var(--beige-300)' }}>
        <div style={{display:'flex',paddingLeft:6}}>{people.slice(0,3).map((p,i)=><span key={p.id} style={{marginLeft:-6,borderRadius:'50%',border:'2px solid var(--white)',display:'inline-flex'}}><Avatar name={p.name} size={30}/></span>)}</div>
        <div style={{minWidth:0}}><div style={{fontSize:14,fontWeight:700}}>Senior product designer shortlist</div><div style={{fontSize:12,color:'var(--fg3)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{people.length} candidates · {names}{people.length>3?` +${people.length-3}`:''}</div></div>
      </div>
      {!group ? <div style={{padding:16}}><div style={{fontSize:14,lineHeight:'21px',fontWeight:500,marginBottom:4}}>Create one outreach strategy for this shortlist?</div><p style={{margin:'0 0 14px',fontSize:12,lineHeight:'18px',color:'var(--fg2)'}}>Ema will use your search context as a starting point, personalize each message, and surface only the candidates that need attention.</p><div style={{display:'flex',gap:8}}><Button variant="primary" color="brand" size="sm" icon="magic-wand" onClick={onCreate}>Create outreach strategy</Button><Button variant="ghost" color="brand" size="sm" onClick={()=>{}}>Not now</Button></div></div>
      : <div style={{padding:16}}><div style={{display:'flex',gap:20,marginBottom:14}}>{[[ready,'Ready','var(--green-800)'],[review,'Need review','var(--orange-800)'],[weak,'Weak fit','var(--red-800)'],[approved,'Approved','var(--green-800)']].map(([value,label,color])=><div key={label}><div style={{fontSize:18,lineHeight:'22px',fontWeight:700,color}}>{value}</div><div style={{fontSize:10,color:'var(--fg3)'}}>{label}</div></div>)}</div><div style={{display:'flex',gap:8}}><Button variant="primary" color="brand" size="sm" icon="arrow-square-out" onClick={onReview}>Review outreach</Button><Button variant="secondary" color="brand" size="sm" icon="pencil-simple" onClick={onEdit}>Edit strategy</Button></div></div>}
    </div>
    </div>
  </>;
}

function Conversation({ onRestart, onNavigate }) {
  const s = useSearchState();
  const brief = s.thread.find(t => t.kind === 'brief');
  // "Something else" is reserved for the deliberately-unreasonable brief demo — see NO_MATCH_SCRIPT.
  const script = brief && brief.scenario === 'other' ? NO_MATCH_SCRIPT : SCRIPT;
  const previous = brief && brief.scenarioContext && brief.scenarioContext.previousEmployeeId && s.team
    ? s.team.members.find(m => m.id === brief.scenarioContext.previousEmployeeId) : null;
  const initialBackfill = {
    preserve: previous ? ['enterpriseB2B', 'complexWorkflows', 'execution'].filter(signal => previous.understoodStrengths.some(x => x.signal === signal)) : [],
    evolve: previous ? ['zeroToOne', 'productStrategy'].filter(signal => previous.understoodGaps.some(x => x.signal === signal)) : [],
  };
  const [played, setPlayed] = React.useState(() => s.conversationPlayed || []);
  const [cursor, setCursor] = React.useState(() => Number.isInteger(s.conversationCursor) ? s.conversationCursor : 0);
  const [thinking, setThinking] = React.useState(true);
  const [criteria, setCriteria] = React.useState(() => script === NO_MATCH_SCRIPT
    ? ((s.criteria && s.criteria.length) ? s.criteria : noMatchCriteria())
    : ((s.criteria && s.criteria.length) ? s.criteria : adaptCriteriaToFilters(Engine.backfillCriteria({ ...initialBackfill, spectrum: 50 }), { locationStrict: 'bangalore-only' })));
  const [filters, setFilters] = React.useState(() => Object.keys(s.filters || {}).length ? s.filters : (script === NO_MATCH_SCRIPT ? {} : { locationStrict: 'bangalore-only' }));
  const [calib, setCalib] = React.useState(() => s.conversationCalibration || {});
  const [selectedId, setSelectedId] = React.useState(null);
  const [split, setSplit] = React.useState(false);
  const [showExperience, setShowExperience] = React.useState(() => !!s.conversationShowExperience);
  const [updating, setUpdating] = React.useState(false);
  const [backfill, setBackfill] = React.useState(() => s.conversationBackfill || initialBackfill);
  const [answers, setAnswers] = React.useState(() => s.conversationAnswers || {});
  const [showStrategyDrawer, setShowStrategyDrawer] = React.useState(false);
  const userTurnRef = React.useRef(null);
  const outreachHandoffRef = React.useRef(null);
  const autoOpenedTableRef = React.useRef(false);

  // A search conversation is a durable project object. Store its playback and
  // working context so the sidebar can switch between searches without replaying
  // or losing the exact point the hiring manager reached.
  React.useEffect(() => {
    SearchState.set(state => ({
      ...state,
      conversationPlayed: played,
      conversationCursor: cursor,
      conversationCalibration: calib,
      conversationShowExperience: showExperience,
      conversationBackfill: backfill,
      conversationAnswers: answers,
      criteria,
      filters,
    }));
  }, [played, cursor, calib, showExperience, backfill, answers, criteria, filters]);

  React.useEffect(() => {
    if (!s.openOutreachStrategy) return;
    setSplit(false);
    setSelectedId(null);
    setShowStrategyDrawer(true);
    SearchState.set({ openOutreachStrategy: false });
  }, [s.openOutreachStrategy]);

  // Set by the mini chat's results teaser (see PersistentEmaChat in Outreach.jsx) so
  // returning to the full conversation opens straight into the results table.
  React.useEffect(() => {
    if (!s.openTableOnReturn) return;
    setSplit(true);
    SearchState.set({ openTableOnReturn: false });
  }, [s.openTableOnReturn]);

  const ranked = rankedResults(s.candidates, criteria, filters);
  const poolSize = qualifiedPoolSize(s.candidates, criteria, filters);
  const applyFilters = next => {
    setFilters(next);
    setCriteria(currentCriteria => adaptCriteriaToFilters(currentCriteria, next));
    SearchState.set({ filters: next });
  };
  const applyCriteria = next => {
    setCriteria(next);
    SearchState.set({ criteria: next });
  };
  const aboveBand = c => /Cr|\$|£/.test(c.compensation) || (+((c.compensation.match(/₹(\d+)/) || [])[1]) > 85);
  const overBand = ranked.slice(0, 6).filter(r => aboveBand(r.candidate)).length;
  const adjacent = (ranked.slice(0, 6).find(r => r.tier.label === 'Strong adjacent match') || {}).candidate;

  const params = {
    previousName: previous ? previous.name : 'the last person',
    backfill,
    hasJD: s.attachments.some(a => a.type === 'jd'),
    reactions: calib, ranked, poolSize,
    top: ranked[0] && ranked[0].candidate.name.split(' ')[0],
    topReason: ranked[0] && (ranked[0].reasons.find(x => !/^Meets all /.test(x)) || ''),
    adjacent: adjacent && adjacent.name.split(' ')[0],
    overBand, criteria, answers,
  };

  // The floating panel is another viewport onto this conversation, not a
  // separate outreach thread. Fold any turns created there into `played` so
  // expanding and minimising never changes which messages the user sees.
  React.useEffect(() => {
    const continuation = s.outreachChat || [];
    if (!continuation.length) return;
    setPlayed(currentPlayed => [
      ...currentPlayed,
      ...continuation.map(message => message.role === 'user'
        ? { said: message.text, ...(message.kind ? { kind: message.kind } : {}) }
        : { emaSaid: message.text, ...(message.kind ? { kind: message.kind } : {}) }),
    ]);
    SearchState.set(state => ({ ...state, outreachChat: [] }));
  }, [s.outreachChat]);

  React.useEffect(() => {
    const transcript=[];
    if(brief&&brief.prompt)transcript.push({role:'user',text:brief.prompt});
    played.forEach(item=>{
      if(typeof item==='object')transcript.push({role:item.emaSaid?'ema':'user',text:item.emaSaid||item.said,...(item.kind?{kind:item.kind}:{})});
      else {
        const beat=script[item];
        if(beat&&beat.body){
          const text=conversationText(beat.body(params)).replace(/\s+/g,' ').trim();
          if(text)transcript.push({role:'ema',text,...(beat.payload?{payload:beat.payload}:{}),...(beat.payload==='calibration'?{reactions:calib}:{})});
        }
      }
    });
    SearchState.set(state=>{
      const previous=JSON.stringify(state.conversationTranscript||[]);
      const next=JSON.stringify(transcript);
      return previous===next?state:{...state,conversationTranscript:transcript};
    });
  },[played,brief,calib,script]);

  // shimmer the criteria whenever they actually change
  const firstRun = React.useRef(true);
  React.useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    setUpdating(true);
    const t = setTimeout(() => setUpdating(false), 900);
    return () => clearTimeout(t);
  }, [criteria, filters]);

  React.useEffect(() => {
    const beat = script[cursor];
    if (!beat || beat.who !== 'ema') { setThinking(false); return; }
    setThinking(true);
    const t = setTimeout(() => {
      setPlayed(p => [...p, cursor]);
      if (beat.effect) {
        const e = beat.effect(params);
        if (e.criteria) setCriteria(e.criteria);
        if (e.showExperience) setShowExperience(true);
        if (e.filters) {
          const nextFilters = { ...filters, ...e.filters };
          setFilters(nextFilters);
          setCriteria(currentCriteria => adaptCriteriaToFilters(currentCriteria, nextFilters));
        }
      }
      setThinking(false);
      setCursor(c => c + 1);
    }, 2000);
    return () => clearTimeout(t);
  }, [cursor]);

  React.useEffect(() => {
    const latest = played[played.length - 1];
    if (!latest || typeof latest !== 'object' || !latest.said || !userTurnRef.current) return;
    const frame = requestAnimationFrame(() => userTurnRef.current && userTurnRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    return () => cancelAnimationFrame(frame);
  }, [played.length]);

  const current = script[cursor];
  const scriptDone = cursor >= script.length;
  const awaitingYou = (current && current.who === 'you' && !thinking) || scriptDone;
  const prefill = (current && current.who === 'you')
    ? (current.composedBackfill ? composeBackfillDecision(previous, backfill) : current.composed ? composeReactions(calib) : current.text)
    : '';

  const send = (text) => {
    setCriteria(currentCriteria => refineCriteriaFromText(currentCriteria, text));
    if (current && current.id) {
      const answer = /^no\b/i.test(text.trim()) ? 'no' : /^yes\b/i.test(text.trim()) ? 'yes' : text;
      setAnswers(state => ({ ...state, [current.id]: answer }));
    }
    if (current && current.composed) {
      const linesOnly = calibrationLines(calib).join(' ');
      setCalib(x => ({ ...x, note: text.replace(linesOnly, '').trim() }));
    }
    if (current && current.composedBackfill) {
      const next = deriveBackfillFromText(text, backfill, previous);
      setBackfill(next);
      SearchState.set(st => ({
        ...st,
        scenarioContext: { ...(st.scenarioContext || {}), preserve: next.preserve, evolve: next.evolve },
      }));
    }
    setPlayed(p => [...p, { said: text }]);
    if (scriptDone) {
      setTimeout(() => setPlayed(p => [...p, { emaSaid: "I've noted that. In a working version this is where I'd re-rank and tell you what moved — for now, steer it with the filters and criteria on the right." }]), 600);
    } else setCursor(c => c + 1);
  };

  const toggleShortlist = id => SearchState.set(st => {
    const next = st.shortlist.includes(id) ? st.shortlist.filter(x => x !== id) : [...st.shortlist, id];
    return {
      ...st, shortlist: next,
      shortlistRecord: next.length ? {
        ...(st.shortlistRecord || {}), id: (st.shortlistRecord && st.shortlistRecord.id) || `shortlist-${st.id}`,
        searchId: st.id, name: 'Senior product designer shortlist', candidateIds: next,
        createdAt: (st.shortlistRecord && st.shortlistRecord.createdAt) || Date.now(),
      } : null,
    };
  });

  const generateOutreach = strategy => {
    SearchState.set(st => {
      const people = st.shortlist.map(id => st.candidates.find(c => c.id === id)).filter(Boolean);
      const nextDrafts = { ...st.outreachDrafts };
      people.forEach((candidate, index) => {
        const personalized = personalizeCandidate(candidate, strategy, st.team && st.team.manager);
        nextDrafts[candidate.id] = {
          ...personalized,
          status: personalized.status === 'channel-unavailable' ? personalized.status : reviewStatus(candidate, index, people.length),
        };
      });
      return {
        ...st, outreachStrategy: strategy, outreachDrafts: nextDrafts,
        outreachGroup: {
          id: `outreach-${st.id}`, shortlistId: st.shortlistRecord && st.shortlistRecord.id,
          candidateIds: people.map(p => p.id), channelStrategy: {
            primary: strategy.primaryChannel, fallback: strategy.fallbackChannel, sender: strategy.sender,
          }, status: 'review', createdAt: Date.now(),
        },
      };
    });
    setShowStrategyDrawer(false);
  };

  const createDailyTask = time => SearchState.set(st => applyDailyTask(st, time));

  const calibrationSet = CALIBRATION_IDS.map(id => s.candidates.find(c => c.id === id)).filter(Boolean);
  const selected = ranked.find(r => r.candidate.id === selectedId);
  const dailyTask = (s.tasks || []).find(task => task.searchId === s.id && task.cadence === 'daily');
  const showRail = played.length > 0 && !split && !showStrategyDrawer;
  const openStrategyPanel = () => {
    setSplit(false);
    setSelectedId(null);
    setShowStrategyDrawer(true);
  };
  const resultsShown = played.some(p => typeof p === 'number' && script[p].payload === 'results');
  React.useEffect(() => {
    if (resultsShown && !autoOpenedTableRef.current) {
      autoOpenedTableRef.current = true;
      setSplit(true);
    }
  }, [resultsShown]);
  React.useEffect(() => {
    if (!s.shortlist.length || !resultsShown || !outreachHandoffRef.current) return;
    const frame = requestAnimationFrame(() => outreachHandoffRef.current && outreachHandoffRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    return () => cancelAnimationFrame(frame);
  }, [s.shortlist.length, !!s.outreachGroup, resultsShown]);
  const latestUserTurnIndex = played.reduce((latest, turn, index) => typeof turn === 'object' && turn.said ? index : latest, -1);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
      <style>{`
        @keyframes emaspin { to { transform: rotate(360deg) } }
        @keyframes emashimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }
        @keyframes emaThinkingText { 0% { background-position: 180% 0 } 100% { background-position: -80% 0 } }
        @keyframes emaStreamWord { from { opacity: 0; filter: blur(2px); } to { opacity: 1; filter: blur(0); } }
        @keyframes emaPayloadEnter { from { opacity: 0; transform: translateY(7px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes emaColumnAdded { 0% { background-color: var(--green-200); } 100% { background-color: transparent; } }
        .ema-stream-word { opacity: 0; animation: emaStreamWord 190ms ease-out forwards; }
        .ema-payload-enter { animation: emaPayloadEnter 260ms ease-out 480ms both; }
        .ema-quick-replies-in { animation: emaPayloadEnter 220ms ease-out both; }
        .ema-review-rail { scrollbar-width: none; }
        .ema-review-rail::-webkit-scrollbar { display: none; }
        .ema-name-link { text-decoration: none; transition: color 120ms; }
        .ema-name-link:hover { color: var(--green-800); text-decoration: underline; }
        .ema-thinking-shimmer {
          color: transparent;
          background: linear-gradient(90deg, var(--fg2) 16%, var(--fg1) 46%, var(--fg2) 76%);
          background-size: 220% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          animation: emaThinkingText 1.55s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .ema-thinking-shimmer { color: var(--fg2); background: none; animation: none; }
          .ema-stream-word { opacity: 1; animation: none; filter: none; }
          .ema-payload-enter { animation: none; }
          .ema-quick-replies-in { animation: none; }
        }
      `}</style>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: split || showStrategyDrawer ? 620 : 720, padding: '24px 28px 0', display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 56px)' }}>
          <div style={{ flex: 1 }}>
            {brief && brief.prompt && <YouSay>{brief.prompt}</YouSay>}

            {played.map((p, i) => {
              if (typeof p === 'object') return p.emaSaid
                ? <EmaSays key={i}>{<Lead>{p.emaSaid}</Lead>}</EmaSays>
                : <YouSay key={i} anchorRef={i === latestUserTurnIndex ? userTurnRef : null}>{p.said}</YouSay>;
              const beat = script[p];
              const wordCounter = { current: 0 };
              const streamedBody = streamWords(beat.body(params), wordCounter);
              return (
                <React.Fragment key={i}>
                  <ThinkingDisclosure items={beat.thinkingItems ? beat.thinkingItems(params) : ['Updated the search using the latest information in the conversation.']} />
                  <EmaSays tight={!!beat.payload}>{streamedBody}</EmaSays>
                  {beat.quickReplies && awaitingYou && played[played.length - 1] === p && (
                    <QuickReplies options={beat.quickReplies} onChoose={send} delay={streamDuration(wordCounter.current)} />
                  )}
                  {beat.payload === 'calibration' && (
                    <CalibrationPayload candidates={calibrationSet} ranked={ranked} state={calib}
                      onView={id => setSelectedId(id)}
                      onReact={(id, r) => setCalib(x => ({ ...x, [id]: { ...(x[id] || {}), reaction: r, reasons: (x[id] || {}).reasons || [] } }))}
                      onReason={(id, label) => setCalib(x => {
                        const cur = x[id] || { reasons: [] };
                        const has = (cur.reasons || []).includes(label);
                        return { ...x, [id]: { ...cur, reasons: has ? cur.reasons.filter(r => r !== label) : [...(cur.reasons || []), label] } };
                      })} />
                  )}
                  {beat.payload === 'no-match' && (
                    <NoMatchPayload poolSize={poolSize} />
                  )}
                  {beat.payload === 'results' && (
                    <ResultsPayload results={ranked} poolSize={poolSize} onExpand={() => setSplit(true)} />
                  )}
                  {beat.payload === 'schedule' && (
                    <DailyTaskSuggestion task={dailyTask} onCreate={createDailyTask} onViewTasks={() => onNavigate && onNavigate('tasks')} />
                  )}
                </React.Fragment>
              );
            })}

            {resultsShown && s.shortlist.length > 0 && (
              <div ref={outreachHandoffRef}>
                <OutreachHandoffCard shortlist={s.shortlist} candidates={s.candidates} group={s.outreachGroup}
                  drafts={s.outreachDrafts || {}} onCreate={openStrategyPanel} onEdit={openStrategyPanel}
                  onReview={()=>onNavigate && onNavigate('outreach')} />
              </div>
            )}

            {thinking && script[cursor] && <Thinking text={script[cursor].thinking ? script[cursor].thinking(params) : 'Refining the search…'} />}
            {latestUserTurnIndex >= 0 && <div aria-hidden="true" style={{ height: 'calc(100vh - 180px)', minHeight: 460, pointerEvents: 'none' }} />}
          </div>

          <ChatComposer prefill={prefill} onSend={send} disabled={!awaitingYou} />
        </div>
      </div>

      {split && (
        <SplitTable results={ranked} shortlist={s.shortlist} onShortlist={toggleShortlist}
          onSelect={setSelectedId} selectedId={selectedId} poolSize={poolSize} showExperience={showExperience}
          onClose={() => { setSplit(false); setSelectedId(null); }}
          criteria={criteria} filters={filters} total={s.candidates.length} updating={updating}
          onFiltersChange={applyFilters} onCriteriaChange={applyCriteria} />
      )}

      {showRail && (
        <aside style={{ width: 340, flex: '0 0 340px', position: 'sticky', top: 0, maxHeight: 'calc(100vh - 56px)', overflow: 'auto', background: 'var(--beige-50)', padding: 16 }}>
          <Rail criteria={criteria} filters={filters} poolSize={poolSize} total={s.candidates.length} updating={updating}
            selected={selected} shortlist={s.shortlist} onShortlist={toggleShortlist} onClearSelected={() => setSelectedId(null)}
            onFiltersChange={applyFilters} onCriteriaChange={applyCriteria}
            hasResults={resultsShown} onOpenTable={() => setSplit(true)} />
        </aside>
      )}
      {showStrategyDrawer && <OutreachStrategyDrawer embedded count={s.shortlist.length} candidates={s.shortlist.map(id=>s.candidates.find(candidate=>candidate.id===id)).filter(Boolean)} initialStrategy={s.outreachStrategy || DEFAULT_STRATEGY}
        onClose={()=>setShowStrategyDrawer(false)} onGenerate={generateOutreach} />}
    </div>
  );
}

Object.assign(window, { Conversation });
