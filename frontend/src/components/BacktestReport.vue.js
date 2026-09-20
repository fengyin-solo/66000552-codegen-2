/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, watch, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import { useTradingStore } from '../store/trading';
const store = useTradingStore();
const eqChart = ref();
let inst = null;
function updateEq() {
    if (!inst || !store.gridResult)
        return;
    const eq = store.gridResult.equityCurve;
    inst.setOption({
        backgroundColor: 'transparent', grid: { left: 45, right: 10, top: 5, bottom: 20 },
        xAxis: { type: 'category', data: eq.map((_, i) => i), show: false },
        yAxis: { type: 'value', axisLabel: { color: '#94a3b8', fontSize: 9 } },
        series: [{ type: 'line', data: eq, symbol: 'none', lineStyle: { color: '#4fc3f7', width: 1 },
                areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(79,195,247,0.2)' }, { offset: 1, color: 'rgba(79,195,247,0)' }]) }
            }], animation: false
    });
}
watch(() => store.gridResult, (r) => { if (r)
    setTimeout(updateEq, 50); });
onUnmounted(() => inst?.dispose());
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['m-val']} */ ;
/** @type {__VLS_StyleScopedClasses['m-val']} */ ;
/** @type {__VLS_StyleScopedClasses['order-row']} */ ;
/** @type {__VLS_StyleScopedClasses['order-row']} */ ;
/** @type {__VLS_StyleScopedClasses['o-side']} */ ;
/** @type {__VLS_StyleScopedClasses['o-side']} */ ;
/** @type {__VLS_StyleScopedClasses['profit']} */ ;
/** @type {__VLS_StyleScopedClasses['o-profit']} */ ;
/** @type {__VLS_StyleScopedClasses['loss']} */ ;
// CSS variable injection 
// CSS variable injection end 
if (__VLS_ctx.store.gridResult) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "metric-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "metric" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "m-val" },
        ...{ class: (__VLS_ctx.store.gridResult.totalProfit >= 0 ? 'profit' : 'loss') },
    });
    (__VLS_ctx.store.gridResult.totalProfit.toFixed(0));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "m-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "metric" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "m-val" },
        ...{ class: (__VLS_ctx.store.gridResult.returnRate >= 0 ? 'profit' : 'loss') },
    });
    (__VLS_ctx.store.gridResult.returnRate.toFixed(2));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "m-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "metric" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "m-val" },
    });
    (__VLS_ctx.store.gridResult.sharpeRatio.toFixed(2));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "m-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "metric" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "m-val loss" },
    });
    (__VLS_ctx.store.gridResult.maxDrawdown.toFixed(2));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "m-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "metric" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "m-val" },
    });
    (__VLS_ctx.store.gridResult.winRate.toFixed(1));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "m-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "metric" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "m-val" },
    });
    (__VLS_ctx.store.gridResult.orders.filter(o => o.side === 'SELL').length);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "m-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ref: "eqChart",
        ...{ class: "chart" },
    });
    /** @type {typeof __VLS_ctx.eqChart} */ ;
    if (__VLS_ctx.store.gridResult.orders.length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "order-list" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "section-title" },
        });
        for (const [o] of __VLS_getVForSourceType((__VLS_ctx.store.gridResult.orders.slice(-8).reverse()))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (o.id),
                ...{ class: "order-row" },
                ...{ class: (o.side) },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "o-side" },
            });
            (o.side);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "o-price" },
            });
            (o.price);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "o-qty" },
            });
            (o.quantity.toFixed(2));
            if (o.side === 'SELL') {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "o-profit" },
                    ...{ class: (o.profit >= 0 ? 'profit' : 'loss') },
                });
                (o.profit.toFixed(2));
            }
        }
    }
}
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['metric']} */ ;
/** @type {__VLS_StyleScopedClasses['m-val']} */ ;
/** @type {__VLS_StyleScopedClasses['m-label']} */ ;
/** @type {__VLS_StyleScopedClasses['metric']} */ ;
/** @type {__VLS_StyleScopedClasses['m-val']} */ ;
/** @type {__VLS_StyleScopedClasses['m-label']} */ ;
/** @type {__VLS_StyleScopedClasses['metric']} */ ;
/** @type {__VLS_StyleScopedClasses['m-val']} */ ;
/** @type {__VLS_StyleScopedClasses['m-label']} */ ;
/** @type {__VLS_StyleScopedClasses['metric']} */ ;
/** @type {__VLS_StyleScopedClasses['m-val']} */ ;
/** @type {__VLS_StyleScopedClasses['loss']} */ ;
/** @type {__VLS_StyleScopedClasses['m-label']} */ ;
/** @type {__VLS_StyleScopedClasses['metric']} */ ;
/** @type {__VLS_StyleScopedClasses['m-val']} */ ;
/** @type {__VLS_StyleScopedClasses['m-label']} */ ;
/** @type {__VLS_StyleScopedClasses['metric']} */ ;
/** @type {__VLS_StyleScopedClasses['m-val']} */ ;
/** @type {__VLS_StyleScopedClasses['m-label']} */ ;
/** @type {__VLS_StyleScopedClasses['chart']} */ ;
/** @type {__VLS_StyleScopedClasses['order-list']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['order-row']} */ ;
/** @type {__VLS_StyleScopedClasses['o-side']} */ ;
/** @type {__VLS_StyleScopedClasses['o-price']} */ ;
/** @type {__VLS_StyleScopedClasses['o-qty']} */ ;
/** @type {__VLS_StyleScopedClasses['o-profit']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            store: store,
            eqChart: eqChart,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
