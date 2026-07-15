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
  // Wound-care lesson diagrams (batch 6; bleeding-type-comparison and
  // minor-vs-serious held for a redo — right-edge bleed from the
  // production sheet — so they stay unmapped for now).
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
