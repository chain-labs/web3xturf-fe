import {
  LOGO,
  PAGE_TITLE,
  SEO_DESCRIPTION,
  SEO_IMAGE,
  SEO_KEYWORDS,
} from "@/copy";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import React from "react";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <React.Fragment>
      <Head>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={SEO_DESCRIPTION} />
        <meta name="keywords" content={SEO_KEYWORDS} />
        <link rel="canonical" href="https://simplrhq.com" />
        <link rel="icon" href={LOGO} />
        <meta property="og:image" content={SEO_IMAGE} />
        {/* Add more meta tags as needed */}
      </Head>
      <Component {...pageProps} />
    </React.Fragment>
  );
}
