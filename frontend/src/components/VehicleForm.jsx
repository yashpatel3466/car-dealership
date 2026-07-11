import { useState } from "react";

const EMPTY = { make: "", model: "", category: "sedan", price: "", quantity: "" };

export default function VehicleForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial ?? EMPTY);
  const isEditing = Boolean(initial);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ ...form, price: Number(form.price), quantity: Number(form.quantity) });
  }

  return (
    <form className="vehicle-form" onSubmit={handleSubmit}>
      <h2>{isEditing ? "Edit vehicle" : "Add a vehicle"}</h2>

      <div className="form-grid">
        <label className="field">
          <span>Make</span>
          <input value={form.make} onChange={(e) => update("make", e.target.value)} required />
        </label>
        <label className="field">
          <span>Model</span>
          <input value={form.model} onChange={(e) => update("model", e.target.value)} required />
        </label>
        <label className="field">
          <span>Category</span>
          <select value={form.category} onChange={(e) => update("category", e.target.value)}>
            {["sedan", "suv", "truck", "coupe", "van", "hatchback", "other"].map((c) => (
              <option key={c} value={c}>
                {c[0].toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Price ($)</span>
          <input type="number" min="0.01" step="0.01" value={form.price} onChange={(e) => update("price", e.target.value)} required />
        </label>
        <label className="field">
          <span>Quantity</span>
          <input type="number" min="0" value={form.quantity} onChange={(e) => update("quantity", e.target.value)} required />
        </label>
      </div>

      <div className="form-actions">
        <button className="btn btn-primary" type="submit">
          {isEditing ? "Save changes" : "Add vehicle"}
        </button>
        <button className="btn btn-ghost" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
