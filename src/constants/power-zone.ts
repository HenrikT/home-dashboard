export enum PowerZone {
  NO1 = "NO1",
  NO2 = "NO2",
  NO3 = "NO3",
  NO4 = "NO4",
  NO5 = "NO5",
}

export const POWER_ZONE_LABELS: Record<PowerZone, string> = {
  [PowerZone.NO1]: "Østlandet (NO1)",
  [PowerZone.NO2]: "Sørlandet (NO2)",
  [PowerZone.NO3]: "Midt-Norge (NO3)",
  [PowerZone.NO4]: "Nord-Norge (NO4)",
  [PowerZone.NO5]: "Vestlandet (NO5)",
};
