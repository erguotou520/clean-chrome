// 创建一个函数来移除广告元素
const removeAds = () => {
  const adElements = document.querySelectorAll('.wwads-cn')
  for (const element of adElements) {
    element.remove()
  }
}

// 创建一个 MutationObserver 实例
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    // 检查新增的节点
    if (mutation.addedNodes.length) {
      const hasAds = Array.from(mutation.addedNodes).some(node => {
        if (node instanceof HTMLElement) {
          return node.classList?.contains('wwads-cn') || node.querySelector('.wwads-cn')
        }
        return false
      })

      if (hasAds) {
        removeAds()
      }
    }
  }
})

// 初始检查并移除现有的广告
removeAds()

// 开始观察 DOM 变化
observer.observe(document.body, {
  childList: true,
  subtree: true
})

// 当页面卸载时断开观察器连接，释放内存
// window.addEventListener('unload', () => {
//   observer.disconnect()
// }) 