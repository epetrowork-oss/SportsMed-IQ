// Reusable image slot: renders a labeled placeholder box until a real image
// lands, at which point an available local asset swaps in the actual <img>.
// All image files live in public/ and remain available fully offline.

const REAL_IMAGE_PATHS = {
  'home-hero.webp': 'images/home/home-hero.webp',
  'category-head-spine-injuries.webp': 'images/categories/category-head-spine-injuries.webp',
  'category-environmental-emergencies.webp': 'images/categories/category-environmental-emergencies.webp',
  'category-acute-care-first-aid.webp': 'images/categories/category-acute-care-first-aid.webp',
  'category-lower-extremity-injuries.webp': 'images/categories/category-lower-extremity-injuries.webp',
  'category-upper-extremity-injuries.webp': 'images/categories/category-upper-extremity-injuries.webp',
  'category-muscle-soft-tissue.webp': 'images/categories/category-muscle-soft-tissue.webp',
  'category-prevention-performance.webp': 'images/categories/category-prevention-performance.webp',
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
