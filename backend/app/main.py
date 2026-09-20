import asyncio, time, random, math, json, threading
import numpy as np
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Grid Trading Engine")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

ACTIVE_CLIENTS = []
SIM_RUNNING = True
current_price = 100.0
ticks_history = []
fills_history = []
tick_seq = 0
fill_seq = 0

# 实时网格状态（可由前端通过 WS 同步），曲线、轨道、成交点共用同一份数据
state_lock = threading.Lock()
GRID = {"lowerPrice": 95.0, "upperPrice": 115.0, "gridCount": 20, "capitalPerGrid": 1000.0}
# holdings: 网格档位索引 -> 持仓数量
holdings = {}


class GridConfig(BaseModel):
    lowerPrice: float = 95
    upperPrice: float = 115
    gridCount: int = 20
    capitalPerGrid: float = 1000
    initialCapital: float = 100000


def simulate_fills(price, prev_price, ts, seq):
    """价格穿越网格档位时产生成交：下穿买入，回到半格止盈位卖出。"""
    global fill_seq
    new_fills = []
    with state_lock:
        # 在同一把锁内取网格快照并生成成交，避免与配置更新交错
        step = (GRID["upperPrice"] - GRID["lowerPrice"]) / GRID["gridCount"]
        levels = [GRID["lowerPrice"] + i * step for i in range(GRID["gridCount"] + 1)]
        capital = GRID["capitalPerGrid"]
        for i, gp in enumerate(levels[:-1]):
            if prev_price > gp >= price and i not in holdings:
                qty = round(capital / gp, 2)
                holdings[i] = qty
                fill_seq += 1
                new_fills.append({"id": fill_seq, "tickSeq": seq, "time": ts,
                                  "side": "BUY", "price": round(gp, 2), "quantity": qty})
                continue
            sell_trigger = gp + step * 0.5
            if prev_price < sell_trigger <= price and i in holdings:
                qty = holdings.pop(i)
                fill_seq += 1
                new_fills.append({"id": fill_seq, "tickSeq": seq, "time": ts,
                                  "side": "SELL", "price": round(sell_trigger, 2), "quantity": qty})
    return new_fills


def simulate_market(loop):
    global current_price, ticks_history, fills_history, tick_seq
    price = 100.0
    prev_price = price
    while SIM_RUNNING:
        drift = 0.005 * math.sin(time.time() * 0.05)
        price += random.gauss(drift, 0.3)
        price = max(80, min(130, price))
        current_price = price
        ts = time.strftime("%H:%M:%S")
        with state_lock:
            tick_seq += 1
            seq = tick_seq
            tick = {
                "seq": seq,
                "time": ts,
                "price": round(price, 2),
                "bid": round(price - random.uniform(0.01, 0.05), 2),
                "ask": round(price + random.uniform(0.01, 0.05), 2),
                "volume": random.randint(100, 5000)
            }
            ticks_history.append(tick)
            if len(ticks_history) > 200:
                ticks_history = ticks_history[-200:]

        # 成交点与报价同帧生成，保证曲线与叠加点来自同一数据源
        new_fills = simulate_fills(price, prev_price, ts, seq)
        prev_price = price
        if new_fills:
            with state_lock:
                fills_history.extend(new_fills)
                if len(fills_history) > 60:
                    fills_history = fills_history[-60:]

        # Order book
        bids = [[round(price - 0.01 * i, 2), random.randint(100, 1000)] for i in range(1, 11)]
        asks = [[round(price + 0.01 * i, 2), random.randint(100, 1000)] for i in range(1, 11)]
        order_book = {"bids": bids, "asks": asks, "midPrice": price, "spread": round(asks[0][0] - bids[0][0], 2)}

        with state_lock:
            # 只重放落在当前报价窗口内的成交，保证叠加点始终能对齐到曲线
            win_start = ticks_history[-60:][0]["seq"] if ticks_history[-60:] else 0
            window_fills = [f for f in fills_history if f["tickSeq"] >= win_start]
            payload = json.dumps({
                "ticks": ticks_history[-60:],
                "fills": window_fills[-60:],
                "orderBook": order_book,
                "grid": {"lowerPrice": GRID["lowerPrice"], "upperPrice": GRID["upperPrice"],
                         "gridCount": GRID["gridCount"]}
            })
        for ws in list(ACTIVE_CLIENTS):
            try:
                asyncio.run_coroutine_threadsafe(ws.send_text(payload), loop)
            except Exception:
                pass
        time.sleep(0.5)


