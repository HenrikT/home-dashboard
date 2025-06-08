"use client";

import { useEffect, useState } from "react";

type PriceItem = {
  NOK_per_kWh: number;
  EUR_per_kWh: number;
  time_start: string;
  time_end: string;
};

type PriceData = PriceItem[];

export default function PriceFetcher() {
  const [data, setData] = useState<PriceData>();
  const date = "2025-06-08";
  const zone = "NO1";

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`/api/price/${date}/${zone}`);
      if (!res.ok) {
        console.error("Failed to fetch");
        return;
      }
      const json = await res.json();
      setData(json);
    }

    fetchData();
  }, [date, zone]);

  return (
    <div>
      <h2>
        Power prices for {zone} on {date}
      </h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
