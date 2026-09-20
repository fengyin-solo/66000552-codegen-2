<template>
  <div class="panel" style="margin-top:12px">
    <div class="panel-head">
      <h4>📈 实时价格 + K线</h4>
      <span class="ws-state" :class="stateClass">{{ stateText }}</span>
    </div>
    <div class="chart-wrap">
      <div ref="chart" class="chart"></div>
      <div v-if="!store.wsConnected && store.ticks.length" class="recon-banner">⚠️ 行情中断，正在重新连接…</div>
    </div>
    <div class="fills" v-if="store.ticks.length">
      <div class="section-title">最近成交（逐笔）</div>
      <template v-if="recentFills.length">
        <div v-for="(f,i) in recentFills" :key="f.time+'-'+f.side+'-'+i" class="fill-row" :class="f.side">
          <span class="f-side">{{ f.side==='BUY'?'买入':'卖出' }}</span>
          <span class="f-price">@¥{{ f.price.toFixed(2) }}</span>
          <span class="f-qty">{{ f.quantity.toFixed(2) }}</span>
          <span class="f-time">{{ f.time }}</span>
        </div>
      </template>
      <div v-else class="empty-fills">本时段暂无网格成交</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { useTradingStore } from '../store/trading'

const store = useTradingStore()
const chart = ref<HTMLDivElement>()
let inst: echarts.ECharts | null = null

// 图例名同时作为 series.name，图例选中状态直接驱动提示过滤与坐标轴重算
const NAMES = ['最新价', '网格上轨', '网格下轨', '买入成交', '卖出成交'] as const
const selected = ref<Record<string, boolean>>(
  Object.fromEntries(NAMES.map(n => [n, true]))
)

const recentFills = computed(() => store.liveFills.slice(-10).reverse())

const stateText = computed(() => {
  if (store.wsConnected) return store.ticks.length ? '● 实时' : '○ 等待行情'
  return store.ticks.length ? '● 行情中断·重连中' : '● 行情未连接'
})
const stateClass = computed(() =>
  store.wsConnected ? (store.ticks.length ? 'st-live' : 'st-wait') : 'st-off'
)

function emptyOption() {
  return {
    backgroundColor: 'transparent',
    title: {
      text: store.wsConnected ? '正在等待行情数据…' : '行情未连接 · 正在尝试重新连接…',
      left: 'center', top: 'center',
      textStyle: { color: '#94a3b8', fontSize: 12, fontWeight: 'normal' as const }
    }
  }
}

function buildOption() {
  const ticks = store.ticks
  if (!ticks.length) return emptyOption()

  const cfg = store.config
  const fills = store.liveFills
  const xData = ticks.map((_, i) => String(i))
  type Pt = { value: [string, number, number] }
  const toPoint = (side: 'BUY' | 'SELL'): Pt[] =>
    fills.filter(f => f.side === side)
      .map(f => ({ value: [String(f.tickIndex), f.price, f.quantity] }))

  // 坐标轴范围只统计当前选中（可见）的叠加项，切换图例时随之一起更新
  const vals: number[] = []
  if (selected.value['最新价']) vals.push(...ticks.map(t => t.price))
  if (selected.value['网格上轨']) vals.push(cfg.upperPrice)
  if (selected.value['网格下轨']) vals.push(cfg.lowerPrice)
  if (selected.value['买入成交']) vals.push(...toPoint('BUY').map(p => p.value[1]))
  if (selected.value['卖出成交']) vals.push(...toPoint('SELL').map(p => p.value[1]))
  const base = vals.length ? vals : ticks.map(t => t.price)
  let min = Math.min(...base), max = Math.max(...base)
  if (min === max) { min -= 1; max += 1 }
  const pad = Math.max((max - min) * 0.08, 0.2)
  min = +(min - pad).toFixed(2)
  max = +(max + pad).toFixed(2)

  return {
    backgroundColor: 'transparent',
    animation: false,
    grid: { left: 50, right: 15, top: 28, bottom: 25 },
    legend: {
      data: NAMES.slice(), top: 0, right: 0, icon: 'roundRect',
      itemWidth: 14, itemHeight: 8, itemGap: 10,
      textStyle: { color: '#94a3b8', fontSize: 10 },
      selected: { ...selected.value }
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#0f1535', borderColor: '#1e2a5a',
      textStyle: { color: '#e0e0e0', fontSize: 11 },
      axisPointer: { type: 'line', lineStyle: { color: '#334155' } },
      formatter: (params: unknown) => {
        const arr = (Array.isArray(params) ? params : [params])
          // 数值提示严格按图例当前选中项展示
          .filter((p: { seriesName?: string }) => p.seriesName ? selected.value[p.seriesName] : false)
        if (!arr.length) return ''
        const first = arr[0] as { axisValue?: string }
        const t = ticks[Number(first.axisValue)]
        let html = `<div style="color:#94a3b8;margin-bottom:2px">${t ? t.time : ''}</div>`
        // 同一时刻可能有多笔成交，逐笔列出
        for (const p of arr as Array<{ marker: string; seriesName: string; value: number | number[] }>) {
          const v = p.value
          if (Array.isArray(v)) html += `${p.marker}${p.seriesName}：<b>¥${v[1].toFixed(2)}</b> × ${v[2].toFixed(2)}<br/>`
          else html += `${p.marker}${p.seriesName}：<b>¥${v.toFixed(2)}</b><br/>`
        }
        return html
      }
    },
    xAxis: {
      type: 'category', data: xData, boundaryGap: false,
      axisLabel: {
        color: '#94a3b8', fontSize: 9,
        formatter: (idx: string) => ticks[Number(idx)]?.time ?? ''
      },
      axisLine: { lineStyle: { color: '#1e2a5a' } },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value', min, max,
      axisLabel: { color: '#94a3b8', fontSize: 9 },
      splitLine: { lineStyle: { color: '#1e2a5a55' } }
    },
    series: [
      {
        name: '最新价', type: 'line', data: ticks.map(t => t.price), symbol: 'none', z: 2,
        lineStyle: { color: '#4fc3f7', width: 1.5 },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(79,195,247,0.3)' }, { offset: 1, color: 'rgba(79,195,247,0)' }]) }
      },
      {
        name: '网格上轨', type: 'line', symbol: 'none', z: 1,
        data: xData.map(() => cfg.upperPrice),
        lineStyle: { color: '#f59e0b', width: 1, type: 'dashed' }
      },
      {
        name: '网格下轨', type: 'line', symbol: 'none', z: 1,
        data: xData.map(() => cfg.lowerPrice),
        lineStyle: { color: '#c084fc', width: 1, type: 'dashed' }
      },
      {
        name: '买入成交', type: 'scatter', z: 3, symbolSize: 7,
        data: toPoint('BUY'),
        itemStyle: { color: '#22c55e', borderColor: '#0f1535', borderWidth: 1 }
      },
      {
        name: '卖出成交', type: 'scatter', z: 3, symbolSize: 7,
        data: toPoint('SELL'),
        itemStyle: { color: '#ef4444', borderColor: '#0f1535', borderWidth: 1 }
      }
    ]
  }
}

