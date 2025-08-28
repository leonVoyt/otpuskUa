import React, { useEffect, useMemo, useRef, useState } from "react";
import { getCountries, searchGeo } from "../../../api";
import "./Input.css";
import { Button } from "../Button.jsx/Button";

export const Input = ({ value, onChange, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(value || "");

  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const containerRef = useRef(null);

  const list = useMemo(() => {
    return options.map((item) => ({
      id: String(item.id),
      name: item.name,
      type: item.type,
      flag: item.flag,
    }));
  }, [options]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    const load = async () => {
      try {
        if (!query) {
          const resp = await getCountries();
          const data = await resp.json();
          console.log({ data });

          const values = Object.values(data).map((c) => ({
            ...c,
            type: "country",
          }));
          if (active) setOptions(values);
        } else {
          const resp = await searchGeo(query);
          const data = await resp.json();
          console.log({ data, query });

          const values = Object.values(data);
          if (active) setOptions(values);
        }
      } catch (_) {
        if (active) setOptions([]);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [isOpen, query]);

  const handleInputClick = () => {
    setIsOpen(true);
    if (selected) {
      if (selected.type === "country") {
        setQuery("");
      } else {
        setQuery(selected.name);
      }
    }
  };

  const handleSelect = (item) => {
    setSelected(item);
    onSelect?.(item);
    onChange?.(item.name);
    setQuery(item.name);
    setIsOpen(false);
  };

  const renderIcon = (item) => {
    if (item.type === "country") {
      return item.flag ? (
        <img
          src={item.flag}
          alt="flag"
          style={{ width: 16, height: 12, marginRight: 8 }}
        />
      ) : (
        <span style={{ marginRight: 8 }}>🌍</span>
      );
    }
    if (item.type === "city") return <span style={{ marginRight: 8 }}>🏙️</span>;
    if (item.type === "hotel")
      return <span style={{ marginRight: 8 }}>🏨</span>;
    return null;
  };

  return (
    <div ref={containerRef} className="customInput">
      <p>Форма пошуку турів</p>
      <div className="inputWrapper">
        <input
          type="text"
          value={query}
          placeholder="Куди летимо?"
          onChange={(e) => {
            setQuery(e.target.value);
            onChange?.(e.target.value);
            setIsOpen(true);
          }}
          onClick={handleInputClick}
          style={{ width: "100%", padding: "8px 10px" }}
        />
        <span
          className="closeArrow"
          onClick={() => {
            setQuery("");
            onChange("");
            onSelect(null);
          }}
        >
          &#215;
        </span>
      </div>
      {isOpen && list.length > 0 && (
        <div className="list">
          <ul>
            {list.map((item) => (
              <li
                key={`${item.type}-${item.id}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(item)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "8px 10px",
                  cursor: "pointer",
                }}
              >
                {renderIcon(item)}
                <span>{item.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <Button text={"Знайти "} type="submit" />
    </div>
  );
};
