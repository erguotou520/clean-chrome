import type { PlasmoCSConfig } from "plasmo"
import { executeMatchingRules } from "./src/executor"
import { ACTION_EXECUTE_RULES } from "~src/constants"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true,
}

// 监听来自后台的消息
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === ACTION_EXECUTE_RULES) {
    executeMatchingRules()
  }
})

// 初始执行
executeMatchingRules()