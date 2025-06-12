"use client";

import React from "react";
import { LuLayoutDashboard, LuSettings, LuLogOut } from "react-icons/lu";
import styles from "./navigation-bar.module.css";
import { JSX } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export enum NavItemType {
  Home = "Home",
  Settings = "Settings",
  Logout = "Logout",
}

type NavItem = {
  label: string;
  icon: JSX.Element;
  type: NavItemType;
};

type NavigationBarProps = {
  onShowSettings: () => void;
};

export default function NavigationBar({ onShowSettings }: NavigationBarProps) {
  const router = useRouter();

  const handleClick = async (type: NavItemType) => {
    switch (type) {
      case NavItemType.Home:
        router.push("/home");
        break;
      case NavItemType.Settings:
        onShowSettings();
        break;
      case NavItemType.Logout:
        await supabase.auth.signOut();
        router.push("/login");
        break;
    }
  };

  const navItems: NavItem[] = [
    {
      label: "Home",
      icon: <LuLayoutDashboard className={styles.icon} />,
      type: NavItemType.Home,
    },
    {
      label: "Settings",
      icon: <LuSettings className={styles.icon} />,
      type: NavItemType.Settings,
    },
    {
      label: "Logout",
      icon: <LuLogOut className={styles.icon} />,
      type: NavItemType.Logout,
    },
  ];

  return (
    <nav className={styles.nav}>
      {navItems.map((item) => (
        <button
          aria-label={item.label}
          key={item.label}
          className={styles.navButton}
          onClick={() => handleClick(item.type)}
        >
          {item.icon}
          <span className={styles.label}>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
