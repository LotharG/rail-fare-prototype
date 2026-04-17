"use client";

import { useState } from "react";
import data from "../data/journeys.json";
import JourneyCard from "../components/JourneyCard";
import { getCheapestFare } from "../lib/pricing";

function getDurationMinutes(dep, arr) {
  const [dh, dm] = dep.split(":").map(Number);
  const [ah, am] = arr.split(":").map(Number);
  return ah * 60 + am - (dh * 60 + dm);
}

function getRestrictionText(activeFareType) {
  if (activeFareType === "anytime") {
    return "Valid on any train today.";
  }

  if (activeFareType === "off_peak") {
    return "Valid on selected off-peak services. Some busy times may be excluded.";
  }

  return "Valid only on the train you selected.";
}

function getFareLabel(activeFareType) {
  if (activeFareType === "anytime") return "Anytime";
  if (activeFareType === "off_peak") return "Off-Peak";
  return "Advance";
}

export default function Home() {
  const [selectedJourney, setSelectedJourney] = useState(null);
  const [basketDetails, setBasketDetails] = useState(null);
  const [total, setTotal] = useState(0);
  const [view, setView] = useState("list");

  const cheapestPrice = Math.min(
    ...data.journeys.map((j) => getCheapestFare(j.fares).price)
  );

  const fastestDuration = Math.min(
    ...data.journeys.map((j) => getDurationMinutes(j.departure, j.arrival))
  );

  if (view === "basket" && selectedJourney) {
    const activeFareType = basketDetails?.activeFareType || "advance";
    const restrictionText = getRestrictionText(activeFareType);

    return (
      <div style={styles.page}>
        <div style={styles.shell}>
          <div style={styles.brandBar}>
            <div style={styles.brandMark}>⇄</div>
            <div>
              <div style={styles.brandTitle}>Great British Railways</div>
              <div style={styles.brandSub}>Journey review</div>
            </div>
          </div>

          <div style={styles.reviewCard}>
            <h1 style={styles.pageTitle}>Check your journey</h1>

            <div style={styles.reviewSection}>
              <div style={styles.reviewLabel}>Passenger</div>
              <div style={styles.reviewValue}>1 adult travelling</div>
            </div>

            <div style={styles.reviewSection}>
              <div style={styles.reviewLabel}>Route</div>
              <div style={styles.reviewValue}>
                {selectedJourney.origin} ({selectedJourney.originCode}) →{" "}
                {selectedJourney.destination} ({selectedJourney.destinationCode})
              </div>
            </div>

            <div style={styles.reviewSection}>
              <div style={styles.reviewLabel}>Service</div>
              <div style={styles.reviewValue}>
                {selectedJourney.departure} → {selectedJourney.arrival}
              </div>
              <div style={styles.reviewMeta}>Platform {selectedJourney.platform}</div>
            </div>

            <div style={styles.reviewSection}>
              <div style={styles.reviewLabel}>Ticket type</div>
              <div style={styles.reviewValue}>{getFareLabel(activeFareType)}</div>
              <div style={styles.reviewMeta}>{restrictionText}</div>
            </div>

            <div style={styles.reviewSection}>
              <div style={styles.reviewLabel}>Total price</div>
              <div style={styles.totalPrice}>£{total}</div>
            </div>

            <div style={styles.buttonRow}>
              <button style={styles.primaryButton}>Continue</button>
              <button
                style={styles.secondaryButton}
                onClick={() => setView("list")}
              >
                Go back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.brandBar}>
          <div style={styles.brandMark}>⇄</div>
          <div>
            <div style={styles.brandTitle}>Great British Railways</div>
            <div style={styles.brandSub}>Journey planner</div>
          </div>
        </div>

        <div style={styles.hero}>
          <h1 style={styles.pageTitle}>London Euston to Manchester Piccadilly</h1>
          <p style={styles.pageIntro}>
            Compare fares, flexibility and journey details for Avanti West Coast
            services.
          </p>
        </div>

        {data.journeys.map((journey) => {
          const basePrice = getCheapestFare(journey.fares).price;

          return (
            <JourneyCard
              key={journey.id}
              journey={journey}
              selected={selectedJourney?.id === journey.id}
              isCheapest={basePrice === cheapestPrice}
              fastestDuration={fastestDuration}
              onSelect={() => {
                setSelectedJourney(journey);
                setTotal(basePrice);
                setBasketDetails({
                  total: basePrice,
                  activeFareType: "advance",
                  addFlex: false,
                  addAnytime: false,
                  addFirst: false
                });
              }}
              onPriceChange={(details) => {
                setTotal(details.total);
                setBasketDetails(details);
              }}
              onContinue={() => setView("basket")}
            />
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#eef2f7",
    padding: "24px",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: "#0b1f3a"
  },
  shell: {
    maxWidth: "980px",
    margin: "0 auto"
  },
  brandBar: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    background: "#0b1f3a",
    color: "#ffffff",
    padding: "14px 18px",
    borderRadius: "12px 12px 0 0",
    borderBottom: "6px solid #d72638"
  },
  brandMark: {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    background: "#ffffff",
    color: "#0b1f3a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: "20px"
  },
  brandTitle: {
    fontSize: "18px",
    fontWeight: "700",
    lineHeight: 1.2
  },
  brandSub: {
    fontSize: "13px",
    opacity: 0.9,
    marginTop: "2px"
  },
  hero: {
    background: "#ffffff",
    padding: "22px 24px",
    borderLeft: "1px solid #d7deea",
    borderRight: "1px solid #d7deea",
    borderBottom: "1px solid #d7deea",
    marginBottom: "18px"
  },
  pageTitle: {
    margin: 0,
    fontSize: "30px",
    lineHeight: 1.15,
    color: "#0b1f3a"
  },
  pageIntro: {
    marginTop: "8px",
    marginBottom: 0,
    fontSize: "16px",
    color: "#334155"
  },
  reviewCard: {
    background: "#ffffff",
    border: "1px solid #d7deea",
    borderTop: "6px solid #2563eb",
    borderRadius: "0 0 12px 12px",
    padding: "24px"
  },
  reviewSection: {
    padding: "14px 0",
    borderBottom: "1px solid #e2e8f0"
  },
  reviewLabel: {
    fontSize: "13px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    color: "#475569",
    marginBottom: "6px"
  },
  reviewValue: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#0b1f3a"
  },
  reviewMeta: {
    marginTop: "6px",
    fontSize: "14px",
    color: "#334155"
  },
  totalPrice: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#0b1f3a"
  },
  buttonRow: {
    display: "flex",
    gap: "12px",
    marginTop: "24px",
    flexWrap: "wrap"
  },
  primaryButton: {
    padding: "14px 18px",
    borderRadius: "10px",
    border: "none",
    background: "#0b1f3a",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer"
  },
  secondaryButton: {
    padding: "14px 18px",
    borderRadius: "10px",
    border: "2px solid #cbd5e1",
    background: "#ffffff",
    color: "#0b1f3a",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer"
  }
};