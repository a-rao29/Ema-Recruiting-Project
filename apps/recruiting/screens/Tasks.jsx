// Project-scoped recurring search tasks. This prototype illustrates the saved
// automation and its schedule; it does not simulate background execution.

function readableTaskTime(value) {
  const [hours, minutes] = String(value || '09:00').split(':').map(Number);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const hour = hours % 12 || 12;
  return `${hour}:${String(minutes || 0).padStart(2, '0')} ${suffix}`;
}

function TasksPage({ tasks = [], onOpenSearch }) {
  return (
    <div style={{ width: '100%', maxWidth: 920, margin: '0 auto', padding: '48px 28px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, lineHeight: '34px', fontWeight: 700, color: 'var(--fg1)' }}>Tasks</h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, lineHeight: '20px', color: 'var(--fg2)' }}>Recurring searches Ema runs for this project.</p>
        </div>
        <span style={{ flex: 1 }} />
        {tasks.length > 0 && <Badge variant="success" size="sm" icon="check-circle">{tasks.length} active</Badge>}
      </div>

      {tasks.length === 0 ? (
        <div style={{ padding: '48px 24px', textAlign: 'center', background: 'var(--white)', border: '1px solid var(--beige-400)', borderRadius: 12 }}>
          <span style={{ width: 40, height: 40, margin: '0 auto 12px', borderRadius: 10, background: 'var(--beige-100)', color: 'var(--fg3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="ph ph-clock-counter-clockwise" style={{ fontSize: 20 }} /></span>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg1)' }}>No recurring tasks yet</div>
          <p style={{ margin: '5px auto 16px', maxWidth: 420, fontSize: 13, lineHeight: '19px', color: 'var(--fg2)' }}>Refine a search with Ema, then turn it into a task to receive new matching profiles on a schedule.</p>
          <Button variant="secondary" color="brand" size="sm" icon="arrow-left" onClick={onOpenSearch}>Back to search</Button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tasks.map(task => (
            <div key={task.id} style={{ padding: 18, background: 'var(--white)', border: '1px solid var(--beige-400)', borderRadius: 12, boxShadow: 'var(--shadow-xs)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--green-200)', color: 'var(--green-800)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}><i className="ph ph-magnifying-glass" style={{ fontSize: 17 }} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--fg1)' }}>{task.title}</span>
                    <Badge variant="success" size="sm">Active</Badge>
                  </div>
                  <div style={{ marginTop: 3, fontSize: 12, color: 'var(--fg2)' }}>{task.searchName} · {PROJECT_NAME}</div>
                </div>
                <Button variant="secondary" color="brand" size="sm" onClick={onOpenSearch}>Open search</Button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10, marginTop: 16 }}>
                {[
                  ['Schedule', `Every day at ${readableTaskTime(task.time)}`, 'calendar-blank'],
                  ['Threshold', `${task.minMatch}% criteria match or higher`, 'chart-line-up'],
                  ['Delivery', task.delivery, 'bell'],
                ].map(([label, value, icon]) => (
                  <div key={label} style={{ minWidth: 0, padding: '10px 11px', borderRadius: 8, background: 'var(--beige-50)', border: '1px solid var(--beige-300)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .6, color: 'var(--fg3)' }}><i className={`ph ph-${icon}`} style={{ fontSize: 11 }} />{label}</div>
                    <div style={{ marginTop: 4, fontSize: 12, lineHeight: '18px', color: 'var(--fg1)' }}>{value}</div>
                  </div>
                ))}
              </div>

              <p style={{ margin: '13px 0 0', fontSize: 12, lineHeight: '18px', color: 'var(--fg2)' }}>Ema will search using the latest criteria and share only additional profiles that have not appeared in the existing list.</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: 11, color: 'var(--fg3)' }}><i className="ph ph-globe" />{task.timezone}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { TasksPage, readableTaskTime });
