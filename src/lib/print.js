function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function list(items, ordered = false, className = '') {
  if (!Array.isArray(items) || items.length === 0) return ''
  const tag = ordered ? 'ol' : 'ul'
  return `<${tag}${className ? ` class="${className}"` : ''}>${items
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join('')}</${tag}>`
}

function studentLines() {
  return `
    <div class="student-lines">
      <span>Name: ______________________________</span>
      <span>Class period: __________</span>
      <span>Date: __________</span>
    </div>`
}

function printStyles() {
  return `
    @page { size: letter; margin: 0.55in; }
    * { box-sizing: border-box; }
    body { margin: 0; color: #111; background: #fff; font: 11pt/1.45 Arial, sans-serif; }
    h1 { font-size: 22pt; margin: 0 0 0.2in; }
    h2 { font-size: 15pt; margin: 0.25in 0 0.1in; break-after: avoid; }
    h3 { font-size: 12pt; margin: 0.2in 0 0.08in; break-after: avoid; }
    p { margin: 0 0 0.12in; }
    li { margin-bottom: 0.05in; }
    section, .callout, .activity-block { break-inside: avoid; }
    .student-lines { display: flex; flex-wrap: wrap; gap: 0.18in 0.35in; margin: 0.15in 0 0.25in; font-weight: 600; }
    .summary { color: #333; margin-bottom: 0.2in; }
    .callout { border: 1px solid #555; padding: 0.12in; margin: 0.12in 0; }
    .callout strong { display: block; margin-bottom: 0.04in; }
    .safety { border: 2px solid #222; padding: 0.12in; }
    .checklist { list-style: none; padding-left: 0; }
    .checklist li::before { content: '☐ '; }
    .response-lines { min-height: 1.65in; border-bottom: 1px solid #bbb; background: repeating-linear-gradient(to bottom, transparent 0, transparent 0.29in, #bbb 0.30in); }
    table { width: 100%; border-collapse: collapse; margin-top: 0.08in; font-size: 9.5pt; }
    th, td { border: 1px solid #555; padding: 0.08in; text-align: left; vertical-align: top; }
    tr { break-inside: avoid; }
    .page-break { break-before: page; }
    .standards { margin-top: 0.35in; font-size: 9pt; }
    .activity-block + .activity-block { break-before: page; }
    .print-note { font-size: 9pt; color: #444; }
    @media print { .no-print { display: none !important; } }
  `
}

function documentShell(title, body) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>${printStyles()}</style>
</head>
<body>
  ${body}
  <script>
    window.addEventListener('load', () => {
      window.focus();
      window.print();
    });
  <\/script>
</body>
</html>`
}

function openPrintDocument(title, body) {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return false
  try {
    printWindow.opener = null
    printWindow.document.open()
    printWindow.document.write(documentShell(title, body))
    printWindow.document.close()
    return true
  } catch {
    printWindow.close()
    return false
  }
}

function renderSection(section) {
  const paragraphs = (section.body ?? []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')
  const bullets = list(section.list)
  const callout = section.callout
    ? `<div class="callout"><strong>${escapeHtml(section.callout.title || 'Important')}</strong><p>${escapeHtml(section.callout.text)}</p></div>`
    : ''
  const imageContext = section.image
    ? `<p class="print-note"><strong>Visual reference:</strong> ${escapeHtml(section.image.alt || section.image.description)}</p>`
    : ''
  return `<section>${section.heading ? `<h2>${escapeHtml(section.heading)}</h2>` : ''}${paragraphs}${bullets}${callout}${imageContext}</section>`
}

function renderStandards(standards) {
  if (!Array.isArray(standards) || standards.length === 0) return ''
  return `<section class="standards"><h2>Standards alignment</h2><ul>${standards
    .map((standard) => `<li><strong>${escapeHtml(standard.framework.shortName)} ${escapeHtml(standard.officialCode)}</strong> — ${escapeHtml(standard.text)}</li>`)
    .join('')}</ul></section>`
}

function renderActivity(activity, includePageBreak = false) {
  const safety = activity.safetyNotes?.length
    ? `<section class="safety"><h3>Safety notes</h3>${list(activity.safetyNotes)}</section>`
    : ''
  const rubric = activity.rubric?.length
    ? `<section class="page-break"><h2>Teacher rubric — ${escapeHtml(activity.title)}</h2><table><thead><tr><th>Criterion</th><th>Proficient evidence</th><th>Notes</th></tr></thead><tbody>${activity.rubric
      .map((row) => `<tr><td>${escapeHtml(row.criterion)}</td><td>${escapeHtml(row.proficient)}</td><td></td></tr>`)
      .join('')}</tbody></table></section>`
    : ''
  return `<article class="activity-block${includePageBreak ? ' page-break' : ''}">
    <h1>${escapeHtml(activity.title)}</h1>
    <p class="summary">Estimated time: about ${escapeHtml(activity.estimatedMinutes)} minutes</p>
    ${studentLines()}
    ${safety}
    ${activity.materials?.length ? `<section><h2>Materials</h2>${list(activity.materials)}</section>` : ''}
    <section><h2>Instructions</h2>${list(activity.instructions, true)}</section>
    ${activity.checklist?.length ? `<section><h2>Student checklist</h2>${list(activity.checklist, false, 'checklist')}</section>` : ''}
    ${activity.writtenResponse ? `<section><h2>Written response</h2><p>${escapeHtml(activity.writtenResponse)}</p><div class="response-lines" aria-label="Blank response space"></div></section>` : ''}
    <p class="print-note">Completion method: ${escapeHtml(activity.completionMethod.replaceAll('-', ' '))}${activity.teacherVerification ? ' · Teacher verification required' : ''}</p>
    ${rubric}
  </article>`
}

export function printLessonPacket(unit, standards = []) {
  const body = `
    <main>
      <h1>${escapeHtml(unit.title)}</h1>
      ${studentLines()}
      <p class="summary">${escapeHtml(unit.summary)}</p>
      ${(unit.sections ?? []).map(renderSection).join('')}
      ${renderStandards(standards)}
    </main>`
  return openPrintDocument(`${unit.title} — lesson`, body)
}

export function printPracticalPacket(unit, activities = []) {
  if (!activities.length) return false
  const body = `
    <main>
      <p class="print-note"><strong>Unit:</strong> ${escapeHtml(unit.title)} · <strong>Grade band:</strong> ${escapeHtml(unit.gradeBand)}</p>
      ${activities.map((activity, index) => renderActivity(activity, index > 0)).join('')}
    </main>`
  return openPrintDocument(`${unit.title} — practical activities`, body)
}
