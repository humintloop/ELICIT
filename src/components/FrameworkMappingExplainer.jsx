import {
  ASSURANCE_PROFILE,
  CONTROL_SET,
  FRAMEWORK_REFERENCES,
  buildCaseMapping,
} from '../data/frameworkMappings';
import { getMitigationMapping } from '../data/mitigationMappings';

export default function FrameworkMappingExplainer({
  C,
  techniqueId,
  techniqueName,
  owasp,
  payload,
  finding,
  compact = false,
}) {
  const mapping = finding ? {
    mapped_controls: finding.mappedControls || finding.mapped_controls || [],
    nist_ai_rmf: finding.nistAiRmf || finding.nist_ai_rmf || [],
    eu_ai_act_relevance: finding.euAiActRelevance || finding.eu_ai_act_relevance || [],
    eu_ai_act_scope: finding.euAiActScope || finding.eu_ai_act_scope || ASSURANCE_PROFILE.eu_ai_act_scope.default_status,
    iso_42001_relevance: finding.iso42001Relevance || finding.iso_42001_relevance || [],
    readiness_gaps: finding.readinessGaps || finding.readiness_gaps || [],
  } : buildCaseMapping(techniqueId, payload || {});
  const mitigation = getMitigationMapping(techniqueId);
  const mappedControls = (mapping.mapped_controls || []).map(id => CONTROL_SET[id]).filter(Boolean);
  const officialMitigations = finding?.officialMitigations || finding?.official_mitigations || mitigation.official_mitigations || [];
  const recommendedMitigations = finding?.recommendedMitigations || finding?.recommended_mitigations || mitigation.recommended_mitigations || [];
  const retestGuidance = finding?.retestGuidance || finding?.retest_guidance || mitigation.retest_guidance || [];
  const mitreLabel = FRAMEWORK_REFERENCES.mitre_atlas[techniqueId] || techniqueName || techniqueId;
  const owaspLabel = FRAMEWORK_REFERENCES.owasp[owasp] || owasp;

  return (
    <section style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 5, overflow: 'hidden' }}>
      <div style={{ padding: '9px 12px', borderBottom: `1px solid ${C.border}`, background: 'rgba(255,255,255,.012)' }}>
        <div style={{ fontSize: 11, color: C.text2, letterSpacing: 1.4, fontWeight: 800, textTransform: 'uppercase' }}>Control relevance</div>
        <div style={{ fontSize: 12, color: C.text3, lineHeight: 1.45, marginTop: 4 }}>
          Traceability aid only. These mappings are not legal conclusions, certification evidence, or automatic noncompliance findings.
        </div>
      </div>
      <div style={{ padding: 12, display: 'grid', gap: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 8 }}>
          <Mini C={C} label="MITRE ATLAS" value={mitreLabel} detail={techniqueId} />
          <Mini C={C} label="OWASP LLM Top 10" value={owaspLabel || 'Not mapped'} detail={owasp || 'No category'} />
          <Mini C={C} label="Profile" value={ASSURANCE_PROFILE.label} detail={mapping.eu_ai_act_scope || 'conditional-readiness'} />
        </div>

        <ListSection C={C} title="Mapped ELICIT controls" items={mappedControls.map(control => ({
          key: control.id,
          title: `${control.id} - ${control.name}`,
          text: `${control.domain}: ${control.objective}`,
        }))} />

        {!compact && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
            <ListSection C={C} title="ISO/IEC 42001" items={(mapping.iso_42001_relevance || []).map(id => ({
              key: id,
              title: id,
              text: FRAMEWORK_REFERENCES.iso_42001[id] || id,
            }))} />
            <ListSection C={C} title="EU AI Act readiness" items={(mapping.eu_ai_act_relevance || []).map(id => ({
              key: id,
              title: id,
              text: FRAMEWORK_REFERENCES.eu_ai_act[id] || id,
            }))} />
            <ListSection C={C} title="NIST AI RMF" items={(mapping.nist_ai_rmf || []).map(id => ({
              key: id,
              title: id,
              text: FRAMEWORK_REFERENCES.nist_ai_rmf[id] || id,
            }))} />
          </div>
        )}

        <ListSection C={C} title="Readiness gaps" items={(mapping.readiness_gaps || []).map((text, idx) => ({ key: idx, title: `Gap ${idx + 1}`, text }))} />
        {!compact && officialMitigations.length > 0 && (
          <ListSection C={C} title="Official mitigation references" items={officialMitigations.map(item => ({
            key: item.id,
            title: `${item.source}: ${item.id}`,
            text: item.name,
          }))} />
        )}
        {!compact && recommendedMitigations.length > 0 && (
          <ListSection C={C} title="Recommended actions" items={recommendedMitigations.map((text, idx) => ({ key: idx, title: `Action ${idx + 1}`, text }))} />
        )}
        {!compact && retestGuidance.length > 0 && (
          <ListSection C={C} title="Retest guidance" items={retestGuidance.map((text, idx) => ({ key: idx, title: `Retest ${idx + 1}`, text }))} />
        )}
      </div>
    </section>
  );
}

function Mini({ C, label, value, detail }) {
  return (
    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, padding: '9px 10px' }}>
      <div style={{ fontSize: 10, color: C.text3, letterSpacing: 1.3, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 13, color: C.text1, fontWeight: 800, lineHeight: 1.4, marginTop: 4 }}>{value}</div>
      <div style={{ fontSize: 11, color: C.text3, marginTop: 3 }}>{detail}</div>
    </div>
  );
}

function ListSection({ C, title, items }) {
  if (!items.length) return null;
  return (
    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, padding: '9px 10px' }}>
      <div style={{ fontSize: 10, color: C.text3, letterSpacing: 1.3, textTransform: 'uppercase', marginBottom: 7 }}>{title}</div>
      <div style={{ display: 'grid', gap: 7 }}>
        {items.map(item => (
          <div key={item.key}>
            <div style={{ fontSize: 12, color: C.amber, fontWeight: 800 }}>{item.title}</div>
            <div style={{ fontSize: 12, color: C.text2, lineHeight: 1.45, marginTop: 2 }}>{item.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
