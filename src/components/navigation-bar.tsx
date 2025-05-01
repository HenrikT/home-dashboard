"use client";

import { LuLayoutDashboard, LuSettings, LuLogOut } from "react-icons/lu";
import styles from "./navigation-bar.module.css";
import { JSX, MouseEventHandler } from "react";
import { useRouter } from "next/navigation";

export enum NavItemType {
  Home = "Home",
  Settings = "Settings",
  Logout = "Logout",
}

type NavItem = {
  label: string;
  icon: JSX.Element;
  type: NavItemType;
  onItemClicked: MouseEventHandler<HTMLButtonElement>;
};

export default function NavigationBar() {
  const router = useRouter();

  function onHomeClicked() {
    router.push("/home");
  }

  function onSettingsClicked() {
    router.push("/settings");
  }

  function onLogoutClicked() {
    router.push("/login");
  }

  const navItems: NavItem[] = [
    {
      label: "Home",
      icon: <LuLayoutDashboard className={styles.icon} />,
      type: NavItemType.Home,
      onItemClicked: onHomeClicked,
    },
    {
      label: "Settings",
      icon: <LuSettings className={styles.icon} />,
      type: NavItemType.Settings,
      onItemClicked: onSettingsClicked,
    },
    {
      label: "Logout",
      icon: <LuLogOut className={styles.icon} />,
      type: NavItemType.Logout,
      onItemClicked: onLogoutClicked,
    },
  ];

  return (
    <nav className={styles.nav}>
      {navItems.map((item) => (
        <button key={item.label} className={styles.navButton} onClick={item.onItemClicked}>
          {item.icon}
          <span className={styles.label}>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
