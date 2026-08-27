// Renders a QR matrix as inline SVG. Inline because the app ships no image
// assets and makes no network calls — the code has to be drawable on a
// Chromebook with the wi-fi off.
//
// Colors are fixed black-on-white rather than themed: a scanner needs the
// contrast and the quiet zone, and a QR tinted to match the page is a QR
// that half the phones in the room fail to read.

import { useMemo } from 'react'
import { encodeQr, qrPath, QUIET_ZONE } from '../lib/qr.js'

export default function QrCode({ text, size = 320, minEc = 'M', label = 'QR code' }) {
  const matrix = useMemo(() => {
    try {
      return encodeQr(text, { minEc })
    } catch {
      return null
    }
  }, [text, minEc])

  const path = useMemo(() => (matrix ? qrPath(matrix) : ''), [matrix])

  if (!matrix) return null
  const dim = matrix.size + QUIET_ZONE * 2

  return (
    <svg
      className="qr-code"
      viewBox={`0 0 ${dim} ${dim}`}
      width={size}
      height={size}
      role="img"
      aria-label={label}
      shapeRendering="crispEdges"
    >
      <rect width={dim} height={dim} fill="#ffffff" />
      <path d={path} fill="#000000" />
    </svg>
  )
}
