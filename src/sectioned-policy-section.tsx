import type { ReactNode } from 'react'

/** Shared editor structure for policies with settings and a rendered result. */
export function SelectLikePolicySection({
  controls,
  controlsLabel = 'Settings',
  description,
  preview,
  previewLabel = 'Preview',
  title,
}: {
  controls: ReactNode
  controlsLabel?: string
  description?: string
  preview: ReactNode
  previewLabel?: string
  title?: string
}) {
  return (
    <section className="select-policy-section">
      {title || description ? (
        <div className="select-policy-heading">
          {title ? <h3>{title}</h3> : null}
          {description ? <p>{description}</p> : null}
        </div>
      ) : null}
      <div className="select-policy-section-grid">
        <div className="select-policy-controls">
          <span className="select-column-label">{controlsLabel}</span>
          {controls}
        </div>
        <div className="select-policy-preview">
          <span className="select-column-label">{previewLabel}</span>
          {preview}
        </div>
      </div>
    </section>
  )
}
