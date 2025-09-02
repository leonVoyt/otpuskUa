import "./App.css";
import React from "react";
import { Routes, Route } from "react-router-dom";
import { Header } from "./components/Header";
import { SearchPage } from "./components/SearchPage";
import { TourPage } from "./components/TourPage";

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/tour/:priceId/:hotelId" element={<TourPage />} />
      </Routes>
    </>
  );
}

export default App;
