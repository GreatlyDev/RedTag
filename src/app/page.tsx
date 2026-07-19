import styles from "./page.module.css";
import { APP_NAME, APP_PROMISE } from "./product-copy";

export default function HomePage() {
  return (
    <main className={styles.shell}>
      <header className={styles.masthead}>
        <a className={styles.wordmark} href="#scan" aria-label="RedTag home">
          {APP_NAME}
        </a>
        <span className={styles.scope}>U.S. recall record guide</span>
      </header>
      <section id="scan" className={styles.hero} aria-labelledby="scan-heading">
        <p className={styles.eyebrow}>Universal Scan</p>
        <h1 id="scan-heading">Evidence first. Answers you can trace.</h1>
        <p>{APP_PROMISE}</p>
        <button type="button">Scan with camera</button>
        <button type="button">Choose from photos</button>
      </section>
    </main>
  );
}
