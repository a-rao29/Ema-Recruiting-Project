// S1 · Search landing
// Scenario first, then one composer that changes shape to match it. The morph is the point:
// the brief claims the scenario changes how Ema searches, and watching the input change is
// what proves that to the user rather than asserting it. Every scenario gets the same
// dissolve-grid → settle-summary → reveal-panel treatment; only Backfill (built deep) skips
// the composer entirely because picking a person is a complete answer on its own.

const SCENARIOS = [
  { id: 'backfill',       icon: 'user-switch',   title: 'Backfill',              desc: 'Replace someone who is leaving or has left.' },
  { id: 'zero-to-one',    icon: 'rocket-launch', title: '0→1 initiative',        desc: 'Build or launch something new.' },
  { id: 'new-role',       icon: 'user-plus',     title: 'New role',              desc: "Create a capability that didn't exist before." },
  { id: 'scale',          icon: 'users-three',   title: 'Scale the team',        desc: "Add capacity to a team that's already working." },
  { id: 'capability-gap', icon: 'puzzle-piece',  title: 'Fill a capability gap', desc: "Bring in expertise the team doesn't have." },
  { id: 'other',          icon: 'dots-three',    title: 'Something else',        desc: 'Describe the situation in your own words.' },
];

const PLACEHOLDER = {
  null:             'Click to describe who you need and what they should accomplish.',
  'backfill':       'What should be different about the role this time? Anything Sarah did that you want to keep, or change?',
  'zero-to-one':    'What does this person need to own — discovery, direction, the first version, the launch?',
  'new-role':       'Why does this role need to exist now, and what should they have accomplished in 6–12 months?',
  'scale':          'What about these people do you want more of — ownership, domain depth, execution, product thinking?',
  'capability-gap': 'What capability are you trying to add that the team does not have today?',
  'other':          'Describe the hiring situation in your own words.',
};

const DEMO = {
  null:             PLACEHOLDER[null],
  'backfill':       'Sarah owned our most complex workflow surfaces and shipped relentlessly. I want to keep that execution strength, but this time I need someone who can also set product direction on an ambiguous AI analytics product rather than working downstream of it.',
  'zero-to-one':    'They need to own this end to end — find the problem with our banking customers, define what we build, and get the first version live. Bangalore, senior, comfortable with dense enterprise data.',
  'new-role':       'We have never had a designer on analytics. In 12 months I want operations leaders interrogating what our AI employees did without writing a query. They will work with one PM and two founding engineers.',
  'scale':          'I want more of what Rohit and Daniel do — deep ownership of a complex surface, and being the person engineering actually wants in the room.',
  'capability-gap': 'The team is strong on enterprise UX and systems, and thin on 0→1 and AI. I need someone who adds product strategy on an ambiguous AI product.',
  'other':          "I need a Senior Product Designer who has already shipped a category-defining AI product at three different unicorns, holds a PhD in Machine Learning, is fluent in Japanese for our Tokyo clients, and can relocate to Bangalore within a week. Budget is ₹18L — we're a scrappy startup. All of this is non-negotiable.",
};

function ScenarioCard({ scenario, selected, resolving, onSelect }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button className={`s1-driver-card${selected ? ' is-selected' : ''}${resolving ? ' is-resolving' : ''}`}
      onClick={() => onSelect(scenario.id)}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 9,
        padding: 14, textAlign: 'left', cursor: 'pointer',
        background: 'var(--white)',
        border: `1px solid ${selected ? 'var(--green-800)' : hover ? 'var(--beige-500)' : 'var(--beige-400)'}`,
        borderRadius: 12,
        boxShadow: selected ? 'var(--shadow-focus)' : hover ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        outline: 'none', fontFamily: 'inherit', transition: 'opacity 220ms ease, transform 320ms cubic-bezier(0.16,1,0.3,1), border-color 180ms ease, box-shadow 180ms ease, background 180ms ease',
      }}>
      <span style={{
        width: 30, height: 30, borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: selected ? 'var(--green-200)' : 'var(--beige-100)',
        color: selected ? 'var(--green-800)' : 'var(--fg2)',
        transition: 'all 150ms cubic-bezier(0.16,1,0.3,1)',
      }}>
        <i className={`ph ph-${selected && resolving ? 'check' : scenario.icon}`} style={{ fontSize: 17 }} />
      </span>
      <span style={{ fontSize: 14, lineHeight: '20px', fontWeight: 700, color: 'var(--fg1)' }}>{scenario.title}</span>
      <span style={{ fontSize: 12, lineHeight: '17px', color: 'var(--fg3)' }}>{scenario.desc}</span>
    </button>
  );
}

