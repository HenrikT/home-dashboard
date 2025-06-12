/** Raw structure from hvakosterstrommen.no */
export type ExternalPriceItem = {
  NOK_per_kWh: number;
  EUR_per_kWh: number;
  EXR: number;
  time_start: string;
  time_end: string;
};

/** Transformed item used in our app (øre per kWh) */
export type PriceItem = {
  øre_per_kWh: number;
  time_start: string;
  time_end: string;
};

/** Transformed response returned by our API and consumed by the frontend */
export type PriceData = {
  date: string;
  zone: string;
  min: number;
  avg: number;
  max: number;
  priceItems: PriceItem[];
};
