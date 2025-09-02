import React, { useEffect, useState } from "react";
import { TourCard } from "../TourCard";
import { getHotels } from "../../api";
import "./TourResults.css";

export const TourResults = ({ searchResults, countryId }) => {
  const [hotels, setHotels] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getHotels(countryId);
        const data = await response.json();

        if (typeof data !== "object" || data === null) {
          console.error("getHotels returned invalid data:", data);
          setError("Неправильний формат даних про готелі");
          return;
        }

        const hotelsMap = {};
        Object.values(data).forEach((hotel) => {
          if (hotel && hotel.id) {
            hotelsMap[hotel.id] = hotel;
          }
        });

        setHotels(hotelsMap);
      } catch (error) {
        console.error("Error fetching hotels:", error);
        setError("Помилка завантаження готелів");
      } finally {
        setLoading(false);
      }
    };

    if (countryId && searchResults) {
      fetchHotels();
    }
  }, [countryId, searchResults]);

  if (loading) {
    return (
      <div className="tour-results">
        <div className="tour-results__container">
          <div className="tour-results__loading">
            <div className="tour-results__loading-spinner"></div>
            <p>Завантаження готелів...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tour-results">
        <div className="tour-results__container">
          <div className="tour-results__error">
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: "#1976d2",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: "pointer",
                marginTop: "12px",
              }}
            >
              Спробувати ще раз
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!searchResults || Object.keys(searchResults).length === 0) {
    return (
      <div className="tour-results">
        <div className="tour-results__container">
          <div className="tour-results__empty">
            <p>Тури не знайдено</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tour-results">
      <div className="tour-results__container">
        <div className="tour-results__grid">
          {Object.values(searchResults).map((tour) => {
            const hotel = hotels[tour.hotelID];
            if (!hotel) return null;

            return <TourCard key={tour.id} tour={tour} hotel={hotel} />;
          })}
        </div>
      </div>
    </div>
  );
};
