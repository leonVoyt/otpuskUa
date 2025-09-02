import React, { useEffect, useMemo, useRef, useState } from "react";
import { getCountries, searchGeo } from "../../../api";
import "./Input.css";

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

          const values = Object.values(data).map((c) => ({
            ...c,
            type: "country",
          }));
          if (active) setOptions(values);
        } else {
          const resp = await searchGeo(query);
          const data = await resp.json();

          const values = Object.values(data);
          if (active) setOptions(values);
        }
      } catch {
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
        onChange("");
        onSelect(null);
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
    <div ref={containerRef} className="geo-input">
      <p className="geo-input__title">Форма пошуку турів</p>
      <div className="geo-input__wrapper">
        <input
          type="text"
          className="geo-input__field"
          value={query}
          placeholder="Куди летимо?"
          onChange={(e) => {
            setQuery(e.target.value);
            onChange?.(e.target.value);
            setIsOpen(true);
          }}
          onClick={handleInputClick}
        />
        <span
          className="geo-input__close-btn"
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
        <div className="geo-input__dropdown">
          <ul className="geo-input__list">
            {list.map((item) => (
              <li
                key={`${item.type}-${item.id}`}
                className="geo-input__item"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(item)}
              >
                {renderIcon(item)}
                <span className="geo-input__item-text">{item.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
