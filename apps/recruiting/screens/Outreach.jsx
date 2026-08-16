// Outreach — define intent once, personalize the batch, review only exceptions.

const DEFAULT_STRATEGY = {
  id: 'senior-product-designer', name: 'Senior Product Designer outreach',
  opportunity: 'Shape a new AI-native product area used by enterprise teams',
  whyHiring: 'We’re hiring a senior product designer to help define and launch it',
  angle: 'Connect their evidence of product ownership to the ambiguity and scale of the role',
  positioning: 'Position the role as an opportunity to shape a new AI-native product area from the ground up, with meaningful ownership over product direction and execution.',
  personalization: 'Find the strongest evidence of product ownership in each person’s experience. Connect it specifically to the ambiguity, influence, and enterprise scale of this role.',
  adaptations: [
    'When zero-to-one experience is strongest, emphasize the chance to define the product area. When experience at scale is stronger, connect it to Ema’s enterprise ambitions.',
    'If the evidence does not support a meaningful connection, do not force one.',
  ],
  boundaries: [
    'Be specific without overstating the person’s experience.',
    'Avoid generic praise and do not imply that they are actively looking.',
    'Keep the invitation low-pressure and ask for a 20-minute conversation with the hiring manager.',
  ],
  tone: 'Warm and direct', cta: 'A 20-minute conversation with the hiring manager',
  length: 'Concise', depth: 'Evidence-led',
  primaryChannel: 'Email', fallbackChannel: 'LinkedIn InMail', sender: 'Hiring manager',
};

// Named presets a recruiter can switch between for a shortlist. Selecting one reapplies
// it to every unapproved draft; approved messages are left alone (see switchStrategy).
const SAVED_STRATEGIES = [
  DEFAULT_STRATEGY,
  {
    ...DEFAULT_STRATEGY,
    id: 'enterprise-scale', name: 'Enterprise-scale angle',
    angle: 'Connect their enterprise judgment to the scale of Ema’s customers',
    positioning: 'Position the role as an opportunity to work at the scale and complexity of the enterprise systems Ema’s customers depend on, with direct influence over how those decisions hold up.',
    personalization: 'Lead with the strongest evidence of enterprise-scale ownership and connect it directly to the complexity Ema’s customers operate in.',
  },
  {
    ...DEFAULT_STRATEGY,
    id: 'fast-conversational', name: 'Fast, conversational outreach',
    positioning: 'Position the role as an opportunity worth a quick, low-commitment conversation rather than a full pitch up front.',
    tone: 'Conversational', length: 'Short', depth: 'Light',
    cta: 'A quick 15-minute call',
  },
];

function firstName(candidate) { return (candidate.name || '').split(' ')[0]; }
function candidateEvidence(candidate) {
  return (candidate.evidence && candidate.evidence[0] && candidate.evidence[0].text)
    || candidate.headline || `${candidate.title} experience at ${candidate.company}`;
}
function availableChannels(candidate) {
  const declared = candidate.contactChannels || {};
  return {
    email: declared.email !== false,
    linkedin: declared.linkedin !== false && Boolean(candidate.linkedin),
  };
}
function resolvedChannel(candidate, strategy) {
  const available = availableChannels(candidate);
  const primary = strategy.primaryChannel === 'LinkedIn InMail' ? 'linkedin' : 'email';
  const fallback = strategy.fallbackChannel === 'None' ? null : primary === 'email' ? 'linkedin' : 'email';
  if (available[primary]) return { channel:primary, fallback:false };
  if (fallback && available[fallback]) return { channel:fallback, fallback:true };
  return { channel:null, fallback:false };
}
function evidenceInSecondPerson(text) {
  const clean = String(text || '').trim().replace(/[.!]+$/, '');
  const replacements = [
    [/^Owns\b/, 'You own'], [/^Runs\b/, 'You run'], [/^Designs\b/, 'You design'],
    [/^Leads\b/, 'You lead'], [/^Led\b/, 'You led'], [/^Defined\b/, 'You defined'],
    [/^Created\b/, 'You created'], [/^Shipped\b/, 'You shipped'], [/^Worked\b/, 'You worked'],
    [/^Built\b/, 'You built'], [/^Ran\b/, 'You ran'], [/^Co-defined\b/, 'You co-defined'],
    [/^Founding designer twice\s*[—-]\s*took\b/, 'You were a founding designer twice and took'],
    [/^First designer on (.*?); took\b/, 'You were the first designer on $1 and took'],
    [/^Ten years across\b/, 'You have spent ten years across'],
    [/^Five years in\b/, 'You have spent five years in'],
    [/^Four years on\b/, 'You spent four years on'],
    [/^Three years on\b/, 'You have spent three years on'],
    [/^Two years on\b/, 'You have spent two years on'],
    [/^Six years designing\b/, 'You have spent six years designing'],
    [/^Exceptional craft\b/, 'Your exceptional craft'],
    [/^Entire career\b/, 'Your entire career'],
    [/^Every surface he's shipped\b/, 'Every surface you have shipped'],
  ];
  const match = replacements.find(([pattern]) => pattern.test(clean));
  const rewritten = match ? clean.replace(match[0], match[1]) : `Your experience includes ${clean.charAt(0).toLowerCase()}${clean.slice(1)}`;
  return `${rewritten}.`;
}
function opportunityPhrase(text) {
  const clean = String(text || '').trim().replace(/[.!]+$/, '');
  if (/^Shape\b/.test(clean)) return clean.replace(/^Shape\b/, 'shaping');
  if (/^Build\b/.test(clean)) return clean.replace(/^Build\b/, 'building');
  if (/^Lead\b/.test(clean)) return clean.replace(/^Lead\b/, 'leading');
  return `working on ${clean.charAt(0).toLowerCase()}${clean.slice(1)}`;
}
const LARGE_COMPANIES = new Set(['Google','Atlassian','Microsoft','Salesforce','ServiceNow','Palantir','SAP','Oracle']);
function isLargeCompanyCandidate(candidate) { return LARGE_COMPANIES.has(candidate.company); }
function hasLargeCompanyRefinement(strategy) {
  return Boolean(strategy&&strategy.largeCompanyTransitionRefined)||(strategy&&strategy.adaptations||[]).some(item=>/larger.*company|broader proximity|ownership you already/i.test(item));
}
function personalizeCandidate(candidate, strategy, manager) {
  const name = firstName(candidate);
  const sender = strategy.sender === 'Recruiter' ? 'Ema Talent Team' : manager ? firstName(manager) : 'Ananya';
  const evidence = candidateEvidence(candidate); const evidenceSentence = evidenceInSecondPerson(evidence);
  const secondEvidence = strategy.depth === 'Deep' && candidate.evidence && candidate.evidence[1]
    ? ` ${evidenceInSecondPerson(candidate.evidence[1].text)}` : '';
  const opportunity = opportunityPhrase(strategy.opportunity);
  const positionedOpportunity = strategy.positioning
    ? String(strategy.positioning).replace(/^Position the role as an opportunity to\s+/i, 'At Ema, you would have the opportunity to ').replace(/[.!]+$/, '')
    : `At Ema, we’re ${opportunity}`;
  const cta = String(strategy.cta || 'a short conversation').trim().replace(/^A\b/, 'a').replace(/[?.!]+$/, '');
  const transition = isLargeCompanyCandidate(candidate)
    ? hasLargeCompanyRefinement(strategy)
      ? ` Coming from ${candidate.company}, this role offers broader proximity to product direction and outcomes, while building on the ownership you already demonstrate.`
      : ` This would be a chance to step beyond a larger-company environment and take on more direct ownership.`
    : '';
  const resolution = resolvedChannel(candidate, strategy);
  const channel = resolution.channel || 'email';
  const body = channel === 'linkedin'
    ? `Hi ${name} — I came across your work at ${candidate.company}. ${evidenceSentence} ${positionedOpportunity}, and your background feels directly relevant. Would you be open to ${cta}? — ${sender}`
    : `Hi ${name},\n\nI came across your work at ${candidate.company}, and one detail stood out: ${evidenceSentence.charAt(0).toLowerCase()}${evidenceSentence.slice(1)}${secondEvidence}\n\n${positionedOpportunity}. ${strategy.whyHiring}.${transition} Your experience feels directly relevant to the ambiguity and ownership this role requires.\n\nWould you be open to ${cta} to explore whether there’s a fit?\n\n${sender}`;
  return {
    subject: channel === 'email' ? `Shaping a new AI product area at Ema` : '', evidence, body,
    status: resolution.channel ? 'ready' : 'channel-unavailable', usedFallback:resolution.fallback, channel:resolution.channel, approved: false, removed: false,
  };
}
function reviewStatus(candidate, index, total) {
  if (total >= 3 && index === total - 1) return 'weak-fit';
  if (index === 1 || (index > 1 && index % 4 === 0)) return 'needs-review';
  return 'ready';
}

const STATUS_META = {
  ready: { label: 'Ready', icon: 'check-circle', bg: 'var(--green-100)', fg: 'var(--green-800)' },
  'needs-review': { label: 'Needs judgment', icon: 'warning-circle', bg: 'var(--orange-100)', fg: 'var(--orange-800)' },
  'weak-fit': { label: 'Weak fit', icon: 'minus-circle', bg: 'var(--red-100)', fg: 'var(--red-800)' },
  'channel-unavailable': { label: 'Contact needed', icon: 'address-book', bg: 'var(--orange-100)', fg: 'var(--orange-800)' },
  approved: { label: 'Approved', icon: 'check-circle', bg: 'var(--green-200)', fg: 'var(--green-800)' },
  removed: { label: 'Excluded', icon: 'minus-circle', bg: 'var(--beige-200)', fg: 'var(--fg3)' },
};
function StatusPill({ status }) { const m = STATUS_META[status] || STATUS_META.ready; return <span style={{ display:'inline-flex',alignItems:'center',gap:5,fontSize:11,fontWeight:600,color:m.fg,whiteSpace:'nowrap' }}><i className={`ph ph-${m.icon}`} style={{fontSize:13}}/>{m.label}</span>; }
function CompanyLogoBubble({candidate,size=36}) { return <span title={candidate.company} style={{width:size,height:size,flex:`0 0 ${size}px`,borderRadius:'50%',display:'inline-flex',alignItems:'center',justifyContent:'center',background:'var(--white)',border:'1px solid var(--beige-400)',boxShadow:'var(--shadow-xs)',overflow:'hidden'}}><CompanyMark name={candidate.company} size={Math.round(size*.68)}/></span>; }
function UpdateShimmer({label='Updating'}) { return <span aria-label={label} role="status" style={{position:'absolute',inset:0,zIndex:4,overflow:'hidden',pointerEvents:'none',background:'rgba(255,255,255,.46)'}}><style>{`@keyframes emaOutreachShimmer{0%{transform:translateX(-120%)}100%{transform:translateX(220%)}}`}</style><span style={{position:'absolute',top:0,bottom:0,left:0,width:'42%',background:'linear-gradient(90deg,transparent,rgba(184,228,194,.35),rgba(220,239,255,.76),rgba(229,220,255,.4),transparent)',animation:'emaOutreachShimmer 1.05s ease-in-out infinite'}}/></span>; }
function TinyLabel({ children }) { return <div style={{ marginBottom:7,fontSize:10,fontWeight:700,letterSpacing:1.05,textTransform:'uppercase',color:'var(--fg3)' }}>{children}</div>; }
function StrategyField({ label, value, onChange, multiline=false }) {
  const shared={width:'100%',border:'1px solid var(--beige-400)',borderRadius:8,background:'var(--white)',padding:'9px 10px',outline:0,color:'var(--fg1)',fontSize:13,lineHeight:'19px',fontFamily:'inherit'};
  return <div style={{marginBottom:14}}><TinyLabel>{label}</TinyLabel>{multiline?<textarea value={value} onChange={e=>onChange(e.target.value)} rows={2} style={{...shared,resize:'vertical'}}/>:<input value={value} onChange={e=>onChange(e.target.value)} style={shared}/>}</div>;
}
function SegmentedControl({label,value,options,onChange}) { return <div style={{marginBottom:14}}><TinyLabel>{label}</TinyLabel><div style={{display:'flex',padding:3,borderRadius:9,background:'var(--beige-200)',gap:2}}>{options.map(option=><button key={option} onClick={()=>onChange(option)} style={{flex:1,minHeight:28,padding:'4px 7px',border:0,borderRadius:7,cursor:'pointer',fontFamily:'inherit',fontSize:11,fontWeight:value===option?600:400,color:value===option?'var(--fg1)':'var(--fg3)',background:value===option?'var(--white)':'transparent',boxShadow:value===option?'var(--shadow-xs)':'none'}}>{option}</button>)}</div></div>; }

function ChannelAvailability({candidates=[],strategy}) {
  if (!candidates.length) return null;
  const results=candidates.map(candidate=>resolvedChannel(candidate,strategy));
  const primaryCount=results.filter(result=>result.channel&&!result.fallback).length;
  const fallbackCount=results.filter(result=>result.fallback).length;
  const blockedCount=results.filter(result=>!result.channel).length;
  return <div style={{margin:'0 0 14px',padding:11,border:`1px solid ${blockedCount?'var(--orange-300)':'var(--beige-300)'}`,borderRadius:9,background:blockedCount?'var(--orange-100)':'var(--beige-100)'}}><div style={{display:'flex',alignItems:'center',gap:7,fontSize:11,fontWeight:700,color:'var(--fg1)',marginBottom:7}}><i className={`ph ph-${blockedCount?'warning-circle':'check-circle'}`} style={{color:blockedCount?'var(--orange-800)':'var(--green-800)'}}/>Channel coverage</div><div style={{display:'flex',gap:12,flexWrap:'wrap',fontSize:11,color:'var(--fg2)'}}><span><strong>{primaryCount}</strong> primary</span>{fallbackCount>0&&<span><strong>{fallbackCount}</strong> use fallback</span>}{blockedCount>0&&<span style={{color:'var(--orange-800)'}}><strong>{blockedCount}</strong> need contact details</span>}</div>{blockedCount>0&&<div style={{fontSize:10,lineHeight:'16px',color:'var(--fg3)',marginTop:6}}>Messages can still be created. Candidates without a reachable channel will appear as exceptions.</div>}</div>;
}

function ConversationGuide({strategy,onSuggestion}) { return <div style={{padding:'22px 18px',height:'100%',overflowY:'auto'}}>
  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:22}}><span style={{width:28,height:28,borderRadius:8,background:'var(--ai-magic-bg-subtle)',color:'var(--ai-magic)',display:'inline-flex',alignItems:'center',justifyContent:'center'}}><i className="ph ph-magic-wand"/></span><div><div style={{fontSize:13,fontWeight:700}}>Build with Ema</div><div style={{fontSize:11,color:'var(--fg3)'}}>Shared outreach strategy</div></div></div>
  <div style={{fontSize:15,lineHeight:'23px',fontWeight:500,marginBottom:8}}>What should make this opportunity compelling?</div><p style={{margin:'0 0 15px',fontSize:13,lineHeight:'20px',color:'var(--fg2)'}}>Choose an angle to start. You can refine the language in the strategy.</p>
  <div style={{display:'flex',flexDirection:'column',gap:7}}>{[['Own a new product area','Connect their product ownership to a new 0→1 initiative'],['Shape the AI experience','Lead with their experience making complex technology usable'],['Work at enterprise scale','Connect their enterprise judgment to the scale of Ema’s customers']].map(([label,value])=><button key={label} onClick={()=>onSuggestion(value)} style={{display:'flex',justifyContent:'space-between',alignItems:'center',textAlign:'left',padding:'10px 11px',borderRadius:8,border:`1px solid ${strategy.angle===value?'var(--green-600)':'var(--beige-400)'}`,background:strategy.angle===value?'var(--green-100)':'var(--white)',color:'var(--fg1)',cursor:'pointer',fontFamily:'inherit',fontSize:12,lineHeight:'17px'}}>{label}<i className="ph ph-arrow-right" style={{color:'var(--fg3)'}}/></button>)}</div>
  <div style={{marginTop:24,padding:12,borderRadius:10,background:'var(--ai-magic-bg-subtle)',border:'1px solid var(--purple-200)'}}><div style={{display:'flex',gap:7,alignItems:'center',color:'var(--ai-magic)',fontSize:11,fontWeight:700,marginBottom:7}}><i className="ph ph-sparkle"/>What Ema will vary</div><div style={{fontSize:12,lineHeight:'18px',color:'var(--fg2)'}}>Only the candidate-specific evidence and connecting sentence. The opportunity, tone, and call to action stay consistent.</div></div>
