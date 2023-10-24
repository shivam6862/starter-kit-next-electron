import "../styles/globals.css";
import { Oxanium } from "next/font/google";
const oxanium = Oxanium({ subsets: ["latin"] });
import Script from "next/script";

export default function MyApp({ Component, pageProps }) {
  return (
    <div className={oxanium.className}>
      <Component {...pageProps} />
      <Script />
    </div>
  );
}
