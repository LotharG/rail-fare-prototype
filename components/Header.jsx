"use client";

export default function Header() {
  return (
    <header style={styles.header} role="banner">
      <div style={styles.inner}>
        <div style={styles.brandWrap} aria-label="Great British Railways">
          <div style={styles.logoBox}>
            <img
              src="/double-arrow.png"
              alt="National Rail double arrow"
              style={styles.logo}
            />
          </div>

          <div>
            <div style={styles.brandTitle}>Great British Railways</div>
            <div style={styles.brandSub}>Journey planner</div>
          </div>
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    height: "80px",
    background: "#0b1f3a",
    color: "#ffffff",
    borderBottom: "4px solid #d72638",
    boxShadow: "0 2px 8px rgba(0,0,0,0.12)"
  },

  inner: {
    maxWidth: "900px",
    height: "100%",
    margin: "0 auto",
    padding: "0 24px",
    display: "flex",
    alignItems: "center"
  },

  brandWrap: {
    display: "flex",
    alignItems: "center",
    gap: "16px"
  },

  logoBox: {
    width: "60px",
    height: "44px",
    borderRadius: "6px",
    background: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },

  logo: {
    width: "46px",
    height: "auto",
    display: "block"
  },

  brandTitle: {
    fontSize: "20px",
    fontWeight: "700",
    lineHeight: 1.15
  },

  brandSub: {
    fontSize: "14px",
    opacity: 0.9,
    marginTop: "4px"
  }
};