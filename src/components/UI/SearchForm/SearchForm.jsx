import React, { useState } from "react";
import { Input as GeoInput } from "../Input/Input";
import { Button } from "../Button/Button";
import "./SearchForm.css";

export const SearchForm = ({
  onSubmit,
  searchState,
  isCancelling,
  setError,
  onCountrySelect,
}) => {
  const [direction, setDirection] = useState("");
  const [selected, setSelected] = useState(null);
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selected) {
      setError("Будь ласка, виберіть напрямок: країну, місто або готель");
      return;
    }

    onCountrySelect(selected.type === "country" ? selected : null);
    onSubmit(selected);
  };

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <div className="search-form__input-container">
        <GeoInput
          value={direction}
          onChange={setDirection}
          onSelect={setSelected}
        />
      </div>

      <Button
        text={isCancelling ? "Скасування..." : "Знайти тури"}
        type="submit"
        disabled={
          searchState === "loading" ||
          searchState === "cancelling" ||
          isCancelling ||
          !selected
        }
      />
    </form>
  );
};
