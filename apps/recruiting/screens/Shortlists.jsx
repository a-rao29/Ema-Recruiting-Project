// Project shortlists — durable collections created from search conversations.

function ShortlistStatus({state}) {
  const meta=state==='outreach'?{label:'Outreach in progress',icon:'paper-plane-tilt',bg:'var(--blue-100)',fg:'var(--blue-800)'}:{label:'Ready for outreach',icon:'bookmark-simple',bg:'var(--green-100)',fg:'var(--green-800)'};
  return <span style={{height:24,padding:'0 8px',display:'inline-flex',alignItems:'center',gap:5,borderRadius:999,background:meta.bg,color:meta.fg,fontSize:10,fontWeight:600,whiteSpace:'nowrap'}}><i className={`ph ph-${meta.icon}`}/>{meta.label}</span>;
}

function ShortlistCollectionTable({record,candidates,outreachGroup,onOpen}) {
  const created=record&&record.createdAt?new Date(record.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):'Today';
  return <div style={{border:'1px solid var(--beige-400)',borderRadius:12,background:'var(--white)',overflow:'hidden',boxShadow:'var(--shadow-sm)'}}><Table><thead><tr><TH>Shortlist</TH><TH style={{width:140}}>Candidates</TH><TH style={{width:170}}>Created from</TH><TH style={{width:150}}>Created</TH><TH style={{width:175}}>Status</TH><TH style={{width:52}}/></tr></thead><tbody><tr onClick={onOpen} style={{cursor:'pointer'}}><TD><div style={{display:'flex',alignItems:'center',gap:10}}><span style={{width:34,height:34,borderRadius:9,background:'var(--green-100)',color:'var(--green-800)',display:'inline-flex',alignItems:'center',justifyContent:'center'}}><i className="ph ph-bookmark-simple"/></span><div><div style={{fontSize:13,fontWeight:700,color:'var(--fg1)'}}>{record.name||'Senior product designer shortlist'}</div><div style={{fontSize:10,color:'var(--fg3)',marginTop:2}}>Updated from the search conversation</div></div></div></TD><TD><div style={{display:'flex',alignItems:'center'}}><div style={{display:'flex',paddingLeft:5}}>{candidates.slice(0,3).map(candidate=><span key={candidate.id} style={{display:'inline-flex',marginLeft:-5,border:'2px solid var(--white)',borderRadius:'50%'}}><Avatar name={candidate.name} size={26}/></span>)}</div><span style={{fontSize:12,color:'var(--fg2)',marginLeft:7}}>{candidates.length}</span></div></TD><TD style={{fontSize:12,color:'var(--fg2)'}}>Senior product designer</TD><TD style={{fontSize:12,color:'var(--fg3)'}}>{created}</TD><TD><ShortlistStatus state={outreachGroup?'outreach':'ready'}/></TD><TD><IconButton icon="caret-right" size="sm" onClick={onOpen}/></TD></tr></tbody></Table></div>;
}

function OutreachStatus({draft}) {
  if (draft && draft.sent) return <span style={{height:24,padding:'0 9px',display:'inline-flex',alignItems:'center',gap:5,borderRadius:999,background:'var(--green-100)',color:'var(--green-800)',fontSize:10.5,fontWeight:600,whiteSpace:'nowrap'}}><i className="ph ph-paper-plane-tilt"/>Sent</span>;
  const label=draft?(draft.approved?'Ready to send':draft.status==='channel-unavailable'?'Contact needed':'Draft prepared'):'Not started';
  return <span style={{fontSize:11,color:draft?'var(--fg2)':'var(--fg3)'}}>{label}</span>;
}

