export interface OGImageProps {
  category: string
  title: string
  description: string
  vendor?: string
}

/**
 * Minimalist OG image template following project design system
 * - Sharp corners (border-radius: 0)
 * - Extremely minimalist aesthetic
 * - Grayscale with low-saturation colors
 * - IBM Plex Mono typography
 */
export function OGImageTemplate({ category, title, description, vendor }: OGImageProps) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0a0a0a',
        color: '#e0e0e0',
        padding: '80px',
        fontFamily: '"IBM Plex Mono", monospace',
      }}
    >
      {/* Category label */}
      <div
        style={{
          fontSize: 28,
          color: '#888',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {category}
      </div>

      {/* Main title */}
      <div
        style={{
          fontSize: 72,
          fontWeight: 600,
          marginTop: 20,
          lineHeight: 1.1,
          maxHeight: '220px',
          overflow: 'hidden',
        }}
      >
        {title}
      </div>

      {/* Description */}
      <div
        style={{
          fontSize: 32,
          color: '#b0b0b0',
          marginTop: 20,
          lineHeight: 1.3,
          maxHeight: '130px',
          overflow: 'hidden',
        }}
      >
        {description.slice(0, 120)}
        {description.length > 120 ? '...' : ''}
      </div>

      {/* Footer with vendor and domain */}
      <div
        style={{
          fontSize: 24,
          marginTop: 'auto',
          color: '#666',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {vendor ? `by ${vendor} | ` : ''}aicodingstack.io
      </div>
    </div>
  )
}
