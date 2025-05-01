import NavigationBar from "@/components/navigation-bar";
import styles from "./page.module.css";
import { LuUser, LuLock } from "react-icons/lu";

export default function Home() {
  return (
    <div className={styles.background}>
      <div className={styles.navigationBar}>
        <div className={styles.card}>
          <NavigationBar />
        </div>
      </div>
      <div className={styles.mainContent}>
        <div className={styles.topSection}>
          <div className={styles.topLeft}>
            <div className={styles.card}>
              <p>This is the top left section</p>
            </div>
          </div>
          <div className={styles.topRight}>
            <div className={styles.card}>
              <p>This is the top right section</p>
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
  );
}
