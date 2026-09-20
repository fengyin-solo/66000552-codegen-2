/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { ref, watch } from 'vue';
import { useTradingStore } from '../store/trading';
const store = useTradingStore();
const cvs = ref();
function draw() {
    const c = cvs.value;
    const ctx = c.getContext('2d');
    const W = c.width, H = c.height;
    ctx.fillStyle = '#0a0e27';
    ctx.fillRect(0, 0, W, H);
    const ob = store.orderBook;
    if (!ob)
        return;
    const maxQty = Math.max(...ob.bids.map(b => b[1]), ...ob.asks.map(a => a[1]), 1);
    const scale = (W / 2 - 20) / maxQty;
    // Bids (green, left)
    ob.bids.slice(0, 10).forEach((b, i) => {
        const w = b[1] * scale;
        const y = 10 + i * (H - 20) / 10;
        const h = (H - 20) / 10 - 2;
        ctx.fillStyle = 'rgba(34,197,94,0.6)';
        ctx.fillRect(W / 2 - 10 - w, y, w, h);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px monospace';
        ctx.fillText(b[0].toFixed(1), W / 2 + 6, y + 12);
        ctx.fillText(String(b[1]), W / 2 - 14 - w, y + 12);
    });
    // Asks (red, right)
    ob.asks.slice(0, 10).forEach((a, i) => {
        const w = a[1] * scale;
        const y = 10 + i * (H - 20) / 10;
        const h = (H - 20) / 10 - 2;
        ctx.fillStyle = 'rgba(239,68,68,0.6)';
        ctx.fillRect(W / 2 + 10, y, w, h);
        ctx.fillStyle = '#f87171';
        ctx.font = '10px monospace';
        ctx.fillText(a[0].toFixed(1), W / 2 + 14 + w + 4, y + 12);
        ctx.textAlign = 'right';
        ctx.fillText(String(a[1]), W / 2 + 8, y + 12);
        ctx.textAlign = 'left';
    });
    ctx.strokeStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(W / 2, 0);
    ctx.lineTo(W / 2, H);
    ctx.stroke();
}
watch(() => store.orderBook, draw, { deep: true });
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.canvas, __VLS_intrinsicElements.canvas)({
    ref: "cvs",
    width: "360",
    height: "280",
    ...{ class: "depth-canvas" },
});
/** @type {typeof __VLS_ctx.cvs} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['depth-canvas']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            cvs: cvs,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
