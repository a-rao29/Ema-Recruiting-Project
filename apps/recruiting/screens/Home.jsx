// Project home. The funnel — search, shortlist, outreach, track — doubles as the
// empty-state explanation: each stage's description IS the education, and it
// swaps for a live stat the moment that stage has real activity. Color marks
// progress, not decoration — a stage only lights up once it's reachable, so the
// order reads even before anyone has done anything.

const HOME_STAGES = [
  { id: 'search',    icon: 'magnifying-glass', label: 'Search',    role: 'purple', image: 'card-search.jpg',
    empty: 'Tell Ema who you need. It searches, ranks and explains why.' },
  { id: 'shortlist', icon: 'bookmark-simple',  label: 'Shortlist', role: 'green', image: 'card-shortlist.jpg',
    empty: 'Save the candidates worth a closer look.' },
  { id: 'outreach',  icon: 'envelope-simple',  label: 'Outreach',  role: 'blue', image: 'card-outreach.jpg',
    empty: 'Turn a shortlist into personalised messages.' },
  { id: 'track',     icon: 'chart-line-up',    label: 'Track',     role: 'orange', image: 'card-track.jpg',
    empty: 'Ema keeps searching on a schedule and tells you what changed.' },
];

const HOME_ROLE_TINT = {
  purple: { bg: 'var(--purple-100)', ring: 'var(--purple-50)', bd: 'var(--purple-400)', fg: 'var(--purple-800)' },
  green:  { bg: 'var(--green-200)',  ring: 'var(--green-50)',  bd: 'var(--green-400)',  fg: 'var(--green-800)' },
  blue:   { bg: 'var(--blue-100)',   ring: 'var(--blue-50)',   bd: 'var(--blue-400)',   fg: 'var(--blue-800)' },
  orange: { bg: 'var(--orange-100)', ring: 'var(--orange-50)', bd: 'var(--orange-400)', fg: 'var(--orange-800)' },
};
const HOME_MUTED_TINT = { bg: 'var(--beige-100)', ring: 'transparent', bd: 'var(--beige-300)', fg: 'var(--fg2)' };

function HomeStepArrow({ dimmed }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '7px 0' }}>
      <span style={{
        width: 26, height: 26, borderRadius: '50%', flex: '0 0 auto',
        background: 'var(--white)', border: `1px solid ${dimmed ? 'var(--beige-300)' : 'var(--beige-400)'}`,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <i className="ph ph-arrow-down" style={{ fontSize: 13, color: dimmed ? 'var(--beige-500)' : 'var(--fg3)' }} />
      </span>
    </div>
  );
}

