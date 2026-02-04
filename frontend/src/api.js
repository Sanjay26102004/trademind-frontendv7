const BASE_URL = import.meta.env.VITE_API_URL;
export const api = {
  scan: async (pair, timeframe, apiKey) => {
    const res = await fetch(`${BASE_URL}/scan/${encodeURIComponent(pair)}?timeframe=${timeframe}`, { headers: { "x-api-key": apiKey } });
    if (!res.ok) throw new Error("Connection Failed");
    return res.json();
  },
  logResult: async (signalId, result, payout, apiKey, skippedReason = null) => {
    const body = { signal_id: signalId, result, payout, skipped_reason: skippedReason };
    const res = await fetch(`${BASE_URL}/trade/result`, { method: "POST", headers: { "Content-Type": "application/json", "x-api-key": apiKey }, body: JSON.stringify(body) });
    return res.json();
  },
  getPairs: async () => {
    const res = await fetch(`${BASE_URL}/pairs`);
    return res.json();
  }
};
