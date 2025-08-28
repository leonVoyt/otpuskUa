import React from "react";
import { useNavigate } from "react-router-dom";
import "./TourCard.css";

export const TourCard = ({ tour, hotel }) => {
  const navigate = useNavigate();

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

  const handleOpenPrice = () => {
    navigate(`/tour/${tour.id}/${tour.hotelID}`);
  };

  return (
    <div className="tour-card">
      <div className="tour-card__image">
        <img src={hotel.img} alt={hotel.name} />
      </div>

      <div className="tour-card__content">
        <h3 className="tour-card__hotel-name">{hotel.name}</h3>

        <div className="tour-card__location">
          <span className="tour-card__city">{hotel.cityName}</span>
          <span className="tour-card__country">{hotel.countryName}</span>
        </div>

        <div className="tour-card__dates">
          <div className="tour-card__date">
            <span className="tour-card__label">Початок:</span>
            <span className="tour-card__value">
              {formatDate(tour.startDate)}
            </span>
          </div>
          <div className="tour-card__date">
            <span className="tour-card__label">Кінець:</span>
            <span className="tour-card__value">{formatDate(tour.endDate)}</span>
          </div>
        </div>

        <div className="tour-card__price">
          <span className="tour-card__price-amount">
            {formatPrice(tour.amount, tour.currency)}
          </span>
        </div>

        <button className="tour-card__open-price-btn" onClick={handleOpenPrice}>
          Відкрити ціну
        </button>
      </div>
    </div>
  );
};
