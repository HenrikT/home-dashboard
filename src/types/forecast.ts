export type ForecastApiResponse = {
  priceArea: string;
  priceUnits: {
    currency: string;
    vat: {
      rate: number;
      hasVAT: boolean;
    };
    energyUnit: string;
  };
  segmentOptions: {
    segmentSize: number;
  };
  forecastAdvice: ForecastAdvice[];
};

export type ForecastAdvice = {
  loss: number;
  type: "Good" | "Normal" | "Avoid";
  from: string;
  to: string;
  averagePrice: number;
  dataSource: "Actual" | "Forecast" | string;
};

export type Segment = {
  averagePrice: number;
  isGoodTime: boolean;
  isBadTime: boolean;
};

export type ForecastItem = {
  dayOfWeek: string;
  segments: Segment[];
};
