/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import { useTradingStore } from '../store/trading';
const store = useTradingStore();
const chart = ref();
let inst = null;
// 叠加层开关 —— 与 ECharts 图例共用同一份选中状态
const showGrid = ref(true);
const showFills = ref(true);
const GRID_NAME = '网格上下轨';
const FILLS_NAME = '已成交点';
const hasData = computed(() => store.ticks.length > 0);
const statusText = computed(() => {
    if (!store.everConnected)
        return '正在连接行情服务器…';
    return store.wsConnected ? '正在接收行情…' : '行情连接已中断，正在重新连接';
});
const statusHint = computed(() => {
    if (!store.everConnected)
        return '尚未收到任何报价，连接成功后即会显示实时曲线';
    return store.wsConnected
        ? '连接已建立，等待第一笔报价到达…'
        : '正在尝试重新连接，恢复后曲线与成交点将从同一数据源继续同步';
});
const seqs = computed(() => store.ticks.map(t => t.seq));
// 只把落在当前报价窗口内的成交点叠到曲线上（统一按 seq 对齐）
const visibleFills = computed(() => {
    if (!seqs.value.length)
        return [];
    const min = seqs.value[0];
    const max = seqs.value[seqs.value.length - 1];
    return store.fills.filter(f => f.tickSeq >= min && f.tickSeq <= max);
});
const recentFills = computed(() => visibleFills.value.slice(-10).reverse());
function yMinMax() {
    const vals = store.ticks.map(t => t.price);
    if (showGrid.value && hasData.value)
        vals.push(store.gridBounds.lowerPrice, store.gridBounds.upperPrice);
    // 切换叠加项后坐标轴范围随选中内容一起更新
    if (!vals.length)
        return undefined;
    let lo = Math.min(...vals), hi = Math.max(...vals);
    if (hi - lo < 1e-6) {
        lo -= 1;
        hi += 1;
    }
    const pad = (hi - lo) * 0.12;
    return { min: lo - pad, max: hi + pad };
}
function buildOption() {
    const ticks = store.ticks;
    const bySeq = new Map(ticks.map(t => [t.seq, t]));
    const bounds = store.gridBounds;
    const y = yMinMax();
    const priceData = ticks.map(t => [t.seq, t.price]);
    const gridData = showGrid.value
        ? [
            { value: [seqs.value[0], null], itemStyle: { opacity: 0 } },
            { value: [seqs.value[0], bounds.upperPrice], itemStyle: { opacity: 0 } },
            { value: [seqs.value[0], bounds.lowerPrice], itemStyle: { opacity: 0 } }
        ]
        : [];
    const fillData = showFills.value
        ? visibleFills.value.map(f => ({
            value: [f.tickSeq, f.price, f.side],
            itemStyle: {
                color: f.side === 'SELL' ? '#ef4444' : '#22c55e',
                borderColor: '#0a0e27', borderWidth: 1
            }
        }))
        : [];
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
                formatter: (v) => bySeq.get(v)?.time ?? ''
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
            formatter: (params) => {
                const xs = (Array.isArray(params) ? params : [params]).map((p) => p.value?.[0]);
                const x = xs.find((v) => v != null);
                if (x == null)
                    return '';
                const tick = bySeq.get(x);
                if (!tick)
                    return '';
                const rows = [`⏱ ${tick.time}`, `<b style="color:#4fc3f7">价格 ¥${tick.price.toFixed(2)}</b>`];
                // 数值提示只展示当前选中的叠加项
                if (showGrid.value) {
                    rows.push(`<span style="color:#f5b942">上轨 ¥${bounds.upperPrice.toFixed(2)}</span>`);
                    rows.push(`<span style="color:#a78bfa">下轨 ¥${bounds.lowerPrice.toFixed(2)}</span>`);
                }
                if (showFills.value) {
                    const here = store.fills.filter(f => f.tickSeq === x);
                    here.forEach(f => rows.push(f.side === 'BUY'
                        ? `<span style="color:#22c55e">● 买入成交 ¥${f.price.toFixed(2)} × ${f.quantity.toFixed(2)}</span>`
                        : `<span style="color:#ef4444">● 卖出成交 ¥${f.price.toFixed(2)} × ${f.quantity.toFixed(2)}</span>`));
                }
                return rows.join('<br/>');
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
    };
}
function update() {
    if (!inst || !hasData.value)
        return;
    inst.setOption(buildOption(), true);
}
// 图例点击 / checkbox 双向联动，坐标轴与图例一起更新
function onLegendChanged(e) {
    if (e.name === GRID_NAME)
        showGrid.value = !!e.selected[GRID_NAME];
    if (e.name === FILLS_NAME)
        showFills.value = !!e.selected[FILLS_NAME];
}
function onResize() { inst?.resize(); }
watch(hasData, (ok) => {
    if (ok) {
        if (!inst && chart.value) {
            inst = echarts.init(chart.value);
            inst.on('legendselectchanged', onLegendChanged);
        }
        update();
    }
});
watch([showGrid, showFills], () => update());
watch(() => [store.ticks, store.fills, store.gridBounds], () => update(), { deep: true });
watch(() => store.wsConnected, (on) => { if (on)
    update(); });
