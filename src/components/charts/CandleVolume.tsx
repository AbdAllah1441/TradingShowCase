"use client";

import { useEffect, useRef } from "react";
import {
  CrosshairMode,
  CandlestickSeries,
  HistogramSeries,
  createChart,
  createSeriesMarkers,
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
  const chartContainerRef = useRef<HTMLDivElement | null>(null);

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

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#0FEDBE",
      downColor: "#F63C6B",
      borderUpColor: "#0FEDBE",
      borderDownColor: "#F63C6B",
      wickUpColor: "#0FEDBE",
      wickDownColor: "#F63C6B",
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceScaleId: "volume",
      priceFormat: { type: "volume" },
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.85,
        bottom: 0,
      },
    });

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

          candles.push({ time: timestamp, open, high, low, close });
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
          } as const;
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

        // Example TP / SL values
        const takeProfitPrice = 1.03 * candles[candles.length - 1].close;
        const stopLossPrice = candles[candles.length - 1].close * 0.99;

        candleSeries.createPriceLine({
          price: takeProfitPrice,
          color: "#0FEDBE",
          lineWidth: 2,
          lineStyle: 2, // dashed
          axisLabelVisible: true,
          title: "Take Profit",
        });

        candleSeries.createPriceLine({
          price: stopLossPrice,
          color: "#F63C6B",
          lineWidth: 2,
          lineStyle: 2,
          axisLabelVisible: true,
          title: "Stop Loss",
        });

        // --- Overlay rectangle between TP and SL ---
        const overlay = document.createElement("div");
        overlay.style.position = "absolute";
        overlay.style.left = "0";
        overlay.style.right = "0";
        overlay.style.pointerEvents = "none";
        overlay.style.zIndex = "2";
        overlay.style.background =
          "linear-gradient(to bottom, rgba(15,237,190,0.10), rgba(246,60,107,0.10))";
        chartContainerRef.current!.style.position = "relative";
        chartContainerRef.current!.appendChild(overlay);

        const updateOverlayPosition = () => {
          const tpY = candleSeries.priceToCoordinate(takeProfitPrice);
          const slY = candleSeries.priceToCoordinate(stopLossPrice);

          if (
            tpY == null ||
            Number.isNaN(tpY) ||
            slY == null ||
            Number.isNaN(slY)
          ) {
            overlay.style.display = "none";
            return;
          }

          overlay.style.display = "block";
          const top = Math.min(tpY, slY);
          const height = Math.abs(slY - tpY);
          const left = chart
            .timeScale()
            .timeToCoordinate(toChartTime(candles[candles.length - 20].time));

          overlay.style.top = `${top}px`;
          overlay.style.left = `${left}px`;
          overlay.style.height = `${height}px`;
        };

        updateOverlayPosition();

        const timeScale = chart.timeScale();
        timeScale.subscribeSizeChange(updateOverlayPosition);
        timeScale.subscribeVisibleTimeRangeChange(updateOverlayPosition);
        chart.subscribeCrosshairMove(updateOverlayPosition);
        window.addEventListener("resize", updateOverlayPosition);

        // --- Add Random Markers ---
        createSeriesMarkers(candleSeries, [
          {
            time: toChartTime(candles[candles.length - 30].time),
            position: "belowBar",
            color: "#0FEDBE",
            shape: "arrowUp",
            text: "Buy",
          },
          {
            time: toChartTime(candles[candles.length - 16].time),
            position: "aboveBar",
            color: "#F63C6B",
            shape: "arrowDown",
            text: "Sell",
          },
        ]);

        // --- ADD VERTICAL LINE ---
        const verticalLine = document.createElement("div");
        verticalLine.style.position = "absolute";
        verticalLine.style.width = "1px";
        verticalLine.style.background = "#FFD700";
        verticalLine.style.bottom = "0";
        verticalLine.style.zIndex = "3";
        verticalLine.style.pointerEvents = "none";
        verticalLine.style.boxShadow = "0 0 8px rgba(255, 215, 0, 0.6)";
        chartContainerRef.current!.appendChild(verticalLine);

        // Place vertical line at a recent visible position (20 candles from end)
        const targetTime = candles[candles.length - 20].time;
        const targetChartTime = toChartTime(targetTime);

        const updateVerticalLine = () => {
          const x = chart.timeScale().timeToCoordinate(targetChartTime);
          const tpY = candleSeries.priceToCoordinate(takeProfitPrice);

          if (
            x == null ||
            Number.isNaN(x) ||
            tpY == null ||
            Number.isNaN(tpY)
          ) {
            verticalLine.style.display = "none";
            return;
          }

          // Get container height to calculate height from bottom
          const containerHeight = chartContainerRef.current!.offsetHeight;
          const heightFromBottom = containerHeight - tpY;

          verticalLine.style.display = "block";
          verticalLine.style.left = `${x}px`;
          verticalLine.style.height = `${heightFromBottom}px`;
          console.log(
            "Vertical line: X=",
            x,
            "Height from bottom=",
            heightFromBottom
          );
        };

        updateVerticalLine();

        timeScale.subscribeVisibleTimeRangeChange(updateVerticalLine);
        timeScale.subscribeSizeChange(updateVerticalLine);
        chart.subscribeCrosshairMove(updateVerticalLine);
        window.addEventListener("resize", updateVerticalLine);

        // --- Cleanup ---
        const cleanup = () => {
          try {
            timeScale.unsubscribeSizeChange(updateOverlayPosition);
            timeScale.unsubscribeVisibleTimeRangeChange(updateOverlayPosition);
          } catch {}
          try {
            chart.unsubscribeCrosshairMove(updateOverlayPosition);
            chart.unsubscribeCrosshairMove(updateVerticalLine);
          } catch {}
          window.removeEventListener("resize", updateOverlayPosition);
          window.removeEventListener("resize", updateVerticalLine);
          overlay.remove();
          verticalLine.remove();
        };

        (chart as unknown as { _overlayCleanup?: () => void })._overlayCleanup =
          cleanup;
      } catch (error) {
        console.error("Error loading CSV:", error);
      }
    };

    loadData();

    return () => {
      try {
        const cleanup = (chart as unknown as { _overlayCleanup?: () => void })
          ._overlayCleanup;
        if (typeof cleanup === "function") cleanup();
      } catch {}
      chart.remove();
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505]">
      <style>{`#tv-attr-logo { display: none !important; }`}</style>
      <div className="bg-[#050505] rounded-3xl p-8 shadow-2xl max-w-6xl w-full">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">
          Alrajhi Bank Candlestick Chart
        </h1>
        <p className="text-sm text-gray-400 mb-6">2010 - 2025</p>
        <div
          ref={chartContainerRef}
          className="relative w-full h-[500px] overflow-hidden"
        />
      </div>
    </div>
  );
}
