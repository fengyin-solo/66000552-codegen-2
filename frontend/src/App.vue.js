/// <reference types="../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { onMounted, onUnmounted } from 'vue';
import OrderBookDepth from './components/OrderBookDepth.vue';
import PriceChart from './components/PriceChart.vue';
import GridControl from './components/GridControl.vue';
import BacktestReport from './components/BacktestReport.vue';
import { useTradingStore } from './store/trading';
const store = useTradingStore();
onMounted(() => store.connectWS());
onUnmounted(() => store.disconnectWS());
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "app-root" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
    ...{ class: "top-bar" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "status" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "dot" },
    ...{ class: ({ on: __VLS_ctx.store.wsConnected }) },
});
(__VLS_ctx.store.wsConnected ? '实时' : '已断开');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "main-grid" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "col-wide" },
});
/** @type {[typeof OrderBookDepth, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(OrderBookDepth, new OrderBookDepth({}));
const __VLS_1 = __VLS_0({}, ...__VLS_functionalComponentArgsRest(__VLS_0));
/** @type {[typeof PriceChart, ]} */ ;
// @ts-ignore
const __VLS_3 = __VLS_asFunctionalComponent(PriceChart, new PriceChart({}));
const __VLS_4 = __VLS_3({}, ...__VLS_functionalComponentArgsRest(__VLS_3));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "col-narrow" },
});
/** @type {[typeof GridControl, ]} */ ;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(GridControl, new GridControl({}));
const __VLS_7 = __VLS_6({}, ...__VLS_functionalComponentArgsRest(__VLS_6));
/** @type {[typeof BacktestReport, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(BacktestReport, new BacktestReport({}));
const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
/** @type {__VLS_StyleScopedClasses['app-root']} */ ;
/** @type {__VLS_StyleScopedClasses['top-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['status']} */ ;
/** @type {__VLS_StyleScopedClasses['dot']} */ ;
/** @type {__VLS_StyleScopedClasses['main-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['col-wide']} */ ;
/** @type {__VLS_StyleScopedClasses['col-narrow']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            OrderBookDepth: OrderBookDepth,
            PriceChart: PriceChart,
            GridControl: GridControl,
            BacktestReport: BacktestReport,
            store: store,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