function ShortlistCandidatesTable({record,candidates,matchById,drafts,onBack,onOpenSearch,onCreateOutreach}) {
  return <><div style={{display:'flex',alignItems:'flex-start',marginBottom:18}}><div><button onClick={onBack} style={{padding:0,border:0,background:'transparent',color:'var(--green-800)',fontFamily:'inherit',fontSize:11,cursor:'pointer',marginBottom:8}}><i className="ph ph-arrow-left" style={{marginRight:5}}/>All shortlists</button><h1 style={{margin:0,fontSize:24,lineHeight:'31px'}}>{record.name||'Senior product designer shortlist'}</h1><p style={{margin:'5px 0 0',fontSize:12,color:'var(--fg3)'}}>{candidates.length} candidates · Created from Senior product designer</p></div><span style={{flex:1}}/><Button variant="secondary" color="brand" icon="magnifying-glass" onClick={onOpenSearch}>Open search</Button><span style={{width:8}}/><Button variant="primary" color="brand" icon="paper-plane-tilt" onClick={onCreateOutreach}>Create outreach</Button></div><div style={{border:'1px solid var(--beige-400)',borderRadius:12,background:'var(--white)',overflow:'hidden',boxShadow:'var(--shadow-sm)'}}><Table><thead><tr><TH>Candidate</TH><TH style={{width:130}}>Match</TH><TH style={{width:170}}>Organisation</TH><TH style={{width:170}}>Location</TH><TH style={{width:120}}>Availability</TH><TH style={{width:150}}>Outreach</TH></tr></thead><tbody>{candidates.map(candidate=>{const draft=drafts[candidate.id];return <tr key={candidate.id}><TD><div style={{display:'flex',alignItems:'center',gap:9}}><CompanyLogoBubble candidate={candidate} size={32}/><div style={{minWidth:0}}><div style={{fontSize:12,fontWeight:700,color:'var(--fg1)'}}>{candidate.name}</div><div style={{fontSize:10,color:'var(--fg3)',marginTop:2,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{candidate.title}</div></div></div></TD><TD><MatchScore value={matchById[candidate.id]} compact showLabel/></TD><TD style={{fontSize:12,color:'var(--fg2)'}}>{candidate.company}</TD><TD style={{fontSize:11,color:'var(--fg3)'}}>{candidate.location}</TD><TD style={{fontSize:11,color:'var(--fg3)'}}>{candidate.availability}</TD><TD><OutreachStatus draft={draft}/></TD></tr>;})}</tbody></Table></div></>;
}

function ShortlistsEmptyState({onOpenSearch}) {
  return <div style={{maxWidth:480,margin:'0 auto',padding:'84px 24px',textAlign:'center'}}><span style={{width:48,height:48,borderRadius:12,background:'var(--beige-200)',color:'var(--fg3)',display:'inline-flex',alignItems:'center',justifyContent:'center',marginBottom:15}}><i className="ph ph-bookmark-simple" style={{fontSize:21}}/></span><h2 style={{margin:'0 0 6px',fontSize:18}}>No shortlists yet</h2><p style={{margin:'0 0 16px',fontSize:13,lineHeight:'19px',color:'var(--fg3)'}}>Shortlists created from a search conversation will appear here.</p><Button variant="primary" color="brand" icon="magnifying-glass" onClick={onOpenSearch}>Open search</Button></div>;
}

function ShortlistsPage({onNavigate}) {
  const s=useSearchState();
  const [open,setOpen]=React.useState(false);
  const record=s.shortlistRecord;
  const ids=(record&&record.candidateIds)||s.shortlist||[];
  const candidates=ids.map(id=>(s.candidates||[]).find(candidate=>candidate.id===id)).filter(Boolean);
  const criteria=(s.criteria&&s.criteria.length)?s.criteria:Engine.baseCriteria();
  const matchById=Object.fromEntries(candidates.map(candidate=>[candidate.id,criteriaMatchPercent(candidate,criteria,s.filters||{})]));
  if(!record||!candidates.length)return <ShortlistsEmptyState onOpenSearch={()=>onNavigate('search')}/>;
  return <main style={{height:'100%',overflowY:'auto',padding:'26px 28px 64px'}}><div style={{maxWidth:1120,margin:'0 auto'}}>{open?<ShortlistCandidatesTable record={record} candidates={candidates} matchById={matchById} drafts={s.outreachDrafts||{}} onBack={()=>setOpen(false)} onOpenSearch={()=>onNavigate('search')} onCreateOutreach={()=>onNavigate('outreach')}/>:<><div style={{marginBottom:18}}><h1 style={{margin:0,fontSize:24}}>Shortlists</h1><p style={{margin:'6px 0 0',fontSize:13,color:'var(--fg2)'}}>Candidate collections saved from searches in this project.</p></div><ShortlistCollectionTable record={record} candidates={candidates} outreachGroup={s.outreachGroup} onOpen={()=>setOpen(true)}/></>}</div></main>;
}

Object.assign(window,{ShortlistsPage});
