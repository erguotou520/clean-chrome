import type { RemoteRuleSet, RuleSet, RuleSetStore } from './types'

const STORE_KEY = 'ruleSetStore'

export async function getRuleSetStore(): Promise<RuleSetStore> {
  const result = await chrome.storage.sync.get(STORE_KEY)
  return result[STORE_KEY] || { ruleSets: [] }
}

export async function saveRuleSetStore(store: RuleSetStore): Promise<void> {
  await chrome.storage.sync.set({ [STORE_KEY]: store })
}

export async function addRuleSet(url: string): Promise<void> {
  const store = await getRuleSetStore()
  // 检查URL是否已存在
  if (store.ruleSets.some(rs => rs.url === url)) {
    throw new Error('规则集URL已存在')
  }
  
  // 获取规则集内容
  const response = await fetch(url)
  const remoteRuleSet: RemoteRuleSet = await response.json()
  const ruleSet: RuleSet = {
    ...remoteRuleSet,
    url,
    lastUpdate: Date.now(),
    enabled: true
  }
  
  store.ruleSets.push(ruleSet)
  await saveRuleSetStore(store)
}

export async function updateRuleSet(ruleSet: RuleSet): Promise<void> {
  const store = await getRuleSetStore()
  const index = store.ruleSets.findIndex(rs => rs.url === ruleSet.url)
  if (index === -1) {
    throw new Error('规则集不存在')
  }
  
  const response = await fetch(ruleSet.url)
  const remoteRuleSet: RemoteRuleSet = await response.json()
  const newRuleSet: RuleSet = {
    ...remoteRuleSet,
    url: ruleSet.url,
    enabled: ruleSet.enabled,
    lastUpdate: Date.now()
  }
  
  store.ruleSets[index] = newRuleSet
  await saveRuleSetStore(store)
}

export async function toggleRuleSet(url: string, enabled: boolean): Promise<void> {
  const store = await getRuleSetStore()
  const ruleSet = store.ruleSets.find(rs => rs.url === url)
  if (!ruleSet) {
    throw new Error('规则集不存在')
  }
  
  ruleSet.enabled = enabled
  await saveRuleSetStore(store)
}

export async function removeRuleSet(url: string): Promise<void> {
  const store = await getRuleSetStore()
  store.ruleSets = store.ruleSets.filter(rs => rs.url !== url)
  await saveRuleSetStore(store)
}

export async function updateAllRuleSets(): Promise<void> {
  const store = await getRuleSetStore()
  for (const ruleSet of store.ruleSets) {
    try {
      await updateRuleSet(ruleSet)
    } catch (error) {
      console.error(`更新规则集失败: ${ruleSet.url}`, error)
    }
  }
  store.lastUpdateTime = Date.now()
  await saveRuleSetStore(store)
} 