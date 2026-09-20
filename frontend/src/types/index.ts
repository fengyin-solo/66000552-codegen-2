export interface Tick { seq: number; time: string; price: number; bid: number; ask: number; volume: number }
export interface Fill { id: number; tickSeq: number; time: string; side: string; price: number; quantity: number }
export interface OrderBook { bids: [number,number][]; asks: [number,number][]; midPrice: number; spread: number }
export interface GridConfig { lowerPrice: number; upperPrice: number; gridCount: number; capitalPerGrid: number; initialCapital: number }
export interface GridBounds { lowerPrice: number; upperPrice: number; gridCount: number }
export interface GridOrder { id: number; price: number; side: string; quantity: number; status: string; profit: number }
export interface GridResult { orders: GridOrder[]; totalProfit: number; returnRate: number; sharpeRatio: number; maxDrawdown: number; winRate: number; equityCurve: number[] }
