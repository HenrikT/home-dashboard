"use client";
import NavigationBar from "@/components/navigation-bar/navigation-bar";
import styles from "./page.module.css";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import PriceSection from "@/components/price-section/price-section";
import SettingsOverlay from "@/components/settings-overlay/settings-overlay";
import { PowerZone } from "@/constants/power-zone";
import { TopBar } from "@/components/top-bar/top-bar";
import ForecastSection from "@/components/forecast-section/forecast-section";

export default function Home() {
  const router = useRouter();
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [selectedZone, setSelectedZone] = useState<PowerZone>(PowerZone.NO1);

  // Get the selected power zone from local storage to show it on the top bar.
  useEffect(() => {
    const loadZone = () => {
      const storedZone = localStorage.getItem("powerZone") as PowerZone | null;
      if (storedZone && Object.values(PowerZone).includes(storedZone)) {
        setSelectedZone(storedZone);
      }
    };

    // Initial load
    loadZone();

    // Listen for custom zone change events
    const handleZoneChanged = () => loadZone();
    window.addEventListener("powerZoneChanged", handleZoneChanged);

    return () => {
      window.removeEventListener("powerZoneChanged", handleZoneChanged);
    };
  }, []);

  // Check if we have a valid session. If we don't, navigate to the login page.
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/login");
      } else {
        setSession(session);
      }
      setLoading(false);
    });
  }, [router]);

  // Show a loading spinner while loading the session.
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  // If we don't have a session, show nothing. Wait for navigation to /login.
  if (!session) {
    return null;
  }

  // Main component.
  return (
    <div className={styles.background}>
      <TopBar selectedZone={selectedZone} session={session} />
      <div className={styles.contentWrapper}>
        <div className={styles.navigationBar}>
          <div className={styles.card}>
            <NavigationBar onShowSettings={() => setShowSettings(true)} />
            {showSettings && <SettingsOverlay onClose={() => setShowSettings(false)} />}
          </div>
        </div>
        <div className={styles.mainContent}>
          <div className={styles.topSection}>
            <div className={styles.topLeft}>
              <div className={styles.card}>
                <PriceSection />
              </div>
            </div>
            <div className={styles.topRight}>
              <div className={styles.card}>
                <ForecastSection />
              </div>
            </div>
          </div>
          <div className={styles.bottomSection}>
            <div className={styles.card}>
              <p>This is the bottom section</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
