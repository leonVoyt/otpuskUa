import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPrice, getHotel } from "../../../api";
import "./TourDetail.css";
import { Button } from "../Button.jsx/Button";

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

        // Fetch tour and hotel data in parallel
        const [tourResponse, hotelResponse] = await Promise.all([
          getPrice(priceId),
          getHotel(`${hotelId}`),
        ]);

        const tour = await tourResponse.json();
        const hotel = await hotelResponse.json();
        console.log({ hotel, hotelId });

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
    const formatter = new Intl.NumberFormat("uk-UA", {
      style: "currency",
      currency: currency === "usd" ? "USD" : "UAH",
      minimumFractionDigits: 0,
    });
    return formatter.format(amount);
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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

  const duration = calculateDuration(tourData.startDate, tourData.endDate);

  return (
    <div className="tour-detail">
      <div className="tour-detail__container">
        {/* Hotel Image */}
        <div className="tour-detail__image">
          <img src={hotelData.img} alt={hotelData.name} />
        </div>

        {/* Hotel Information */}
        <div className="tour-detail__hotel-info">
          <h1 className="tour-detail__hotel-name">{hotelData.name}</h1>
          <div className="tour-detail__location">
            <span className="tour-detail__city">{hotelData.cityName}</span>
            <span className="tour-detail__country">
              {hotelData.countryName}
            </span>
          </div>
        </div>

        {/* Tour Information */}
        <div className="tour-detail__tour-info">
          <h2 className="tour-detail__section-title">Інформація про тур</h2>
          <div className="tour-detail__tour-details">
            <div className="tour-detail__detail-row">
              <span className="tour-detail__label">Дата початку:</span>
              <span className="tour-detail__value">
                {formatDate(tourData.startDate)}
              </span>
            </div>
            <div className="tour-detail__detail-row">
              <span className="tour-detail__label">Дата закінчення:</span>
              <span className="tour-detail__value">
                {formatDate(tourData.endDate)}
              </span>
            </div>
            <div className="tour-detail__detail-row">
              <span className="tour-detail__label">Тривалість:</span>
              <span className="tour-detail__value">{duration} днів</span>
            </div>
            <div className="tour-detail__detail-row tour-detail__price-row">
              <span className="tour-detail__label">Ціна:</span>
              <span className="tour-detail__price">
                {formatPrice(tourData.amount, tourData.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Hotel Description */}
        {hotelData.description && (
          <div className="tour-detail__description">
            <h2 className="tour-detail__section-title">Опис готелю</h2>
            <p className="tour-detail__description-text">
              {hotelData.description}
            </p>
          </div>
        )}

        {/* Hotel Services */}
        {hotelData.services && (
          <div className="tour-detail__services">
            <h2 className="tour-detail__section-title">Сервіси та зручності</h2>
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
                    <span className="tour-detail__service-status">
                      {serviceValue === "yes"
                        ? "✓"
                        : serviceValue === "none"
                        ? "✗"
                        : serviceValue}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
