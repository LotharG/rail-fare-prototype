import Header from "../components/Header";
import type { ReactNode } from "react";

export const metadata = {
  title: "Great British Railways",
  description: "Rail journey planner prototype"
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
    background: "#f4f7fb"
  },

  main: {
    paddingTop: "104px"
  }
};