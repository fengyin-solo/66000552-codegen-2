<template>
  <div class="panel" style="margin-top:12px">
    <h4>📈 实时价格 + 叠加视图</h4>
    <div class="overlay-bar">
      <label class="overlay-item" :class="{ off: !showGrid }"><input type="checkbox" v-model="showGrid"> 网格上下轨</label>
      <label class="overlay-item" :class="{ off: !showFills }"><input type="checkbox" v-model="showFills"> 已成交点</label>
      <span class="last-price" v-if="store.ticks.length">最新 ¥{{ store.ticks[store.ticks.length-1].price.toFixed(2) }}</span>
    </div>

    <div class="chart-wrap">
      <div v-show="hasData" ref="chart" class="chart"></div>
      <div v-if="!hasData" class="chart-empty">
        <div class="empty-dot"></div>
        <div class="empty-title">{{ statusText }}</div>
        <div class="empty-sub">{{ statusHint }}</div>
      </div>
      <div v-if="hasData && !store.wsConnected" class="chart-offline">⚠ 行情已中断，正在重新连接…（下图保留最后数据，已暂停刷新）</div>
    </div>

    <div class="fills" v-if="visibleFills.length">
      <div class="fills-title">最近成交（{{ visibleFills.length }}）</div>
      <div class="fills-head">
        <span>时间</span><span>方向</span><span class="r">价格</span><span class="r">数量</span>
      </div>
      <div v-for="f in recentFills" :key="f.id" class="fill-row" :class="f.side">
        <span class="f-time">{{ f.time }}</span>
        <span class="f-side">{{ f.side === 'BUY' ? '买入' : '卖出' }}</span>
        <span class="f-price r">¥{{ f.price.toFixed(2) }}</span>
        <span class="f-qty r">{{ f.quantity.toFixed(2) }}</span>
      </div>
    </div>
    <div class="fills-empty" v-else-if="hasData">
      <span v-if="store.wsConnected">等待价格触及网格档位，暂无成交…</span>
      <span v-else>行情中断，暂无新成交</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { useTradingStore } from '../store/trading'
import type { Fill } from '../types'

const store = useTradingStore()
const chart = ref<HTMLDivElement>()
let inst: echarts.ECharts | null = null

// 叠加层开关 —— 与 ECharts 图例共用同一份选中状态
const showGrid = ref(true)
const showFills = ref(true)

const GRID_NAME = '网格上下轨'
const FILLS_NAME = '已成交点'

const hasData = computed(() => store.ticks.length > 0)
const statusText = computed(() => {
  if (!store.everConnected) return '正在连接行情服务器…'
  return store.wsConnected ? '正在接收行情…' : '行情连接已中断，正在重新连接'
})
const statusHint = computed(() => {
  if (!store.everConnected) return '尚未收到任何报价，连接成功后即会显示实时曲线'
  return store.wsConnected
    ? '连接已建立，等待第一笔报价到达…'
    : '正在尝试重新连接，恢复后曲线与成交点将从同一数据源继续同步'
})

const seqs = computed(() => store.ticks.map(t => t.seq))
// 只把落在当前报价窗口内的成交点叠到曲线上（统一按 seq 对齐）
const visibleFills = computed<Fill[]>(() => {
  if (!seqs.value.length) return []
  const min = seqs.value[0]
  const max = seqs.value[seqs.value.length - 1]
  return store.fills.filter(f => f.tickSeq >= min && f.tickSeq <= max)
})
const recentFills = computed(() => visibleFills.value.slice(-10).reverse())

function yMinMax() {
  const vals: number[] = store.ticks.map(t => t.price)
  if (showGrid.value && hasData.value) vals.push(store.gridBounds.lowerPrice, store.gridBounds.upperPrice)
  // 切换叠加项后坐标轴范围随选中内容一起更新
  if (!vals.length) return undefined
  let lo = Math.min(...vals), hi = Math.max(...vals)
  if (hi - lo < 1e-6) { lo -= 1; hi += 1 }
  const pad = (hi - lo) * 0.12
  return { min: lo - pad, max: hi + pad }
}

