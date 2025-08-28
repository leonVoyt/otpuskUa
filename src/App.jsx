import "./App.css";
import React, { useState } from "react";
import { Input as GeoInput } from "./components/UI/Input/Input";

function App() {
  const [direction, setDirection] = useState("");
  const [selected, setSelected] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    // submit stub
    alert(`Пошук: ${selected?.name ?? direction}`);
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ minWidth: 320 }}>
          <GeoInput
            value={direction}
            onChange={setDirection}
            onSelect={setSelected}
          />
        </div>
      </form>
    </>
  );
}

export default App;
