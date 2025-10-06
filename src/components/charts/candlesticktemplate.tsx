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
  const volumeContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadChart = async () => {
      if (!chartContainerRef.current || !volumeContainerRef.current) return;

      const chartDiv = chartContainerRef.current;
      const volumeDiv = volumeContainerRef.current;

      // Create the main candlestick chart
      const chart = createChart(chartDiv, {
        autoSize: true,
        layout: {
          background: { color: "#ffffff" },
          textColor: "#333",
        },
        grid: {
          vertLines: { color: "#f0f0f0" },
          horzLines: { color: "#f0f0f0" },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
        },
        rightPriceScale: {
          borderColor: "#d1d4dc",
        },
        timeScale: {
          borderColor: "#d1d4dc",
          timeVisible: true,
          secondsVisible: false,
        },
      });

      // Create the volume chart
      const volumeChart = createChart(volumeDiv, {
        width: volumeDiv.clientWidth,
        height: 150,
        layout: {
          background: { color: "#ffffff" },
          textColor: "#333",
        },
        grid: {
          vertLines: { color: "#f0f0f0" },
          horzLines: { color: "#f0f0f0" },
        },
        rightPriceScale: {
          borderColor: "#d1d4dc",
        },
        timeScale: {
          borderColor: "#d1d4dc",
          timeVisible: true,
          secondsVisible: false,
        },
      });

      // Add candlestick series
      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: "#0FEDBE",
        downColor: "#F63C6B",
        borderUpColor: "#0FEDBE",
        borderDownColor: "#F63C6B",
        wickUpColor: "#0FEDBE",
        wickDownColor: "#F63C6B",
      });

      // Add volume histogram series
      const volumeSeries = volumeChart.addSeries(HistogramSeries, {
        color: "#26a69a",
        priceFormat: {
          type: "volume",
        },
        priceScaleId: "right",
      });

      // Load and parse CSV data
      try {
        const response = await fetch("/data.csv");
        const csvText = await response.text();

        // Parse CSV
        const lines = csvText.trim().split("\n");
        const data: CandleData[] = [];
        const volumeData: VolumeData[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",");
          const date = values[0];
          const close = parseFloat(values[1]);
          const high = parseFloat(values[2]);
          const low = parseFloat(values[3]);
          const open = parseFloat(values[4]);
          const volume = parseFloat(values[5]);

          // Convert date to timestamp
          const timestamp = Math.floor(new Date(date).getTime() / 1000);

          data.push({
            time: timestamp,
            open: open,
            high: high,
            low: low,
            close: close,
          });

          // Volume data with color based on price direction
          const volumeColor =
            close >= open
              ? "rgba(38, 166, 154, 0.5)"
              : "rgba(239, 83, 80, 0.5)";

          volumeData.push({
            time: timestamp,
            value: volume,
            color: volumeColor,
          });
        }

        // Set the data, converting timestamps to { year, month, day } objects for Lightweight Charts compatibility
        const toChartTime = (timestamp: number) => {
          const date = new Date(timestamp * 1000);
          return {
            year: date.getUTCFullYear(),
            month: date.getUTCMonth() + 1,
            day: date.getUTCDate(),
          };
        };

        const candleChartData = data.map((d) => ({
          ...d,
          time: toChartTime(d.time),
        }));

        const volumeChartData = volumeData.map((v) => ({
          ...v,
          time: toChartTime(v.time),
        }));

        candleSeries.setData(candleChartData);
        volumeSeries.setData(volumeChartData);
      } catch (error) {
        console.error("Error loading CSV:", error);
      }

      // Sync the time scales
      chart.timeScale().subscribeVisibleTimeRangeChange((timeRange) => {
        if (timeRange) {
          volumeChart.timeScale().setVisibleRange(timeRange);
        }
      });

      volumeChart.timeScale().subscribeVisibleTimeRangeChange((timeRange) => {
        if (timeRange) {
          chart.timeScale().setVisibleRange(timeRange);
        }
      });

      // Handle window resize
      const handleResize = () => {
        chart.applyOptions({
          width: chartDiv.clientWidth,
        });
        volumeChart.applyOptions({
          width: volumeDiv.clientWidth,
        });
      };

      window.addEventListener("resize", handleResize);

      // Cleanup
      return () => {
        window.removeEventListener("resize", handleResize);
        chart.remove();
        volumeChart.remove();
      };
    };

    loadChart();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-gradient-to-br from-[#667eea] to-[#764ba2]">
      {/* style tag to hide the logo */}
      <style>{`
      #tv-attr-logo {
        display: none !important;
      }
    `}</style>
      <div className="bg-white/95 rounded-3xl p-8 shadow-2xl max-w-6xl w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          📈 OHLC Candlestick Chart
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          Real-time price action with volume analysis
        </p>

        <div className="bg-white rounded-xl p-3 mb-4">
          <div ref={chartContainerRef} className="w-full h-96" />
        </div>

        <div className="bg-white rounded-xl p-3 mb-4">
          <div ref={volumeContainerRef} className="w-full h-36" />
        </div>

        <div className="mt-5 p-4 bg-gray-50 rounded-xl text-sm text-gray-700">
          💡 <strong>Tip:</strong> Hover over the chart to see detailed price
          information. Green candles indicate price increase, red indicates
          decrease.
        </div>
      </div>
    </div>
  );
}
