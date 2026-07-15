export type ArtifactValidationIssue = { path: string; code: string; message: string; severity: 'error' }
export type ArtifactValidationResult<T> = { ok: true; value: T; issues: [] } | { ok: false; issues: ArtifactValidationIssue[] }

export const issue = (path: string, code: string, message: string): ArtifactValidationIssue => ({ path, code, message, severity: 'error' })
export const stableIssues = (issues: ArtifactValidationIssue[]): ArtifactValidationIssue[] => [...issues].sort((left, right) => left.path.localeCompare(right.path) || left.code.localeCompare(right.code) || left.message.localeCompare(right.message))
export const result = <T>(value: T, issues: ArtifactValidationIssue[]): ArtifactValidationResult<T> => {
  const sorted = stableIssues(issues)
  return sorted.length ? { ok: false, issues: sorted } : { ok: true, value, issues: [] }
}
