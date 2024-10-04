import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Link from 'next/link';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className={styles.title}>
          W(om)e(n) Matter
        </h1>
        <h2 className={styles.subtitle}>
          A perspective from a researcher in STEM
        </h2>

        <p className={styles.description}>
          Welcome to W(om)e(n) Matter, a blog space where I explore the intersections of gender studies, technology, and society through my lens as a researcher in computational cognitive science, AI, and HCI. Here, I share insights into the role of women in balancing family and work, the evolving ideals of gender, and how we can leverage data and technology to create a more equitable world. Join me in the journey—all with the goal of fostering connection, understanding and positive change.
        </p>

        <div className={styles.grid}>
          <a href="https://www.chenyi-li.com/female_work_life_balance_study/" className={styles.card}>
            <h3> Research &rarr;</h3>
            <p> Field Study on Female Family-Work Balance in Eastern China </p>
          </a>

          <Link href="/visualization" className={styles.card}>
            <h3> Visualization &rarr;</h3>
            <p> Data visualization on gender equality around the world</p>
          </Link>

          <a
            href="https://www.chenyi-li.com/object_analysis/"
            className={styles.card}
          >
            <h3> Reflection &rarr;</h3>
            <p> Changes of Ideal Body Shape and Gender Image </p>
          </a>

          <a
            href="/proposal"
            className={styles.card}
          >
            <h3> Proposal &rarr;</h3>
            <p>
              How to create technology to make the world a better place?
            </p>
          </a>
        </div>
      </main>


      <footer>
      <p>2024 &copy; Chenyi Li. All right reserved.</p>
      </footer>

      <style jsx>{`
        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        footer {
          width: 100%;
          height: 100px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        footer img {
          margin-left: 0.5rem;
        }
        footer a {
          display: flex;
          justify-content: center;
          align-items: center;
          text-decoration: none;
          color: inherit;
        }
        code {
          background: #fafafa;
          border-radius: 5px;
          padding: 0.75rem;
          font-size: 1.1rem;
          font-family:
            Menlo,
            Monaco,
            Lucida Console,
            Liberation Mono,
            DejaVu Sans Mono,
            Bitstream Vera Sans Mono,
            Courier New,
            monospace;
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family:
            -apple-system,
            BlinkMacSystemFont,
            Segoe UI,
            Roboto,
            Oxygen,
            Ubuntu,
            Cantarell,
            Fira Sans,
            Droid Sans,
            Helvetica Neue,
            sans-serif;
        }
        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}
