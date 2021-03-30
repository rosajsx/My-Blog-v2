import { AppProps } from 'next/app';
import '../styles/globals.scss';
import Header from '../components/Header/index';

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <>
      <Header />

      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
