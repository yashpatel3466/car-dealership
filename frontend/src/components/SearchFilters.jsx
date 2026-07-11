import { useState } from "react";

const CATEGORIES = ["", "sedan", "suv", "truck", "coupe", "van", "hatchback", "other"];

export default function SearchFilters({ onSearch, onClear }) {
  const [filters, setFilters] = useState({ make: "", model: "", category: "", min_price: "", max_price: "" });

  function update(field, value) {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const cleaned = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ""));
    onSearch(cleaned);
  }

  function handleClear() {
    setFilters({ make: "", model: "", category: "", min_price: "", max_price: "" });
    onClear();
  }

  return (
    <form className="filter-bar" onSubmit={handleSubmit}>
      <input placeholder="Make" value={filters.make} onChange={(e) => update("make", e.target.value)} />
      <input placeholder="Model" value={filters.model} onChange={(e) => update("model", e.target.value)} />
      <select value={filters.category} onChange={(e) => update("category", e.target.value)}>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c === "" ? "Any category" : c[0].toUpperCase() + c.slice(1)}
          </option>
        ))}
      </select>
      <input
        placeholder="Min price"
        type="number"
        value={filters.min_price}
        onChange={(e) => update("min_price", e.target.value)}
      />
      <input
        placeholder="Max price"
        type="number"
        value={filters.max_price}
        onChange={(e) => update("max_price", e.target.value)}
      />
      <button className="btn btn-primary" type="submit">
        Search
      </button>
      <button className="btn btn-ghost" type="button" onClick={handleClear}>
        Clear
      </button>
    </form>
  );
}