function buildOption(): echarts.EChartsOption {
  const ticks = store.ticks
  const bySeq = new Map(ticks.map(t => [t.seq, t]))
  const bounds = store.gridBounds
  const y = yMinMax()

  const priceData = ticks.map(t => [t.seq, t.price])
  const gridData = showGrid.value
    ? [
        { value: [seqs.value[0], null], itemStyle: { opacity: 0 } },
        { value: [seqs.value[0], bounds.upperPrice], itemStyle: { opacity: 0 } },
        { value: [seqs.value[0], bounds.lowerPrice], itemStyle: { opacity: 0 } }
      ]
    : []
  const fillData = showFills.value
    ? visibleFills.value.map(f => ({
        value: [f.tickSeq, f.price, f.side],
        itemStyle: {
          color: f.side === 'SELL' ? '#ef4444' : '#22c55e',
          borderColor: '#0a0e27', borderWidth: 1
        }
      }))
    : []

  return {
    backgroundColor: 'transparent',
    animation: false,
    grid: { left: 50, right: 15, top: 30, bottom: 25 },
    legend: {
      top: 0, left: 8, icon: 'roundRect',
      textStyle: { color: '#94a3b8', fontSize: 10 },
      itemWidth: 12, itemHeight: 8,
      selected: { [GRID_NAME]: showGrid.value, [FILLS_NAME]: showFills.value }
    },
    xAxis: {
      type: 'value',
      min: seqs.value.length > 1 ? seqs.value[0] : (seqs.value[0] ?? 0) - 0.5,
      max: seqs.value.length > 1 ? seqs.value[seqs.value.length - 1] : (seqs.value[0] ?? 0) + 0.5,
      axisLabel: {
        color: '#94a3b8', fontSize: 9,
        formatter: (v: number) => bySeq.get(v as number)?.time ?? ''
      },
      splitLine: { show: false },
      axisLine: { lineStyle: { color: '#1e2a5a' } }
    },
    yAxis: {
      type: 'value', scale: true, min: y?.min, max: y?.max,
      axisLabel: { color: '#94a3b8', fontSize: 9 },
      splitLine: { lineStyle: { color: '#1e2a5a', opacity: 0.5 } }
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15,21,53,0.95)',
      borderColor: '#1e2a5a',
      textStyle: { color: '#e2e8f0', fontSize: 11 },
      formatter: (params: any) => {
        const xs = (Array.isArray(params) ? params : [params]).map((p: any) => p.value?.[0])
        const x = xs.find((v: number) => v != null)
        if (x == null) return ''
        const tick = bySeq.get(x)
        if (!tick) return ''
        const rows: string[] = [`⏱ ${tick.time}`, `<b style="color:#4fc3f7">价格 ¥${tick.price.toFixed(2)}</b>`]
        // 数值提示只展示当前选中的叠加项
        if (showGrid.value) {
          rows.push(`<span style="color:#f5b942">上轨 ¥${bounds.upperPrice.toFixed(2)}</span>`)
          rows.push(`<span style="color:#a78bfa">下轨 ¥${bounds.lowerPrice.toFixed(2)}</span>`)
        }
        if (showFills.value) {
          const here = store.fills.filter(f => f.tickSeq === x)
          here.forEach(f => rows.push(
            f.side === 'BUY'
              ? `<span style="color:#22c55e">● 买入成交 ¥${f.price.toFixed(2)} × ${f.quantity.toFixed(2)}</span>`
              : `<span style="color:#ef4444">● 卖出成交 ¥${f.price.toFixed(2)} × ${f.quantity.toFixed(2)}</span>`
          ))
        }
        return rows.join('<br/>')
      }
    },
    series: [
      {
        type: 'line', data: priceData, symbol: 'none', showSymbol: false,
        lineStyle: { color: '#4fc3f7', width: 1.5 },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(79,195,247,0.3)' }, { offset: 1, color: 'rgba(79,195,247,0)' }]) }
      },
      {
        name: GRID_NAME, type: 'line', data: gridData, symbol: 'none',
        silent: true,
        lineStyle: { color: 'transparent' }, itemStyle: { color: '#f5b942' },
        markLine: {
          silent: true, symbol: 'none', animation: false,
          label: { show: true, position: 'insideEndTop', fontSize: 9 },
          data: [
            { yAxis: bounds.upperPrice, lineStyle: { type: 'dashed', width: 1, color: '#f5b942' },
              label: { color: '#f5b942', formatter: '上轨 ' + bounds.upperPrice.toFixed(2) } },
            { yAxis: bounds.lowerPrice, lineStyle: { type: 'dashed', width: 1, color: '#a78bfa' },
              label: { color: '#a78bfa', position: 'insideEndBottom', formatter: '下轨 ' + bounds.lowerPrice.toFixed(2) } }
          ]
        }
      },
      {
        name: FILLS_NAME, type: 'scatter', data: fillData,
        symbolSize: 8, itemStyle: { color: '#cbd5e1' }
      }
    ]
  }
}