// --- shared shell: every scenario settles into the same summary + setup card ------

function DriverSummary({ title, onEdit, entering }) {
  return (
    <div className={entering ? 's1-driver-summary is-entering' : 's1-driver-summary'} style={{
      height: 46, padding: '0 14px', display: 'flex', alignItems: 'center', gap: 9,
      background: 'var(--white)', border: '1px solid var(--beige-400)', borderRadius: 10,
      boxShadow: 'var(--shadow-sm)', marginBottom: 12,
    }}>
      <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--green-200)', color: 'var(--green-800)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <i className="ph ph-check" style={{ fontSize: 13, fontWeight: 700 }} />
      </span>
      <span style={{ flex: 1, fontSize: 14, color: 'var(--fg2)' }}>Hiring driver: <strong style={{ color: 'var(--fg1)' }}>{title}</strong></span>
      <button onClick={onEdit} style={{ border: 0, background: 'transparent', color: 'var(--green-800)', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Edit</button>
    </div>
  );
}

function SetupCard({ heading, subtext, entering, children }) {
  return (
    <div className={entering ? 's1-next-step is-entering' : 's1-next-step'} style={{ padding: 18, background: 'var(--white)', border: '1px solid var(--beige-400)', borderRadius: 12, boxShadow: 'var(--shadow-sm)', marginBottom: 12 }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 16, lineHeight: '22px', fontWeight: 700, color: 'var(--fg1)' }}>{heading}</div>
        {subtext && <div style={{ marginTop: 3, fontSize: 13, lineHeight: '19px', color: 'var(--fg3)' }}>{subtext}</div>}
      </div>
      {children}
    </div>
  );
}

// --- per-scenario setup widgets: the part that changes inside the card ------------

const STAGES_0TO1 = ['Idea', 'Validation', 'Building', 'Launching', 'Scaling'];
const NEW_ROLE_REASONS = ['Growing scope of an existing team', 'Strategic bet on a new area', 'Gap surfaced during planning', 'Org restructuring'];

const SETUP_COPY = {
  'zero-to-one':    { heading: 'What are you building?',              subtext: 'A brief helps more than a job description — Ema reads intent, not just requirements.' },
  'new-role':       { heading: "Why does this role need to exist now?", subtext: "There's no previous person to anchor on, so start with the problem." },
  'scale':          { heading: 'Who is working well?',                 subtext: 'Pick up to three — Ema learns the traits behind them, not their profiles.' },
  'capability-gap': { heading: 'What is the team missing?',            subtext: "Read from your team's backgrounds, or describe the gap yourself." },
};

function ZeroToOneWidget({ ctx, setCtx, onAttach }) {
  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
        <Button size="sm" variant="secondary" color="brand" icon="file-text" onClick={() => onAttach('doc')}>
          Attach a product brief
        </Button>
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.1, color: 'var(--fg3)', marginBottom: 8 }}>Where is it today?</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {STAGES_0TO1.map(st => (
          <button key={st} onClick={() => setCtx({ ...ctx, stage: ctx.stage === st ? null : st })}
            style={{
              height: 32, padding: '0 14px', borderRadius: 9999, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
              background: ctx.stage === st ? 'var(--green-200)' : 'var(--white)',
              border: `1px solid ${ctx.stage === st ? 'var(--green-800)' : 'var(--beige-400)'}`,
              color: ctx.stage === st ? 'var(--green-800)' : 'var(--fg2)', transition: 'all 150ms',
            }}>{st}</button>
        ))}
      </div>
    </>
  );
}