</div>; }

function StrategyBuilder({strategy,setStrategy,count,candidates=[],onGenerate}) { const patch=value=>setStrategy(current=>({...current,...value})); return <div style={{display:'grid',gridTemplateColumns:'300px minmax(520px,720px)',justifyContent:'center',minHeight:'100%'}}>
  <aside style={{borderRight:'1px solid var(--beige-300)',background:'var(--beige-50)'}}><ConversationGuide strategy={strategy} onSuggestion={angle=>patch({angle})}/></aside>
  <main style={{padding:'28px 36px 72px'}}><div style={{marginBottom:24}}><div style={{fontSize:12,color:'var(--green-800)',fontWeight:600,marginBottom:7}}>Manual setup · {count} shortlisted candidates</div><h1 style={{margin:0,fontSize:24,lineHeight:'32px',fontWeight:700}}>Configure outreach strategy</h1><p style={{margin:'7px 0 0',color:'var(--fg2)',fontSize:14,lineHeight:'21px'}}>Set the shared message guidance and delivery preferences. Ema will still ground each personalized claim in candidate evidence.</p></div>
  <div style={{padding:20,border:'1px solid var(--beige-400)',borderRadius:12,background:'var(--white)',boxShadow:'var(--shadow-sm)'}}><div style={{display:'flex',gap:10,alignItems:'center',marginBottom:20}}><span style={{width:34,height:34,borderRadius:9,background:'var(--ai-magic-bg-subtle)',color:'var(--ai-magic)',display:'inline-flex',alignItems:'center',justifyContent:'center'}}><i className="ph ph-strategy"/></span><div><div style={{fontSize:15,fontWeight:700}}>Shared strategy</div><div style={{fontSize:12,color:'var(--fg3)'}}>Applied to every candidate</div></div></div>
  <StrategyField label="Strategy name" value={strategy.name} onChange={name=>patch({name})}/><StrategyField label="The opportunity" value={strategy.opportunity} onChange={opportunity=>patch({opportunity})} multiline/><StrategyField label="Why you are hiring" value={strategy.whyHiring} onChange={whyHiring=>patch({whyHiring})} multiline/><StrategyField label="Message angle" value={strategy.angle} onChange={angle=>patch({angle})} multiline/>
  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}><SegmentedControl label="Tone" value={strategy.tone} options={['Direct','Warm and direct','Conversational']} onChange={tone=>patch({tone})}/><SegmentedControl label="Length" value={strategy.length} options={['Short','Concise','Detailed']} onChange={length=>patch({length})}/></div>
  <StrategyField label="Call to action" value={strategy.cta} onChange={cta=>patch({cta})}/><SegmentedControl label="Personalization" value={strategy.depth} options={['Light','Evidence-led','Deep']} onChange={depth=>patch({depth})}/><ChannelAvailability candidates={candidates} strategy={strategy}/></div>
  <div style={{display:'flex',alignItems:'center',marginTop:18}}><span style={{color:'var(--fg3)',fontSize:12}}><i className="ph ph-shield-check" style={{marginRight:6}}/>Every personalized claim will show its source.</span><span style={{flex:1}}/><Button variant="primary" color="brand" icon="magic-wand" onClick={onGenerate}>Personalize {count} messages</Button></div></main>
</div>; }