function update() {
  if (!inst || !hasData.value) return
  inst.setOption(buildOption() as any, true)
}

// 图例点击 / checkbox 双向联动，坐标轴与图例一起更新
function onLegendChanged(e: any) {
  if (e.name === GRID_NAME) showGrid.value = !!e.selected[GRID_NAME]
  if (e.name === FILLS_NAME) showFills.value = !!e.selected[FILLS_NAME]
}

function onResize() { inst?.resize() }

watch(hasData, (ok) => {
  if (ok) {
    if (!inst && chart.value) {
      inst = echarts.init(chart.value)
      inst.on('legendselectchanged', onLegendChanged)
    }
    update()
  }
})
watch([showGrid, showFills], () => update())
watch(() => [store.ticks, store.fills, store.gridBounds], () => update(), { deep: true })
watch(() => store.wsConnected, (on) => { if (on) update() })

onMounted(() => {
  if (hasData.value && chart.value) {
    inst = echarts.init(chart.value)
    inst.on('legendselectchanged', onLegendChanged)
    update()
  }
  window.addEventListener('resize', onResize)
})
onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  inst?.dispose(); inst = null
})
</script>

<style scoped>
.panel{background:#0f1535;border-radius:8px;padding:12px;border:1px solid #1e2a5a}
.panel h4{color:#4fc3f7;font-size:13px;margin-bottom:4px}
.overlay-bar{display:flex;align-items:center;gap:12px;margin:2px 0 6px;font-size:11px;color:#cbd5e1}
.overlay-item{display:flex;align-items:center;gap:4px;cursor:pointer;user-select:none}
.overlay-item.off{color:#64748b}
.overlay-item input{accent-color:#4fc3f7;margin:0}
.last-price{margin-left:auto;color:#4fc3f7;font-weight:700;font-size:11px}
.chart-wrap{position:relative}
.chart{width:100%;height:300px}
.chart-empty{width:100%;height:300px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;background:#0a0e27;border-radius:6px;border:1px dashed #1e2a5a}
.empty-dot{width:10px;height:10px;border-radius:50%;background:#f59e0b;animation:pulse 1.2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
.empty-title{color:#e2e8f0;font-size:13px;font-weight:600}
.empty-sub{color:#64748b;font-size:11px}
.chart-offline{position:absolute;top:6px;right:8px;font-size:10px;color:#f87171;background:rgba(15,21,53,0.85);padding:3px 8px;border-radius:4px;border:1px solid #7f1d1d55}
.fills{margin-top:8px;border-top:1px solid #1e2a5a;padding-top:6px}
.fills-title{font-size:11px;color:#64748b;margin-bottom:4px}
.fills-head,.fill-row{display:grid;grid-template-columns:64px 44px 1fr 1fr;gap:8px;font-size:11px;padding:2px 4px}
.fills-head{color:#64748b;font-size:10px}
.r{text-align:right}
.fill-row{border-radius:3px;margin:1px 0;font-family:monospace}
.fill-row.BUY{background:#22c55e15}
.fill-row.SELL{background:#ef444415}
.f-side{font-weight:700}
.fill-row.BUY .f-side{color:#22c55e}
.fill-row.SELL .f-side{color:#ef4444}
.f-time{color:#94a3b8}
.f-price{color:#e2e8f0}
.f-qty{color:#94a3b8}
.fills-empty{margin-top:8px;padding:8px 4px;font-size:11px;color:#64748b;border-top:1px solid #1e2a5a}
</style>
