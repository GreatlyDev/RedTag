import Link from "next/link";
import styles from "./page.module.css";
import { APP_NAME, APP_PROMISE } from "./product-copy";

export default function HomePage() {
  return (
    <div className={styles.shell}>
      <header className={styles.masthead}>
        <Link className={styles.wordmark} href="/" aria-label="RedTag home">
          {APP_NAME}
        </Link>
        <span className={styles.scope}>U.S. recall record guide</span>
      </header>
      <main>
        <section
          id="scan"
          className={styles.hero}
          aria-labelledby="scan-heading"
        >
          <p className={styles.eyebrow}>Universal Scan</p>
          <h1 id="scan-heading">Evidence first. Answers you can trace.</h1>
          <p>{APP_PROMISE}</p>
          <button type="button">Scan with camera</button>
          <button type="button">Choose from photos</button>
        </section>
      </main>
    </div>
  );
}
