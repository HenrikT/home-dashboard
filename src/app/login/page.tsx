"use client";
import React from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { FaUser, FaLock } from "react-icons/fa";
import { supabase } from "@/lib/supabaseClient";
import type { User, Session, AuthError } from "@supabase/supabase-js";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  /**
   * Attempts to log in the user via Supabase.
   *
   * If an error occurs, a popup displaying the error is shown.
   *
   * If successful, the user is logged in.
   */
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (data.session) {
      router.push("/home");
    }
  };

  return (
    <div className={styles.main}>
      <div className={styles.card}>
        <h1 className={styles.header}>Login</h1>
        <form className={styles.form} onSubmit={handleLogin}>
          <div className={styles.inputGroup}>
            <FaUser className={styles.icon} />
            <input
              type="email"
              name="email"
              placeholder="Type your username"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className={styles.inputGroup}>
            <FaLock className={styles.icon} />
            <input
              type="password"
              name="password"
              placeholder="Type your password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button aria-label="Login" type="submit" className={styles.loginButton}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