onMounted(() => {
    if (hasData.value && chart.value) {
        inst = echarts.init(chart.value);
        inst.on('legendselectchanged', onLegendChanged);
        update();
    }
    window.addEventListener('resize', onResize);
});
onUnmounted(() => {
    window.removeEventListener('resize', onResize);
    inst?.dispose();
    inst = null;
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['overlay-item']} */ ;
/** @type {__VLS_StyleScopedClasses['overlay-item']} */ ;
/** @type {__VLS_StyleScopedClasses['fills-head']} */ ;
/** @type {__VLS_StyleScopedClasses['fill-row']} */ ;
/** @type {__VLS_StyleScopedClasses['fill-row']} */ ;
/** @type {__VLS_StyleScopedClasses['fill-row']} */ ;
/** @type {__VLS_StyleScopedClasses['fill-row']} */ ;
/** @type {__VLS_StyleScopedClasses['BUY']} */ ;
/** @type {__VLS_StyleScopedClasses['f-side']} */ ;
/** @type {__VLS_StyleScopedClasses['fill-row']} */ ;
/** @type {__VLS_StyleScopedClasses['SELL']} */ ;
/** @type {__VLS_StyleScopedClasses['f-side']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "panel" },
    ...{ style: {} },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "overlay-bar" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "overlay-item" },
    ...{ class: ({ off: !__VLS_ctx.showGrid }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input, __VLS_intrinsicElements.input)({
    type: "checkbox",
});
(__VLS_ctx.showGrid);
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "overlay-item" },
    ...{ class: ({ off: !__VLS_ctx.showFills }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input, __VLS_intrinsicElements.input)({
    type: "checkbox",
});
(__VLS_ctx.showFills);
if (__VLS_ctx.store.ticks.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "last-price" },
    });
    (__VLS_ctx.store.ticks[__VLS_ctx.store.ticks.length - 1].price.toFixed(2));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "chart-wrap" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ref: "chart",
    ...{ class: "chart" },
});
__VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.hasData) }, null, null);
/** @type {typeof __VLS_ctx.chart} */ ;
if (!__VLS_ctx.hasData) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "chart-empty" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-dot" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-title" },
    });
    (__VLS_ctx.statusText);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-sub" },
    });
    (__VLS_ctx.statusHint);
}
if (__VLS_ctx.hasData && !__VLS_ctx.store.wsConnected) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "chart-offline" },
    });
}
if (__VLS_ctx.visibleFills.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "fills" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "fills-title" },
    });
    (__VLS_ctx.visibleFills.length);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "fills-head" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "r" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "r" },
    });
    for (const [f] of __VLS_getVForSourceType((__VLS_ctx.recentFills))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (f.id),
            ...{ class: "fill-row" },
            ...{ class: (f.side) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "f-time" },
        });
        (f.time);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "f-side" },
        });
        (f.side === 'BUY' ? '买入' : '卖出');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "f-price r" },
        });
        (f.price.toFixed(2));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "f-qty r" },
        });
        (f.quantity.toFixed(2));
    }
}
else if (__VLS_ctx.hasData) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "fills-empty" },
    });
    if (__VLS_ctx.store.wsConnected) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    }
}
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['overlay-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['overlay-item']} */ ;
/** @type {__VLS_StyleScopedClasses['overlay-item']} */ ;
/** @type {__VLS_StyleScopedClasses['last-price']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['chart']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-empty']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-title']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-sub']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-offline']} */ ;
/** @type {__VLS_StyleScopedClasses['fills']} */ ;
/** @type {__VLS_StyleScopedClasses['fills-title']} */ ;
/** @type {__VLS_StyleScopedClasses['fills-head']} */ ;
/** @type {__VLS_StyleScopedClasses['r']} */ ;
/** @type {__VLS_StyleScopedClasses['r']} */ ;
/** @type {__VLS_StyleScopedClasses['fill-row']} */ ;
/** @type {__VLS_StyleScopedClasses['f-time']} */ ;
/** @type {__VLS_StyleScopedClasses['f-side']} */ ;
/** @type {__VLS_StyleScopedClasses['f-price']} */ ;
/** @type {__VLS_StyleScopedClasses['r']} */ ;
/** @type {__VLS_StyleScopedClasses['f-qty']} */ ;
/** @type {__VLS_StyleScopedClasses['r']} */ ;
/** @type {__VLS_StyleScopedClasses['fills-empty']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            store: store,
            chart: chart,
            showGrid: showGrid,
            showFills: showFills,
            hasData: hasData,
            statusText: statusText,
            statusHint: statusHint,
            visibleFills: visibleFills,
            recentFills: recentFills,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
