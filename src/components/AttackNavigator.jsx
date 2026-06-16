import { Search } from 'lucide-react';

const filterLabels = [
  ['ALL', 'All'],
  ['AML.T0051.000', 'Direct injection'],
  ['AML.T0051.001', 'Indirect injection'],
  ['AML.T0054', 'Jailbreak'],
  ['AML.T0056', 'Prompt extraction'],
];

export default function AttackNavigator({
  C,
  clusters,
  activeClusterId,
  activeProbeId,
  filter,
  setFilter,
  query,
  setQuery,
  onSelectProbe,
}) {
  const normalizedQuery = query.trim().toLowerCase();
  const visibleClusters = clusters
    .filter(cluster => filter === 'ALL' || cluster.code === filter || cluster.id === filter)
    .map(cluster => ({
      ...cluster,
      payloads: cluster.payloads.filter(payload => {
        if (!normalizedQuery) return true;
        return [
          payload.name,
          payload.description,
          payload.technique,
          payload.difficulty,
          payload.owasp,
          payload.objective,
          payload.failure_mode,
        ].filter(Boolean).join(' ').toLowerCase().includes(normalizedQuery);
      }),
    }))
    .filter(cluster => cluster.payloads.length > 0);

  return (
    <aside className="attack-nav" style={{
      width: 300,
      minWidth: 260,
      maxWidth: 360,
      borderRight: `1px solid ${C.border}`,
      background: 'rgba(10,12,22,.7)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{ padding: 12, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ fontSize: 11, color: C.text2, letterSpacing: 1.4, fontWeight: 800, textTransform: 'uppercase', marginBottom: 9 }}>
          Attack Library
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
          {filterLabels.map(([id, label]) => (
            <button key={id} onClick={() => setFilter(id)} style={{
              padding: '4px 7px',
              background: filter === id ? C.amberBg : 'transparent',
              border: `1px solid ${filter === id ? C.amber : C.borderHi}`,
              color: filter === id ? C.amber : C.text2,
              borderRadius: 2,
              fontSize: 11,
              fontWeight: 800,
              cursor: 'pointer',
            }}>
              {label}
            </button>
          ))}
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 3, padding: '6px 8px' }}>
          <Search size={12} color={C.text3} />
          <input value={query} onChange={event => setQuery(event.target.value)} placeholder="search probes, controls, signals" style={{
            width: '100%',
            minWidth: 0,
            background: 'transparent',
            border: 'none',
            color: C.text1,
            fontSize: 12,
          }} />
        </label>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {visibleClusters.map(cluster => {
          const clusterActive = activeClusterId === cluster.id;
          const color = C[cluster.colorKey] || C.amber;
          return (
            <section key={cluster.id} style={{ borderBottom: `1px solid ${C.border}` }}>
              <div style={{ padding: '10px 12px 6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontSize: 11, color, letterSpacing: 1, fontWeight: 800 }}>{cluster.code}</span>
                  <span style={{ fontSize: 11, color: C.text3 }}>{cluster.payloads.length} probes</span>
                </div>
                <div style={{ fontSize: 13, color: clusterActive ? C.text1 : C.text2, fontWeight: 800, marginTop: 3 }}>{cluster.name}</div>
                {cluster.owasp && <div style={{ fontSize: 11, color: C.text3, marginTop: 2 }}>{cluster.owasp}</div>}
              </div>
              <div style={{ display: 'grid', gap: 2, padding: '0 8px 8px' }}>
                {cluster.payloads.map((payload, index) => {
                  const active = activeProbeId === payload.id;
                  return (
                    <button key={payload.id} onClick={() => onSelectProbe(cluster.id, payload.id)} style={{
                      textAlign: 'left',
                      background: active ? `${color}14` : 'transparent',
                      border: `1px solid ${active ? color : 'transparent'}`,
                      borderLeft: `3px solid ${active ? color : C.border}`,
                      borderRadius: 3,
                      padding: '8px 9px',
                      cursor: 'pointer',
                    }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: active ? color : C.text3 }}>{String(index + 1).padStart(2, '0')}</span>
                        <span style={{ fontSize: 12.5, color: active ? C.text1 : C.text2, fontWeight: active ? 800 : 600 }}>{payload.name}</span>
                      </div>
                      <div style={{ fontSize: 11, color: C.text3, marginTop: 3, lineHeight: 1.35 }}>
                        {payload.difficulty?.toUpperCase()} · {payload.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </aside>
  );
}
