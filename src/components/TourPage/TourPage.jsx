import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPrice, getHotel } from "../../api";
import { Button } from "../UI/Button/Button";
import "./TourPage.css";

export const TourPage = () => {
  const { priceId, hotelId } = useParams();
  const navigate = useNavigate();
  const [tourData, setTourData] = useState(null);
  const [hotelData, setHotelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (priceId && hotelId) {
      fetchData();
    }
  }, [priceId, hotelId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [tourResponse, hotelResponse] = await Promise.all([
        getPrice(priceId),
        getHotel(`${hotelId}`),
      ]);

      const tour = await tourResponse.json();
      const hotel = await hotelResponse.json();

      setTourData(tour);
      setHotelData(hotel);
    } catch (err) {
      setError("Помилка завантаження даних про тур");
      console.error("Error fetching tour details:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatPrice = (amount, currency) => {
    if (currency === "usd") {
      return `${amount} USD`;
    }
    return `${amount.toLocaleString("uk-UA")} грн`;
  };

  const getServiceIcon = (serviceName) => {
    const icons = {
      wifi: "📶",
      aquapark: "🏊‍♂️",
      tennis_court: "🎾",
      laundry: "👕",
      parking: "🅿️",
    };
    return icons[serviceName] || "✅";
  };

  const getServiceLabel = (serviceName) => {
    const labels = {
      wifi: "Wi-Fi",
      aquapark: "Аквапарк",
      tennis_court: "Тенісний корт",
      laundry: "Пральня",
      parking: "Парковка",
    };
    return labels[serviceName] || serviceName;
  };

  const handleBackToSearch = () => {
    navigate("/");
  };

  return (
    <div className="tour-page">
      <div className="tour-page__container">
        <div className="tour-page__content">
          {loading ? (
            <div className="tour-page__loading">
              <div className="tour-page__loading-spinner"></div>
              <p>Завантаження деталей туру...</p>
            </div>
          ) : error || !tourData || !hotelData ? (
            <div className="tour-page__error">
              <p>{error || "Тур не знайдено"}</p>
              <Button
                text="Спробувати ще раз"
                onClick={fetchData}
                style={{ marginTop: "16px" }}
              />
            </div>
          ) : (
            <>
              <div className="tour-page__main-info">
                <h1 className="tour-page__hotel-name">{hotelData.name}</h1>
                <div className="tour-page__location">
                  <span className="tour-page__geo-icon">📍</span>
                  <span className="tour-page__country">
                    {hotelData.countryName}
                  </span>
                  <span className="tour-page__city-icon">🏙️</span>
                  <span className="tour-page__city">{hotelData.cityName}</span>
                </div>
              </div>

              <div className="tour-page__image">
                <img src={hotelData.img} alt={hotelData.name} />
              </div>

              {hotelData.description && (
                <div className="tour-page__description">
                  <h2 className="tour-page__description-title">Опис готелю</h2>
                  <p className="tour-page__description-text">
                    {hotelData.description}
                  </p>
                </div>
              )}

              {hotelData.services && (
                <div className="tour-page__services">
                  <h2 className="tour-page__services-title">Сервіси:</h2>
                  <div className="tour-page__services-grid">
                    {Object.entries(hotelData.services).map(
                      ([serviceName, serviceValue]) => (
                        <div
                          key={serviceName}
                          className="tour-page__service-item"
                        >
                          <span className="tour-page__service-icon">
                            {getServiceIcon(serviceName)}
                          </span>
                          <span className="tour-page__service-name">
                            {getServiceLabel(serviceName)}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              <div className="tour-page__divider"></div>

              <div className="tour-page__tour-summary">
                <div className="tour-page__date-section">
                  <span className="tour-page__calendar-icon">📅</span>
                  <span className="tour-page__date">
                    {formatDate(tourData.startDate)}
                  </span>
                </div>
                <div className="tour-page__price-section">
                  <span className="tour-page__price">
                    {formatPrice(tourData.amount, tourData.currency)}
                  </span>
                  <button className="tour-page__open-price-btn">
                    Відкрити ціну
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
