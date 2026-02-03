const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export const api = {
  scan: async (pair, timeframe, apiKey) => {
    const encodedPair = encodeURIComponent(pair);
    const res = await fetch(`${BASE_URL}/scan/${encodedPair}?timeframe=${timeframe}`, {
      headers: { "x-api-key": apiKey }
    });
    if (!res.ok) throw new Error("Connection Failed");
    return res.json();
  },

  // UPGRADED: Accepts skippedReason
  logResult: async (signalId, result, payout, apiKey, skippedReason = null) => {
    const body = { 
      signal_id: signalId, 
      result: result, 
      payout: payout 
    };

    if (skippedReason) {
      body.skipped_reason = skippedReason;
    }

    const res = await fetch(`${BASE_URL}/trade/result`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-api-key": apiKey 
      },
      body: JSON.stringify(body)
    });
    return res.json();
  },

  getPairs: async () => {
    const res = await fetch(`${BASE_URL}/pairs`);
    if (!res.ok) throw new Error("Failed to load pairs");
    return res.json();
  }
};