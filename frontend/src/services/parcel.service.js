import api from "./api";

const parcelService = {
  /** POST /api/parcel — body: { items: [{ productId, quantity, unitPrice }] } */
  createParcelSale: async (cartItems) => {
    const items = cartItems.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
      unitPrice: i.price, // backend expects unitPrice for parcel calculation
    }));
    const res = await api.post("/parcels/parcel", { items });
    return res.data.data; // returns the created parcel sale
  },
};

export default parcelService;
