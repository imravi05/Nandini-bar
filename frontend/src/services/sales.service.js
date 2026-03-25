import api from "./api";

export const salesService = {
  /** POST /api/sales — body: { items: [{ productId, quantity }] } */
  createSale: async (cartItems) => {
    const items = cartItems.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
    }));
    const res = await api.post("/sales", { items });
    return res.data.data; // returns the created sale { id, saleNumber, totalAmount }
  },

  /** DELETE /api/sales/:id — restores stock atomically */
  deleteSale: async (saleId) => {
    const res = await api.delete(`/sales/${saleId}`);
    return res.data;
  },
};
export const parcelService = {
  /** POST /api/sales/parcel — body: { items: [{ productId, quantity }] } */
  createParcel: async (cartItems) => {
    const items = cartItems.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
    }));
    const res = await api.post("/sales/parcel", { items });
    return res.data.data;
  },
  //   deleteParcel: async (saleId) => {
  //     const res = await api.delete(`/sales/${saleId}`);
  //     return res.data;
  // }
};
