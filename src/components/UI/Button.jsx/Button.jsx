import React from "react";
import classes from "./Button.module.css";

export const Button = ({ type = "button", text, onClick, disabled, style }) => {
  return (
    <button
      type={type}
      className={classes.button}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {text}
    </button>
  );
};
