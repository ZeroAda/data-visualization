import '../styles/global.css';
import Background from '../components/background';

export default function App({ Component, pageProps }) {
  return (
    <Background>
      <Component {...pageProps} />
    </Background>
  );
}