function ScaleWidget({ team, ctx, setCtx }) {
  const picked = ctx.replicate || [];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
      {team.members.filter(m => m.status === 'active').map(member => {
        const selected = picked.includes(member.id);
        return (
          <button key={member.id}
            onClick={() => setCtx({
              ...ctx,
              replicate: selected ? picked.filter(x => x !== member.id)
                : picked.length >= 3 ? picked : [...picked, member.id],
            })}
            style={{
              minWidth: 0, minHeight: 54, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 9,
              border: `1px solid ${selected ? 'var(--green-800)' : 'var(--beige-400)'}`, borderRadius: 10,
              background: selected ? 'var(--green-100)' : 'var(--white)',
              cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'all 150ms',
            }}>
            <Avatar name={member.name} size={30} />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 13, lineHeight: '18px', fontWeight: 500, color: 'var(--fg1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.name}</span>
              <span style={{ display: 'block', fontSize: 12, lineHeight: '17px', color: 'var(--fg3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.title}</span>
            </span>
            {member.highPerformer && <Badge variant="warning" size="sm">High performer</Badge>}
            <span style={{
              width: 18, height: 18, borderRadius: '50%', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              border: `1px solid ${selected ? 'var(--green-800)' : 'var(--beige-500)'}`,
              background: selected ? 'var(--green-800)' : 'transparent', transition: 'all 150ms',
            }}>
              {selected && <i className="ph ph-check" style={{ fontSize: 11, color: 'var(--white)', fontWeight: 700 }} />}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function CapabilityGapWidget({ team, ctx, setCtx }) {
  const cap = team.capabilityMap;
  return (
    <>
      <button onClick={() => setCtx({ ...ctx, useTeam: !ctx.useTeam })}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 7, height: 32, padding: '0 12px', marginBottom: ctx.useTeam ? 14 : 0,
          borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
          background: ctx.useTeam ? 'var(--green-200)' : 'var(--white)',
          border: `1px solid ${ctx.useTeam ? 'var(--green-800)' : 'var(--beige-400)'}`,
          color: ctx.useTeam ? 'var(--green-800)' : 'var(--fg2)',
        }}>
        <i className={`ph ph-${ctx.useTeam ? 'check-circle' : 'users-three'}`} style={{ fontSize: 14 }} />
        Use my existing team
      </button>
      {ctx.useTeam && (
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {[['Strong', cap.strong, 'var(--green-800)'], ['Less represented', cap.lessRepresented, 'var(--orange-800)']].map(([label, list, tone]) => (
            <div key={label}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.1, color: 'var(--fg3)', marginBottom: 6 }}>{label}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {list.map(x => (
                  <span key={x.signal} style={{ height: 26, padding: '0 9px', borderRadius: 9999, background: 'var(--white)', border: '1px solid var(--beige-400)', color: tone, fontSize: 12, display: 'inline-flex', alignItems: 'center' }}>
                    {x.label}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function NewRoleWidget({ ctx, setCtx }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {NEW_ROLE_REASONS.map(r => (
        <button key={r} onClick={() => setCtx({ ...ctx, reason: ctx.reason === r ? null : r })}
          style={{
            height: 32, padding: '0 13px', borderRadius: 9999, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
            background: ctx.reason === r ? 'var(--green-200)' : 'var(--white)',
            border: `1px solid ${ctx.reason === r ? 'var(--green-800)' : 'var(--beige-400)'}`,
            color: ctx.reason === r ? 'var(--green-800)' : 'var(--fg2)', transition: 'all 150ms',
          }}>{r}</button>
      ))}
    </div>
  );
}

function ScenarioWidget({ scenario, team, ctx, setCtx, onAttach }) {
  if (!team) return null;
  if (scenario === 'zero-to-one')    return <ZeroToOneWidget ctx={ctx} setCtx={setCtx} onAttach={onAttach} />;
  if (scenario === 'scale')          return <ScaleWidget team={team} ctx={ctx} setCtx={setCtx} />;
  if (scenario === 'capability-gap') return <CapabilityGapWidget team={team} ctx={ctx} setCtx={setCtx} />;
  if (scenario === 'new-role')       return <NewRoleWidget ctx={ctx} setCtx={setCtx} />;
  return null;
}

// --- Backfill: built deep — a person pick is a complete answer, so it skips the composer ---

function BackfillSetup({ team, attachments, onAttach, onRemove, onSelect, onEditDriver, entering }) {
  const [query, setQuery] = React.useState('');
  const people = team.members.filter(member => {
    const haystack = `${member.name} ${member.title} ${member.location}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });
  const jd = attachments.find(a => a.type === 'jd');

  return (
    <div style={{ width: '100%', minWidth: 0 }}>
      <DriverSummary title="Backfill" onEdit={onEditDriver} entering={entering} />

      <SetupCard
        heading="Who are you replacing?"
        subtext="Ema will use their work as evidence—not as a similarity template."
        entering={entering}
      >
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <i className="ph ph-magnifying-glass" style={{ position: 'absolute', left: 12, top: 11, fontSize: 16, color: 'var(--fg3)' }} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search your team"
            style={{ width: '100%', height: 38, padding: '0 12px 0 36px', borderRadius: 8, border: '1px solid var(--beige-400)', outline: 0, background: 'var(--beige-50)', color: 'var(--fg1)', fontSize: 13 }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
          {people.map(member => (
            <button key={member.id} onClick={() => onSelect(member)}
              style={{
                minWidth: 0, minHeight: 54, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 9,
                border: '1px solid var(--beige-400)', borderRadius: 10, background: 'var(--white)',
                cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
              }}>
              <Avatar name={member.name} size={30} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 13, lineHeight: '18px', fontWeight: 500, color: 'var(--fg1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.name}</span>
                <span style={{ display: 'block', fontSize: 12, lineHeight: '17px', color: 'var(--fg3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.title}</span>
              </span>
              {member.status === 'leaving' && <Badge variant="warning" size="sm">Leaving</Badge>}
              <i className="ph ph-caret-right" style={{ fontSize: 13, color: 'var(--fg3)' }} />
            </button>
          ))}
        </div>

        {people.length === 0 && <div style={{ padding: '18px 0', textAlign: 'center', fontSize: 13, color: 'var(--fg3)' }}>No matching employees</div>}

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 5, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--beige-200)' }}>
          <Button variant="ghost" color="brand" size="sm" icon="link" onClick={() => onAttach('profile')}>Paste profile URL</Button>
          <Button variant="ghost" color="brand" size="sm" icon="upload-simple" onClick={() => onAttach('profile')}>Upload profile</Button>
          <span style={{ flex: 1 }} />
          {jd ? <AttachmentChip attachment={jd} onRemove={onRemove} /> : (
            <Button variant="ghost" color="brand" size="sm" icon="file-text" onClick={() => onAttach('jd')}>Add job description</Button>
          )}
        </div>
      </SetupCard>
    </div>
  );
}

// --- composer ---------------------------------------------------------------

function AttachmentChip({ attachment, onRemove }) {
  const icons = { jd: 'file-text', profile: 'user-focus', doc: 'paperclip' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 28, padding: '0 6px 0 10px', borderRadius: 8, background: 'var(--beige-100)', border: '1px solid var(--beige-400)', fontSize: 13, color: 'var(--fg1)', maxWidth: 280 }}>
      <i className={`ph ph-${icons[attachment.type]}`} style={{ fontSize: 14, color: 'var(--fg3)' }} />
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{attachment.name}</span>
      <button onClick={() => onRemove(attachment.id)} title="Remove"
        style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--fg3)', display: 'inline-flex', padding: 2, borderRadius: 4 }}>
        <i className="ph ph-x" style={{ fontSize: 12 }} />
      </button>
    </span>
  );
}

function Composer({ scenario, value, onChange, attachments, onAttach, onRemove, onSubmit, canSubmit }) {
  const [focus, setFocus] = React.useState(false);
  const [typingPrefill, setTypingPrefill] = React.useState(false);
  const typingTimerRef = React.useRef(null);
  const typedScenarioRef = React.useRef(null);

  const stopPrefillTyping = () => {
    if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current);
    typingTimerRef.current = null;
    setTypingPrefill(false);
  };

  const startPrefillTyping = () => {
    const prefill = DEMO[scenario] || DEMO[null];
    if (!prefill || value || typingTimerRef.current || typedScenarioRef.current === scenario) return;
    typedScenarioRef.current = scenario;
    let cursor = 0;
    setTypingPrefill(true);
    const typeNextCharacter = () => {
      cursor = Math.min(prefill.length, cursor + 1);
      onChange(prefill.slice(0, cursor));
      if (cursor >= prefill.length) {
        stopPrefillTyping();
        return;
      }
      const character = prefill[cursor - 1];
      const delay = /[.!?]/.test(character) ? 105 : /[,;:—]/.test(character) ? 70 : character === ' ' ? 28 : 18 + Math.round(Math.random() * 12);
      typingTimerRef.current = window.setTimeout(typeNextCharacter, delay);
    };
    typingTimerRef.current = window.setTimeout(typeNextCharacter, 120);
  };

  React.useEffect(() => {
    stopPrefillTyping();
    typedScenarioRef.current = null;
  }, [scenario]);
  React.useEffect(() => () => {
    if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current);
  }, []);

  return (
    <div style={{
      background: 'var(--white)',
      border: `1px solid ${focus ? 'var(--green-500)' : 'var(--beige-400)'}`,
      borderRadius: 12,
      boxShadow: focus ? 'var(--shadow-focus)' : 'var(--shadow-sm)',
      transition: 'all 150ms cubic-bezier(0.16,1,0.3,1)',
      overflow: 'hidden',
    }}>
      <textarea
        value={value} aria-busy={typingPrefill}
        onChange={e => { stopPrefillTyping(); onChange(e.target.value); }}
        onFocus={() => setFocus(true)}
        onClick={startPrefillTyping}
        onBlur={() => setFocus(false)}
        onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && canSubmit) onSubmit(); }}
        placeholder={PLACEHOLDER[scenario] || PLACEHOLDER[null]}
        style={{ display: 'block', width: '100%', minHeight: 96, resize: 'none', border: 0, outline: 0, background: 'transparent', padding: '16px 18px 8px', fontFamily: 'inherit', fontSize: 15, lineHeight: '24px', color: 'var(--fg1)' }} />

      {attachments.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '0 18px 10px' }}>
          {attachments.map(a => <AttachmentChip key={a.id} attachment={a} onRemove={onRemove} />)}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '10px 12px', borderTop: '1px solid var(--beige-200)' }}>
        <Button variant="ghost" color="brand" size="sm" icon="file-text" onClick={() => onAttach('jd')}>Add job description</Button>
        <Button variant="ghost" color="brand" size="sm" icon="paperclip" onClick={() => onAttach('doc')}>Add context</Button>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: 'var(--fg3)', marginRight: 8 }}>⌘⏎</span>
        <IconButton icon="arrow-up" variant="primary" color="brand" size="md" onClick={() => canSubmit && onSubmit()} title="Start search" />
      </div>
    </div>
  );
}

function CompanyContextStrip({ company }) {
  if (!company) return null;
  const bits = [company.name, company.characteristics.audience.value, 'complex workflow software', company.primaryHiringLocation];
  return (
    <div style={{ textAlign: 'center', padding: '18px 0 0', fontSize: 14, lineHeight: '20px', color: 'var(--fg3)' }}>
      Your company context is applied to ranking — {bits.join(' · ')}.{' '}
      <button style={{ border: 0, background: 'transparent', padding: 0, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 500, color: 'var(--green-800)', textDecoration: 'underline', textUnderlineOffset: 2 }}>
        Review
      </button>
    </div>
  );
}

function SearchModeSwitch({value,onChange}) {
  const modes=[{id:'agentic',icon:'sparkle',label:'Agentic search'},{id:'regular',icon:'sliders-horizontal',label:'Regular search'}];
  return <div style={{display:'inline-flex',padding:3,borderRadius:10,border:'1px solid var(--beige-400)',background:'var(--beige-100)',boxShadow:'var(--shadow-xs)'}} role="tablist" aria-label="Search mode">{modes.map(mode=><button key={mode.id} role="tab" aria-selected={value===mode.id} onClick={()=>onChange(mode.id)} style={{height:34,padding:'0 14px',display:'inline-flex',alignItems:'center',gap:7,border:0,borderRadius:8,background:value===mode.id?'var(--white)':'transparent',boxShadow:value===mode.id?'var(--shadow-sm)':'none',color:value===mode.id?'var(--fg1)':'var(--fg3)',fontFamily:'inherit',fontSize:12,fontWeight:value===mode.id?700:500,cursor:'pointer',transition:'all 150ms cubic-bezier(0.16,1,0.3,1)'}}><i className={`ph ph-${mode.icon}`} style={{color:value===mode.id?(mode.id==='agentic'?'var(--ai-magic)':'var(--green-800)'):'var(--fg3)'}}/>{mode.label}</button>)}</div>;
}

function RegularSearchSetup({criteria,setCriteria,onSubmit}) {
  const fieldStyle={width:'100%',height:40,padding:'0 11px',border:'1px solid var(--beige-400)',borderRadius:8,background:'var(--white)',outline:0,fontFamily:'inherit',fontSize:13,color:'var(--fg1)'};
  const Field=({label,children})=><label style={{display:'block'}}><span style={{display:'block',marginBottom:6,fontSize:11,fontWeight:700,letterSpacing:.7,textTransform:'uppercase',color:'var(--fg3)'}}>{label}</span>{children}</label>;
  const update=(key,value)=>setCriteria(current=>({...current,[key]:value}));
  const canSubmit=criteria.title.trim().length>0;
  return <div style={{animation:'s1MorphIn 300ms cubic-bezier(0.16,1,0.3,1) both'}}><div style={{padding:20,border:'1px solid var(--beige-400)',borderRadius:12,background:'var(--white)',boxShadow:'var(--shadow-sm)'}}><div style={{display:'flex',alignItems:'flex-start',marginBottom:18}}><span style={{width:34,height:34,borderRadius:9,background:'var(--green-100)',color:'var(--green-800)',display:'inline-flex',alignItems:'center',justifyContent:'center',marginRight:10}}><i className="ph ph-magnifying-glass"/></span><div><div style={{fontSize:15,fontWeight:700}}>Search criteria</div><div style={{fontSize:12,lineHeight:'18px',color:'var(--fg3)',marginTop:2}}>Enter explicit requirements. Results will match these criteria directly.</div></div></div>
    <div style={{display:'grid',gridTemplateColumns:'1.35fr 1fr',gap:14,marginBottom:14}}><Field label="Role or title"><input autoFocus value={criteria.title} onChange={e=>update('title',e.target.value)} placeholder="e.g. Senior product designer" style={fieldStyle}/></Field><Field label="Location"><input value={criteria.location} onChange={e=>update('location',e.target.value)} placeholder="e.g. Bangalore" style={fieldStyle}/></Field></div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}><Field label="Experience"><select value={criteria.experience} onChange={e=>update('experience',e.target.value)} style={fieldStyle}><option>Any experience</option><option>3–5 years</option><option>5–8 years</option><option>8+ years</option></select></Field><Field label="Seniority"><select value={criteria.seniority} onChange={e=>update('seniority',e.target.value)} style={fieldStyle}><option>Any seniority</option><option>Senior IC</option><option>Lead</option><option>Manager</option><option>Director+</option></select></Field></div>
    <Field label="Skills and keywords"><input value={criteria.skills} onChange={e=>update('skills',e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&canSubmit)onSubmit();}} placeholder="e.g. enterprise SaaS, 0→1, AI products" style={fieldStyle}/></Field>
    <div style={{display:'flex',alignItems:'center',marginTop:18,paddingTop:14,borderTop:'1px solid var(--beige-200)'}}><span style={{fontSize:11,color:'var(--fg3)'}}><i className="ph ph-info" style={{marginRight:5}}/>You can refine filters after viewing results.</span><span style={{flex:1}}/><Button variant="primary" color="brand" icon="magnifying-glass" disabled={!canSubmit} onClick={onSubmit}>Search candidates</Button></div>
  </div></div>;
}

// --- the settled state for every scenario: summary chip + setup card (+ composer, unless Backfill) ---

function ScenarioSetup({ scenario, team, ctx, setCtx, s, onAttach, onRemove, onSelectBackfillMember, onEditDriver, entering, onChangePrompt, onSubmit, canSubmit }) {
  if (scenario === 'backfill') {
    return (
      <BackfillSetup team={team} attachments={s.attachments} onAttach={onAttach} onRemove={onRemove}
        onSelect={onSelectBackfillMember} onEditDriver={onEditDriver} entering={entering} />
    );
  }

  const meta = SCENARIOS.find(x => x.id === scenario);
  const copy = SETUP_COPY[scenario];

  return (
    <div style={{ width: '100%', minWidth: 0 }}>
      <DriverSummary title={meta.title} onEdit={onEditDriver} entering={entering} />

      {copy && (
        <SetupCard heading={copy.heading} subtext={copy.subtext} entering={entering}>
          <ScenarioWidget scenario={scenario} team={team} ctx={ctx} setCtx={setCtx} onAttach={onAttach} />
        </SetupCard>
      )}

      <Composer
        scenario={scenario}
        value={s.prompt}
        onChange={onChangePrompt}
        attachments={s.attachments}
        onAttach={onAttach}
        onRemove={onRemove}
        onSubmit={onSubmit}
        canSubmit={canSubmit}
      />
      <CompanyContextStrip company={s.company} />
    </div>
  );
}

function S1Landing({ onStart }) {
  const s = useSearchState();
  const ctx = s.scenarioContext || {};
  const setCtx = c => SearchState.set({ scenarioContext: c });
  const [transitionPhase, setTransitionPhase] = React.useState('idle');
  const [pendingScenario, setPendingScenario] = React.useState(null);
  const [searchMode,setSearchMode]=React.useState('agentic');
  const [regularCriteria,setRegularCriteria]=React.useState({title:'',location:'Bangalore',experience:'Any experience',seniority:'Any seniority',skills:''});
  const transitionTimer = React.useRef(null);

  React.useEffect(() => () => clearTimeout(transitionTimer.current), []);

  const attach = (type) => {
    const preset = {
      jd:      { name: s.jd ? s.jd.fileName : 'Job description.pdf', ref: 'jd-001' },
      profile: { name: 'Profile from URL', ref: 'profile-url' },
      doc:     { name: 'AI analytics product brief.pdf', ref: 'doc-001' },
    }[type];
    if (s.attachments.some(a => a.ref === preset.ref)) return;
    SearchState.set(st => ({ ...st, attachments: [...st.attachments, { id: `att-${Date.now()}`, type, ...preset }] }));
  };
  const removeAttachment = id => SearchState.set(st => ({ ...st, attachments: st.attachments.filter(a => a.id !== id) }));

  const canSubmit = s.prompt.trim().length > 0 || s.attachments.length > 0 || !!s.scenario;

  const submit = () => {
    if (!canSubmit) return;
    SearchState.push({ role: 'user', kind: 'brief', prompt: s.prompt, attachments: s.attachments, scenario: s.scenario, scenarioContext: ctx });
    onStart();
  };
  const submitRegular = () => {
    if (!regularCriteria.title.trim()) return;
    const parts=[regularCriteria.title,regularCriteria.location,regularCriteria.experience!=='Any experience'?regularCriteria.experience:null,regularCriteria.seniority!=='Any seniority'?regularCriteria.seniority:null,regularCriteria.skills].filter(Boolean);
    const prompt=`Find ${parts.join(' · ')}`;
    SearchState.set({prompt,scenario:null,scenarioContext:{},searchMode:'regular'});
    SearchState.push({role:'user',kind:'brief',prompt,attachments:s.attachments,scenario:null,scenarioContext:{},searchMode:'regular',criteria:regularCriteria});
    onStart();
  };

  // Every scenario settles the same way: the tile grid dissolves, a summary chip
  // settles in, and the setup card reveals. This runs both directions — picking a
  // scenario, and hitting Edit to go back to the grid.
  const selectScenario = id => {
    const next = s.scenario === id ? null : id;
    const commit = () => SearchState.set({
      scenario: next,
      scenarioContext: {},
      prompt: '',         // the composer's shape changed, so its content should not carry over
    });

    clearTimeout(transitionTimer.current);
    setPendingScenario(next);
    setTransitionPhase('resolving');
    transitionTimer.current = setTimeout(() => {
      commit();
      setTransitionPhase('entering');
      transitionTimer.current = setTimeout(() => {
        setPendingScenario(null);
        setTransitionPhase('idle');
      }, 640);
    }, 360);
  };

  const startBackfill = member => {
    const scenarioContext = { previousEmployeeId: member.id, preserve: [], evolve: [] };
    SearchState.set({ scenarioContext });
    SearchState.push({
      role: 'user', kind: 'brief', prompt: '', attachments: SearchState.get().attachments,
      scenario: 'backfill', scenarioContext,
    });
    onStart();
  };

  return (
    <div style={{
      width: '100%', minHeight: '100%',
      backgroundImage: 'url(assets/hero-bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'top center', backgroundRepeat: 'no-repeat',
    }}>
    <div style={{ width: '100%', maxWidth: 860, boxSizing: 'border-box', margin: '0 auto', padding: '56px 28px 96px' }}>
      <style>{`
        @keyframes s1MorphIn {
          from { opacity: 0; transform: translateY(9px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes s1SummarySettle {
          0% { opacity: 1; transform: translateY(7px) scale(.992); background: var(--green-100); box-shadow: 0 0 0 3px var(--green-200), var(--shadow-sm); }
          62% { opacity: 1; transform: translateY(-1px) scale(1); background: var(--green-100); }
          100% { opacity: 1; transform: translateY(0) scale(1); background: var(--white); }
        }
        @keyframes s1NextStepReveal {
          0% { opacity: 0; transform: translateY(18px) scale(.992); clip-path: inset(0 0 18% 0 round 12px); }
          100% { opacity: 1; transform: translateY(0) scale(1); clip-path: inset(0 0 0 0 round 12px); }
        }
        .s1-driver-card.is-resolving.is-selected {
          transform: translateY(-3px) scale(1.012);
          box-shadow: 0 0 0 3px var(--green-200), var(--shadow-md) !important;
        }
        .s1-driver-grid.is-resolving .s1-driver-card:not(.is-selected) {
          opacity: .22;
          transform: translateY(5px) scale(.985);
          pointer-events: none;
        }
        .s1-driver-heading.is-resolving { opacity: .36; transform: translateY(-3px); }
        .s1-driver-summary.is-entering { animation: s1SummarySettle 440ms cubic-bezier(0.16,1,0.3,1) both; }
        .s1-next-step.is-entering { animation: s1NextStepReveal 500ms 90ms cubic-bezier(0.16,1,0.3,1) both; }
        .s1-driver-wrap.is-entering { animation: s1MorphIn 380ms cubic-bezier(0.16,1,0.3,1) both; }
        .s1-setup.is-resolving {
          opacity: .3; transform: translateY(6px); pointer-events: none;
          transition: opacity 220ms ease, transform 300ms cubic-bezier(0.16,1,0.3,1);
        }
        @media (prefers-reduced-motion: reduce) {
          .s1-morph, .s1-driver-card, .s1-driver-heading, .s1-driver-summary, .s1-next-step, .s1-driver-wrap, .s1-setup { animation: none !important; transition: none !important; }
        }
      `}</style>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{marginBottom:22}}><SearchModeSwitch value={searchMode} onChange={setSearchMode}/></div>
        <h1 style={{ margin: 0, fontSize: 36, lineHeight: '40px', fontWeight: 700, color: 'var(--fg1)', letterSpacing: '-0.4px' }}>
          {searchMode==='agentic'?'Who are you looking for?':'Search for candidates'}
        </h1>
        <p style={{ margin: '10px 0 0', fontSize: 16, lineHeight: '24px', color: 'var(--fg2)' }}>
          {searchMode==='agentic'?"Start with why you're hiring. Ema works out the rest.":'Set the requirements you want candidates to match.'}
        </p>
      </div>

      <div className="s1-morph" style={{ width: '100%', minWidth: 0 }}>
        {searchMode==='regular'?<RegularSearchSetup criteria={regularCriteria} setCriteria={setRegularCriteria} onSubmit={submitRegular}/>:s.scenario ? (
          <div className={transitionPhase === 'resolving' ? 's1-setup is-resolving' : 's1-setup'}>
            <ScenarioSetup
              scenario={s.scenario} team={s.team} ctx={ctx} setCtx={setCtx} s={s}
              onAttach={attach} onRemove={removeAttachment}
              onSelectBackfillMember={startBackfill}
              onEditDriver={() => selectScenario(s.scenario)}
              entering={transitionPhase === 'entering'}
              onChangePrompt={v => SearchState.set({ prompt: v })}
              onSubmit={submit} canSubmit={canSubmit}
            />
          </div>
        ) : (
          <div className={transitionPhase === 'entering' ? 's1-driver-wrap is-entering' : 's1-driver-wrap'}>
            <div style={{ marginBottom: 20 }}>
              <div className={`s1-driver-heading${transitionPhase === 'resolving' ? ' is-resolving' : ''}`} style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12, transition: 'opacity 220ms ease, transform 300ms cubic-bezier(0.16,1,0.3,1)' }}>
                <h2 style={{ margin: 0, fontSize: 15, lineHeight: '22px', fontWeight: 700, color: 'var(--fg1)' }}>What's driving this hire?</h2>
                <span style={{ fontSize: 13, color: 'var(--fg3)' }}>This changes how Ema searches, not just how it labels the search.</span>
              </div>
              <div className={`s1-driver-grid${transitionPhase === 'resolving' ? ' is-resolving' : ''}`} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
                {SCENARIOS.map(sc => (
                  <ScenarioCard key={sc.id} scenario={sc} selected={s.scenario === sc.id || pendingScenario === sc.id}
                    resolving={transitionPhase === 'resolving'} onSelect={selectScenario} />
                ))}
              </div>
            </div>

            <div style={{ textAlign: 'center', padding: '18px 0 0', fontSize: 14, lineHeight: '20px', color: 'var(--fg3)', opacity: transitionPhase === 'resolving' ? .3 : 1, transform: transitionPhase === 'resolving' ? 'translateY(5px)' : 'translateY(0)', transition: 'opacity 220ms ease, transform 300ms cubic-bezier(0.16,1,0.3,1)' }}>
              Pick what's driving this hire and Ema will ask for what it actually needs.
              <br />
              Not sure? <button onClick={() => selectScenario('other')}
                style={{ border: 0, background: 'transparent', padding: 0, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 500, color: 'var(--green-800)', textDecoration: 'underline', textUnderlineOffset: 2 }}>
                just describe it
              </button>.
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}

Object.assign(window, { S1Landing, SCENARIOS });
