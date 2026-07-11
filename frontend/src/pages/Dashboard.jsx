import { useEffect, useState } from "react";

import { VehicleAPI } from "../api/client";
import SearchFilters from "../components/SearchFilters.jsx";
import VehicleCard from "../components/VehicleCard.jsx";
import VehicleForm from "../components/VehicleForm.jsx";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { isAdmin } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  async function loadAll() {
    setLoading(true);
    try {
      const data = await VehicleAPI.list();
      setVehicles(data.results ?? data);
      setErrorMessage(null);
    } catch (err) {
      setErrorMessage("Couldn't load inventory. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleSearch(filters) {
    setLoading(true);
    try {
      const data = await VehicleAPI.search(filters);
      setVehicles(data.results ?? data);
      setErrorMessage(null);
    } catch {
      setErrorMessage("Search failed. Check your filters and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePurchase(vehicle) {
    try {
      const updated = await VehicleAPI.purchase(vehicle.id, 1);
      setVehicles((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
    } catch (err) {
      setErrorMessage(err.data?.detail ?? "Purchase failed.");
    }
  }

  async function handleRestock(vehicle) {
    const amount = Number(window.prompt(`Restock ${vehicle.make} ${vehicle.model} by how many?`, "1"));
    if (!amount || amount < 1) return;
    try {
      const updated = await VehicleAPI.restock(vehicle.id, amount);
      setVehicles((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
    } catch (err) {
      setErrorMessage(err.data?.detail ?? "Restock failed.");
    }
  }

  async function handleDelete(vehicle) {
    if (!window.confirm(`Delete ${vehicle.make} ${vehicle.model}? This can't be undone.`)) return;
    try {
      await VehicleAPI.remove(vehicle.id);
      setVehicles((prev) => prev.filter((v) => v.id !== vehicle.id));
    } catch {
      setErrorMessage("Delete failed.");
    }
  }

  async function handleFormSubmit(formValues) {
    try {
      if (editingVehicle) {
        const updated = await VehicleAPI.update(editingVehicle.id, formValues);
        setVehicles((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
      } else {
        const created = await VehicleAPI.create(formValues);
        setVehicles((prev) => [...prev, created]);
      }
      setShowForm(false);
      setEditingVehicle(null);
    } catch (err) {
      setErrorMessage(err.data ? JSON.stringify(err.data) : "Couldn't save vehicle.");
    }
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Inventory</h1>
          <p className="dashboard-subtitle">{vehicles.length} vehicles on the lot</p>
        </div>
        {isAdmin && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingVehicle(null);
              setShowForm(true);
            }}
          >
            + Add vehicle
          </button>
        )}
      </div>

      <SearchFilters onSearch={handleSearch} onClear={loadAll} />

      {errorMessage && <p className="form-error">{errorMessage}</p>}

      {showForm && (
        <VehicleForm
          initial={editingVehicle}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingVehicle(null);
          }}
        />
      )}

      {loading ? (
        <p className="dashboard-status">Loading inventory…</p>
      ) : vehicles.length === 0 ? (
        <p className="dashboard-status">No vehicles match your search.</p>
      ) : (
        <div className="vehicle-grid">
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              isAdmin={isAdmin}
              onPurchase={handlePurchase}
              onRestock={handleRestock}
              onEdit={(v) => {
                setEditingVehicle(v);
                setShowForm(true);
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
