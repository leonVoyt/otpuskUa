import "./App.css";
import React from "react";
import { Routes, Route } from "react-router-dom";
import { Header } from "./components/UI/Header";
import { SearchPage } from "./components/UI/SearchPage";
import { TourDetail } from "./components/UI/TourDetail";

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/tour/:priceId/:hotelId" element={<TourDetail />} />
      </Routes>
    </>
  );
}

export default App;
