"use client";

import { useEffect, useRef } from "react";
import {
  CrosshairMode,
  CandlestickSeries,
  HistogramSeries,
  createChart,
} from "lightweight-charts";

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface VolumeData {
  time: number;
  value: number;
  color: string;
}

export default function CandlestickChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      autoSize: true,
      layout: {
        background: { color: "#1F1F1F" },
        textColor: "#d1d4dc",
      },
      grid: {
        vertLines: { color: "#2a2a2a" },
        horzLines: { color: "#2a2a2a" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: "#3a3a3a",
      },
      timeScale: {
        borderColor: "#3a3a3a",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // Candlestick series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#0FEDBE",
      downColor: "#F63C6B",
      borderUpColor: "#0FEDBE",
      borderDownColor: "#F63C6B",
      wickUpColor: "#0FEDBE",
      wickDownColor: "#F63C6B",
    });

    // Volume histogram series (different scale)
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceScaleId: "volume", // separate scale at bottom
      priceFormat: { type: "volume" },
    });

    // Minimize the volume chart to bottom 15% of the chart
    chart.priceScale("volume").applyOptions({
      scaleMargins: {
        top: 0.85, // 85% margin at top
        bottom: 0,
      },
    });

    // Load data
    const loadData = async () => {
      try {
        const response = await fetch("/data.csv");
        const csvText = await response.text();

        const lines = csvText.trim().split("\n");
        const candles: CandleData[] = [];
        const volumes: VolumeData[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",");
          const date = values[0];
          const close = parseFloat(values[1]);
          const high = parseFloat(values[2]);
          const low = parseFloat(values[3]);
          const open = parseFloat(values[4]);
          const volume = parseFloat(values[5]);

          const timestamp = Math.floor(new Date(date).getTime() / 1000);

          candles.push({
            time: timestamp,
            open,
            high,
            low,
            close,
          });

          volumes.push({
            time: timestamp,
            value: volume,
            color:
              close >= open
                ? "rgba(38, 166, 154, 0.5)"
                : "rgba(239, 83, 80, 0.5)",
          });
        }

        const toChartTime = (timestamp: number) => {
          const date = new Date(timestamp * 1000);
          return {
            year: date.getUTCFullYear(),
            month: date.getUTCMonth() + 1,
            day: date.getUTCDate(),
          };
        };

        candleSeries.setData(
          candles.map((d) => ({
            ...d,
            time: toChartTime(d.time),
          }))
        );

        volumeSeries.setData(
          volumes.map((v) => ({
            ...v,
            time: toChartTime(v.time),
          }))
        );
      } catch (error) {
        console.error("Error loading CSV:", error);
      }
    };

    loadData();

    return () => chart.remove();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505]">
      <style>{`
        #tv-attr-logo {
          display: none !important;
        }
      `}</style>
      <div className="bg-[#050505] rounded-3xl p-8 shadow-2xl max-w-6xl w-full">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">
          Alrajhi Bank Candlestick Chart
        </h1>
        <p className="text-sm text-gray-400 mb-6">2010 - 2025</p>

        <div ref={chartContainerRef} className="w-full h-[500px]" />
      </div>
    </div>
  );
}
