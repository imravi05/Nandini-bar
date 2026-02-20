export const deleteSale = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await salesService.deleteSale(id);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};