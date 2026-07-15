export const artifactSchemaVersion = '0.1.0' as const
export const bundleSpecVersion = '0.1.0' as const

export type RegionDefinition = { id: string; purpose: string; required: boolean }
export type StateDefinition = { id: string; description: string }
export type CompositionRule = { id: string; statement: string; regionIds: string[] }
export type ExtensionPointKind = 'fields' | 'columns' | 'filters' | 'permissions' | 'data' | 'actions' | 'routes' | 'content'
export type ExtensionPoint = { id: string; regionId: string; kind: ExtensionPointKind; description: string; required: boolean }
export type PatternDependency = { id: string; patternVersion: string }
export type ScenarioDependency = { id: string; scenarioVersion: string }
export type CoreRequirements = { coreSchemaVersion: string; coreRuleIds: string[] }

type PatternBase = {
  patternSchemaVersion: typeof artifactSchemaVersion
  id: string
  patternVersion: string
  title: string
  purpose: string
  appliesWhen: string[]
  nonGoals: string[]
  requires: CoreRequirements
  regions: RegionDefinition[]
  requiredStates: StateDefinition[]
  compositionRules: CompositionRule[]
  extensionPoints: ExtensionPoint[]
}

export type ScreenPatternArtifact = PatternBase & {
  artifactKind: 'screen-pattern'
  composes: { compositionPatterns: PatternDependency[]; interactionScenarios: ScenarioDependency[] }
}

export type CompositionPatternArtifact = PatternBase & {
  artifactKind: 'composition-pattern'
  composes: { compositionPatterns: PatternDependency[] }
}

export type InteractionScenarioArtifact = {
  artifactKind: 'interaction-scenario'
  scenarioSchemaVersion: typeof artifactSchemaVersion
  id: string
  scenarioVersion: string
  title: string
  purpose: string
  appliesWhen: string[]
  nonGoals: string[]
  requires: CoreRequirements
  composes: { interactionScenarios: ScenarioDependency[] }
  requiredContext: string[]
  requiredStates: StateDefinition[]
  compositionRules: Array<{ id: string; statement: string }>
  extensionPoints: Array<{ id: string; kind: Extract<ExtensionPointKind, 'permissions' | 'data' | 'actions' | 'routes' | 'content'>; description: string; required: boolean }>
}

export type BundleContractReference = { path: string; schemaVersion: string; digest: string }
export type PatternReference = { id: string; path: string; patternVersion: string; digest: string }
export type ScenarioReference = { id: string; path: string; scenarioVersion: string; digest: string }
export type BundleManifest = {
  bundleSpecVersion: typeof bundleSpecVersion
  contract: BundleContractReference
  screenPatterns: PatternReference[]
  compositionPatterns: PatternReference[]
  interactionScenarios: ScenarioReference[]
}

export type ResolvedArtifact<T> = { path: string; digest: string; document: T }
export type ArtifactSetInput = {
  manifest: BundleManifest
  core: { path: string; schemaVersion: string; digest: string; ruleIds: string[] }
  screenPatterns: ResolvedArtifact<ScreenPatternArtifact>[]
  compositionPatterns: ResolvedArtifact<CompositionPatternArtifact>[]
  interactionScenarios: ResolvedArtifact<InteractionScenarioArtifact>[]
}