function HomeStageCard({ stage, index, reached, stat, primary, onAction }) {
  const tint = reached ? HOME_ROLE_TINT[stage.role] : HOME_MUTED_TINT;
  const clickable = !!onAction;
  return (
    <div className={clickable ? 'ema-home-card' : 'ema-home-card is-disabled'} style={{
      display: 'flex', alignItems: 'stretch', minWidth: 0, borderRadius: 14, overflow: 'hidden',
      background: 'var(--white)',
      border: `1.5px solid ${stat ? tint.bd : 'var(--beige-300)'}`,
      animation: `emaHomeCardIn 420ms cubic-bezier(0.16,1,0.3,1) ${100 + index * 80}ms both`,
    }}>
      <div style={{
        width: 128, flex: '0 0 128px', position: 'relative', minHeight: 108,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span aria-hidden="true" style={{position:'absolute',inset:0,backgroundImage:`url(assets/${stage.image})`,backgroundSize:'cover',backgroundPosition:'center',filter:reached?'none':'grayscale(.72) saturate(.7)',opacity:reached?1:.68}}/>
        <span style={{
          position:'relative',zIndex:1,width: 52, height: 52, borderRadius: 13, background: 'var(--white)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: reached?'0 2px 10px rgba(26,29,25,0.14)':'0 1px 5px rgba(26,29,25,0.09)',
        }}>
          <i className={`ph ph-${stage.icon}`} style={{ fontSize: 22, color: tint.fg }} />
        </span>
      </div>

      <div style={{ flex: 1, minWidth: 0, padding: '16px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: reached ? 'var(--fg1)' : 'var(--fg2)' }}>{stage.label}</div>
          {stat ? (
            <div style={{ marginTop: 3, display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 22, lineHeight: '26px', fontWeight: 700, color: tint.fg }}>{stat.value}</span>
              <span style={{ fontSize: 12, color: 'var(--fg3)' }}>{stat.label}</span>
            </div>
          ) : (
            <p style={{ margin: '3px 0 0', fontSize: 12.5, lineHeight: '18px', color: reached ? 'var(--fg2)' : 'var(--fg3)' }}>{stage.empty}</p>
          )}
        </div>

        {clickable && (primary ? (
          <Button variant="primary" color="brand" size="sm" iconRight="arrow-right" onClick={onAction} style={{ flex: '0 0 auto' }}>
            {stat ? 'Open' : 'Start'}
          </Button>
        ) : (
          <button onClick={onAction} style={{
            flex: '0 0 auto', border: 0, background: 'transparent', padding: 0, fontFamily: 'inherit',
            fontSize: 13, fontWeight: 600, color: tint.fg, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 5,
          }}>
            {stat ? 'Open' : 'Start'} <i className="ph ph-arrow-right" style={{ fontSize: 12 }} />
          </button>
        ))}
      </div>
    </div>
  );
}

function HomePage({ onNavigate, onNewSearch }) {
  const s = useSearchState();
  const started = s.thread.length > 0;
  const ranked = started && s.criteria.length ? Engine.rank(s.candidates, s.criteria, s.filters) : [];
  const shortlistCount = (s.shortlist || []).length;
  const drafts = Object.values(s.outreachDrafts || {}).filter(d => !d.removed);
  const approvedCount = drafts.filter(d => d.approved).length;
  const taskCount = (s.tasks || []).length;

  const reached = { search: true, shortlist: started, outreach: shortlistCount > 0, track: taskCount > 0 || drafts.length > 0 };
  const stats = {
    search: started ? { value: ranked.length || s.candidates.length, label: 'candidates ranked' } : null,
    shortlist: shortlistCount > 0 ? { value: shortlistCount, label: shortlistCount === 1 ? 'shortlisted' : 'shortlisted' } : null,
    outreach: drafts.length > 0 ? { value: approvedCount, label: `of ${drafts.length} approved` } : null,
    track: taskCount > 0 ? { value: taskCount, label: taskCount === 1 ? 'active task' : 'active tasks' } : null,
  };
  const actions = {
    search: started ? () => onNavigate('search') : onNewSearch,
    shortlist: reached.shortlist ? () => onNavigate('shortlists') : null,
    outreach: reached.outreach ? () => onNavigate('outreach') : null,
    track: reached.track ? () => onNavigate('tasks') : null,
  };
  const currentStageId = HOME_STAGES.find(stage => reached[stage.id] && !stats[stage.id])?.id;

  return (
    <div style={{
      width: '100%', minHeight: '100%',
      backgroundImage: 'url(assets/hero-bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'top center', backgroundRepeat: 'no-repeat',
    }}>
      <div style={{ width: '100%', maxWidth: 760, margin: '0 auto', padding: '48px 28px 80px' }}>
        <style>{`
          @keyframes emaHomeCardIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .ema-home-card { transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease; box-shadow: var(--shadow-xs); }
          .ema-home-card:not(.is-disabled):hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
          .ema-home-card.is-disabled { box-shadow: 0 1px 2px rgba(26,29,25,.035); }
          @media (prefers-reduced-motion: reduce) {
            .ema-home-card { animation: none !important; }
          }
        `}</style>

        <div style={{ marginBottom: 24, textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontSize: 28, lineHeight: '34px', fontWeight: 700, color: 'var(--fg1)' }}>{PROJECT_NAME}</h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, lineHeight: '20px', color: 'var(--fg2)' }}>
            Search for candidates, shortlist the ones worth a closer look, reach out, then track what happens next.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {HOME_STAGES.map((stage, i) => (
            <React.Fragment key={stage.id}>
              {i > 0 && <HomeStepArrow dimmed={!reached[stage.id]} />}
              <HomeStageCard stage={stage} index={i} reached={reached[stage.id]} stat={stats[stage.id]}
                primary={stage.id === currentStageId} onAction={actions[stage.id]} />
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { HomePage });
