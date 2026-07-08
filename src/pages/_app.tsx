import type { AppProps } from "next/app";
import { Providers } from "@/components/Providers";
import "@/index.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Providers>
      <Component {...pageProps} />
    </Providers>
  );
}
