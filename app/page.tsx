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

function getRestrictionText(type) {
  if (type === "anytime") {
    return "Valid on any train today.";
  }

  if (type === "off_peak") {
    return "Valid on selected off-peak services. Some busy times may be excluded.";
  }

  return "Valid only on the train you selected.";
}

function getFareLabel(type) {
  if (type === "anytime") return "Anytime";
  if (type === "off_peak") return "Off-Peak";
  return "Advance";
}

export default function Home() {
  const [selectedJourney, setSelectedJourney] = useState(null);
  const [basketDetails, setBasketDetails] = useState(null);
  const [total, setTotal] = useState(0);
  const [view, setView] = useState("list");

  const cheapestPrice = Math.min(
    ...data.journeys.map(j => getCheapestFare(j.fares).price)
  );

  const fastestDuration = Math.min(
    ...data.journeys.map(j =>
      getDurationMinutes(j.departure, j.arrival)
    )
  );

  // =========================
  // BASKET PAGE
  // =========================
  if (view === "basket" && selectedJourney) {
    const type = basketDetails?.activeFareType || "advance";

    return (
      <div style={styles.page}>
        <div style={styles.shell}>
          <div style={styles.header}>
            <div style={styles.logo}>⇄</div>
            <div>
              <div style={styles.brand}>Great British Railways</div>
              <div style={styles.sub}>Journey review</div>
            </div>
          </div>

          <div style={styles.card}>
            <h1 style={styles.title}>Check your journey</h1>

            <div style={styles.section}>
              <strong>Passenger</strong>
              <div>1 adult travelling</div>
            </div>

            <div style={styles.section}>
              <strong>Route</strong>
              <div>
                {selectedJourney.origin} → {selectedJourney.destination}
              </div>
            </div>

            <div style={styles.section}>
              <strong>Service</strong>
              <div>
                {selectedJourney.departure} → {selectedJourney.arrival}
              </div>
            </div>

            <div style={styles.section}>
              <strong>Ticket</strong>
              <div>{getFareLabel(type)}</div>
              <div style={styles.meta}>
                {getRestrictionText(type)}
              </div>
            </div>

            <div style={styles.section}>
              <strong>Total</strong>
              <div style={styles.total}>£{total}</div>
            </div>

            <div style={styles.buttonRow}>
              <button style={styles.primary}>
                Continue
              </button>

              <button
                style={styles.secondary}
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

  // =========================
  // MAIN LIST
  // =========================
  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.header}>
          <div style={styles.logo}>⇄</div>
          <div>
            <div style={styles.brand}>Great British Railways</div>
            <div style={styles.sub}>Journey planner</div>
          </div>
        </div>

        <h1 style={styles.title}>
          London Euston → Manchester Piccadilly
        </h1>

        {data.journeys.map(journey => {
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
                  activeFareType: "advance"
                });
              }}
              onPriceChange={(d) => {
                setTotal(d.total);
                setBasketDetails(d);
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
    background: "#eef2f7",
    minHeight: "100vh",
    padding: "20px",
    fontFamily: "system-ui"
  },

  shell: {
    maxWidth: "900px",
    margin: "0 auto"
  },

  header: {
    display: "flex",
    gap: "12px",
    background: "#0b1f3a",
    color: "white",
    padding: "12px",
    borderRadius: "10px"
  },

  logo: {
    background: "white",
    color: "#0b1f3a",
    padding: "6px 10px",
    borderRadius: "6px",
    fontWeight: "700"
  },

  brand: {
    fontWeight: "700"
  },

  sub: {
    fontSize: "13px",
    opacity: 0.8
  },

  title: {
    marginTop: "16px",
    marginBottom: "16px"
  },

  card: {
    background: "white",
    padding: "20px",
    borderRadius: "10px"
  },

  section: {
    marginTop: "12px"
  },

  meta: {
    fontSize: "14px",
    color: "#475569"
  },

  total: {
    fontSize: "28px",
    fontWeight: "800"
  },

  buttonRow: {
    display: "flex",
    gap: "12px",
    marginTop: "20px"
  },

  primary: {
    padding: "12px",
    background: "#0b1f3a",
    color: "white",
    border: "none",
    borderRadius: "8px"
  },

  secondary: {
    padding: "12px",
    border: "2px solid #ddd",
    background: "white",
    borderRadius: "8px"
  }
};