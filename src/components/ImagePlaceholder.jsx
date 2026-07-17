// Reusable image slot: renders a labeled placeholder box until a real image
// lands, at which point passing `src` swaps in the actual <img> — a one-prop
// change per slot, no layout rework needed.
//
// Every instance carries its full metadata (asset name, purpose, ratio,
// background, target location) as data-* attributes so the whole set of
// slots can be scanned from the DOM or the source tree — see
// scripts/list-image-slots.mjs, which scans the source tree directly to
// build the shot list handed to the image author.
//
// No network requests are ever made here: finished assets resolve to local
// PWA paths, while unfinished slots continue to render pure CSS/DOM.

const REAL_IMAGE_PATHS = {
  'home-hero.webp': 'images/home/home-hero.webp',
  'category-head-spine-injuries.webp':
    'images/categories/category-head-spine-injuries.webp',
  'category-environmental-emergencies.webp':
    'images/categories/category-environmental-emergencies.webp',
  'category-acute-care-first-aid.webp':
    'images/categories/category-acute-care-first-aid.webp',
  'category-lower-extremity-injuries.webp':
    'images/categories/category-lower-extremity-injuries.webp',
  'category-upper-extremity-injuries.webp':
    'images/categories/category-upper-extremity-injuries.webp',
  'category-muscle-soft-tissue.webp':
    'images/categories/category-muscle-soft-tissue.webp',
  'category-prevention-performance.webp':
    'images/categories/category-prevention-performance.webp',
  'unit-concussion-hero.webp':
    'images/units/concussion/unit-concussion-hero.webp',
  'unit-heat-illness-hero.webp':
    'images/units/heat-illness/unit-heat-illness-hero.webp',
  'unit-emergency-action-plan-hero.webp':
    'images/units/emergency-action-plan/unit-emergency-action-plan-hero.webp',
  'unit-wound-care-hero.webp':
    'images/units/wound-care/unit-wound-care-hero.webp',
  'unit-ankle-sprain-hero.webp':
    'images/units/ankle-sprain/unit-ankle-sprain-hero.webp',
  'unit-fractures-dislocations-hero.webp':
    'images/units/fractures-dislocations/unit-fractures-dislocations-hero.webp',
  'unit-knee-acl-hero.webp':
    'images/units/knee-acl/unit-knee-acl-hero.webp',
  'unit-shoulder-injuries-hero.webp':
    'images/units/shoulder-injuries/unit-shoulder-injuries-hero.webp',
  'unit-muscle-strains-hero.webp':
    'images/units/muscle-strains/unit-muscle-strains-hero.webp',
  'unit-overuse-injuries-hero.webp':
    'images/units/overuse-injuries/unit-overuse-injuries-hero.webp',
  'unit-taping-wrapping-hero.webp':
    'images/units/taping-wrapping/unit-taping-wrapping-hero.webp',
  'unit-warmup-injury-prevention-hero.webp':
    'images/units/warmup-injury-prevention/unit-warmup-injury-prevention-hero.webp',
  'unit-cold-exposure-hero.webp':
    'images/units/cold-exposure/unit-cold-exposure-hero.webp',
  'unit-hydration-nutrition-hero.webp':
    'images/units/hydration-nutrition/unit-hydration-nutrition-hero.webp',
  'unit-dental-facial-trauma-hero.webp':
    'images/units/dental-facial-trauma/unit-dental-facial-trauma-hero.webp',
  'unit-eye-injuries-hero.webp':
    'images/units/eye-injuries/unit-eye-injuries-hero.webp',
  'unit-skin-conditions-hero.webp':
    'images/units/skin-conditions/unit-skin-conditions-hero.webp',
  'unit-sports-psychology-hero.webp':
    'images/units/sports-psychology/unit-sports-psychology-hero.webp',
  // Concussion lesson diagrams (batch 3).
  'concussion-brain-in-skull.webp':
    'images/units/concussion/concussion-brain-in-skull.webp',
  'concussion-brain-movement-mechanism.webp':
    'images/units/concussion/concussion-brain-movement-mechanism.webp',
  'concussion-warning-signs.webp':
    'images/units/concussion/concussion-warning-signs.webp',
  'concussion-second-impact-risk.webp':
    'images/units/concussion/concussion-second-impact-risk.webp',
  'concussion-lucid-interval-timeline.webp':
    'images/units/concussion/concussion-lucid-interval-timeline.webp',
  'concussion-return-to-play-steps.webp':
    'images/units/concussion/concussion-return-to-play-steps.webp',
  'concussion-return-to-play-stages.webp':
    'images/units/concussion/concussion-return-to-play-stages.webp',
  'concussion-neurometabolic-cascade.webp':
    'images/units/concussion/concussion-neurometabolic-cascade.webp',
  // Heat-illness lesson diagrams (batch 4).
  'heat-illness-sweat-cooling.webp':
    'images/units/heat-illness/heat-illness-sweat-cooling.webp',
  'heat-illness-dissipation-pathways.webp':
    'images/units/heat-illness/heat-illness-dissipation-pathways.webp',
  'heat-illness-collapse-differential.webp':
    'images/units/heat-illness/heat-illness-collapse-differential.webp',
  'heat-illness-spectrum-triage.webp':
    'images/units/heat-illness/heat-illness-spectrum-triage.webp',
  'heat-illness-cold-water-immersion-technique.webp':
    'images/units/heat-illness/heat-illness-cold-water-immersion-technique.webp',
  'heat-illness-prevention-habits.webp':
    'images/units/heat-illness/heat-illness-prevention-habits.webp',
  'heat-illness-warning-signs.webp':
    'images/units/heat-illness/heat-illness-warning-signs.webp',
  'heat-illness-heat-stroke-emergency.webp':
    'images/units/heat-illness/heat-illness-heat-stroke-emergency.webp',
  // Emergency-action-plan lesson diagrams (batch 5). The four 7-8
  // (emergency-action-plan-ms) images were reframed after review to the
  // unit's "notice and get an adult; adults handle 911/AED" pedagogy.
  'eap-team-role-assignment.webp':
    'images/units/emergency-action-plan/eap-team-role-assignment.webp',
  'eap-sca-cause-comparison.webp':
    'images/units/emergency-action-plan/eap-sca-cause-comparison.webp',
  'eap-cpr-hand-placement.webp':
    'images/units/emergency-action-plan/eap-cpr-hand-placement.webp',
  'eap-aed-pad-placement.webp':
    'images/units/emergency-action-plan/eap-aed-pad-placement.webp',
  'eap-collapsed-athlete-scene.webp':
    'images/units/emergency-action-plan/eap-collapsed-athlete-scene.webp',
  'eap-yell-for-help-scene.webp':
    'images/units/emergency-action-plan/eap-yell-for-help-scene.webp',
  'eap-aed-wall-case.webp':
    'images/units/emergency-action-plan/eap-aed-wall-case.webp',
  'eap-know-your-school-map.webp':
    'images/units/emergency-action-plan/eap-know-your-school-map.webp',
  // Wound-care lesson diagrams (batch 6, complete 8/8; bleeding-type-
  // comparison and minor-vs-serious were delivered with a neighboring
  // production-sheet panel bleeding into the right margin and were fixed
  // in-repo by white-filling the margin strip — card artwork untouched).
  'wound-care-bleeding-type-comparison.webp':
    'images/units/wound-care/wound-care-bleeding-type-comparison.webp',
  'wound-care-minor-vs-serious.webp':
    'images/units/wound-care/wound-care-minor-vs-serious.webp',
  'wound-care-junctional-wound-packing.webp':
    'images/units/wound-care/wound-care-junctional-wound-packing.webp',
  'wound-care-open-wound-types.webp':
    'images/units/wound-care/wound-care-open-wound-types.webp',
  'wound-care-direct-pressure-technique.webp':
    'images/units/wound-care/wound-care-direct-pressure-technique.webp',
  'wound-care-self-care-steps.webp':
    'images/units/wound-care/wound-care-self-care-steps.webp',
  'wound-care-infection-signs.webp':
    'images/units/wound-care/wound-care-infection-signs.webp',
  'wound-care-nosebleed-position.webp':
    'images/units/wound-care/wound-care-nosebleed-position.webp',
  // Ankle-sprain lesson diagrams (batch 7, complete 9/9). The first delivery
  // had neighboring-card slivers bleeding into a margin on several images
  // (fixed in-repo by white-filling the margin outside each card, artwork
  // untouched); swelling-signs, rice-steps, and deformity-warning came back
  // on the wrong topic and were redone (the redos also had thin edge slivers,
  // fixed the same way). See docs/IMAGE-BATCHES.md batch 7.
  'ankle-sprain-syndesmosis-anatomy.webp':
    'images/units/ankle-sprain/ankle-sprain-syndesmosis-anatomy.webp',
  'ankle-sprain-differential-diagnosis.webp':
    'images/units/ankle-sprain/ankle-sprain-differential-diagnosis.webp',
  'ankle-sprain-ligament-basics.webp':
    'images/units/ankle-sprain/ankle-sprain-ligament-basics.webp',
  'ankle-sprain-swelling-signs.webp':
    'images/units/ankle-sprain/ankle-sprain-swelling-signs.webp',
  'ankle-sprain-rice-steps.webp':
    'images/units/ankle-sprain/ankle-sprain-rice-steps.webp',
  'ankle-sprain-deformity-warning.webp':
    'images/units/ankle-sprain/ankle-sprain-deformity-warning.webp',
  'ankle-sprain-lateral-ligaments.webp':
    'images/units/ankle-sprain/ankle-sprain-lateral-ligaments.webp',
  'ankle-sprain-inversion-mechanism.webp':
    'images/units/ankle-sprain/ankle-sprain-inversion-mechanism.webp',
  'ankle-sprain-grading-comparison.webp':
    'images/units/ankle-sprain/ankle-sprain-grading-comparison.webp',
  // Fractures-dislocations lesson diagrams (batch 8, complete 8/8). Clean
  // delivery — standalone full-frame cards, no slivers, no photographs. The
  // fracture-vs-dislocation slot was delivered as an illustrated athlete
  // recognition graphic (not the isolated bone diagram originally briefed,
  // to avoid duplicating bone-vs-joint-diagram); its unit-JSON alt/desc were
  // updated to match. See docs/IMAGE-BATCHES.md batch 8.
  'fractures-dislocations-pattern-classification.webp':
    'images/units/fractures-dislocations/fractures-dislocations-pattern-classification.webp',
  'fractures-dislocations-patellar-vs-knee-dislocation.webp':
    'images/units/fractures-dislocations/fractures-dislocations-patellar-vs-knee-dislocation.webp',
  'fractures-dislocations-fracture-vs-dislocation.webp':
    'images/units/fractures-dislocations/fractures-dislocations-fracture-vs-dislocation.webp',
  'fractures-dislocations-warning-signs.webp':
    'images/units/fractures-dislocations/fractures-dislocations-warning-signs.webp',
  'fractures-dislocations-do-not-move.webp':
    'images/units/fractures-dislocations/fractures-dislocations-do-not-move.webp',
  'fractures-dislocations-doctor-xray-decision.webp':
    'images/units/fractures-dislocations/fractures-dislocations-doctor-xray-decision.webp',
  'fractures-dislocations-bone-vs-joint-diagram.webp':
    'images/units/fractures-dislocations/fractures-dislocations-bone-vs-joint-diagram.webp',
  'fractures-dislocations-open-vs-closed.webp':
    'images/units/fractures-dislocations/fractures-dislocations-open-vs-closed.webp',
  // Knee-acl lesson diagrams (batch 9, complete 8/8). Clean delivery — no
  // slivers, no photographs, anatomy vetted (ACL/PCL cross inside, MCL
  // medial / LCL lateral, C-shaped menisci). The noncontact-landing slot was
  // delivered as a user-approved lower-body skeletal biomechanics diagram
  // (not a full-body action figure); its unit-JSON alt/desc were updated to
  // match. On differential-comparison-chart, the meniscal-tear swelling cell's
  // '(2-3 days)' parenthetical was removed in-repo (it contradicted the app's
  // 'hours to a day' / 'overnight' teaching in six places, per Codex); the
  // cell now reads 'Usually gradual', matching the three no-parenthetical
  // columns. See docs/IMAGE-BATCHES.md batch 9.
  'knee-acl-position-of-no-return.webp':
    'images/units/knee-acl/knee-acl-position-of-no-return.webp',
  'knee-acl-differential-comparison-chart.webp':
    'images/units/knee-acl/knee-acl-differential-comparison-chart.webp',
  'knee-acl-inside-the-knee.webp':
    'images/units/knee-acl/knee-acl-inside-the-knee.webp',
  'knee-acl-planting-twist-mechanism.webp':
    'images/units/knee-acl/knee-acl-planting-twist-mechanism.webp',
  'knee-acl-warning-signs.webp':
    'images/units/knee-acl/knee-acl-warning-signs.webp',
  'knee-acl-deformity-emergency.webp':
    'images/units/knee-acl/knee-acl-deformity-emergency.webp',
  'knee-acl-anatomy-mechanism.webp':
    'images/units/knee-acl/knee-acl-anatomy-mechanism.webp',
  'knee-acl-noncontact-landing-mechanism.webp':
    'images/units/knee-acl/knee-acl-noncontact-landing-mechanism.webp',
  // Shoulder-injuries lesson diagrams (batch 10, complete 8/8). Clean
  // delivery — no slivers, no photographs, anatomy vetted (glenoid/labrum,
  // four rotator-cuff muscles with a posterior-cuff inset for infraspinatus/
  // teres minor, separate AC joint; Bankart = anterior-inferior labrum,
  // Hill-Sachs = posterior humeral-head divot; dislocation squared-off vs AC
  // step-off; classic vs internal impingement with correct athlete groups).
  // The dislocation-vs-ac-sprain arm is guarded/supported (its unit-JSON
  // alt/desc were made position-neutral to stay consistent with the lesson's
  // 'held away from the body' text). See docs/IMAGE-BATCHES.md batch 10.
  'shoulder-injuries-bankart-hill-sachs.webp':
    'images/units/shoulder-injuries/shoulder-injuries-bankart-hill-sachs.webp',
  'shoulder-injuries-internal-vs-classic-impingement.webp':
    'images/units/shoulder-injuries/shoulder-injuries-internal-vs-classic-impingement.webp',
  'shoulder-injuries-two-causes.webp':
    'images/units/shoulder-injuries/shoulder-injuries-two-causes.webp',
  'shoulder-injuries-warning-signs.webp':
    'images/units/shoulder-injuries/shoulder-injuries-warning-signs.webp',
  'shoulder-injuries-support-the-arm.webp':
    'images/units/shoulder-injuries/shoulder-injuries-support-the-arm.webp',
  'shoulder-injuries-overhead-ache.webp':
    'images/units/shoulder-injuries/shoulder-injuries-overhead-ache.webp',
  'shoulder-injuries-glenohumeral-anatomy.webp':
    'images/units/shoulder-injuries/shoulder-injuries-glenohumeral-anatomy.webp',
  'shoulder-injuries-dislocation-vs-ac-sprain.webp':
    'images/units/shoulder-injuries/shoulder-injuries-dislocation-vs-ac-sprain.webp',
}

