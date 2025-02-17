import { useEffect, useState } from "react"
import { addRuleSet, getRuleSetStore, removeRuleSet, toggleRuleSet, updateAllRuleSets, updateRuleSet } from "./core/storage"
import type { RuleSet } from "./core/types"

function IndexPopup() {
  const [ruleSets, setRuleSets] = useState<RuleSet[]>([])
  const [newUrl, setNewUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [lastUpdate, setLastUpdate] = useState<number>()

  useEffect(() => {
    loadRuleSets()
  }, [])

  const loadRuleSets = async () => {
    try {
      const store = await getRuleSetStore()
      setRuleSets(store.ruleSets)
      setLastUpdate(store.lastUpdateTime)
    } catch (err) {
      setError("加载规则集失败")
    }
  }

  const handleAddRuleSet = async () => {
    if (!newUrl) return
    setLoading(true)
    setError("")
    try {
      await addRuleSet(newUrl)
      setNewUrl("")
      await loadRuleSets()
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("添加规则集失败")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateAll = async () => {
    setLoading(true)
    setError("")
    try {
      await updateAllRuleSets()
      await loadRuleSets()
    } catch (err) {
      setError("更新规则集失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 w-[400px]">
      <h2 className="text-xl font-bold mb-4">规则集管理</h2>

      <div className="mb-4 flex gap-2">
        <input
          className="flex-1 px-2 py-1 border rounded"
          placeholder="输入规则集URL"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
        />
        <button
          className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
          onClick={handleAddRuleSet}
          disabled={loading || !newUrl}
        >
          添加
        </button>
      </div>

      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-600 rounded">
          {error}
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {lastUpdate
            ? `上次更新: ${new Date(lastUpdate).toLocaleString()}`
            : "从未更新"}
        </span>
        <button
          className="px-3 py-1 bg-green-500 text-white rounded disabled:opacity-50"
          onClick={handleUpdateAll}
          disabled={loading}
        >
          更新全部
        </button>
      </div>

      <div className="space-y-2">
        {ruleSets.map((ruleSet) => (
          <div
            key={ruleSet.url}
            className="p-3 border rounded flex items-center justify-between"
          >
            <div>
              <div className="text-xs text-gray-400">{ruleSet.url}</div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={ruleSet.enabled}
                onChange={(e) =>
                  toggleRuleSet(ruleSet.url, e.target.checked).then(loadRuleSets)
                }
              />
              <button
                className="text-red-500"
                onClick={() => removeRuleSet(ruleSet.url).then(loadRuleSets)}
              >
                删除
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default IndexPopup
