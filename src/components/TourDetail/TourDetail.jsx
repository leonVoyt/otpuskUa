import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPrice, getHotel } from "../../api";
import "./TourDetail.css";
import { Button } from "../UI/Button/Button";

export const TourDetail = () => {
  const { priceId, hotelId } = useParams();
  const navigate = useNavigate();

  const [tourData, setTourData] = useState(null);
  const [hotelData, setHotelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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

    if (priceId && hotelId) {
      fetchData();
    }
  }, [priceId, hotelId]);

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

  if (loading) {
    return (
      <div className="tour-detail">
        <div className="tour-detail__container">
          <div className="tour-detail__loading">
            <div className="tour-detail__loading-spinner"></div>
            <p>Завантаження деталей туру...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !tourData || !hotelData) {
    return (
      <div className="tour-detail">
        <div className="tour-detail__container">
          <div className="tour-detail__error">
            <p>{error || "Тур не знайдено"}</p>
            <Button
              text="Повернутися до пошуку"
              onClick={() => navigate("/")}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tour-detail">
      <div className="tour-detail__container">
        {/* Hotel Information Header */}
        <div className="tour-detail__header">
          <h1 className="tour-detail__hotel-name">{hotelData.name}</h1>
          <div className="tour-detail__location">
            <span className="tour-detail__geo-icon">📍</span>
            <span className="tour-detail__country">
              {hotelData.countryName}
            </span>
            <span className="tour-detail__city-icon">🏙️</span>
            <span className="tour-detail__city">{hotelData.cityName}</span>
          </div>
        </div>

        {/* Hotel Image */}
        <div className="tour-detail__image">
          <img src={hotelData.img} alt={hotelData.name} />
        </div>

        {/* Hotel Description */}
        {hotelData.description && (
          <div className="tour-detail__description">
            <p className="tour-detail__description-text">
              {hotelData.description}
            </p>
          </div>
        )}

        {/* Hotel Services */}
        {hotelData.services && (
          <div className="tour-detail__services">
            <h2 className="tour-detail__services-title">Сервіси:</h2>
            <div className="tour-detail__services-grid">
              {Object.entries(hotelData.services).map(
                ([serviceName, serviceValue]) => (
                  <div key={serviceName} className="tour-detail__service-item">
                    <span className="tour-detail__service-icon">
                      {getServiceIcon(serviceName)}
                    </span>
                    <span className="tour-detail__service-name">
                      {getServiceLabel(serviceName)}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Divider Line */}
        <div className="tour-detail__divider"></div>

        {/* Tour Date and Price */}
        <div className="tour-detail__tour-summary">
          <div className="tour-detail__date-section">
            <span className="tour-detail__calendar-icon">📅</span>
            <span className="tour-detail__date">
              {formatDate(tourData.startDate)}
            </span>
          </div>
          <div className="tour-detail__price-section">
            <span className="tour-detail__price">
              {formatPrice(tourData.amount, tourData.currency)}
            </span>
            <button className="tour-detail__open-price-btn">
              Відкрити ціну
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
