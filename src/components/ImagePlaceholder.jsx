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
// No network requests are ever made here: the placeholder is pure CSS/DOM,
// keeping the app offline-first.

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

  if (src) {
    return (
      <img
        src={src}
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
