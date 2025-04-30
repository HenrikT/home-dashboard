import Image from "next/image";
import styles from "./page.module.css";
import Login from "./login/page";

export default function Home() {
  return (
    <div>
      <main>
        <Login />
      </main>
      <footer className={styles.footer}>
        <a href="https://sørlys.no" target="_blank" rel="noopener noreferrer">
          <Image aria-hidden src="/globe.svg" alt="File icon" width={16} height={16} />
          Sørlys
        </a>
      </footer>
    </div>
  );
}
