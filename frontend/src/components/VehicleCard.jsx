export default function VehicleCard({ vehicle, isAdmin, onPurchase, onRestock, onEdit, onDelete }) {
  const outOfStock = vehicle.quantity === 0;

  return (
    <article className={`vehicle-card${outOfStock ? " is-out" : ""}`}>
      <div className="vehicle-card-top">
        <span className="vehicle-category">{vehicle.category}</span>
        {outOfStock && <span className="vehicle-status">Sold out</span>}
      </div>

      <h3 className="vehicle-title">
        {vehicle.make} {vehicle.model}
      </h3>

      <div className="vehicle-meta">
        <span className="vehicle-price">${Number(vehicle.price).toLocaleString()}</span>
        <span className="vehicle-qty">{vehicle.quantity} in stock</span>
      </div>

      <div className="vehicle-actions">
        <button className="btn btn-primary" disabled={outOfStock} onClick={() => onPurchase(vehicle)}>
          {outOfStock ? "Unavailable" : "Purchase"}
        </button>

        {isAdmin && (
          <>
            <button className="btn btn-ghost" onClick={() => onRestock(vehicle)}>
              Restock
            </button>
            <button className="btn btn-ghost" onClick={() => onEdit(vehicle)}>
              Edit
            </button>
            <button className="btn btn-danger" onClick={() => onDelete(vehicle)}>
              Delete
            </button>
          </>
        )}
      </div>
    </article>
  );
}
