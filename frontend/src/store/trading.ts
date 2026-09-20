import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import type { Tick, OrderBook, GridConfig, GridResult, LiveFill } from '@/types'
export const useTradingStore = defineStore('trading', () => {
  const loading = ref(false)
  const ticks = ref<Tick[]>([])
  const orderBook = ref<OrderBook | null>(null)
  const gridResult = ref<GridResult | null>(null)
  const wsConnected = ref(false)
  const config = ref<GridConfig>({ lowerPrice: 95, upperPrice: 115, gridCount: 20, capitalPerGrid: 1000, initialCapital: 100000 })

  // 实时成交点：始终由当前 ticks（唯一行情数据源）按网格穿越规则派生，
  // 重连后 ticks 被服务端快照替换，曲线与成交点会基于同一份数据重新同步。
  const liveFills = computed<LiveFill[]>(() => {
    const list = ticks.value
    if (list.length < 2) return []
    const { lowerPrice, upperPrice, gridCount, capitalPerGrid } = config.value
    if (gridCount <= 0 || upperPrice <= lowerPrice) return []
    const step = (upperPrice - lowerPrice) / gridCount
    const level = (i: number) => lowerPrice + i * step
    const holds = new Map<number, number>() // gridIndex -> quantity
    const fills: LiveFill[] = []
    for (let t = 1; t < list.length; t++) {
      const prev = list[t - 1].price
      const cur = list[t].price
      // 向下穿越网格线：买入挂单成交
      for (let i = 0; i <= gridCount; i++) {
        if (prev > level(i) && cur <= level(i) && !holds.has(i)) {
          const qty = +(capitalPerGrid / level(i)).toFixed(2)
          holds.set(i, qty)
          fills.push({ time: list[t].time, side: 'BUY', price: +level(i).toFixed(2), quantity: qty, gridIndex: i, tickIndex: t })
        }
      }
      // 向上回升一格：持仓卖出成交（与回测的网格套利规则保持一致）
      for (const i of Array.from(holds.keys())) {
        const target = i < gridCount ? level(i + 1) : level(i) + step
        if (prev < target && cur >= target) {
          const qty = holds.get(i)!
          holds.delete(i)
          fills.push({ time: list[t].time, side: 'SELL', price: +target.toFixed(2), quantity: qty, gridIndex: i, tickIndex: t })
        }
      }
    }
    return fills
  })

  let ws: WebSocket | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let manualClose = false
  function connectWS() {
    manualClose = false
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null }
    ws = new WebSocket(`ws://${location.hostname}:8000/ws`)
    ws.onopen = () => { wsConnected.value = true }
    ws.onmessage = (e) => {
      try {
        const d = JSON.parse(e.data)
        if (d.ticks) ticks.value = d.ticks.slice(-60)
        if (d.orderBook) orderBook.value = d.orderBook
      } catch {}
    }
    ws.onclose = () => {
      wsConnected.value = false
      ws = null
      // 行情中断后自动重新连上，连上即收到服务端快照，曲线与叠加点随之同步
      if (!manualClose) reconnectTimer = setTimeout(connectWS, 2000)
    }
    ws.onerror = () => { ws?.close() }
  }

  async function runBacktest() {
    loading.value = true
    try { const { data } = await axios.post('/api/backtest', config.value) ; gridResult.value = data }
    finally { loading.value = false }
  }

  function disconnectWS() {
    manualClose = true
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null }
    ws?.close(); ws = null; wsConnected.value = false
  }

  return { loading, ticks, orderBook, gridResult, wsConnected, config, liveFills, connectWS, runBacktest, disconnectWS }
})
