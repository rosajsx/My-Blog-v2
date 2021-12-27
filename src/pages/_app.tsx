import { AppProps } from "next/app";
import NextNprogress from "nextjs-progressbar";

import "../styles/globals.scss";

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <>
      <NextNprogress startPosition={0.3} stopDelayMs={200} color="#C82F63"/>

      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
