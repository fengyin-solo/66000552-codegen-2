import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import axios from 'axios';
export const useTradingStore = defineStore('trading', () => {
    const loading = ref(false);
    const ticks = ref([]);
    const fills = ref([]);
    const orderBook = ref(null);
    const gridResult = ref(null);
    const gridBounds = ref({ lowerPrice: 95, upperPrice: 115, gridCount: 20 });
    const wsConnected = ref(false);
    const everConnected = ref(false);
    const config = ref({ lowerPrice: 95, upperPrice: 115, gridCount: 20, capitalPerGrid: 1000, initialCapital: 100000 });
    let ws = null;
    let manualClose = false;
    let reconnectTimer = null;
    function connectWS() {
        manualClose = false;
        ws = new WebSocket(`ws://${location.hostname}:8000/ws`);
        ws.onopen = () => {
            wsConnected.value = true;
            everConnected.value = true;
            // 把当前网格配置同步给后端，重连后也以同一份配置生成轨道与成交点
            ws?.send(JSON.stringify(config.value));
        };
        ws.onmessage = (e) => {
            try {
                const d = JSON.parse(e.data);
                // ticks / fills / grid 在同一帧 payload 内整体替换，保证曲线与叠加点同步
                if (d.ticks)
                    ticks.value = d.ticks;
                if (d.fills)
                    fills.value = d.fills;
                if (d.grid)
                    gridBounds.value = d.grid;
                if (d.orderBook)
                    orderBook.value = d.orderBook;
            }
            catch { }
        };
        ws.onclose = () => {
            wsConnected.value = false;
            ws = null;
            // 断线后自动重连；重连成功时后端会重新推送完整的 ticks/fills/grid
            if (!manualClose)
                reconnectTimer = setTimeout(connectWS, 2000);
        };
    }
    // 网格参数调整时实时同步到后端（WS 不通时跳过，重连后会再推一次）
    watch(config, (cfg) => {
        if (ws && ws.readyState === WebSocket.OPEN)
            ws.send(JSON.stringify(cfg));
    }, { deep: true });
    async function runBacktest() {
        loading.value = true;
        try {
            const { data } = await axios.post('/api/backtest', config.value);
            gridResult.value = data;
        }
        finally {
            loading.value = false;
        }
    }
    function disconnectWS() {
        manualClose = true;
        if (reconnectTimer)
            clearTimeout(reconnectTimer);
        ws?.close();
        ws = null;
        wsConnected.value = false;
    }
    return { loading, ticks, fills, orderBook, gridResult, gridBounds, wsConnected, everConnected, config, connectWS, runBacktest, disconnectWS };
});
