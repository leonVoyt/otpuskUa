import React, { useState } from "react";
import { SearchForm } from "../UI/SearchForm";
import { TourResults } from "../TourResults";
import { Button } from "../UI/Button/Button";
import { useSearch } from "../../hooks/useSearch";

export const SearchPage = () => {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [previousResults, setPreviousResults] = useState(null);
  const [previousCountryId, setPreviousCountryId] = useState(null);

  const {
    searchState,
    waitUntil,
    searchResults,
    error,
    isCancelling,
    startSearch,
    resetSearch,
    setError,
  } = useSearch();

  const handleSearchSubmit = (countryId) => {
    if (searchResults && searchResults !== previousResults) {
      setPreviousResults(searchResults);
      setPreviousCountryId(selectedCountry?.id);
    }
    startSearch(countryId);
  };

  const displayResults =
    searchState === "success" ? searchResults : previousResults;
  const displayCountryId =
    searchState === "success" ? selectedCountry?.id : previousCountryId;

  return (
    <>
      <SearchForm
        onSubmit={handleSearchSubmit}
        searchState={searchState}
        isCancelling={isCancelling}
        setError={setError}
        onCountrySelect={setSelectedCountry}
      />

      <div>
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

        {/* Cancelling State */}
        {searchState === "cancelling" && (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <div>⏹️ Скасування поточного пошуку...</div>
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

        {/* Tour Results - Show current results or previous results */}
        {displayResults && Object.keys(displayResults).length > 0 && (
          <>
            {/* Show indicator if displaying previous results */}
            {searchState !== "success" && previousResults && (
              <div
                style={{
                  color: "#666",
                  backgroundColor: "#f0f8ff",
                  padding: "12px",
                  borderRadius: "4px",
                  textAlign: "center",
                  marginBottom: "20px",
                  fontSize: "14px",
                }}
              >
                Показуються результати попереднього пошуку. Натисніть "Знайти
                тури" для нового пошуку.
              </div>
            )}
            <TourResults
              searchResults={displayResults}
              countryId={displayCountryId}
            />
          </>
        )}
      </div>
    </>
  );
};
