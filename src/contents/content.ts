import { ACTION_EXECUTE_RULES } from "@/core/constants"
import { executeMatchingRules } from "@/core/executor"
import type { PlasmoCSConfig } from "plasmo"

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
