/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { useTradingStore } from '../store/trading';
const store = useTradingStore();
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
const __VLS_0 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    model: (__VLS_ctx.store.config),
    labelWidth: "90px",
    size: "small",
    labelPosition: "top",
}));
const __VLS_2 = __VLS_1({
    model: (__VLS_ctx.store.config),
    labelWidth: "90px",
    size: "small",
    labelPosition: "top",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.ElRow;
/** @type {[typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    gutter: (8),
}));
const __VLS_6 = __VLS_5({
    gutter: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
const __VLS_8 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    span: (12),
}));
const __VLS_10 = __VLS_9({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
const __VLS_12 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    label: "下限价格",
}));
const __VLS_14 = __VLS_13({
    label: "下限价格",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
const __VLS_16 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    modelValue: (__VLS_ctx.store.config.lowerPrice),
    min: (50),
    max: (200),
    step: (5),
    controlsPosition: "right",
}));
const __VLS_18 = __VLS_17({
    modelValue: (__VLS_ctx.store.config.lowerPrice),
    min: (50),
    max: (200),
    step: (5),
    controlsPosition: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
var __VLS_15;
var __VLS_11;
const __VLS_20 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    span: (12),
}));
const __VLS_22 = __VLS_21({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
const __VLS_24 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    label: "上限价格",
}));
const __VLS_26 = __VLS_25({
    label: "上限价格",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
const __VLS_28 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    modelValue: (__VLS_ctx.store.config.upperPrice),
    min: (50),
    max: (200),
    step: (5),
    controlsPosition: "right",
}));
const __VLS_30 = __VLS_29({
    modelValue: (__VLS_ctx.store.config.upperPrice),
    min: (50),
    max: (200),
    step: (5),
    controlsPosition: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
var __VLS_27;
var __VLS_23;
var __VLS_7;
const __VLS_32 = {}.ElRow;
/** @type {[typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    gutter: (8),
}));
const __VLS_34 = __VLS_33({
    gutter: (8),
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
const __VLS_36 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    span: (12),
}));
const __VLS_38 = __VLS_37({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
const __VLS_40 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    label: "网格数量",
}));
const __VLS_42 = __VLS_41({
    label: "网格数量",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
const __VLS_44 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    modelValue: (__VLS_ctx.store.config.gridCount),
    min: (5),
    max: (50),
    step: (5),
    controlsPosition: "right",
}));
const __VLS_46 = __VLS_45({
    modelValue: (__VLS_ctx.store.config.gridCount),
    min: (5),
    max: (50),
    step: (5),
    controlsPosition: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
var __VLS_43;
var __VLS_39;
const __VLS_48 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    span: (12),
}));
const __VLS_50 = __VLS_49({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
const __VLS_52 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    label: "每格资金",
}));
const __VLS_54 = __VLS_53({
    label: "每格资金",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
const __VLS_56 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    modelValue: (__VLS_ctx.store.config.capitalPerGrid),
    min: (100),
    max: (50000),
    step: (500),
    controlsPosition: "right",
}));
const __VLS_58 = __VLS_57({
    modelValue: (__VLS_ctx.store.config.capitalPerGrid),
    min: (100),
    max: (50000),
    step: (500),
    controlsPosition: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
var __VLS_55;
var __VLS_51;
var __VLS_35;
const __VLS_60 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    label: "初始资金",
}));
const __VLS_62 = __VLS_61({
    label: "初始资金",
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_63.slots.default;
const __VLS_64 = {}.ElInputNumber;
/** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    modelValue: (__VLS_ctx.store.config.initialCapital),
    min: (10000),
    max: (1000000),
    step: (10000),
    controlsPosition: "right",
}));
const __VLS_66 = __VLS_65({
    modelValue: (__VLS_ctx.store.config.initialCapital),
    min: (10000),
    max: (1000000),
    step: (10000),
    controlsPosition: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
var __VLS_63;
const __VLS_68 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.store.loading),
    block: true,
}));
const __VLS_70 = __VLS_69({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.store.loading),
    block: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
let __VLS_72;
let __VLS_73;
let __VLS_74;
const __VLS_75 = {
    onClick: (__VLS_ctx.store.runBacktest)
};
__VLS_71.slots.default;
var __VLS_71;
var __VLS_3;
if (__VLS_ctx.store.config.gridCount) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "grid-info" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "info-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (((__VLS_ctx.store.config.upperPrice - __VLS_ctx.store.config.lowerPrice) / __VLS_ctx.store.config.gridCount).toFixed(2));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "info-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    ((__VLS_ctx.store.config.gridCount * __VLS_ctx.store.config.capitalPerGrid).toLocaleString());
}
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-info']} */ ;
/** @type {__VLS_StyleScopedClasses['info-row']} */ ;
/** @type {__VLS_StyleScopedClasses['info-row']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
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
