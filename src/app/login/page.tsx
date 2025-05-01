"use client";

import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { FaUser, FaLock } from "react-icons/fa";

export default function Login() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/home");
  };

  return (
    <div className={styles.main}>
      <div className={styles.card}>
        <h1 className={styles.header}>Login</h1>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <FaUser className={styles.icon} />
            <input
              type="email"
              name="email"
              placeholder="Type your username"
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <FaLock className={styles.icon} />
            <input type="password" placeholder="Type your password" className={styles.input} />
          </div>
          <button type="submit" className={styles.loginButton}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
