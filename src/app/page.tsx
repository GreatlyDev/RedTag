import Link from "next/link";
import { connection } from "next/server";
import { UniversalScan } from "@/features/scan/universal-scan";
import styles from "./page.module.css";
import { APP_NAME } from "./product-copy";

export default async function HomePage() {
  // Intentional: request-scoped CSP nonces require dynamic rendering.
  await connection();
  return (
    <div className={styles.shell}>
      <header className={styles.masthead}>
        <Link className={styles.wordmark} href="/" aria-label="RedTag home">
          {APP_NAME}
        </Link>
        <span className={styles.scope}>U.S. recall record guide</span>
      </header>
      <main id="scan">
        <UniversalScan />
      </main>
    </div>
  );
}
