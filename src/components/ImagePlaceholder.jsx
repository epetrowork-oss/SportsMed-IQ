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

  return (
    <div
      className={`image-slot image-placeholder image-placeholder-bg-${background}`}
      style={style}
      role="img"
      aria-label={alt}
      title={description}
      {...dataProps}
    >
      <span className="image-placeholder-icon" aria-hidden="true">
        🖼
      </span>
      <span className="image-placeholder-asset">{asset}</span>
      <span className="image-placeholder-meta">
        {ratio} · {purpose}
      </span>
    </div>
  )
}
