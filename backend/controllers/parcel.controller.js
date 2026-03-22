import { createParcelSale } from "../services/parcel.service.js";

export const createParcel = async (req, res) => {
  try {
    const result = await createParcelSale(req.body);

    res.status(201).json({
      success: true,
      message: "Parcel sale created successfully",
      data: result
    });

  } catch (error) {
    console.error("Parcel Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create parcel sale"
    });
  }
};