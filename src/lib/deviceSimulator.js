"use client";

import { useEffect, useRef, useState } from "react";

const HISTORY_LEN = 30;
const TICK_MS = 2000;

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export function useDeviceTelemetry() {
  const [battery, setBattery] = useState(87);
  const [heartRate, setHeartRate] = useState(72);
  const [connected, setConnected] = useState(true);
  const [signal, setSignal] = useState(4);
  const [fallDetected, setFallDetected] = useState(false);
  const [batteryHistory, setBatteryHistory] = useState(() => Array(HISTORY_LEN).fill(87));
  const [heartRateHistory, setHeartRateHistory] = useState(() => Array(HISTORY_LEN).fill(72));

  const fallCooldown = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      setBattery((b) => {
        const drained = clamp(b - Math.random() * 0.4, 1, 100);
        setBatteryHistory((h) => [...h.slice(-HISTORY_LEN + 1), drained]);
        return drained;
      });

      setHeartRate((hr) => {
        let next;
        if (fallCooldown.current > 0) {
          next = clamp(hr + (Math.random() * 30 - 5), 60, 180);
          fallCooldown.current -= 1;
        } else {
          next = clamp(hr + (Math.random() * 8 - 4), 58, 102);
        }
        setHeartRateHistory((h) => [...h.slice(-HISTORY_LEN + 1), Math.round(next)]);
        return Math.round(next);
      });

      setConnected((c) => (Math.random() < 0.04 ? !c : c || true));
      setSignal(() => clamp(Math.round(2 + Math.random() * 3), 1, 5));
    }, TICK_MS);

    return () => clearInterval(id);
  }, []);

  function chargeBattery() {
    setBattery(100);
    setBatteryHistory((h) => [...h.slice(-HISTORY_LEN + 1), 100]);
  }

  function simulateFall() {
    fallCooldown.current = 4;
    setFallDetected(true);
    setTimeout(() => setFallDetected(false), 6000);
  }

  return {
    battery: Math.round(battery),
    heartRate,
    connected,
    signal,
    fallDetected,
    batteryHistory,
    heartRateHistory,
    chargeBattery,
    simulateFall,
  };
}
