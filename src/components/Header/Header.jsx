import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Header.css";
import { Button } from "../UI/Button/Button";

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === "/";

  return (
    <header className="header">
      <div className="header__container">
        <div className="header__logo" onClick={() => navigate("/")}>
          🏖️ Otpusk
        </div>

        {!isHomePage && (
          <Button
            text="← Повернутися до пошуку"
            onClick={() => navigate("/")}
            style={{ marginLeft: "auto" }}
          />
        )}
      </div>
    </header>
  );
};
