import Link from 'next/link';
import styles from './style.module.scss';

export function ExitPreviewButton() {
  return (
    <aside className={styles.container}>
      <Link href="/api/exit-preview">
        <a>Sair do modo Preview</a>
      </Link>
    </aside>
  );
}
