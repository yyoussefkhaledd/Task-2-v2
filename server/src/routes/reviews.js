
const express = require("express");
const router = express.Router();

const {
  createReview,
  getAllReviews,
  getReview,
  getPopularMeals
} = require("../controllers/reviewController");

router.post("/", createReview);

router.get("/", getAllReviews);

router.get("/popular", getPopularMeals);

router.get("/:id", getReview);

module.exports = router;
