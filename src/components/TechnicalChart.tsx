"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, ColorType, CandlestickSeries, LineSeries } from "lightweight-charts";
import { SMA, RSI } from "technicalindicators";

interface ChartData {
  time: string; // YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
}

interface TechnicalChartProps {
  data: ChartData[];
  symbol: string;
}

export function TechnicalChart({ data, symbol }: TechnicalChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  
  const [showSMA20, setShowSMA20] = useState(false);
  const [showSMA50, setShowSMA50] = useState(false);
  const [showRSI, setShowRSI] = useState(false);

  // Store refs to series so we can add/remove them dynamically without recreating chart
  const seriesRefs = useRef<{
    sma20: any;
    sma50: any;
    rsi: any;
    chart: any;
  }>({ sma20: null, sma50: null, rsi: null, chart: null });

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#9CA3AF",
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.05)" },
        horzLines: { color: "rgba(255, 255, 255, 0.05)" },
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
      rightPriceScale: {
        borderVisible: false,
      },
      timeScale: {
        borderVisible: false,
      },
    });
    
    seriesRefs.current.chart = chart;

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e", // green-500
      downColor: "#ef4444", // red-500
      borderVisible: false,
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    const sortedData = [...data].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    candlestickSeries.setData(sortedData);
    
    // Set up RSI price scale at the bottom 20%
    chart.priceScale('rsi').applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
      borderVisible: false,
    });

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      seriesRefs.current.chart = null;
    };
  }, [data]);

  // Effect to handle toggling indicators
  useEffect(() => {
    const chart = seriesRefs.current.chart;
    if (!chart) return;

    const sortedData = [...data].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    const closePrices = sortedData.map(d => d.close);

    // SMA 20
    if (showSMA20 && !seriesRefs.current.sma20) {
      const sma20Raw = SMA.calculate({ period: 20, values: closePrices });
      const sma20Data = sma20Raw.map((val, i) => ({ time: sortedData[i + 19].time, value: val }));
      const series = chart.addSeries(LineSeries, { color: '#3b82f6', lineWidth: 2, title: 'SMA 20' }); // blue
      series.setData(sma20Data);
      seriesRefs.current.sma20 = series;
    } else if (!showSMA20 && seriesRefs.current.sma20) {
      chart.removeSeries(seriesRefs.current.sma20);
      seriesRefs.current.sma20 = null;
    }

    // SMA 50
    if (showSMA50 && !seriesRefs.current.sma50) {
      const sma50Raw = SMA.calculate({ period: 50, values: closePrices });
      const sma50Data = sma50Raw.map((val, i) => ({ time: sortedData[i + 49].time, value: val }));
      const series = chart.addSeries(LineSeries, { color: '#f59e0b', lineWidth: 2, title: 'SMA 50' }); // yellow
      series.setData(sma50Data);
      seriesRefs.current.sma50 = series;
    } else if (!showSMA50 && seriesRefs.current.sma50) {
      chart.removeSeries(seriesRefs.current.sma50);
      seriesRefs.current.sma50 = null;
    }

    // RSI 14
    if (showRSI && !seriesRefs.current.rsi) {
      const rsiRaw = RSI.calculate({ period: 14, values: closePrices });
      const rsiData = rsiRaw.map((val, i) => ({ time: sortedData[i + 14].time, value: val }));
      const series = chart.addSeries(LineSeries, { 
        color: '#a855f7', // purple
        lineWidth: 2, 
        priceScaleId: 'rsi',
        title: 'RSI 14'
      });
      series.setData(rsiData);
      seriesRefs.current.rsi = series;
    } else if (!showRSI && seriesRefs.current.rsi) {
      chart.removeSeries(seriesRefs.current.rsi);
      seriesRefs.current.rsi = null;
    }

  }, [showSMA20, showSMA50, showRSI, data]);

  return (
    <div className="glass rounded-2xl p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">{symbol} Grafiği</h2>
          <p className="text-gray-400">Günlük Mum Grafiği (Son 1 Yıl)</p>
        </div>
        
        {/* Indicator Toggles */}
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setShowSMA20(!showSMA20)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
              showSMA20 ? "bg-blue-500/20 text-blue-400 border-blue-500/50" : "glass text-gray-400 border-white/10 hover:bg-white/5"
            }`}
          >
            SMA 20
          </button>
          <button 
            onClick={() => setShowSMA50(!showSMA50)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
              showSMA50 ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/50" : "glass text-gray-400 border-white/10 hover:bg-white/5"
            }`}
          >
            SMA 50
          </button>
          <button 
            onClick={() => setShowRSI(!showRSI)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
              showRSI ? "bg-purple-500/20 text-purple-400 border-purple-500/50" : "glass text-gray-400 border-white/10 hover:bg-white/5"
            }`}
          >
            RSI 14
          </button>
        </div>
      </div>
      
      <div ref={chartContainerRef} className="w-full h-[500px]" />
    </div>
  );
}
