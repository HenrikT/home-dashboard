"use client";

import React, { useEffect, useState } from "react";
import styles from "./settings-overlay.module.css";
import { POWER_ZONE_LABELS, PowerZone } from "@/constants/power-zone";

type Props = {
  onClose: () => void;
};

export default function SettingsOverlay({ onClose }: Props) {
  const [selectedZone, setSelectedZone] = useState<PowerZone>(PowerZone.NO1);

  useEffect(() => {
    const savedZone = localStorage.getItem("powerZone") as PowerZone | null;
    if (savedZone && Object.values(PowerZone).includes(savedZone)) {
      setSelectedZone(savedZone);
    }
  }, []);

  const handleZoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const zone = e.target.value as PowerZone;
    setSelectedZone(zone);
    localStorage.setItem("powerZone", zone);
    window.dispatchEvent(new Event("powerZoneChanged"));
    onClose();
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h1 className={styles.title}>Settings</h1>
        <div className={styles.settingRow}>
          <label className={styles.label} htmlFor="powerZoneSelect">
            Power Zone
          </label>
          <select
            id="powerZoneSelect"
            className={styles.select}
            value={selectedZone}
            onChange={handleZoneChange}
          >
            {Object.values(PowerZone).map((zone) => (
              <option key={zone} value={zone}>
                {POWER_ZONE_LABELS[zone]}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
