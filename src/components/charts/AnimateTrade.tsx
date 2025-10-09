"use client";

import { useEffect, useRef, useState } from "react";
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
  const [showPopup, setShowPopup] = useState(false);

  // Show congratulations popup after 6 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

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

        // buy time and sell time indices
        const buyIndex = candles.length - 30;
        const sellIndex = candles.length - 10;
        const buyTime = candles[buyIndex].time;
        const sellTime = candles[sellIndex].time;

        // Example TP / SL values
        const entryPrice = candles[buyIndex].close;
        const takeProfitPrice = 1.03 * entryPrice;
        const stopLossPrice = entryPrice * 0.99;
        
        // Calculate TP and SL percentages
        const tpPercentage = ((takeProfitPrice - entryPrice) / entryPrice * 100).toFixed(2);
        const slPercentage = ((stopLossPrice - entryPrice) / entryPrice * 100).toFixed(2);

        // Initially set data up to buy time, then all remaining static data
        const initialCandles = [
          ...candles.slice(0, buyIndex).map((d) => ({
            ...d,
            time: toChartTime(d.time),
          })),
        ];

        const animatedCandles = candles.slice(buyIndex, sellIndex + 1).map((d) => ({
          ...d,
          time: toChartTime(d.time),
        }));

        // Set initial data (before buy time)
        candleSeries.setData(initialCandles);

        // Set volume data (all at once)
        volumeSeries.setData(
          volumes.map((v) => ({
            ...v,
            time: toChartTime(v.time),
          }))
        );

        // Animate candles from buy to sell time
        let currentIndex = 0;
        const animationInterval = setInterval(() => {
          if (currentIndex < animatedCandles.length) {
            candleSeries.update(animatedCandles[currentIndex]);
            currentIndex++;
          } else {
            clearInterval(animationInterval);
          }
        }, 200); // 200ms per candle

        // --- Overlay rectangle between TP and SL ---
        const overlay = document.createElement("div");
        overlay.style.position = "absolute";
        overlay.style.pointerEvents = "none";
        overlay.style.zIndex = "2";
        chartContainerRef.current!.style.position = "relative";
        chartContainerRef.current!.appendChild(overlay);

        // --- Short Take Profit line inside overlay ---
        const tpLine = document.createElement("div");
        tpLine.style.position = "absolute";
        tpLine.style.height = "0";
        tpLine.style.borderTop = "2px dashed #088D25";
        tpLine.style.filter = "drop-shadow(0 0 4px rgba(8, 141, 37, 0.6))";
        tpLine.style.top = "0";
        overlay.appendChild(tpLine);

        // --- Short Stop Loss line inside overlay ---
        const slLine = document.createElement("div");
        slLine.style.position = "absolute";
        slLine.style.height = "0";
        slLine.style.borderTop = "2px dashed #E92424";
        slLine.style.filter = "drop-shadow(0 0 4px rgba(233, 36, 36, 0.6))";
        overlay.appendChild(slLine);

        // --- Entry Price line inside overlay ---
        const entryLine = document.createElement("div");
        entryLine.style.position = "absolute";
        entryLine.style.height = "0";
        entryLine.style.borderTop = "2px dashed #00BDDD";
        entryLine.style.filter = "drop-shadow(0 0 4px rgba(0, 189, 221, 0.6))";
        entryLine.style.width = "100%";
        overlay.appendChild(entryLine);

        // --- Entry Price Label at right end ---
        const entryPriceLabel = document.createElement("div");
        entryPriceLabel.style.position = "absolute";
        entryPriceLabel.style.background = "rgba(0, 189, 221, 0.9)";
        entryPriceLabel.style.color = "#1F1F1F";
        entryPriceLabel.style.padding = "2px 8px";
        entryPriceLabel.style.borderRadius = "4px";
        entryPriceLabel.style.fontSize = "11px";
        entryPriceLabel.style.fontWeight = "600";
        entryPriceLabel.style.pointerEvents = "none";
        entryPriceLabel.style.zIndex = "5";
        entryPriceLabel.style.whiteSpace = "nowrap";
        entryPriceLabel.textContent = "Entry Price: " + entryPrice.toFixed(2);
        chartContainerRef.current!.appendChild(entryPriceLabel);

        // --- Take Profit Percentage Label ---
        const tpLabel = document.createElement("div");
        tpLabel.style.position = "absolute";
        tpLabel.style.background = "rgba(15, 237, 190, 0.9)";
        tpLabel.style.color = "#1F1F1F";
        tpLabel.style.padding = "4px 10px";
        tpLabel.style.borderRadius = "8px";
        tpLabel.style.fontSize = "12px";
        tpLabel.style.fontWeight = "600";
        tpLabel.style.pointerEvents = "none";
        tpLabel.style.zIndex = "5";
        tpLabel.style.boxShadow = "0 2px 8px rgba(15, 237, 190, 0.4)";
        tpLabel.textContent = `Take Profit: +${tpPercentage}%`;
        chartContainerRef.current!.appendChild(tpLabel);

        // --- Stop Loss Percentage Label ---
        const slLabel = document.createElement("div");
        slLabel.style.position = "absolute";
        slLabel.style.background = "rgba(246, 60, 107, 0.9)";
        slLabel.style.color = "#FFFFFF";
        slLabel.style.padding = "4px 10px";
        slLabel.style.borderRadius = "8px";
        slLabel.style.fontSize = "12px";
        slLabel.style.fontWeight = "600";
        slLabel.style.pointerEvents = "none";
        slLabel.style.zIndex = "5";
        slLabel.style.boxShadow = "0 2px 8px rgba(246, 60, 107, 0.4)";
        slLabel.textContent = `Stop Loss: ${slPercentage}%`;
        chartContainerRef.current!.appendChild(slLabel);

        const updateOverlayPosition = () => {
          const tpY = candleSeries.priceToCoordinate(takeProfitPrice);
          const slY = candleSeries.priceToCoordinate(stopLossPrice);

          if (
            tpY == null ||
            slY == null ||
            Number.isNaN(tpY) ||
            Number.isNaN(slY)
          ) {
            overlay.style.display = "none";
            tpLabel.style.display = "none";
            slLabel.style.display = "none";
            return;
          }

          overlay.style.display = "block";
          tpLabel.style.display = "block";
          slLabel.style.display = "block";

          // Position overlay between TP and SL
          const top = Math.min(tpY, slY);
          const height = Math.abs(slY - tpY);

          // Overlay spans from buy time to sell time
          const startX = chart
            .timeScale()
            .timeToCoordinate(toChartTime(buyTime));
          const endX = chart
            .timeScale()
            .timeToCoordinate(toChartTime(sellTime));

          if (startX == null || endX == null) return;

          const left = Math.min(startX, endX);
          const width = Math.abs(endX - startX);

          overlay.style.top = `${top}px`;
          overlay.style.left = `${left}px`;
          overlay.style.width = `${width}px`;
          overlay.style.height = `${height}px`;

          // Update short TP and SL lines within overlay
          tpLine.style.width = "100%";
          slLine.style.width = "100%";
          tpLine.style.top = "0";
          slLine.style.bottom = "0";

          // Position entry price line within overlay and extend to chart's right edge
          const entryY = candleSeries.priceToCoordinate(entryPrice);
          if (entryY != null && !Number.isNaN(entryY)) {
            const entryOffsetFromTop = entryY - top;
            const entryPercentage = (entryOffsetFromTop / height) * 100;
            
            // Sharp gradient with hard stop at entry price
            overlay.style.background = `linear-gradient(to bottom, 
rgba(11, 99, 81, 0.4) 0%, 
rgba(11, 99, 81, 0.4) ${entryPercentage}%, 
rgba(81, 19, 24, 0.4) ${entryPercentage}%, 
rgba(81, 19, 24, 0.4) 100%)`;
            
            entryLine.style.top = `${entryOffsetFromTop}px`;
            
            // Calculate width to extend to the right edge of the chart
            const containerWidth = chartContainerRef.current!.offsetWidth;
            const overlayRight = left + width;
            const extensionWidth = containerWidth - overlayRight;
            const totalLineWidth = width + extensionWidth;
            
            entryLine.style.width = `${totalLineWidth}px`;
            entryLine.style.left = "0";

            // Position entry price label at the right end
            entryPriceLabel.style.display = "block";
            entryPriceLabel.style.right = "8px";
            entryPriceLabel.style.top = `${entryY - 10}px`;
          } else {
            entryPriceLabel.style.display = "none";
          }

          // Calculate responsive font size based on overlay width
          const minFontSize = 10;
          const maxFontSize = 14;
          const fontSize = Math.max(minFontSize, Math.min(maxFontSize, width / 25));
          
          // Update TP label size and position (centered above overlay)
          tpLabel.style.fontSize = `${fontSize}px`;
          tpLabel.style.padding = `${fontSize * 0.4}px ${fontSize * 1}px`;
          tpLabel.style.left = `${left + width / 2}px`;
          tpLabel.style.top = `${top - (fontSize * 2.5)}px`;
          tpLabel.style.transform = "translateX(-50%)"; // Center horizontally

          // Update SL label size and position (centered below overlay)
          slLabel.style.fontSize = `${fontSize}px`;
          slLabel.style.padding = `${fontSize * 0.4}px ${fontSize * 1}px`;
          slLabel.style.left = `${left + width / 2}px`;
          slLabel.style.top = `${top + height + (fontSize * 0.5)}px`;
          slLabel.style.transform = "translateX(-50%)"; // Center horizontally
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
            time: toChartTime(buyTime),
            position: "belowBar",
            color: "#0FEDBE",
            shape: "arrowUp",
            text: "Buy",
          },
          {
            time: toChartTime(sellTime),
            position: "aboveBar",
            color: "#F63C6B",
            shape: "arrowDown",
            text: "Sell",
          },
        ]);

        // --- ADD VERTICAL LINE ---
        const bottomMargin = 30;
        const verticalLine = document.createElement("div");
        verticalLine.style.position = "absolute";
        verticalLine.style.width = "0";
        verticalLine.style.borderLeft = "2px dashed #FFD700";
        verticalLine.style.bottom = `${bottomMargin}px`;
        verticalLine.style.zIndex = "3";
        verticalLine.style.pointerEvents = "none";
        verticalLine.style.filter = "drop-shadow(0 0 4px rgba(255, 215, 0, 0.6))";
        chartContainerRef.current!.appendChild(verticalLine);

        // --- ADD CIRCLE AT BOTTOM OF VERTICAL LINE ---
        const circle = document.createElement("div");
        circle.style.position = "absolute";
        circle.style.width = "16px";
        circle.style.height = "16px";
        circle.style.borderRadius = "50%";
        circle.style.background = "#FFD700";
        circle.style.bottom = `${bottomMargin}px`;
        circle.style.zIndex = "4";
        circle.style.pointerEvents = "none";
        circle.style.boxShadow = "0 0 8px rgba(255, 215, 0, 0.8)";
        circle.style.transform = "translateX(-50%)";
        chartContainerRef.current!.appendChild(circle);

        const targetChartTime = toChartTime(buyTime);

        const updateVerticalLine = () => {
          const x = chart.timeScale().timeToCoordinate(targetChartTime);
          const tpY = candleSeries.priceToCoordinate(entryPrice);

          if (x == null || tpY == null || Number.isNaN(x) || Number.isNaN(tpY)) {
            verticalLine.style.display = "none";
            circle.style.display = "none";
            return;
          }

          const containerHeight = chartContainerRef.current!.offsetHeight;
          const heightFromBottom = containerHeight - tpY - bottomMargin;

          verticalLine.style.display = "block";
          verticalLine.style.left = `${x}px`;
          verticalLine.style.height = `${heightFromBottom}px`;

          circle.style.display = "block";
          circle.style.left = `${x}px`;
        };

        updateVerticalLine();

        timeScale.subscribeVisibleTimeRangeChange(updateVerticalLine);
        timeScale.subscribeSizeChange(updateVerticalLine);
        chart.subscribeCrosshairMove(updateVerticalLine);
        window.addEventListener("resize", updateVerticalLine);

        // --- Cleanup ---
        const cleanup = () => {
          clearInterval(animationInterval);
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
          circle.remove();
          tpLabel.remove();
          slLabel.remove();
          entryPriceLabel.remove();
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

      {/* Congratulations Popup */}
      {showPopup && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowPopup(false)}
        >
          <div 
            className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-8 shadow-2xl max-w-md mx-4 transform animate-bounce"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Congratulations!
              </h2>
              <p className="text-xl text-white mb-6">
                Mr. Essam, you are lucky to have such a developer!
              </p>
              <button
                onClick={() => setShowPopup(false)}
                className="bg-white text-green-700 font-bold py-2 px-6 rounded-lg hover:bg-gray-100 transition-colors pointer"
              >
                Thank You! 😊
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
