import React, { useEffect, useState, useMemo } from "react";
import { getHotels } from "../../../api";
import { TourCard } from "../TourCard";
import "./TourResults.css";

export const TourResults = ({ searchResults, countryId }) => {
  const [hotels, setHotels] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cache for hotels to avoid repeated API calls
  const hotelsCache = React.useRef(new Map());

  // Fetch hotels for the selected country
  useEffect(() => {
    if (!countryId || !searchResults) return;

    const fetchHotels = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check cache first
        if (hotelsCache.current.has(countryId)) {
          setHotels(hotelsCache.current.get(countryId));
          setLoading(false);
          return;
        }

        const response = await getHotels(countryId);
        const hotelsData = await response.json();

        // Cache the results
        hotelsCache.current.set(countryId, hotelsData);
        setHotels(hotelsData);
      } catch (err) {
        setError("Помилка завантаження інформації про готелі");
        console.error("Error fetching hotels:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [countryId, searchResults]);

  // Aggregate tour and hotel data
  const aggregatedResults = useMemo(() => {
    if (!searchResults || !hotels || Object.keys(hotels).length === 0) {
      return [];
    }

    return Object.entries(searchResults)
      .map(([tourId, tour]) => {
        const hotel = hotels[tour.hotelID];
        return {
          tourId,
          tour,
          hotel,
        };
      })
      .filter((result) => result.hotel); // Only show results with valid hotel data
  }, [searchResults, hotels]);

  if (loading) {
    return (
      <div className="tour-results__loading">
        <div className="tour-results__loading-spinner"></div>
        <p>Завантаження інформації про готелі...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tour-results__error">
        <p>{error}</p>
      </div>
    );
  }

  if (aggregatedResults.length === 0) {
    return (
      <div className="tour-results__empty">
        <p>За вашим запитом турів не знайдено</p>
      </div>
    );
  }

  return (
    <div className="tour-results">
      <div className="tour-results__container">
        <div className="tour-results__grid">
          {aggregatedResults.map(({ tourId, tour, hotel }) => (
            <TourCard key={tourId} tour={tour} hotel={hotel} />
          ))}
        </div>
      </div>
    </div>
  );
};
