// Recruiting shell. A project is the durable hiring workspace; searches live inside it.
// Shortlists, outreach and tasks are scoped to the selected project, while company data
// and connections stay global.

function SidebarItem({ collapsed, active, icon, label, onClick, nested = false, action = false, badge }) {
  return (
    <button onClick={onClick} title={collapsed ? label : undefined}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, width: '100%',
        height: 38, padding: collapsed ? 0 : nested ? '0 10px 0 24px' : '0 10px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        background: active ? 'var(--beige-200)' : 'transparent',
        color: active ? 'var(--fg1)' : 'var(--fg2)', border: 0, borderRadius: 8,
        cursor: 'pointer', fontFamily: 'inherit', fontSize: 14,
        fontWeight: active ? 500 : 400, textAlign: 'left', marginBottom: 2,
      }}>
      <i className={`ph ph-${icon}`} style={{
        flex: '0 0 auto', fontSize: action ? 17 : 18,
        color: action ? 'var(--green-800)' : active ? 'var(--green-800)' : 'var(--fg3)',
      }} />
      {!collapsed && <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>}
      {!collapsed && badge > 0 && <span style={{ minWidth: 20, height: 20, padding: '0 6px', borderRadius: 9999, background: 'var(--green-200)', color: 'var(--green-800)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{badge}</span>}
    </button>
  );
}

function Sidebar({ collapsed, onToggle, current, onNav, started, onNewSearch, conversations = [], activeConversationId, onOpenConversation, taskCount = 0 }) {
  const W = collapsed ? 72 : 256;
  const projectNav = [
    { id: 'search', icon: 'magnifying-glass', label: 'Search' },
    { id: 'shortlists', icon: 'bookmark-simple', label: 'Shortlists' },
    { id: 'outreach', icon: 'envelope-simple', label: 'Outreach' },
    { id: 'tasks', icon: 'clock-counter-clockwise', label: 'Tasks' },
  ];

  return (
    <aside style={{
      width: W, flex: `0 0 ${W}px`, height: '100%', background: 'var(--beige-50)',
      borderRight: '1px solid var(--beige-300)', display: 'flex', flexDirection: 'column',
      transition: 'width 200ms cubic-bezier(0.16,1,0.3,1)', overflow: 'hidden',
    }}>
      <div style={{
        height: 64, flex: '0 0 64px', display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between', padding: collapsed ? 0 : '0 16px', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <img src="../../assets/logo-mark.svg" width="26" height="26" alt="Ema" />
          {!collapsed && <div style={{ fontSize: 17, color: 'var(--fg1)', whiteSpace: 'nowrap' }}><strong style={{ fontWeight: 700 }}>Ema</strong> Hiring</div>}
        </div>
        {!collapsed && <IconButton icon="sidebar-simple" onClick={onToggle} size="sm" title="Collapse" />}
      </div>

      <div style={{ padding: '8px 12px 12px', flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {!collapsed && (
          <div style={{
            display: 'flex', alignItems: 'center',
            padding: '8px 8px 7px', color: 'var(--fg3)',
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.1 }}>Projects</span>
          </div>
        )}

        {!collapsed && (
          <button onClick={() => onNav('home')} style={{
            width: '100%', height: 44, display: 'flex', alignItems: 'center', gap: 10,
            padding: '0 10px', marginBottom: 6, border: '1px solid var(--beige-300)',
            borderRadius: 10, background: 'var(--beige-100)', color: 'var(--fg1)',
            cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
          }}>
            <i className="ph ph-folder" style={{ fontSize: 19, color: 'var(--green-800)' }} />
            <span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{PROJECT_NAME}</span>
            <i className="ph ph-caret-down" style={{ fontSize: 12, color: 'var(--fg3)' }} />
          </button>
        )}

        <SidebarItem collapsed={collapsed} icon="house" label="Home"
          active={current === 'home'} onClick={() => onNav('home')} />

        {projectNav.map(item => (
          <SidebarItem key={item.id} collapsed={collapsed} {...item}
            badge={item.id === 'tasks' ? taskCount : 0}
            active={current === item.id && !(started && item.id === 'search')}
            onClick={() => item.id === 'search' ? onNewSearch() : onNav(item.id)} />
        ))}

        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', padding: '18px 8px 7px', color: 'var(--fg3)' }}>
            <span style={{ flex: 1, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.1 }}>Conversations</span>
            <IconButton icon="plus" size="sm" title="New conversation" onClick={onNewSearch} />
          </div>
        )}
        {collapsed && (
          <SidebarItem collapsed icon="plus" label="New conversation" action onClick={onNewSearch} />
        )}

        {conversations.length ? (
          conversations.map(conversation => (
            <SidebarItem key={conversation.id} collapsed={collapsed} icon="chat-circle-text" label={conversation.title}
              active={current === 'search' && conversation.id === activeConversationId}
              onClick={() => onOpenConversation && onOpenConversation(conversation.id)} />
          ))
        ) : (
          !collapsed && <div style={{ padding: '2px 10px 10px', fontSize: 12, color: 'var(--fg3)' }}>No conversations yet</div>
        )}
      </div>

      <div style={{ padding: '8px 12px 4px' }}>
        <SidebarItem collapsed={collapsed} icon="buildings" label="Company profile"
          active={current === 'company'} onClick={() => onNav('company')} />
        <SidebarItem collapsed={collapsed} icon="plugs-connected" label="Connections"
          active={current === 'connections'} onClick={() => onNav('connections')} />
      </div>

      <div style={{
        margin: '0 12px', padding: '12px 4px', borderTop: '1px solid var(--beige-300)',
        display: 'flex', alignItems: 'center', gap: 10, justifyContent: collapsed ? 'center' : 'flex-start',
      }}>
        {collapsed ? (
          <IconButton icon="sidebar-simple" onClick={onToggle} size="sm" title="Expand sidebar" />
        ) : (
          <>
            <Avatar name="Ananya Kulkarni" size={34} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Ananya Kulkarni</div>
              <div style={{ fontSize: 12, color: 'var(--fg3)' }}>Head of Design</div>
            </div>
            <i className="ph ph-dots-three" style={{ fontSize: 18, color: 'var(--fg3)' }} />
          </>
        )}
      </div>
    </aside>
  );
}

function Navbar({ title, breadcrumbs = [], chatTitle, onNewChat, onMinimizeChat }) {
  if (chatTitle) return (
    <header style={{
      height: 56, flex: '0 0 56px', background: 'var(--beige-50)',
      borderBottom: '1px solid var(--beige-300)', display: 'flex',
      alignItems: 'center', padding: '0 20px', gap: 8,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{chatTitle}</div>
        <div style={{ marginTop: 1, fontSize: 10, color: 'var(--fg3)' }}>Conversation with Ema</div>
      </div>
      <IconButton icon="plus" title="New chat" onClick={onNewChat} />
      <IconButton icon="arrows-in-simple" title="Minimise chat" onClick={onMinimizeChat} />
    </header>
  );
  return (
    <header style={{
      height: 56, flex: '0 0 56px', background: 'var(--beige-50)',
      borderBottom: '1px solid var(--beige-300)', display: 'flex',
      alignItems: 'center', padding: '0 20px', gap: 14,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
        {breadcrumbs.length > 0 ? breadcrumbs.map((b, i) => (
          <React.Fragment key={i}>
            <span style={{ fontSize: 13, color: i === breadcrumbs.length - 1 ? 'var(--fg1)' : 'var(--fg2)', fontWeight: i === breadcrumbs.length - 1 ? 500 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b}</span>
            {i < breadcrumbs.length - 1 && <i className="ph ph-caret-right" style={{ fontSize: 11, color: 'var(--fg3)' }} />}
          </React.Fragment>
        )) : <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--fg1)' }}>{title}</div>}
      </div>
      <IconButton icon="bell" title="Notifications" />
      <IconButton icon="question" title="Help" />
    </header>
  );
}

Object.assign(window, { Sidebar, Navbar });