function OutreachStrategyDrawer({ count, candidates = [], initialStrategy, onClose, onGenerate, embedded = false }) {
  const [strategy, setStrategy] = React.useState(initialStrategy || DEFAULT_STRATEGY);
  const [editing, setEditing] = React.useState(null);
  const [showDelivery, setShowDelivery] = React.useState(false);
  const patch = value => setStrategy(current => ({ ...current, ...value }));
  const normalized = {
    positioning: strategy.positioning || `Position the role as an opportunity to ${String(strategy.opportunity || '').replace(/^./, value => value.toLowerCase())}.`,
    personalization: strategy.personalization || strategy.angle,
    adaptations: strategy.adaptations || DEFAULT_STRATEGY.adaptations,
    boundaries: strategy.boundaries || DEFAULT_STRATEGY.boundaries,
  };
  const updateList = (key, index, value) => patch({ [key]:normalized[key].map((item,i)=>i===index?value:item) });
  const addListItem = key => patch({ [key]:[...normalized[key], ''] });
  const removeListItem = (key, index) => patch({ [key]:normalized[key].filter((_, i) => i !== index) });
  const EditableList = ({id, keyName, items, bulletIcon}) => <div style={{display:'flex',flexDirection:'column',gap:editing===id?6:10}}>
    {items.map((item,index)=>editing===id?(
      <div key={index} style={{display:'flex',gap:6,alignItems:'flex-start'}}>
        <textarea rows={2} value={item} onChange={e=>updateList(keyName,index,e.target.value)} style={{...textStyle,flex:1}}/>
        <button onClick={()=>removeListItem(keyName,index)} title="Remove" style={{flex:'0 0 auto',width:28,height:28,marginTop:2,border:0,borderRadius:6,background:'transparent',color:'var(--fg3)',cursor:'pointer',display:'inline-flex',alignItems:'center',justifyContent:'center'}}><i className="ph ph-trash" style={{fontSize:13}}/></button>
      </div>
    ):(
      <div key={index} style={{display:'flex',gap:9,fontSize:12.5,lineHeight:'20px',color:'var(--fg2)'}}>
        {bulletIcon || <span style={{width:4,height:4,marginTop:8,borderRadius:'50%',background:'var(--beige-600, var(--fg3))',flex:'0 0 auto'}}/>}
        <span>{item}</span>
      </div>
    ))}
    {editing===id && <button onClick={()=>addListItem(keyName)} style={{alignSelf:'flex-start',border:0,background:'transparent',color:'var(--green-800)',fontFamily:'inherit',fontSize:11,fontWeight:600,cursor:'pointer',display:'inline-flex',alignItems:'center',gap:4,padding:0}}><i className="ph ph-plus" style={{fontSize:11}}/>Add point</button>}
  </div>;
  const StrategySection = ({id,icon,title,description,children}) => <section style={{padding:'14px 16px',marginBottom:10,border:'1px solid var(--beige-300)',borderRadius:12,background:'var(--white)',boxShadow:'var(--shadow-xs)'}}>
    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
      <i className={`ph ph-${icon}`} style={{fontSize:15,color:'var(--fg3)',flex:'0 0 auto'}}/>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:13,fontWeight:700,color:'var(--fg1)'}}>{title}</div>
        <div style={{fontSize:11,color:'var(--fg3)',marginTop:1}}>{description}</div>
      </div>
      <button onClick={()=>setEditing(editing===id?null:id)} style={{border:0,background:'transparent',color:'var(--green-800)',fontFamily:'inherit',fontSize:11,fontWeight:600,cursor:'pointer',flex:'0 0 auto'}}>{editing===id?'Done':'Edit'}</button>
    </div>
    {children}
  </section>;
  const textStyle={width:'100%',padding:10,border:'1px solid var(--beige-400)',borderRadius:8,background:'var(--white)',fontFamily:'inherit',fontSize:12,lineHeight:'19px',color:'var(--fg1)',resize:'vertical',outline:0};
  const panel = <aside style={{ width:680,flex:'0 0 680px',maxWidth:'calc(100vw - 72px)',height:embedded?'calc(100vh - 56px)':'100%',position:embedded?'sticky':'relative',top:0,borderLeft:embedded?'1px solid var(--beige-300)':0,background:'var(--beige-50)',boxShadow:embedded?'none':'var(--shadow-lg)',display:'flex',flexDirection:'column',animation:'emaOutreachDrawerIn 260ms cubic-bezier(.16,1,.3,1)' }}>
      <style>{`@keyframes emaOutreachDrawerIn{from{transform:translateX(28px);opacity:.5}to{transform:translateX(0);opacity:1}}`}</style>
      <header style={{ display:'flex',alignItems:'center',gap:8,padding:'12px 16px',borderBottom:'1px solid var(--beige-300)',background:'var(--white)',flex:'0 0 auto' }}>
        <div style={{minWidth:0}}><div style={{fontSize:14,fontWeight:700,color:'var(--fg1)'}}>Outreach strategy</div><div style={{marginTop:1,fontSize:12,color:'var(--fg3)'}}>Instructions Ema will use for {count} message{count===1?'':'s'}</div></div><span style={{flex:1}}/><IconButton icon="x" size="sm" title="Close" onClick={onClose}/>
      </header>
      <div style={{ flex:1,overflowY:'auto',padding:22 }}>
        <StrategySection id="positioning" icon="flag-banner" title="Position the opportunity" description="The story every message should communicate">{editing==='positioning'?<textarea rows={4} value={normalized.positioning} onChange={e=>patch({positioning:e.target.value})} style={textStyle}/>:<p style={{margin:0,fontSize:13,lineHeight:'21px',color:'var(--fg2)'}}>{normalized.positioning}</p>}</StrategySection>
        <StrategySection id="personalization" icon="link" title="Personalize the case" description="How Ema should connect the person’s experience">{editing==='personalization'?<textarea rows={4} value={normalized.personalization} onChange={e=>patch({personalization:e.target.value})} style={textStyle}/>:<p style={{margin:0,fontSize:13,lineHeight:'21px',color:'var(--fg2)'}}>{normalized.personalization}</p>}</StrategySection>
        <StrategySection id="adaptations" icon="git-branch" title="Adapt when relevant" description="Context Ema should account for, not rigid message rules"><EditableList id="adaptations" keyName="adaptations" items={normalized.adaptations}/></StrategySection>
        <StrategySection id="boundaries" icon="shield-check" title="Keep in mind" description="Boundaries Ema should preserve across messages"><EditableList id="boundaries" keyName="boundaries" items={normalized.boundaries} bulletIcon={<i className="ph ph-check" style={{marginTop:3,color:'var(--green-700, var(--green-800))',fontSize:13}}/>}/></StrategySection>
        <button onClick={()=>setShowDelivery(value=>!value)} style={{width:'100%',marginTop:4,padding:'11px 12px',display:'flex',alignItems:'center',border:'1px solid var(--beige-400)',borderRadius:9,background:'var(--white)',fontFamily:'inherit',cursor:'pointer',textAlign:'left'}}><i className="ph ph-paper-plane-tilt" style={{marginRight:8,color:'var(--fg3)'}}/><span><strong style={{display:'block',fontSize:12}}>Delivery preferences</strong><span style={{fontSize:10,color:'var(--fg3)'}}>{strategy.primaryChannel || 'Email'} · Send as {String(strategy.sender || 'Hiring manager').toLowerCase()}</span></span><span style={{flex:1}}/><i className={`ph ph-caret-${showDelivery?'up':'down'}`} style={{color:'var(--fg3)'}}/></button>
        {showDelivery&&<div style={{padding:'14px 14px 0',border:'1px solid var(--beige-400)',borderTop:0,borderRadius:'0 0 9px 9px',background:'var(--white)'}}><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}><SegmentedControl label="Channel" value={strategy.primaryChannel || 'Email'} options={['Email','LinkedIn InMail']} onChange={primaryChannel=>patch({primaryChannel})}/><SegmentedControl label="Send as" value={strategy.sender || 'Hiring manager'} options={['Hiring manager','Recruiter']} onChange={sender=>patch({sender})}/></div><ChannelAvailability candidates={candidates} strategy={strategy}/></div>}
      </div>
      <footer style={{ minHeight:68,padding:'12px 20px',display:'flex',alignItems:'center',borderTop:'1px solid var(--beige-300)',background:'var(--white)' }}><span style={{fontSize:11,color:'var(--fg3)'}}><i className="ph ph-arrows-clockwise" style={{marginRight:5}}/>Feedback on messages can improve this strategy.</span><span style={{flex:1}}/><Button variant="secondary" color="brand" onClick={onClose}>Cancel</Button><span style={{width:8}}/><Button variant="primary" color="brand" icon="magic-wand" onClick={()=>onGenerate({...strategy,...normalized})}>Create {count} messages</Button></footer>
    </aside>;
  return embedded ? panel : <div style={{ position:'fixed',inset:0,zIndex:40,background:'rgba(35,33,25,.26)',display:'flex',justifyContent:'flex-end' }} onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}>{panel}</div>;
}

function SummaryStat({value,label,tone}) { return <div style={{minWidth:116,padding:'12px 14px',borderRight:'1px solid var(--beige-300)'}}><div style={{fontSize:22,lineHeight:'26px',fontWeight:700,color:tone||'var(--fg1)'}}>{value}</div><div style={{fontSize:11,color:'var(--fg3)',marginTop:2}}>{label}</div></div>; }

