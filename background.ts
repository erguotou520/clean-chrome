import { ACTION_EXECUTE_RULES, ACTION_GET_STORE } from "~src/constants"
import { getRuleSetStore, updateAllRuleSets } from "./src/storage"

// 检查是否需要更新
async function checkForUpdates() {
  const store = await getRuleSetStore()
  const now = Date.now()
  const lastUpdate = store.lastUpdateTime || 0
  
  // 如果今天还没有更新过，则进行更新
  const lastUpdateDate = new Date(lastUpdate).setHours(0, 0, 0, 0)
  const today = new Date(now).setHours(0, 0, 0, 0)
  
  if (lastUpdateDate < today) {
    await updateAllRuleSets()
  }
}

// 监听标签页更新
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // 检查更新
    await checkForUpdates()
    
    // 向内容脚本发送消息，通知其执行规则
    chrome.tabs.sendMessage(tabId, { type: ACTION_EXECUTE_RULES })
  }
})

// 监听来自内容脚本的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === ACTION_GET_STORE) {
    getRuleSetStore().then(store => {
      sendResponse(store)
    })
    return true // 保持消息通道开放
  }
}) 