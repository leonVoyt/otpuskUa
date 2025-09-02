import React from "react";
import "./Button.css";

export const Button = ({ type = "button", text, onClick, disabled, style }) => {
  return (
    <button
      type={type}
      className={`button ${disabled ? "button--disabled" : ""}`}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {text}
    </button>
  );
};