function StrategyOptionCard({option,active,onClick}) {
  return <button onClick={onClick} role="option" aria-selected={active} style={{display:'flex',alignItems:'flex-start',gap:10,width:'100%',padding:'9px 10px',border:0,borderRadius:8,background:active?'var(--green-100)':'transparent',cursor:'pointer',textAlign:'left',fontFamily:'inherit'}}>
    <span style={{width:26,height:26,flex:'0 0 26px',marginTop:1,borderRadius:7,background:active?'var(--green-200)':'var(--beige-200)',color:active?'var(--green-800)':'var(--fg3)',display:'inline-flex',alignItems:'center',justifyContent:'center'}}><i className="ph ph-strategy" style={{fontSize:13}}/></span>
    <span style={{flex:1,minWidth:0}}>
      <span style={{display:'block',fontSize:12.5,fontWeight:700,color:'var(--fg1)'}}>{option.name}</span>
      <span style={{display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden',marginTop:2,fontSize:11,lineHeight:'16px',color:'var(--fg3)'}}>{option.positioning}</span>
    </span>
    {active&&<i className="ph ph-check" style={{marginTop:3,color:'var(--green-800)',fontSize:14,flex:'0 0 auto'}}/>}
  </button>;
}

function StrategySelector({strategy,savedStrategies=SAVED_STRATEGIES,onSelect,onEdit,onCreate,compact=false,updating=false}) {
  const [open,setOpen]=React.useState(false);
  const rootRef=React.useRef(null);
  React.useEffect(()=>{
    if(!open)return;
    const closeIfOutside=event=>{ if(rootRef.current&&!rootRef.current.contains(event.target))setOpen(false); };
    document.addEventListener('mousedown',closeIfOutside);
    return ()=>document.removeEventListener('mousedown',closeIfOutside);
  },[open]);
  const name=(strategy&&strategy.name)||DEFAULT_STRATEGY.name;
  const positioning=(strategy&&strategy.positioning)||DEFAULT_STRATEGY.positioning;
  const activeId=strategy&&strategy.id;
  return <div ref={rootRef} aria-busy={updating} style={{position:'relative',marginBottom:compact?16:18}}>
    <TinyLabel>Applying strategy</TinyLabel>
    <button aria-haspopup="listbox" aria-expanded={open} onClick={()=>setOpen(value=>!value)} style={{position:'relative',width:'100%',display:'flex',alignItems:'flex-start',gap:11,padding:compact?'9px 11px':'12px 14px',border:`1px solid ${open?'var(--green-500)':'var(--beige-400)'}`,borderRadius:10,background:'var(--white)',boxShadow:compact?'none':'var(--shadow-xs)',cursor:'pointer',textAlign:'left',fontFamily:'inherit',overflow:'hidden'}}>
      <span style={{width:compact?28:32,height:compact?28:32,flex:`0 0 ${compact?28:32}px`,borderRadius:8,background:'var(--green-100)',color:'var(--green-800)',display:'inline-flex',alignItems:'center',justifyContent:'center'}}><i className="ph ph-strategy"/></span>
      <span style={{flex:1,minWidth:0}}>
        <span style={{display:'block',fontSize:compact?12:13,fontWeight:700,color:'var(--fg1)'}}>{name}</span>
        <span style={{display:'-webkit-box',WebkitLineClamp:compact?1:2,WebkitBoxOrient:'vertical',overflow:'hidden',marginTop:3,fontSize:compact?10.5:12,lineHeight:compact?'16px':'18px',color:'var(--fg2)'}}>{positioning}</span>
      </span>
      <i className={`ph ph-caret-${open?'up':'down'}`} style={{marginTop:3,color:'var(--fg3)',flex:'0 0 auto'}}/>
      {updating&&<UpdateShimmer label="Updating outreach strategy"/>}
    </button>
    {open&&<div role="listbox" style={{position:'absolute',zIndex:12,top:'100%',left:0,right:0,marginTop:6,padding:6,border:'1px solid var(--beige-400)',borderRadius:11,background:'var(--white)',boxShadow:'var(--shadow-lg, var(--shadow-md))'}}>
      {savedStrategies.map(option=><StrategyOptionCard key={option.id} option={option} active={option.id===activeId} onClick={()=>{onSelect&&onSelect(option);setOpen(false);}}/>)}
      <div style={{marginTop:4,paddingTop:4,borderTop:'1px solid var(--beige-300)'}}>
        <button onClick={()=>{setOpen(false);onCreate&&onCreate();}} style={{width:'100%',display:'flex',alignItems:'center',gap:8,padding:'8px 10px',border:0,borderRadius:8,background:'transparent',color:'var(--green-800)',fontFamily:'inherit',fontSize:12,fontWeight:600,cursor:'pointer'}}><i className="ph ph-plus-circle"/>Create new strategy</button>
        <button onClick={()=>{setOpen(false);onEdit&&onEdit();}} style={{width:'100%',display:'flex',alignItems:'center',gap:8,padding:'8px 10px',border:0,borderRadius:8,background:'transparent',color:'var(--fg2)',fontFamily:'inherit',fontSize:12,fontWeight:600,cursor:'pointer'}}><i className="ph ph-pencil-simple"/>Edit this strategy</button>
      </div>
    </div>}
  </div>;
}
function ChannelPill({channel}) { const linkedin=channel==='linkedin'; const unavailable=!channel; return <span style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:11,fontWeight:600,color:unavailable?'var(--orange-800)':'var(--fg3)',whiteSpace:'nowrap'}}>{unavailable?<i className="ph ph-address-book"/>:linkedin?<LinkedIn size={12}/>:<i className="ph ph-envelope-simple"/>}{unavailable?'No channel':linkedin?'LinkedIn':'Email'}</span>; }
function BatchRow({candidate,draft,active,onClick,updating=false}) { const status=draft.removed?'removed':draft.approved?'approved':draft.status; return <button onClick={onClick} aria-busy={updating} style={{position:'relative',overflow:'hidden',width:'100%',display:'grid',gridTemplateColumns:'minmax(220px,1.35fr) minmax(220px,1.7fr) 78px 112px 20px',gap:12,alignItems:'center',minHeight:68,padding:'10px 16px',border:0,borderBottom:'1px solid var(--beige-300)',background:active?'var(--beige-100)':'var(--white)',textAlign:'left',cursor:'pointer',fontFamily:'inherit',opacity:draft.removed?.58:1}}>
  <span style={{display:'flex',gap:10,alignItems:'center',minWidth:0}}><CompanyLogoBubble candidate={candidate} size={34}/><span style={{minWidth:0}}><strong style={{display:'block',fontSize:13,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{candidate.name}</strong><span style={{display:'block',fontSize:11,color:'var(--fg3)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{candidate.title} · {candidate.company}</span></span></span>
  <span style={{minWidth:0,fontSize:12,lineHeight:'18px',color:'var(--fg2)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{draft.status==='ready'?draft.usedFallback?'Primary unavailable · routed to fallback':draft.evidence:draft.status==='channel-unavailable'?'No reachable email or LinkedIn channel':draft.status==='needs-review'?'Evidence supports the role, but the message angle is broad.':'Limited evidence for the shared message angle.'}</span><ChannelPill channel={draft.channel}/><StatusPill status={status}/><i className="ph ph-caret-right" style={{color:'var(--fg3)'}}/>{updating&&<UpdateShimmer label={`Updating ${candidate.name}'s message`}/>}</button>; }

function CandidateReview({candidate,draft,onChange,onClose,onApprove,onRemove}) { const [confirmExclude,setConfirmExclude]=React.useState(false); return <aside style={{width:420,flex:'0 0 420px',borderLeft:'1px solid var(--beige-300)',background:'var(--beige-50)',height:'100%',overflowY:'auto'}}><div style={{height:56,padding:'0 16px',display:'flex',alignItems:'center',borderBottom:'1px solid var(--beige-300)'}}><strong style={{fontSize:14}}>Review personalization</strong><span style={{flex:1}}/><IconButton icon="x" onClick={onClose}/></div><div style={{padding:18}}>
  <div style={{display:'flex',gap:10,alignItems:'center',marginBottom:18}}><CompanyLogoBubble candidate={candidate} size={40}/><div><div style={{fontSize:15,fontWeight:700}}>{candidate.name}</div><div style={{fontSize:12,color:'var(--fg3)'}}>{candidate.title} at {candidate.company}</div></div></div>
  {draft.status!=='ready'&&<div style={{padding:11,marginBottom:16,display:'flex',gap:8,border:`1px solid ${draft.status==='weak-fit'?'var(--red-300)':'var(--orange-300)'}`,borderRadius:9,background:draft.status==='weak-fit'?'var(--red-100)':'var(--orange-100)',fontSize:12,lineHeight:'18px',color:'var(--fg2)'}}><i className={`ph ph-${draft.status==='weak-fit'?'minus-circle':'warning-circle'}`} style={{marginTop:2}}/><span><strong style={{color:'var(--fg1)'}}>{draft.status==='weak-fit'?'The shared angle may be a weak fit.':'The evidence could be more specific.'}</strong><br/>Review the highlighted evidence before approving.</span></div>}
  <TinyLabel>Evidence Ema used</TinyLabel><div style={{padding:11,marginBottom:16,border:'1px solid var(--purple-200)',borderRadius:9,background:'var(--ai-magic-bg-subtle)',fontSize:12,lineHeight:'18px'}}><i className="ph ph-quotes" style={{color:'var(--ai-magic)',marginRight:7}}/>{draft.evidence}</div>
  <div style={{display:'flex',alignItems:'center',marginBottom:7}}><TinyLabel>Complete message</TinyLabel><span style={{flex:1}}/><ChannelPill channel={draft.channel}/></div>{draft.channel!=='linkedin'&&<input value={draft.subject} onChange={e=>onChange({subject:e.target.value})} style={{width:'100%',padding:'10px 11px',border:'1px solid var(--beige-400)',borderRadius:'9px 9px 0 0',background:'var(--white)',outline:0,fontWeight:600,fontSize:12}}/>}<textarea value={draft.body} onChange={e=>onChange({body:e.target.value})} rows={13} style={{width:'100%',padding:11,border:'1px solid var(--beige-400)',borderTop:draft.channel!=='linkedin'?0:'1px solid var(--beige-400)',borderRadius:draft.channel!=='linkedin'?'0 0 9px 9px':9,background:'var(--white)',outline:0,resize:'vertical',fontFamily:'inherit',fontSize:12,lineHeight:'19px'}}/>
  {confirmExclude&&!draft.removed&&<div style={{marginTop:16,padding:12,border:'1px solid var(--red-300)',borderRadius:9,background:'var(--red-50)'}}><div style={{fontSize:12,fontWeight:700,color:'var(--fg1)',marginBottom:4}}>Exclude {firstName(candidate)} from this outreach?</div><div style={{fontSize:11,lineHeight:'17px',color:'var(--fg2)',marginBottom:11}}>They will remain in the shortlist. This only removes their draft from the current outreach group.</div><div style={{display:'flex',justifyContent:'flex-end',gap:8}}><Button variant="ghost" color="brand" size="sm" onClick={()=>setConfirmExclude(false)}>Cancel</Button><Button variant="secondary" color="destructive" size="sm" icon="minus-circle" onClick={()=>{onRemove();setConfirmExclude(false);}}>Exclude from outreach</Button></div></div>}
  <div style={{display:'flex',gap:8,marginTop:16}}>{draft.removed?<Button variant="secondary" color="brand" icon="plus-circle" onClick={onRemove}>Add back to outreach</Button>:<Button variant="ghost" color="destructive" icon="minus-circle" onClick={()=>setConfirmExclude(true)}>Exclude from outreach</Button>}<span style={{flex:1}}/><Button variant="primary" color="brand" icon="check" onClick={onApprove}>{draft.approved?'Approved':'Approve'}</Button></div></div></aside>; }

function LegacyBatchReview({people,drafts,onDraftChange,onBack,strategy}) { const [selectedId,setSelectedId]=React.useState(null); const ready=people.filter(p=>drafts[p.id]&&drafts[p.id].status==='ready'&&!drafts[p.id].approved&&!drafts[p.id].removed); const review=people.filter(p=>drafts[p.id]&&drafts[p.id].status==='needs-review'&&!drafts[p.id].removed); const weak=people.filter(p=>drafts[p.id]&&drafts[p.id].status==='weak-fit'&&!drafts[p.id].removed); const approved=people.filter(p=>drafts[p.id]&&drafts[p.id].approved&&!drafts[p.id].removed); const removed=people.filter(p=>drafts[p.id]&&drafts[p.id].removed); const selected=people.find(p=>p.id===selectedId); const approveReady=()=>ready.forEach(p=>onDraftChange(p.id,{approved:true})); const sections=[['Needs your review',[...review,...weak]],['Ready to approve',ready]]; return <div style={{display:'flex',height:'100%',minHeight:0}}><main style={{flex:1,minWidth:0,overflowY:'auto',padding:'24px 28px 64px'}}><div style={{maxWidth:1040,margin:'0 auto'}}>
  <div style={{display:'flex',alignItems:'flex-start',marginBottom:18}}><div><button onClick={onBack} style={{border:0,padding:0,marginBottom:8,background:'transparent',color:'var(--green-800)',cursor:'pointer',fontFamily:'inherit',fontSize:12}}><i className="ph ph-arrow-left" style={{marginRight:5}}/>Edit strategy</button><h1 style={{margin:0,fontSize:24,lineHeight:'32px'}}>Review personalized outreach</h1><p style={{margin:'6px 0 0',fontSize:13,color:'var(--fg2)'}}>Ema found {review.length+weak.length} message{review.length+weak.length===1?'':'s'} that need attention. The rest can be approved together.</p><div style={{display:'flex',alignItems:'center',gap:7,marginTop:8,fontSize:11,color:'var(--fg3)'}}><ChannelPill channel={(strategy&&strategy.primaryChannel)==='LinkedIn InMail'?'linkedin':'email'}/><span>Primary</span>{strategy&&strategy.fallbackChannel&&strategy.fallbackChannel!=='None'&&<><i className="ph ph-arrow-right"/><ChannelPill channel={strategy.fallbackChannel==='LinkedIn InMail'?'linkedin':'email'}/><span>Fallback</span></>}</div></div><span style={{flex:1}}/><Button variant="primary" color="brand" icon="checks" onClick={approveReady}>Approve {ready.length} ready</Button></div>
  <div style={{display:'flex',border:'1px solid var(--beige-400)',borderRadius:12,background:'var(--white)',overflow:'hidden',marginBottom:20}}><SummaryStat value={people.length} label="Selected"/><SummaryStat value={approved.length} label="Approved" tone="var(--green-800)"/><SummaryStat value={review.length} label="Need review" tone="var(--orange-800)"/><SummaryStat value={weak.length} label="Weak fit" tone="var(--red-800)"/><SummaryStat value={removed.length} label="Excluded"/></div>
  {sections.map(([label,candidates])=>candidates.length>0&&<section key={label} style={{marginBottom:20}}><div style={{display:'flex',alignItems:'center',marginBottom:8}}><strong style={{fontSize:13}}>{label}</strong><span style={{marginLeft:7,fontSize:11,color:'var(--fg3)'}}>{candidates.length}</span></div><div style={{border:'1px solid var(--beige-400)',borderRadius:12,background:'var(--white)',overflow:'hidden'}}>{candidates.map(candidate=><BatchRow key={candidate.id} candidate={candidate} draft={drafts[candidate.id]} active={selectedId===candidate.id} onClick={()=>setSelectedId(candidate.id)}/>)}</div></section>)}</div></main>
  {selected&&<CandidateReview candidate={selected} draft={drafts[selected.id]} onClose={()=>setSelectedId(null)} onChange={patch=>onDraftChange(selected.id,patch)} onApprove={()=>onDraftChange(selected.id,{approved:true,status:'ready'})} onRemove={()=>onDraftChange(selected.id,{removed:!drafts[selected.id].removed,approved:false})}/>}</div>; }

function draftParagraphs(body) {
  const parts = String(body || '').split(/\n\n+/);
  while (parts.length < 5) parts.push('');
  return parts;
}
function withDraftParagraph(body, index, value) {
  const parts = draftParagraphs(body); parts[index] = value; return parts.join('\n\n');
}

function ReviewQueueRow({candidate,draft,matchPercent,active,onClick}) {
  const status=draft.removed?'removed':draft.approved?'approved':draft.status;
  return <button onClick={onClick} style={{width:'100%',display:'flex',alignItems:'center',gap:9,padding:'10px 11px',border:0,borderRadius:9,background:active?'var(--green-100)':'transparent',cursor:'pointer',textAlign:'left',fontFamily:'inherit',opacity:draft.removed?.55:1}}><CompanyLogoBubble candidate={candidate} size={30}/><span style={{flex:1,minWidth:0}}><strong style={{display:'block',fontSize:12,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{candidate.name}</strong><span style={{display:'block',fontSize:10,color:'var(--fg3)',marginTop:2}}>{STATUS_META[status].label}</span></span>{Number.isFinite(matchPercent)&&<span style={{fontSize:11,fontWeight:700,color:matchPercent>=75?'var(--green-800)':'var(--fg2)'}}>{matchPercent}%</span>}<i className="ph ph-caret-right" style={{fontSize:11,color:'var(--fg3)'}}/></button>;
}

function CandidateContextPanel({candidate,draft,matchPercent,onClose,onUseEvidence}) {
  const channels=availableChannels(candidate);
  return <aside style={{width:360,flex:'0 0 360px',height:'calc(100vh - 56px)',overflowY:'auto',borderLeft:'1px solid var(--beige-300)',background:'var(--white)'}}>
    <header style={{height:58,padding:'0 16px',display:'flex',alignItems:'center',borderBottom:'1px solid var(--beige-300)',position:'sticky',top:0,background:'var(--white)',zIndex:2}}><div><div style={{fontSize:13,fontWeight:700}}>Candidate details</div><div style={{fontSize:10,color:'var(--fg3)'}}>Use context while editing</div></div><span style={{flex:1}}/><IconButton icon="x" size="sm" onClick={onClose}/></header>
    <div style={{padding:18}}><div style={{display:'flex',gap:11,alignItems:'center',marginBottom:18}}><CompanyLogoBubble candidate={candidate} size={44}/><div style={{flex:1,minWidth:0}}><div style={{fontSize:15,fontWeight:700}}>{candidate.name}</div><div style={{fontSize:11,lineHeight:'17px',color:'var(--fg3)'}}>{candidate.title} at {candidate.company}</div></div>{Number.isFinite(matchPercent)&&<div style={{minWidth:62,flex:'0 0 62px',alignSelf:'center',padding:'7px 8px 8px',border:'1px solid var(--green-300)',borderRadius:10,background:'var(--green-100)',textAlign:'center'}}><strong style={{display:'block',fontSize:17,lineHeight:'20px',fontVariantNumeric:'tabular-nums',color:'var(--green-800)'}}>{matchPercent}%</strong><span style={{display:'block',fontSize:9,lineHeight:'12px',color:'var(--fg3)',marginTop:1}}>Match</span></div>}</div>
      <p style={{margin:'0 0 16px',fontSize:12,lineHeight:'19px',color:'var(--fg2)'}}>{candidate.headline}</p>
      <div style={{display:'flex',gap:7,marginBottom:20}}>{channels.email&&<ChannelPill channel="email"/>}{channels.linkedin&&<ChannelPill channel="linkedin"/>}<span style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:10,color:'var(--fg3)'}}><i className="ph ph-map-pin"/>{candidate.location}</span></div>
      <TinyLabel>Relevant evidence</TinyLabel><div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:20}}>{(candidate.evidence||[]).map((item,index)=><div key={index} style={{padding:10,border:'1px solid var(--beige-300)',borderRadius:9,background:draft.evidence===item.text?'linear-gradient(120deg, var(--green-100) 0%, var(--blue-50) 52%, var(--purple-100) 100%)':'var(--beige-50)'}}><div style={{fontSize:11,lineHeight:'17px',color:'var(--fg2)'}}>{item.text}</div><button onClick={()=>onUseEvidence(item.text)} style={{marginTop:7,padding:0,border:0,background:'transparent',color:'var(--green-800)',fontFamily:'inherit',fontSize:10,fontWeight:600,cursor:'pointer'}}>{draft.evidence===item.text?'Currently used':'Use in message'} <i className="ph ph-arrow-right"/></button></div>)}</div>
      {(candidate.experience||[]).length>0&&<><TinyLabel>Experience</TinyLabel><div style={{marginBottom:20}}>{candidate.experience.map((role,index)=><div key={index} style={{display:'grid',gridTemplateColumns:'8px 1fr',gap:9,paddingBottom:12}}><span style={{width:7,height:7,borderRadius:999,background:index===0?'var(--green-700)':'var(--beige-500)',marginTop:5}}/><div><div style={{fontSize:11,fontWeight:700}}>{role.title} · {role.company}</div><div style={{fontSize:10,color:'var(--fg3)',margin:'2px 0'}}>{role.period}</div><div style={{fontSize:10,lineHeight:'16px',color:'var(--fg2)'}}>{role.note}</div></div></div>)}</div></>}
      {(candidate.tradeoffs||[]).length>0&&<><TinyLabel>Considerations</TinyLabel>{candidate.tradeoffs.map((item,index)=><div key={index} style={{display:'flex',gap:7,fontSize:11,lineHeight:'17px',color:'var(--fg2)',marginBottom:7}}><i className="ph ph-info" style={{marginTop:2,color:'var(--orange-800)'}}/><span>{item}</span></div>)}</>}
    </div>
  </aside>;
}

function FocusedMessageEditor({candidate,draft,matchPercent,index,total,strategy,savedStrategies,onEditStrategy,onCreateStrategy,onSelectStrategy,onBack,onChange,onApproveNext,onExclude,onAddContact,updating=false,strategyUpdating=false}) {
  const [showCandidate,setShowCandidate]=React.useState(false); const [showContact,setShowContact]=React.useState(false); const [contact,setContact]=React.useState({email:candidate.email||'',linkedin:candidate.linkedin||''}); const [confirmExclude,setConfirmExclude]=React.useState(false);
  const parts=draftParagraphs(draft.body); const personalized=parts[1]||'';
  const rewriteOpening=action=>{
    let next=personalized; let evidence=draft.evidence;
    if(action==='Use stronger evidence'&&candidate.evidence&&candidate.evidence[1]){evidence=candidate.evidence[1].text;const sentence=evidenceInSecondPerson(evidence);next=`I also noticed another relevant part of your work: ${sentence.charAt(0).toLowerCase()}${sentence.slice(1)}`;}
    if(action==='Make more specific')next=`${personalized.replace(/\s+$/,'')} That hands-on experience navigating complex product decisions is especially relevant to what this role needs.`;
    if(action==='Shorten'){const sentence=evidenceInSecondPerson(evidence);next=`Your work at ${candidate.company} stood out: ${sentence.charAt(0).toLowerCase()}${sentence.slice(1)}`;}
    onChange({body:withDraftParagraph(draft.body,1,next),evidence});
  };
  const useEvidence=evidence=>{const sentence=evidenceInSecondPerson(evidence);onChange({evidence,body:withDraftParagraph(draft.body,1,`I came across your work at ${candidate.company}, and one detail stood out: ${sentence.charAt(0).toLowerCase()}${sentence.slice(1)}`)});};
  const evidenceText=String(draft.evidence||'');
  const personalizationRationale=/from zero|from concept|first designer|0.?1|blank page/i.test(evidenceText)
    ? 'This is the clearest proof that they can turn ambiguity into a defined product outcome—the closest match to the strategy’s ownership angle.'
    : /enterprise|scale|compliance|security|workflow/i.test(evidenceText)
      ? 'This shows judgment in a complex enterprise environment and creates a credible bridge to the role’s scale and ambiguity.'
      : 'This is the strongest concrete example of ownership in their profile, so the opening can be specific instead of relying on generic praise.';
  return <div style={{display:'flex',flex:1,minWidth:0}}><main style={{flex:1,minWidth:0,height:'calc(100vh - 56px)',overflowY:'auto',background:'var(--app-background)'}}>
    <header style={{position:'sticky',top:0,zIndex:6,borderBottom:'1px solid var(--beige-300)',background:'rgba(255,255,255,.96)',backdropFilter:'blur(10px)'}}>
      <div style={{maxWidth:940,minHeight:68,margin:'0 auto',padding:'9px 24px',display:'flex',alignItems:'center',gap:11}}>
        <IconButton icon="arrow-left" size="sm" title="Back to outreach preflight" onClick={onBack}/>
        <button onClick={()=>setShowCandidate(true)} style={{display:'flex',alignItems:'center',gap:10,padding:0,border:0,background:'transparent',fontFamily:'inherit',textAlign:'left',cursor:'pointer'}}><CompanyLogoBubble candidate={candidate} size={40}/><span><span style={{display:'flex',alignItems:'center',gap:5,fontSize:15,fontWeight:700}}>{candidate.name}<i className="ph ph-arrow-square-out" style={{fontSize:12,color:'var(--green-800)'}}/></span><span style={{fontSize:10.5,color:'var(--fg3)'}}>{candidate.title} at {candidate.company} · {index+1} of {total}</span></span></button>
        <span style={{flex:1}}/>
        <Button variant="ghost" color="destructive" size="sm" icon="minus-circle" onClick={()=>setConfirmExclude(true)}>Exclude</Button>
        <Button variant="primary" color="brand" size="sm" icon={draft.status==='channel-unavailable'?'address-book':'check'} onClick={draft.status==='channel-unavailable'?()=>setShowContact(true):onApproveNext}>{draft.status==='channel-unavailable'?'Add contact':'Approve and next'}</Button>
      </div>
      {confirmExclude&&<div style={{borderTop:'1px solid var(--beige-300)',background:'var(--red-50)',padding:'9px 24px'}}><div style={{maxWidth:892,margin:'0 auto',display:'flex',alignItems:'center',gap:8}}><span style={{fontSize:11.5,color:'var(--fg2)'}}>Exclude {candidate.name} from this outreach? They will remain shortlisted.</span><span style={{flex:1}}/><Button variant="ghost" color="brand" size="sm" onClick={()=>setConfirmExclude(false)}>Cancel</Button><Button variant="secondary" color="destructive" size="sm" onClick={()=>{onExclude();setConfirmExclude(false);}}>Exclude</Button></div></div>}
    </header>
    <div style={{maxWidth:840,margin:'0 auto',padding:'20px 28px 80px'}}>
      <StrategySelector strategy={strategy} savedStrategies={savedStrategies} compact onEdit={onEditStrategy} onCreate={onCreateStrategy} onSelect={onSelectStrategy} updating={strategyUpdating}/>

      {draft.status!=='ready'&&<div style={{padding:'11px 12px',marginBottom:showContact?0:14,border:`1px solid ${draft.status==='channel-unavailable'?'var(--orange-300)':'var(--beige-400)'}`,borderRadius:showContact?'9px 9px 0 0':9,background:draft.status==='channel-unavailable'?'var(--orange-100)':'var(--beige-50)',fontSize:11.5,lineHeight:'17px',color:'var(--fg2)',display:'flex',alignItems:'flex-start',gap:10}}><span style={{width:28,height:28,flex:'0 0 28px',borderRadius:8,display:'inline-flex',alignItems:'center',justifyContent:'center',background:draft.status==='channel-unavailable'?'var(--orange-200)':'linear-gradient(120deg, var(--green-100), var(--blue-50), var(--purple-100))',color:draft.status==='channel-unavailable'?'var(--orange-800)':'var(--green-800)'}}><i className={`ph ph-${draft.status==='channel-unavailable'?'address-book':'sparkle'}`}/></span><span><strong style={{display:'block',color:'var(--fg1)',marginBottom:1}}>{draft.status==='channel-unavailable'?'Contact details needed':draft.status==='weak-fit'?'Review the strategy fit':'Ema recommends a quick evidence check'}</strong>{draft.status==='channel-unavailable'?'Add an email address or connect LinkedIn before this message can be sent.':draft.status==='weak-fit'?'The candidate’s evidence only partially supports this strategy. Review the message before approving.':'Ema couldn’t confidently connect the selected evidence to the strategy. Review the opening or use stronger evidence.'}</span><span style={{flex:1}}/>{draft.status==='channel-unavailable'&&<Button variant="secondary" color="brand" size="sm" icon="plus" onClick={()=>setShowContact(value=>!value)}>{showContact?'Cancel':'Add contact'}</Button>}</div>}
      {showContact&&draft.status==='channel-unavailable'&&<section style={{padding:14,marginBottom:14,border:'1px solid var(--orange-300)',borderTop:0,borderRadius:'0 0 9px 9px',background:'var(--white)'}}><div style={{display:'flex',alignItems:'flex-start',marginBottom:12}}><div><div style={{fontSize:13,fontWeight:700}}>Add contact details</div><div style={{fontSize:10,color:'var(--fg3)',marginTop:2}}>Add at least one reachable channel for {candidate.name}.</div></div><span style={{flex:1}}/><span style={{fontSize:10,color:'var(--fg3)'}}>Saved to candidate profile</span></div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}><label><span style={{display:'block',fontSize:10,fontWeight:700,letterSpacing:.7,textTransform:'uppercase',color:'var(--fg3)',marginBottom:6}}>Email address</span><div style={{position:'relative'}}><i className="ph ph-envelope-simple" style={{position:'absolute',left:10,top:11,color:'var(--fg3)'}}/><input type="email" value={contact.email} onChange={event=>setContact(current=>({...current,email:event.target.value}))} placeholder="name@company.com" style={{width:'100%',height:38,padding:'0 10px 0 32px',border:'1px solid var(--beige-400)',borderRadius:8,outline:0,fontFamily:'inherit',fontSize:12}}/></div></label><label><span style={{display:'block',fontSize:10,fontWeight:700,letterSpacing:.7,textTransform:'uppercase',color:'var(--fg3)',marginBottom:6}}>LinkedIn profile</span><div style={{position:'relative'}}><i className="ph ph-link" style={{position:'absolute',left:10,top:11,color:'var(--fg3)'}}/><input value={contact.linkedin} onChange={event=>setContact(current=>({...current,linkedin:event.target.value}))} placeholder="linkedin.com/in/profile" style={{width:'100%',height:38,padding:'0 10px 0 32px',border:'1px solid var(--beige-400)',borderRadius:8,outline:0,fontFamily:'inherit',fontSize:12}}/></div></label></div><div style={{display:'flex',alignItems:'center',marginTop:12}}><span style={{fontSize:10,color:'var(--fg3)'}}>Ema will use email first and LinkedIn as fallback.</span><span style={{flex:1}}/><Button variant="primary" color="brand" size="sm" icon="check" disabled={!contact.email.trim()&&!contact.linkedin.trim()} onClick={()=>{onAddContact(contact);setShowContact(false);}}>Save contact</Button></div></section>}

      <section aria-busy={updating} style={{position:'relative',border:'1px solid var(--beige-400)',borderRadius:12,background:'var(--white)',overflow:'hidden',boxShadow:'var(--shadow-sm)',marginBottom:12}}><div style={{padding:'12px 14px',display:'flex',alignItems:'center',borderBottom:'1px solid var(--beige-300)'}}><div><div style={{fontSize:13,fontWeight:700}}>{draft.channel==='linkedin'?'LinkedIn message':'Email message'}</div><div style={{fontSize:10,color:'var(--fg3)',marginTop:2}}>{updating?'Applying strategy refinement…':'Edit any part before approving'}</div></div><span style={{flex:1}}/><span style={{padding:'4px 7px',borderRadius:999,background:'linear-gradient(120deg, var(--green-100) 0%, var(--blue-50) 52%, var(--purple-100) 100%)',fontSize:10,color:'var(--fg2)'}}><i className="ph ph-sparkle" style={{marginRight:4}}/>Drafted by Ema</span></div>{draft.channel!=='linkedin'&&<div style={{display:'flex',alignItems:'center',padding:'0 14px',borderBottom:'1px solid var(--beige-300)'}}><span style={{fontSize:11,color:'var(--fg3)',width:52}}>Subject</span><input value={draft.subject} onChange={e=>onChange({subject:e.target.value})} style={{flex:1,padding:'12px 0',border:0,outline:0,background:'transparent',fontFamily:'inherit',fontWeight:600,fontSize:13}}/></div>}<textarea value={draft.body} onChange={e=>onChange({body:e.target.value})} rows={15} aria-label="Complete outreach message" style={{width:'100%',minHeight:300,padding:16,border:0,outline:0,resize:'vertical',fontFamily:'inherit',fontSize:13,lineHeight:'21px',color:'var(--fg1)',background:'var(--white)'}}/><div style={{display:'flex',gap:6,padding:'10px 14px',borderTop:'1px solid var(--beige-300)',background:'var(--beige-50)'}}>{['Use stronger evidence','Make more specific','Shorten'].map(action=><Button key={action} variant="ghost" color="brand" size="sm" onClick={()=>rewriteOpening(action)}>{action}</Button>)}<span style={{flex:1}}/><Button variant="ghost" color="brand" size="sm" icon="user-focus" onClick={()=>setShowCandidate(true)}>View candidate</Button></div>{updating&&<UpdateShimmer label={`Updating ${candidate.name}'s email`}/>}</section>

      <section style={{position:'relative',padding:'13px 14px 13px 16px',border:'1px solid var(--beige-300)',borderRadius:10,background:'var(--white)',marginBottom:12,display:'flex',gap:11,alignItems:'flex-start',overflow:'hidden'}}><span aria-hidden="true" style={{position:'absolute',left:0,top:0,bottom:0,width:3,background:'linear-gradient(180deg, var(--green-500), var(--blue-300), var(--purple-300))'}}/><span style={{width:28,height:28,flex:'0 0 28px',borderRadius:8,background:'linear-gradient(120deg, var(--green-100), var(--blue-50), var(--purple-100))',display:'inline-flex',alignItems:'center',justifyContent:'center'}}><i className="ph ph-sparkle" style={{color:'var(--green-800)'}}/></span><div style={{flex:1,minWidth:0}}><div style={{fontSize:10,fontWeight:700,letterSpacing:.75,textTransform:'uppercase',color:'var(--fg2)',marginBottom:4}}>Personalization rationale</div><div style={{fontSize:11.5,lineHeight:'18px',color:'var(--fg1)'}}>{personalizationRationale}</div><div style={{marginTop:7,paddingLeft:9,borderLeft:'2px solid var(--beige-400)',fontSize:10.5,lineHeight:'16px',color:'var(--fg3)'}}>{draft.evidence}</div></div><button onClick={()=>setShowCandidate(true)} style={{padding:0,border:0,background:'transparent',color:'var(--green-800)',fontFamily:'inherit',fontSize:10,fontWeight:600,cursor:'pointer'}}>Change evidence</button></section>

    </div>
  </main>{showCandidate&&<CandidateContextPanel candidate={candidate} draft={draft} matchPercent={matchPercent} onClose={()=>setShowCandidate(false)} onUseEvidence={useEvidence}/>}</div>;
}

function BatchReview({people,drafts,matchById={},onDraftChange,onAddContact,onBack,onCreateStrategy,onSelectStrategy,strategy,savedStrategies,updatingIds=[],strategyUpdating=false}) {
  const [selectedId,setSelectedId]=React.useState(null);
  const active=people.filter(p=>drafts[p.id]&&!drafts[p.id].removed);
  const sent=active.filter(p=>drafts[p.id].sent);
  const exceptions=active.filter(p=>!drafts[p.id].sent&&!drafts[p.id].approved&&drafts[p.id].status!=='ready');
  const ready=active.filter(p=>!drafts[p.id].sent&&!drafts[p.id].approved&&drafts[p.id].status==='ready');
  const approved=active.filter(p=>!drafts[p.id].sent&&drafts[p.id].approved);
  const sendable=[...ready,...approved];
  const excluded=people.filter(p=>drafts[p.id]&&drafts[p.id].removed);
  const blocked=exceptions.filter(candidate=>drafts[candidate.id].status==='channel-unavailable');
  const reviewableExceptions=exceptions.filter(candidate=>drafts[candidate.id].status!=='channel-unavailable');
  const fallback=active.filter(candidate=>drafts[candidate.id].usedFallback);
  const queue=[...reviewableExceptions,...blocked,...ready,...approved,...excluded]; const selected=queue.find(p=>p.id===selectedId); const selectedIndex=Math.max(0,queue.findIndex(p=>p.id===selectedId));
  const sendReady=()=>sendable.forEach(p=>onDraftChange(p.id,{approved:true,sent:true,sentAt:Date.now()}));
  const approveExceptions=()=>reviewableExceptions.forEach(candidate=>onDraftChange(candidate.id,{approved:true,status:'ready'}));
  const approveNext=()=>{onDraftChange(selected.id,{approved:true,status:'ready'}); const remaining=queue.filter(p=>p.id!==selected.id&&!drafts[p.id].approved&&!drafts[p.id].removed); setSelectedId(remaining.length?remaining[0].id:null);};
  if(selected)return <div style={{display:'flex',height:'100%',minHeight:0}}><aside style={{width:260,flex:'0 0 260px',height:'calc(100vh - 56px)',overflowY:'auto',padding:12,borderRight:'1px solid var(--beige-300)',background:'var(--beige-50)'}}><div style={{padding:'6px 8px 10px'}}><div style={{fontSize:13,fontWeight:700}}>Outreach preflight</div><div style={{fontSize:11,color:'var(--fg3)',marginTop:2}}>{reviewableExceptions.length} need judgment · {blocked.length} blocked</div>{reviewableExceptions.length>1&&<button onClick={approveExceptions} style={{width:'100%',marginTop:9,padding:'7px 8px',border:'1px solid var(--green-500)',borderRadius:7,background:'var(--white)',color:'var(--green-800)',fontFamily:'inherit',fontSize:10,fontWeight:600,cursor:'pointer'}}><i className="ph ph-checks" style={{marginRight:5}}/>Approve {reviewableExceptions.length} reviewable</button>}</div>{queue.map(candidate=><ReviewQueueRow key={candidate.id} candidate={candidate} draft={drafts[candidate.id]} matchPercent={matchById[candidate.id]} active={candidate.id===selected.id} onClick={()=>setSelectedId(candidate.id)}/>)}</aside><FocusedMessageEditor candidate={selected} draft={drafts[selected.id]} matchPercent={matchById[selected.id]} index={selectedIndex} total={queue.length} strategy={strategy} savedStrategies={savedStrategies} onEditStrategy={onBack} onCreateStrategy={onCreateStrategy} onBack={()=>setSelectedId(null)} onChange={patch=>onDraftChange(selected.id,patch)} onApproveNext={approveNext} onExclude={()=>{onDraftChange(selected.id,{removed:true,approved:false});setSelectedId(null);}} onAddContact={details=>onAddContact(selected.id,details)} onSelectStrategy={onSelectStrategy} updating={updatingIds.includes(selected.id)} strategyUpdating={strategyUpdating}/></div>;
  const sections=[{label:'Needs judgment',description:'Ema needs one decision before these messages are ready.',candidates:reviewableExceptions,action:reviewableExceptions.length?approveExceptions:null,actionLabel:`Approve ${reviewableExceptions.length} as written`},{label:'Blocked',description:'Resolve missing contact details before sending.',candidates:blocked},{label:'Ready under this strategy',description:'Ema applied the strategy with strong supporting evidence.',candidates:ready}];
  return <main style={{height:'100%',overflowY:'auto',padding:'24px 28px 64px'}}><div style={{maxWidth:1040,margin:'0 auto'}}><div style={{display:'flex',alignItems:'flex-end',marginBottom:16}}><div><h1 style={{margin:0,fontSize:24}}>Outreach preflight</h1><p style={{margin:'6px 0 0',fontSize:13,color:'var(--fg2)'}}>Ema applied the saved strategy to this shortlist. Resolve exceptions, then send the messages that are ready.</p></div><span style={{flex:1}}/><Button variant="primary" color="brand" icon="paper-plane-tilt" disabled={!sendable.length} onClick={sendReady}>Send {sendable.length} message{sendable.length===1?'':'s'}</Button></div><StrategySelector strategy={strategy} savedStrategies={savedStrategies} onEdit={onBack} onCreate={onCreateStrategy} onSelect={onSelectStrategy} updating={strategyUpdating}/><div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',border:'1px solid var(--beige-400)',borderRadius:12,background:'var(--white)',overflow:'hidden',marginBottom:22}}><SummaryStat value={ready.length} label="Ready" tone="var(--green-800)"/><SummaryStat value={reviewableExceptions.length} label="Need judgment" tone="var(--orange-800)"/><SummaryStat value={blocked.length} label="Blocked" tone={blocked.length?'var(--red-800)':'var(--fg1)'}/><SummaryStat value={fallback.length} label="Using fallback"/></div>{approved.length>0&&<div style={{display:'flex',alignItems:'center',gap:7,margin:'-10px 0 18px',fontSize:11,color:'var(--green-800)'}}><i className="ph ph-check-circle"/>{approved.length} approved and ready to send</div>}{sent.length>0&&<div style={{display:'flex',alignItems:'center',gap:7,margin:'-10px 0 18px',fontSize:11,color:'var(--green-800)'}}><i className="ph ph-paper-plane-tilt"/>{sent.length} message{sent.length===1?'':'s'} sent</div>}{sections.map(section=>section.candidates.length>0&&<section key={section.label} style={{marginBottom:20}}><div style={{display:'flex',alignItems:'flex-end',marginBottom:8}}><div><strong style={{fontSize:13}}>{section.label}</strong><span style={{marginLeft:7,fontSize:11,color:'var(--fg3)'}}>{section.candidates.length}</span><div style={{fontSize:10,color:'var(--fg3)',marginTop:2}}>{section.description}</div></div><span style={{flex:1}}/>{section.action&&<Button variant="secondary" color="brand" size="sm" icon="checks" onClick={section.action}>{section.actionLabel}</Button>}</div><div style={{border:'1px solid var(--beige-400)',borderRadius:12,background:'var(--white)',overflow:'hidden'}}>{section.candidates.map(candidate=><BatchRow key={candidate.id} candidate={candidate} draft={drafts[candidate.id]} active={false} updating={updatingIds.includes(candidate.id)} onClick={()=>setSelectedId(candidate.id)}/>)}</div></section>)}</div></main>;
}

function OutreachEmptyState({hasShortlist,onOpenSearch}) { return <div style={{padding:'72px 28px',maxWidth:480,margin:'0 auto',textAlign:'center'}}><div style={{width:48,height:48,borderRadius:12,background:'var(--beige-200)',display:'inline-flex',alignItems:'center',justifyContent:'center',marginBottom:16}}><i className="ph ph-users-three" style={{fontSize:22,color:'var(--fg3)'}}/></div><div style={{fontSize:18,fontWeight:700,marginBottom:6}}>{hasShortlist?'Create outreach from your search':'Select candidates first'}</div><p style={{margin:'0 0 16px',fontSize:13,lineHeight:'19px',color:'var(--fg3)'}}>{hasShortlist?'Return to the search conversation. Ema will help you create a shared strategy for this shortlist.':'Add candidates to a shortlist. Ema will recommend outreach as the next step in the search conversation.'}</p>{onOpenSearch&&<Button variant="secondary" color="brand" icon="arrow-left" onClick={onOpenSearch}>Back to conversation</Button>}</div>; }

function PersistentEmaChat({state,onSend,onExpand,onNavigate}) {
  const [open,setOpen]=React.useState(false);
  const messages=[...(state.conversationTranscript||[]),...(state.outreachChat||[])];
  const hasOutreachContinuation=Boolean(state.outreachChatStarted||(state.outreachChat||[]).length);
  const endOfThreadRef=React.useRef(null);
  const demoPrompt="These messages undersell the transition. For people from larger companies, acknowledge that this role offers broader ownership—but don’t imply they lack ownership today.";
  const candidates=state.candidates||[];
  const criteria=(state.criteria&&state.criteria.length)?state.criteria:Engine.baseCriteria();
  const filters=state.filters||{};
  const ranked=rankedResults(candidates,criteria,filters);
  const poolSize=qualifiedPoolSize(candidates,criteria,filters);
  const calibrationSet=CALIBRATION_IDS.map(id=>candidates.find(c=>c.id===id)).filter(Boolean);
  const dailyTask=(state.tasks||[]).find(task=>task.searchId===state.id&&task.cadence==='daily');
  const createDailyTask=time=>SearchState.set(st=>applyDailyTask(st,time));
  // Any reaction/view click in a historical calibration card jumps to the live
  // conversation instead of mutating the frozen snapshot shown here.
  const backToConversation=()=>onExpand();
  React.useEffect(()=>{
    if(!open)return;
    const frame=requestAnimationFrame(()=>endOfThreadRef.current&&endOfThreadRef.current.scrollIntoView({block:'end'}));
    return()=>cancelAnimationFrame(frame);
  },[open,messages.length]);
  return <>
    <button onClick={()=>setOpen(true)} aria-label="Ask Ema" style={{position:'fixed',zIndex:45,right:26,bottom:28,height:54,padding:'0 20px 0 9px',display:open?'none':'inline-flex',alignItems:'center',gap:11,border:'1px solid var(--beige-400)',borderRadius:999,background:'var(--white)',boxShadow:'var(--shadow-lg)',color:'var(--fg1)',fontFamily:'inherit',fontSize:14,fontWeight:700,cursor:'pointer'}}><span style={{width:38,height:38,borderRadius:'50%',display:'inline-flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(120deg, var(--green-100), var(--blue-50), var(--purple-100))'}}><img src="../../assets/logo-mark.svg" width="24" height="24" alt="Ema"/></span>Ask Ema</button>
    {open&&<aside style={{position:'fixed',zIndex:50,right:20,bottom:20,width:480,height:'min(680px, calc(100vh - 76px))',display:'flex',flexDirection:'column',border:'1px solid var(--beige-400)',borderRadius:14,background:'var(--app-background)',boxShadow:'var(--shadow-lg)',overflow:'hidden',animation:'emaOutreachChatIn 240ms cubic-bezier(.16,1,.3,1)'}}>
      <style>{`@keyframes emaOutreachChatIn{from{opacity:0;transform:translateY(12px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>
      <header style={{height:66,flex:'0 0 66px',padding:'0 14px',display:'flex',alignItems:'center',borderBottom:'1px solid var(--beige-300)',background:'var(--white)'}}><span style={{width:38,height:38,borderRadius:10,background:'var(--ai-magic-bg-subtle)',display:'inline-flex',alignItems:'center',justifyContent:'center',marginRight:10}}><img src="../../assets/logo-mark.svg" width="24" height="24" alt="Ema"/></span><div><div style={{fontSize:14,fontWeight:700}}>Ema</div><div style={{fontSize:10,color:'var(--fg3)'}}>Senior product designer search</div></div><span style={{flex:1}}/><Button variant="ghost" color="brand" size="sm" icon="plus" onClick={()=>{}}>New chat</Button><IconButton icon="arrows-out-simple" size="sm" title="Expand chat" onClick={backToConversation}/><IconButton icon="minus" size="sm" title="Minimise chat" onClick={()=>setOpen(false)}/></header>
      <div style={{flex:1,overflowY:'auto',padding:'18px 18px 8px'}}>
        {messages.length?messages.map((message,index)=>{
          if(message.kind==='status')return <div key={index} role="status" style={{display:'flex',alignItems:'center',gap:6,margin:'2px 31px 13px',fontSize:10.5,color:'var(--green-800)'}}><i className="ph ph-check-circle"/>{message.text}</div>;
          const bubble=<div style={{display:'flex',justifyContent:message.role==='user'?'flex-end':'flex-start',marginBottom:message.payload?8:13}}>{message.role==='ema'&&<span style={{width:24,height:24,flex:'0 0 24px',marginRight:7,borderRadius:7,background:'var(--ai-magic-bg-subtle)',display:'inline-flex',alignItems:'center',justifyContent:'center'}}><img src="../../assets/logo-mark.svg" width="15" height="15" alt=""/></span>}<div style={{maxWidth:message.role==='user'?'82%':'calc(100% - 34px)',padding:message.role==='user'?'9px 11px':'1px 0',borderRadius:10,background:message.role==='user'?'var(--fg1)':'transparent',border:message.role==='user'?'1px solid var(--fg1)':0,fontSize:12,lineHeight:'19px',color:message.role==='user'?'var(--white)':'var(--fg1)'}}>{message.text}</div></div>;
          if(!message.payload)return <React.Fragment key={index}>{bubble}</React.Fragment>;
          return <React.Fragment key={index}>
            {bubble}
            <div style={{margin:'0 0 14px 31px'}}>
              {message.payload==='results'&&<ResultsPayload results={ranked} poolSize={poolSize} onExpand={()=>onExpand(true)}/>}
              {message.payload==='schedule'&&<DailyTaskSuggestion task={dailyTask} onCreate={createDailyTask} onViewTasks={()=>onNavigate&&onNavigate('tasks')}/>}
              {message.payload==='calibration'&&<CalibrationPayload candidates={calibrationSet} ranked={ranked} state={message.reactions||{}} onReact={backToConversation} onReason={backToConversation} onView={backToConversation}/>}
            </div>
          </React.Fragment>;
        }) : <div style={{padding:12,border:'1px solid var(--beige-300)',borderRadius:10,background:'linear-gradient(120deg, var(--green-100), var(--blue-50), var(--purple-100))',fontSize:12,lineHeight:'19px',color:'var(--fg2)'}}>Start a search conversation with Ema. It will remain available here while you work.</div>}
        {state.outreachGroup&&!hasOutreachContinuation&&<div style={{margin:'8px 0 10px 31px',paddingTop:12,borderTop:'1px solid var(--beige-300)'}}><div style={{fontSize:10,color:'var(--fg3)',marginBottom:7}}>Noticing the same issue in several messages?</div><button onClick={()=>onSend(demoPrompt)} style={{padding:'7px 9px',border:'1px solid var(--beige-300)',borderRadius:8,background:'linear-gradient(120deg, var(--green-100), var(--blue-50), var(--purple-100))',color:'var(--fg2)',fontFamily:'inherit',fontSize:10.5,lineHeight:'16px',textAlign:'left',cursor:'pointer'}}>Improve the large-company transition</button></div>}
        <div ref={endOfThreadRef} aria-hidden="true" style={{height:1}}/>
      </div>
      <div style={{padding:'0 14px',background:'var(--app-background)'}}><ChatComposer prefill={state.outreachGroup&&!hasOutreachContinuation?demoPrompt:''} onSend={onSend} disabled={false}/></div>
    </aside>}
  </>;
}

function OutreachPage({onNavigate}) { const s=useSearchState(); const groupIds=(s.outreachGroup&&s.outreachGroup.candidateIds)||[]; const people=groupIds.map(id=>(s.candidates||[]).find(c=>c.id===id)).filter(Boolean); const shortlisted=(s.shortlist||[]).map(id=>(s.candidates||[]).find(c=>c.id===id)).filter(Boolean); const drafts=s.outreachDrafts||{};
  const [manualMode,setManualMode]=React.useState(false);
  const [manualStrategy,setManualStrategy]=React.useState(s.outreachStrategy||DEFAULT_STRATEGY);
  const [updatingIds,setUpdatingIds]=React.useState([]);
  const [strategyUpdating,setStrategyUpdating]=React.useState(false);
  React.useEffect(()=>{
    if(!s.outreachGroup||!people.length)return;
    const active=people.filter(candidate=>drafts[candidate.id]&&!drafts[candidate.id].removed);
    if(active.some(candidate=>drafts[candidate.id].status==='channel-unavailable'))return;
    const target=[...active].reverse().find(candidate=>!drafts[candidate.id].approved);
    if(!target)return;
    SearchState.set(st=>({...st,outreachDrafts:{...st.outreachDrafts,[target.id]:{...st.outreachDrafts[target.id],status:'channel-unavailable',channel:null,usedFallback:false,demoBlocked:true}}}));
  },[s.outreachGroup&&s.outreachGroup.id,people.length]);
  const updateDraft=(id,patch)=>SearchState.set(st=>({...st,outreachDrafts:{...st.outreachDrafts,[id]:{...st.outreachDrafts[id],...patch}}}));
  const addContact=(id,details)=>SearchState.set(st=>{
    const email=(details.email||'').trim(); const linkedin=(details.linkedin||'').trim();
    const channels={email:Boolean(email),linkedin:Boolean(linkedin)};
    const candidates=(st.candidates||[]).map(candidate=>candidate.id===id?{...candidate,email,linkedin,contactChannels:channels}:candidate);
    const primary=(st.outreachStrategy&&st.outreachStrategy.primaryChannel)==='LinkedIn InMail'?'linkedin':'email';
    const channel=channels[primary]?primary:(primary==='email'&&channels.linkedin?'linkedin':channels.email?'email':null);
    return {...st,candidates,outreachDrafts:{...st.outreachDrafts,[id]:{...st.outreachDrafts[id],channel,status:channel?'ready':'channel-unavailable',usedFallback:Boolean(channel&&channel!==primary),demoBlocked:false}}};
  });
  const createOutreach=strategy=>SearchState.set(st=>{const selected=(st.shortlist||[]).map(id=>(st.candidates||[]).find(candidate=>candidate.id===id)).filter(Boolean);const nextDrafts={...st.outreachDrafts};selected.forEach((candidate,index)=>{const personalized=personalizeCandidate(candidate,strategy,st.team&&st.team.manager);nextDrafts[candidate.id]={...personalized,status:personalized.status==='channel-unavailable'?personalized.status:reviewStatus(candidate,index,selected.length)};});if(selected.length&&!selected.some(candidate=>nextDrafts[candidate.id].status==='channel-unavailable')){const target=selected[selected.length-1];nextDrafts[target.id]={...nextDrafts[target.id],status:'channel-unavailable',channel:null,usedFallback:false,demoBlocked:true};}const savedOutreachStrategies=String(strategy.id||'').startsWith('custom-')?[...(st.savedOutreachStrategies||[]).filter(item=>item.id!==strategy.id),strategy]:(st.savedOutreachStrategies||[]);return {...st,outreachStrategy:strategy,savedOutreachStrategies,outreachDrafts:nextDrafts,outreachGroup:{id:`outreach-${st.id}`,shortlistId:st.shortlistRecord&&st.shortlistRecord.id,candidateIds:selected.map(candidate=>candidate.id),channelStrategy:{primary:strategy.primaryChannel,fallback:strategy.fallbackChannel,sender:strategy.sender},status:'review',createdAt:Date.now()}};});
  const editStrategy=()=>{setManualStrategy(s.outreachStrategy||DEFAULT_STRATEGY);setManualMode(true);};
  const createStrategy=()=>{setManualStrategy({...DEFAULT_STRATEGY,id:`custom-${Date.now()}`,name:'New outreach strategy'});setManualMode(true);};
  const switchStrategy=strategy=>SearchState.set(st=>{
    const ids=(st.outreachGroup&&st.outreachGroup.candidateIds)||[];
    const nextDrafts={...st.outreachDrafts};
    ids.forEach((id,index)=>{
      const existing=nextDrafts[id]; const candidate=(st.candidates||[]).find(item=>item.id===id);
      if(!candidate||!existing||existing.approved||existing.removed)return;
      const regenerated=personalizeCandidate(candidate,strategy,st.team&&st.team.manager);
      nextDrafts[id]=existing.demoBlocked?{...regenerated,status:'channel-unavailable',channel:null,usedFallback:false,demoBlocked:true}:{...regenerated,status:regenerated.status==='channel-unavailable'?regenerated.status:reviewStatus(candidate,index,ids.length)};
    });
    return {...st,outreachStrategy:strategy,outreachDrafts:nextDrafts};
  });
  const sendToEma=text=>{
    const lower=text.toLowerCase();
    const currentState=SearchState.get();
    const patternCorrection=/undersell|larger compan|large compan|broader ownership|transition/.test(lower);
    if(patternCorrection){
      const affected=((currentState.outreachGroup&&currentState.outreachGroup.candidateIds)||[]).filter(id=>{
        const candidate=(currentState.candidates||[]).find(item=>item.id===id); const draft=currentState.outreachDrafts&&currentState.outreachDrafts[id];
        return candidate&&draft&&isLargeCompanyCandidate(candidate)&&!draft.approved&&!draft.removed;
      });
      const history=[...(currentState.outreachChat||[]),{role:'user',text},{role:'ema',text:`I’m adding that as a strategy refinement and updating ${affected.length} affected, unapproved message${affected.length===1?'':'s'}. Approved messages will stay unchanged.`}];
      SearchState.set({...currentState,outreachChat:history,outreachChatStarted:true});
      setUpdatingIds(affected); setStrategyUpdating(true);
      window.setTimeout(()=>SearchState.set(st=>{
        const instruction='When someone comes from a larger company, position the move as broader proximity to product direction and outcomes. Do not frame their current work as narrow or imply they lack ownership today.';
        const current=st.outreachStrategy||DEFAULT_STRATEGY;
        const nextStrategy={...current,largeCompanyTransitionRefined:true,adaptations:[instruction,...(current.adaptations||[]).filter(item=>!/larger.*company|broader proximity|ownership you already/i.test(item))]};
        const nextDrafts={...st.outreachDrafts};
        affected.forEach(id=>{const candidate=(st.candidates||[]).find(item=>item.id===id);const existing=nextDrafts[id];if(!candidate||!existing||existing.approved||existing.removed)return;const regenerated=personalizeCandidate(candidate,nextStrategy,st.team&&st.team.manager);nextDrafts[id]=existing.demoBlocked?{...regenerated,status:'channel-unavailable',channel:null,usedFallback:false,demoBlocked:true}:{...regenerated,status:existing.status};});
        return {...st,outreachStrategy:nextStrategy,outreachDrafts:nextDrafts,outreachChat:[...(st.outreachChat||[]),{role:'ema',kind:'status',text:`Strategy updated · ${affected.length} message${affected.length===1?'':'s'} refreshed`} ]};
      }),1250);
      window.setTimeout(()=>{setUpdatingIds([]);setStrategyUpdating(false);},1450);
      return;
    }
    SearchState.set(st=>{
      const history=[...(st.outreachChat||[]),{role:'user',text}];
      if(lower.includes('approve')&&lower.includes('ready')){const nextDrafts={...st.outreachDrafts};let approvedCount=0;Object.keys(nextDrafts).forEach(id=>{const draft=nextDrafts[id];if(draft&&draft.status==='ready'&&!draft.approved&&!draft.removed){nextDrafts[id]={...draft,approved:true};approvedCount+=1;}});return {...st,outreachDrafts:nextDrafts,outreachChatStarted:true,outreachChat:[...history,{role:'ema',text:`I approved ${approvedCount} ready message${approvedCount===1?'':'s'}. Judgment and blocked cases are unchanged.`}]};}
      const current=st.outreachStrategy||DEFAULT_STRATEGY;let nextStrategy;
      if(lower.includes('avoid')||lower.includes("don't")||lower.includes('do not'))nextStrategy={...current,boundaries:[...(current.boundaries||DEFAULT_STRATEGY.boundaries),text]};else if(lower.includes('if ')||lower.includes('when ')||lower.includes('coming from'))nextStrategy={...current,adaptations:[...(current.adaptations||DEFAULT_STRATEGY.adaptations),text]};else nextStrategy={...current,personalization:`${current.personalization||DEFAULT_STRATEGY.personalization} ${text}`};
      const nextDrafts={...st.outreachDrafts};let reapplied=0;const ids=(st.outreachGroup&&st.outreachGroup.candidateIds)||[];ids.forEach((id,index)=>{const existing=nextDrafts[id];const candidate=(st.candidates||[]).find(item=>item.id===id);if(!candidate||!existing||existing.approved||existing.removed)return;const regenerated=personalizeCandidate(candidate,nextStrategy,st.team&&st.team.manager);nextDrafts[id]=existing.demoBlocked?{...regenerated,status:'channel-unavailable',channel:null,usedFallback:false,demoBlocked:true}:{...regenerated,status:regenerated.status==='channel-unavailable'?regenerated.status:reviewStatus(candidate,index,ids.length)};reapplied+=1;});return {...st,outreachStrategy:nextStrategy,outreachDrafts:nextDrafts,outreachChatStarted:true,outreachChat:[...history,{role:'ema',text:`I updated the saved strategy and reapplied it to ${reapplied} unapproved message${reapplied===1?'':'s'}. Approved messages were left unchanged.`}]};
    });
  };
  const matchCriteria=(s.criteria&&s.criteria.length)?s.criteria:Engine.baseCriteria();
  const matchById=Object.fromEntries(people.map(candidate=>[candidate.id,criteriaMatchPercent(candidate,matchCriteria,s.filters||{})]));
  const savedStrategies=[...SAVED_STRATEGIES,...(s.savedOutreachStrategies||[]).filter(item=>!SAVED_STRATEGIES.some(preset=>preset.id===item.id))];
  let content;
  if(manualMode||(!s.outreachGroup&&shortlisted.length))content=<StrategyBuilder strategy={manualStrategy} setStrategy={setManualStrategy} count={shortlisted.length} candidates={shortlisted} onGenerate={()=>{createOutreach(manualStrategy);setManualMode(false);}}/>;
  else if(!s.outreachGroup||!people.length)content=<OutreachEmptyState hasShortlist={(s.shortlist||[]).length>0} onOpenSearch={onNavigate?()=>onNavigate('search'):null}/>;
  else content=<BatchReview people={people} drafts={drafts} matchById={matchById} strategy={s.outreachStrategy} savedStrategies={savedStrategies} onDraftChange={updateDraft} onAddContact={addContact} onBack={editStrategy} onCreateStrategy={createStrategy} onSelectStrategy={switchStrategy} updatingIds={updatingIds} strategyUpdating={strategyUpdating}/>;
  const expandChat=openTable=>{SearchState.set({chatExpandedFrom:'outreach',...(openTable?{openTableOnReturn:true}:{})});if(onNavigate)onNavigate('search');};
  return <>{content}<PersistentEmaChat state={s} onSend={sendToEma} onExpand={expandChat} onNavigate={onNavigate}/></>;
}
Object.assign(window,{OutreachPage,OutreachStrategyDrawer,DEFAULT_STRATEGY,personalizeCandidate,reviewStatus});
