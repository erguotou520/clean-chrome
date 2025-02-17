export interface RuleItem {
  site: string
  type: 'js' | 'css'
  content: string
}

export interface RemoteRuleSet {
  version: number
  rules: RuleItem[]
}

export interface RuleSet extends RemoteRuleSet {
  url: string
  enabled: boolean
  lastUpdate?: number
}

export interface RuleSetStore {
  ruleSets: RuleSet[]
  lastUpdateTime?: number
} 