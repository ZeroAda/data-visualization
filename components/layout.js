import styles from './layout.module.css';
import Link from 'next/link';


export default function Layout({ children, home }) {
  return <div className={styles.pageContainer}>
    <main className={styles.container}>{children}</main>
    <footer className={styles.footer}>
      <p>2024 &copy; Chenyi Li. All right reserved.</p>
    </footer>
    </div>;
}