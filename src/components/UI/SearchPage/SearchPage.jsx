import React, { useState, useCallback } from "react";
import { Input as GeoInput } from "../Input/Input";
import { TourResults } from "../TourResults";
import { startSearchPrices, getSearchPrices } from "../../../api";
import { Button } from "../Button.jsx/Button";

export const SearchPage = () => {
  const [direction, setDirection] = useState("");
  const [selected, setSelected] = useState(null);

  // Search state
  const [searchState, setSearchState] = useState("idle"); // idle, loading, success, error
  const [waitUntil, setWaitUntil] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const MAX_RETRIES = 2;

  // Poll for search results
  const pollForResults = useCallback(
    async (token, waitUntilTime) => {
      const waitTime = new Date(waitUntilTime).getTime() - Date.now();

      if (waitTime > 0) {
        // Wait until the specified time
        setTimeout(() => pollForResults(token, waitUntilTime), waitTime);
        return;
      }

      // Try to get results
      try {
        const response = await getSearchPrices(token);
        const data = await response.json();

        setSearchResults(data.prices);
        setSearchState("success");
        setWaitUntil(null);
      } catch (err) {
        if (err.status === 425) {
          // Results not ready yet, retry after a short delay
          setTimeout(() => pollForResults(token, waitUntilTime), 1000);
        } else if (retryCount < MAX_RETRIES) {
          // Retry on other errors
          setRetryCount((prev) => prev + 1);
          setTimeout(() => pollForResults(token, waitUntilTime), 1000);
        } else {
          // Max retries exceeded
          setSearchState("error");
          setError("Помилка отримання результатів. Спробуйте ще раз.");
          setWaitUntil(null);
        }
      }
    },
    [retryCount]
  );

  // Start search process
  const startSearch = useCallback(
    async (countryID) => {
      try {
        setSearchState("loading");
        setError(null);
        setRetryCount(0);

        const response = await startSearchPrices(countryID);
        const data = await response.json();

        setWaitUntil(new Date(data.waitUntil));

        // Start polling for results
        pollForResults(data.token, data.waitUntil);
      } catch {
        setSearchState("error");
        setError("Помилка запуску пошуку. Спробуйте ще раз.");
      }
    },
    [pollForResults]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();

      if (!selected || selected.type !== "country") {
        setError("Будь ласка, виберіть країну для пошуку турів");
        return;
      }

      startSearch(selected.id);
    },
    [selected, startSearch]
  );

  // Reset search
  const resetSearch = useCallback(() => {
    setSearchState("idle");
    setSearchResults(null);
    setError(null);
    setRetryCount(0);
    setWaitUntil(null);
  }, []);

  return (
    <>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          alignItems: "center",
          justifyContent: "center",
          maxWidth: 600,
          margin: "0 auto",
          padding: "20px",
        }}
      >
        <div style={{ minWidth: 320 }}>
          <GeoInput
            value={direction}
            onChange={setDirection}
            onSelect={setSelected}
          />
        </div>

        <Button
          text="Знайти тури"
          type="submit"
          disabled={
            searchState === "loading" ||
            !selected ||
            selected.type !== "country"
          }
        />

        {/* Loading State */}
        {searchState === "loading" && (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <div>🔍 Пошук турів...</div>
            {waitUntil && (
              <div
                style={{ fontSize: "14px", color: "#666", marginTop: "8px" }}
              >
                Очікування результатів до:{" "}
                {new Date(waitUntil).toLocaleTimeString()}
              </div>
            )}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div
            style={{
              color: "#d32f2f",
              backgroundColor: "#ffebee",
              padding: "12px",
              borderRadius: "4px",
              textAlign: "center",
              maxWidth: "400px",
            }}
          >
            <div>{error}</div>
            <Button
              text="Спробувати ще раз"
              onClick={resetSearch}
              style={{ marginTop: "8px" }}
            />
          </div>
        )}

        {/* Empty State */}
        {searchState === "success" &&
          searchResults &&
          Object.keys(searchResults).length === 0 && (
            <div
              style={{
                color: "#666",
                backgroundColor: "#f5f5f5",
                padding: "20px",
                borderRadius: "4px",
                textAlign: "center",
              }}
            >
              За вашим запитом турів не знайдено
            </div>
          )}

        {/* Tour Results */}
        {searchState === "success" &&
          searchResults &&
          Object.keys(searchResults).length > 0 && (
            <TourResults
              searchResults={searchResults}
              countryId={selected?.id}
            />
          )}
      </form>
    </>
  );
};