function ratioToCss(ratio) {
  const [w, h] = String(ratio).split(':')
  return w && h ? `${w} / ${h}` : undefined
}

export default function ImagePlaceholder({
  asset,
  purpose,
  ratio,
  background = 'transparent',
  description,
  noText = true,
  location,
  alt,
  src,
}) {
  const style = { aspectRatio: ratioToCss(ratio) }
  const dataProps = {
    'data-image-slot': asset,
    'data-asset': asset,
    'data-purpose': purpose,
    'data-ratio': ratio,
    'data-background': background,
    'data-location': location,
  }
  const localPath = REAL_IMAGE_PATHS[asset]
  const resolvedSrc = src ?? (localPath ? `${import.meta.env.BASE_URL}${localPath}` : undefined)

  if (resolvedSrc) {
    return (
      <img
        src={resolvedSrc}
        alt={alt}
        loading="lazy"
        className="image-slot image-slot-real"
        style={style}
        {...dataProps}
      />
    )
  }

  // Filename/ratio/purpose stay available (per data-* attributes above and
  // this title) without being visibly rendered — the visible tile is just a
  // short human label, not dev scaffolding.
  const metaTitle = [asset, ratio, purpose].filter(Boolean).join(' · ')

  // Icon-sized slots (the Library category icons) stay icon-only: no chip,
  // no label, same dimensions as before.
  if (purpose === 'category icon') {
    return (
      <div
        className="image-slot image-placeholder image-placeholder-icon-only"
        style={style}
        role="img"
        aria-label={alt}
        title={metaTitle}
        {...dataProps}
      >
        <span className="image-placeholder-icon" aria-hidden="true">
          🖼
        </span>
      </div>
    )
  }

  return (
    <div
      className="image-slot image-placeholder"
      style={style}
      role="img"
      aria-label={alt}
      title={metaTitle}
      {...dataProps}
    >
      <span className="image-placeholder-chip">
        <span className="image-placeholder-icon" aria-hidden="true">
          🖼
        </span>
      </span>
      <span className="image-placeholder-label">Illustration coming soon</span>
    </div>
  )
}
