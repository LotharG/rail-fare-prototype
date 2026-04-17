"use client";

import { useState } from "react";
import data from "../data/journeys.json";
import JourneyCard from "../components/JourneyCard";
import { getCheapestFare } from "../lib/pricing";

function getDurationMinutes(dep, arr) {
  const [dh, dm] = dep.split(":").map(Number);
  const [ah, am] = arr.split(":").map(Number);
  return (ah * 60 + am) - (dh * 60 + dm);
}

export default function Home() {
  const [selectedJourney, setSelectedJourney] = useState(null);
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

  // 👉 BASKET VIEW
  if (view === "basket" && selectedJourney) {
    return (
      <div style={styles.container}>
        <h1>Review your journey</h1>

        <div style={styles.card}>
          <p><strong>1 adult travelling</strong></p>

          <p>
            {selectedJourney.origin} → {selectedJourney.destination}
          </p>

          <p>
            Depart: {selectedJourney.departure}  
            <br />
            Arrive: {selectedJourney.arrival}
          </p>

          <p style={styles.restrictions}>
            This ticket is valid only on the selected train.
            Upgrade options allow travel on other services.
          </p>

          <h2>Total: £{total}</h2>

          <div style={styles.actions}>
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
    );
  }

  // 👉 MAIN VIEW
  return (
    <div style={styles.container}>
      <h1>Rail Fare Prototype</h1>

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
            }}
            onPriceChange={(p) => setTotal(p.total)}
            onContinue={() => setView("basket")}
          />
        );
      })}
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    background: "#f5f5f5"
  },
  card: {
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    marginTop: "20px"
  },
  restrictions: {
    marginTop: "10px",
    fontSize: "14px",
    color: "#374151"
  },
  actions: {
    marginTop: "20px",
    display: "flex",
    gap: "10px"
  },
  primary: {
    padding: "12px",
    background: "#111827",
    color: "white",
    border: "none",
    borderRadius: "8px"
  },
  secondary: {
    padding: "12px",
    background: "white",
    border: "2px solid #d1d5db",
    borderRadius: "8px"
  }
};