function update() {
  if (!inst || inst.isDisposed()) return
  // notMerge：叠加项显隐 / 空状态 ↔ 有数据 切换时彻底替换，不残留旧坐标
  inst.setOption(buildOption(), true)
}

function onResize() { inst?.resize() }

onMounted(() => {
  if (chart.value) {
    inst = echarts.init(chart.value)
    // 切换叠加项后：图例状态、坐标轴范围、数值提示同步更新
    inst.on('legendselectchanged', (p: unknown) => {
      const ev = p as { selected: Record<string, boolean> }
      selected.value = { ...ev.selected }
      update()
    })
    update()
  }
  window.addEventListener('resize', onResize)
})
watch(() => [store.ticks, store.config, store.wsConnected], update, { deep: true })
onUnmounted(() => { window.removeEventListener('resize', onResize); inst?.dispose() })
</script>
<style scoped>
.panel{background:#0f1535;border-radius:8px;padding:12px;border:1px solid #1e2a5a}
.panel-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}
.panel h4{color:#4fc3f7;font-size:13px}
.chart{width:100%;height:300px}
.chart-wrap{position:relative}
.ws-state{font-size:10px;padding:1px 8px;border-radius:9px;white-space:nowrap}
.ws-state.st-live{color:#22c55e;background:rgba(34,197,94,0.12)}
.ws-state.st-wait{color:#94a3b8;background:rgba(148,163,184,0.12)}
.ws-state.st-off{color:#ef4444;background:rgba(239,68,68,0.12)}
.recon-banner{position:absolute;top:6px;left:50%;transform:translateX(-50%);
  font-size:10px;color:#f87171;background:rgba(239,68,68,0.15);
  border:1px solid rgba(239,68,68,0.35);border-radius:10px;padding:2px 10px;pointer-events:none}
.fills{margin-top:4px}
.section-title{font-size:11px;color:#64748b;margin:6px 0 4px}
.fill-row{display:flex;gap:8px;align-items:center;padding:3px 6px;font-size:11px;border-radius:3px;margin:1px 0}
.fill-row.BUY{background:#22c55e15}
.fill-row.SELL{background:#ef444415}
.f-side{font-weight:700;min-width:32px}
.fill-row.BUY .f-side{color:#22c55e}
.fill-row.SELL .f-side{color:#ef4444}
.f-price{color:#94a3b8}
.f-qty{color:#cbd5e1;margin-left:auto}
.f-time{color:#475569;font-size:10px;min-width:56px;text-align:right}
.empty-fills{font-size:11px;color:#64748b;padding:4px 6px}
</style>
