"use client";

import { useEffect, useRef } from "react";
import { createChart, ColorType } from "lightweight-charts";

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

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#9CA3AF",
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.1)" },
        horzLines: { color: "rgba(255, 255, 255, 0.1)" },
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

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: "#22c55e", // green-500
      downColor: "#ef4444", // red-500
      borderVisible: false,
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    // Sort data chronologically, as required by lightweight-charts
    const sortedData = [...data].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    candlestickSeries.setData(sortedData);
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
    };
  }, [data]);

  return (
    <div className="glass rounded-2xl p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{symbol} Grafiği</h2>
          <p className="text-gray-400">Günlük Mum Grafiği (Son 1 Yıl)</p>
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full h-[500px]" />
    </div>
  );
}