@app.on_event("startup")
async def startup():
    loop = asyncio.get_event_loop()
    threading.Thread(target=simulate_market, args=(loop,), daemon=True).start()


@app.post("/api/backtest")
def run_backtest(config: GridConfig):
    step = (config.upperPrice - config.lowerPrice) / config.gridCount
    grid_prices = [config.lowerPrice + i * step for i in range(config.gridCount + 1)]

    # Simulate prices
    np.random.seed(42)
    prices = [100]
    for _ in range(200):
        prices.append(prices[-1] + random.gauss(0, 1.2))
    prices = [max(70, min(140, p)) for p in prices]

    buy_grids = {}  # price -> True (buy order placed)
    orders = []
    cash = config.initialCapital
    holdings = 0
    equity_curve = [cash]
    order_id = 0

    for p in prices:
        for gp in grid_prices:
            # Buy signal
            if p <= gp and gp not in buy_grids and cash >= config.capitalPerGrid:
                qty = config.capitalPerGrid / gp
                cash -= config.capitalPerGrid
                holdings += qty
                buy_grids[gp] = True
                order_id += 1
                orders.append({"id": order_id, "price": round(gp, 2), "side": "BUY", "quantity": round(qty, 2), "status": "FILLED", "profit": 0})

            # Sell signal
            upper_gp = gp + step * 0.5
            if p >= upper_gp and gp in buy_grids:
                qty = config.capitalPerGrid / gp
                buy_price = gp
                sell_price = gp + step * 0.5
                profit = qty * (sell_price - buy_price)
                cash += config.capitalPerGrid + profit
                holdings -= qty
                del buy_grids[gp]
                order_id += 1
                orders.append({"id": order_id, "price": round(sell_price, 2), "side": "SELL", "quantity": round(qty, 2), "status": "FILLED", "profit": round(profit, 2)})

        equity = cash + holdings * p
        equity_curve.append(round(equity, 2))

    total_profit = cash + holdings * prices[-1] - config.initialCapital
    return_rate = (total_profit / config.initialCapital) * 100

    # Sharpe ratio
    eq_returns = np.diff(equity_curve) / (np.array(equity_curve[:-1], dtype=float) + 1e-5)
    sharpe = float(np.mean(eq_returns) / max(np.std(eq_returns), 1e-5) * np.sqrt(252)) if len(eq_returns) > 1 else 0

    # Max drawdown
    peak = equity_curve[0]
    max_dd = 0.0
    for e in equity_curve:
        if e > peak: peak = e
        dd = (peak - e) / peak * 100
        max_dd = max(max_dd, dd)

    # Win rate
    wins = sum(1 for o in orders if o["profit"] > 0)
    total = len([o for o in orders if o["side"] == "SELL"])
    win_rate = (wins / total * 100) if total > 0 else 0

    return {
        "orders": orders,
        "totalProfit": round(total_profit, 2),
        "returnRate": round(return_rate, 2),
        "sharpeRatio": round(sharpe, 2),
        "maxDrawdown": round(max_dd, 2),
        "winRate": round(win_rate, 1),
        "equityCurve": equity_curve
    }


@app.websocket("/ws")
async def ws_endpoint(ws: WebSocket):
    await ws.accept()
    ACTIVE_CLIENTS.append(ws)
    try:
        while True:
            msg = await ws.receive_text()
            # 前端把当前网格配置推过来，实时上下轨与成交模拟随之更新
            try:
                d = json.loads(msg)
                lower = float(d["lowerPrice"])
                upper = float(d["upperPrice"])
                count = int(d["gridCount"])
                if lower < upper and count > 0:
                    with state_lock:
                        GRID["lowerPrice"] = lower
                        GRID["upperPrice"] = upper
                        GRID["gridCount"] = count
                        if d.get("capitalPerGrid"):
                            GRID["capitalPerGrid"] = float(d["capitalPerGrid"])
                        holdings.clear()
            except Exception:
                pass
    except Exception:
        pass
    finally:
        if ws in ACTIVE_CLIENTS:
            ACTIVE_CLIENTS.remove(ws)
