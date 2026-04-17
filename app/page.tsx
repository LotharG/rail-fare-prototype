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

function getRestrictionText(activeFareType) {
  if (activeFareType === "anytime") {
    return "Valid on any train today.";
  }

  if (activeFareType === "off_peak") {
    return "Valid on selected off-peak services. Some busy times may be excluded.";
  }

  return "Valid only on the train you selected.";
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
    const restrictionText = getRestrictionText(
      basketDetails?.activeFareType || "advance"
    );

    return (
      <div style={styles.container}>
        <h1>Review your journey</h1>

        <div style={styles.card}>
          <p>
            <strong>1 adult travelling</strong>
          </p>

          <p>
            {selectedJourney.origin} → {selectedJourney.destination}
          </p>

          <p>
            Depart: {selectedJourney.departure}
            <br />
            Arrive: {selectedJourney.arrival}
          </p>

          <p style={styles.restrictions}>{restrictionText}</p>

          <h2>Total: £{total}</h2>

          <div style={styles.actions}>
            <button style={styles.primary}>Continue</button>

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

  return (
    <div style={styles.container}>
      <h1>Rail Fare Prototype</h1>

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
  );
}

const styles = {
  container: {
    padding: "20px",
    background: "#f5f5f5",
    minHeight: "100vh"
  },
  card: {
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    marginTop: "20px",
    maxWidth: "700px"
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
    borderRadius: "8px",
    cursor: "pointer"
  },
  secondary: {
    padding: "12px",
    background: "white",
    border: "2px solid #d1d5db",
    borderRadius: "8px",
    cursor: "pointer"
  }
};