import type { Metadata } from "next";
import { ReactNode } from "react";
import Header from "../components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Great British Railways",
  description: "Rail journey planner prototype",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body style={styles.body}>
        <Header />
        <main style={styles.main}>{children}</main>
      </body>
    </html>
  );
}

const styles = {
  body: {
    margin: 0,
    fontFamily: "system-ui",
    background: "#f4f7fb",
  },

  main: {
    paddingTop: "104px", // space for fixed header
  },
};