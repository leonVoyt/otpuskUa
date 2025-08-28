import React from "react";
import classes from "./Button.module.css";

export const Button = ({ type = "button", text }) => {
  return (
    <button type={type} className={classes.button}>
      {text}{" "}
    </button>
  );
};
