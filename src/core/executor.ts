import { ACTION_INSERT_CSS, ACTION_INSERT_SCRIPT } from './constants'
import { getRuleSetStore } from './storage'
import type { RuleItem } from './types'

export async function executeRule(rule: RuleItem): Promise<void> {
  if (rule.js) {
    await executeJsRule(rule.js)
  }
  if (rule.css) {
    executeCssRule(rule.css)
  }
}

function executeJsRule(content: string): void {
  chrome.runtime.sendMessage({
    type: ACTION_INSERT_SCRIPT,
    script: `// injected
function _each(nodes, func) {
  for (var node of nodes) {
    func(node)
  }
}
function _watch_add_node(selector) {
  var _nodes = []
  var observer = new MutationObserver(function(mutations) {
    _nodes = []
    for (var mutation of mutations) {
      if (mutation.addedNodes.length) {
        Array.from(mutation.addedNodes).forEach(function(node) {
          if (node instanceof HTMLElement) {
            const nodes = node.querySelectorAll(selector)
            if (nodes.length) {
              _nodes.push(nodes)
            }
          }
        })
      }
    }
  })
  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
  return {
    click: _each(_nodes, function(node) {
      node.click()
    }),
    remove: _each(_nodes, function(node) {
      node.remove()
    }),
    map: function(func) {
      _each(_nodes, func)
    }
  }
}
${content}`
  })
}

function executeCssRule(content: string): void {
  chrome.runtime.sendMessage({
    type: ACTION_INSERT_CSS,
    css: content
  })
}

export async function executeMatchingRules(): Promise<void> {
  const store = await getRuleSetStore()
  const currentUrl = window.location.href

  // 执行匹配的规则
  for (const ruleSet of store.ruleSets) {
    if (!ruleSet.enabled) continue

    for (const rule of ruleSet.rules) {
      try {
        const pattern = new RegExp(rule.site)
        if (pattern.test(currentUrl)) {
          await executeRule(rule)
        }
      } catch (error) {
        console.error(`执行规则失败: ${rule.site}`, error)
      }
    }
  }
}
