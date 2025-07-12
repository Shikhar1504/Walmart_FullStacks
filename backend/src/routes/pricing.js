const express = require("express");
const router = express.Router();
const pricingController = require("../controllers/pricingController");
const {
  authenticateJWT,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// Unified pricing system routes
router.get("/items", pricingController.getAllPricingItems);
router.get("/supplier/:supplierId", pricingController.getPricingBySupplier);
router.post(
  "/items",
  authenticateJWT,
  authorizeRoles("admin"),
  pricingController.createPricingItem
);

// Legacy routes (for backward compatibility)
router.get("/products", pricingController.getProductPricing);
router.get("/history/:productId", pricingController.getPricingHistory);
router.post(
  "/optimize",
  authenticateJWT,
  authorizeRoles("admin"),
  pricingController.optimizePrice
);
router.put(
  "/update/:productId",
  authenticateJWT,
  authorizeRoles("admin"),
  pricingController.updatePrice
);
router.get("/ml-performance", pricingController.getMLPerformance);
router.get("/analytics", pricingController.getPricingAnalytics);
router.get("/optimization", pricingController.getPricingOptimization);
router.get("/ml-factors/:productId", pricingController.getMLPriceFactors);
router.get("/time-demand/:productId", pricingController.getTimeOfDayDemand);
router.get("/ml-analytics/:productId", pricingController.getProductMLAnalytics);
router.get(
  "/time-series/:productId",
  pricingController.getProductPricingTimeSeries
);
router.get("/summary-cards", pricingController.getGeneralSummaryCards);

module.exports = router;
