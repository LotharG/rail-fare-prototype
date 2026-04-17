"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import data from "../data/journeys.json";
import JourneyCard from "../components/JourneyCard";
import { getCheapestFare } from "../lib/pricing";

// ---------- helpers ----------
function getDurationMinutes(dep: string, arr: string) {
  const [dh, dm] = dep.split(":").map(Number);
  const [ah, am] = arr.split(":").map(Number);
  return ah * 60 + am - (dh * 60 + dm);
}

function roundUpToNearest5p(value: number) {
  return Math.ceil(value * 20) / 20;
}

function formatMoney(value: number) {
  return roundUpToNearest5p(value).toFixed(2);
}

type Journey = {
  id: number;
  route: string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  platform: string;
  callingPoints: string[];
  fares: Array<{
    type: string;
    price: number;
    class: string;
  }>;
};

type BasketDetails = {
  total: number;
  activeFareType: string;
  addFlex?: boolean;
  addAnytime?: boolean;
  addFirst?: boolean;
};

// ---------- component ----------
export default function Home() {
  const [view, setView] = useState<"home" | "list" | "basket">("home");
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);
  const [basketDetails, setBasketDetails] = useState<BasketDetails | null>(null);
  const [total, setTotal] = useState(0);

  const [searchConfig, setSearchConfig] = useState({
    routeKey: "",
    origin: "",
    destination: "",
    passengers: "",
    railcardEligible: false
  });

  const filteredJourneys = (data.journeys as Journey[]).filter((j) =>
    searchConfig.routeKey ? j.route === searchConfig.routeKey : false
  );

  const cheapestPrice =
    filteredJourneys.length > 0
      ? Math.min(...filteredJourneys.map((j) => getCheapestFare(j.fares).price))
      : 0;

  const fastestDuration =
    filteredJourneys.length > 0
      ? Math.min(
          ...filteredJourneys.map((j) =>
            getDurationMinutes(j.departure, j.arrival)
          )
        )
      : 0;

  // ================= HOME =================
  if (view === "home") {
    return (
      <div style={styles.page}>
        <div style={styles.shell}>
          <h1 style={styles.title}>Plan your journey</h1>

          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Popular journeys</h2>

            <button
              style={styles.option}
              onClick={() => {
                setSearchConfig({
                  routeKey: "london",
                  origin: "London Euston",
                  destination: "Manchester Piccadilly",
                  passengers: "1 adult",
                  railcardEligible: false
                });
                setView("list");
              }}
            >
              <strong>London Euston → Manchester Piccadilly</strong>
              <div style={styles.subText}>1 adult</div>
            </button>

            <button
              style={styles.option}
              onClick={() => {
                setSearchConfig({
                  routeKey: "glossop",
                  origin: "Glossop",
                  destination: "Manchester Piccadilly",
                  passengers: "2 adults, 2 children",
                  railcardEligible: true
                });
                setView("list");
              }}
            >
              <strong>Glossop → Manchester Piccadilly</strong>
              <div style={styles.subText}>2 adults, 2 children</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================= BASKET =================
  if (view === "basket" && selectedJourney) {
    const type = basketDetails?.activeFareType || "advance";

    const getValidityBlocks = () => {
      if (type === "anytime") {
        return Array.from({ length: 13 }, (_, i) => ({
          label: String(6 + i).padStart(2, "0"),
          valid: true
        }));
      }

      return [
        { label: "06", valid: false },
        { label: "07", valid: false },
        { label: "08", valid: false },
        { label: "09", valid: true },
        { label: "10", valid: true },
        { label: "11", valid: true },
        { label: "12", valid: true },
        { label: "13", valid: true },
        { label: "14", valid: true },
        { label: "15", valid: true },
        { label: "16", valid: false },
        { label: "17", valid: false },
        { label: "18", valid: false }
      ];
    };

    return (
      <div style={styles.page}>
        <div style={styles.shell}>
          <h1 style={styles.title}>Check your journey</h1>

          <div style={styles.card}>
            <p style={styles.bodyText}>
              <strong>{searchConfig.passengers}</strong>
            </p>

            <p style={styles.bodyText}>
              {searchConfig.origin} → {searchConfig.destination}
            </p>

            <p style={styles.bodyText}>
              {selectedJourney.departure} → {selectedJourney.arrival}
            </p>

            <div style={styles.validityBox}>
              {type === "advance" && "✔ This ticket is valid on this train only"}
              {type === "off_peak" && "✔ Valid on selected off-peak services"}
              {type === "anytime" && "✔ Valid on any service today"}
            </div>

            {type !== "advance" && (
              <div style={styles.timeline}>
                {getValidityBlocks().map((b, i) => (
                  <div key={i} style={styles.timelineItem}>
                    <div
                      style={{
                        ...styles.block,
                        background: b.valid ? "#16a34a" : "#dc2626"
                      }}
                    />
                    <div style={styles.label}>
                      {i % 3 === 0 ? b.label : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <h2 style={styles.total}>£{formatMoney(total)}</h2>

            <div style={styles.buttonRow}>
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
      </div>
    );
  }

  // ================= RESULTS =================
  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <button onClick={() => setView("home")} style={styles.back}>
          ← Change journey
        </button>

        <h1 style={styles.title}>
          {searchConfig.origin} → {searchConfig.destination}
        </h1>

        <p style={styles.subText}>{searchConfig.passengers}</p>

        {filteredJourneys.map((journey) => {
          const basePrice = getCheapestFare(journey.fares).price;

          return (
            <JourneyCard
              key={journey.id}
              journey={journey}
              selected={selectedJourney?.id === journey.id}
              isCheapest={basePrice === cheapestPrice}
              fastestDuration={fastestDuration}
              railcardEligible={searchConfig.railcardEligible}
              onSelect={() => {
                setSelectedJourney(journey);
                setTotal(basePrice);
                setBasketDetails({
                  total: basePrice,
                  activeFareType: "advance"
                });
              }}
              onPriceChange={(d: BasketDetails) => {
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

// ---------- styles ----------
const styles: Record<string, CSSProperties> = {
  page: {
    background: "#f4f7fb",
    minHeight: "100vh",
    padding: "32px 24px",
    fontFamily: "system-ui"
  },

  shell: {
    maxWidth: "900px",
    margin: "0 auto"
  },

  title: {
    fontSize: "30px",
    fontWeight: 700,
    lineHeight: 1.2,
    color: "#0b1f3a",
    marginBottom: "16px"
  },

  sectionTitle: {
    marginBottom: "16px",
    fontSize: "22px",
    lineHeight: 1.25
  },

  subText: {
    fontSize: "16px",
    lineHeight: 1.5,
    color: "#475569"
  },

  bodyText: {
    fontSize: "17px",
    lineHeight: 1.6,
    marginTop: 0,
    marginBottom: "12px"
  },

  card: {
    background: "white",
    padding: "28px",
    borderRadius: "12px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
  },

  option: {
    width: "100%",
    padding: "20px",
    marginTop: "16px",
    border: "2px solid #e2e8f0",
    borderRadius: "10px",
    background: "white",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "18px",
    lineHeight: 1.5
  },

  back: {
    marginBottom: "16px",
    background: "none",
    border: "none",
    color: "#2563eb",
    cursor: "pointer",
    fontSize: "16px",
    lineHeight: 1.5,
    padding: "8px 0"
  },

  total: {
    fontSize: "36px",
    fontWeight: 800,
    lineHeight: 1.2,
    marginTop: "16px"
  },

  buttonRow: {
    display: "flex",
    gap: "16px",
    marginTop: "24px"
  },

  primary: {
    padding: "16px 18px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontWeight: 600,
    fontSize: "17px",
    lineHeight: 1.3,
    cursor: "pointer"
  },

  secondary: {
    padding: "16px 18px",
    border: "2px solid #cbd5e1",
    background: "white",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "17px",
    lineHeight: 1.3
  },

  validityBox: {
    marginTop: "16px",
    padding: "14px",
    background: "#f1f5f9",
    borderRadius: "8px",
    fontSize: "16px",
    lineHeight: 1.5
  },

  timeline: {
    display: "flex",
    gap: "6px",
    marginTop: "14px"
  },

  timelineItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },

  block: {
    width: "18px",
    height: "12px"
  },

  label: {
    fontSize: "11px",
    lineHeight: 1.4,
    marginTop: "4px"
  }
};