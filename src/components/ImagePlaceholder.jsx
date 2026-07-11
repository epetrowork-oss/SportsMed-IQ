// Reusable image slot: renders a labeled placeholder box until a real image
// lands, at which point an available local asset swaps in the actual <img>.
// All image files live in public/ and remain available fully offline.

const REAL_IMAGE_PATHS = {
  'unit-concussion-hero.webp': 'images/units/concussion/unit-concussion-hero.webp',
  'unit-heat-illness-hero.webp': 'images/units/heat-illness/unit-heat-illness-hero.webp',
  'unit-emergency-action-plan-hero.webp': 'images/units/emergency-action-plan/unit-emergency-action-plan-hero.webp',
  'unit-wound-care-hero.webp': 'images/units/wound-care/unit-wound-care-hero.webp',
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
  const resolvedSrc = src ?? (REAL_IMAGE_PATHS[asset] ? `${import.meta.env.BASE_URL}${REAL_IMAGE_PATHS[asset]}` : null)

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
      <span className="image-placeholder-icon" aria-hidden="true">🖼</span>
      <span className="image-placeholder-asset">{asset}</span>
      <span className="image-placeholder-meta">{ratio} · {purpose}</span>
    </div>
  )
}
