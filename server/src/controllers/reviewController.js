
const mongoose = require("mongoose");
const Review = require("../models/Review");

// CREATE REVIEW
const createReview = async (req, res, next) => {
  try {
    const { mealCode, rating, comment, reviewedBy } = req.body;

    const review = await Review.create({
      mealCode,
      rating,
      comment,
      reviewedBy
    });

    return res.status(201).json({ review });
  } catch (err) {
    if (err.name === "ValidationError" || err.name === "CastError") {
      return res.status(400).json({ message: err.message });
    }

    if (err.code === 11000) {
      return res.status(409).json({
        message: "Review already exists for this meal and reviewer"
      });
    }

    next(err);
  }
};

// GET ALL REVIEWS
const getAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find();

    return res.status(200).json({ reviews });
  } catch (err) {
    next(err);
  }
};

// GET ONE REVIEW
const getReview = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid review id"
      });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        message: "Review not found"
      });
    }

    return res.status(200).json({ review });
  } catch (err) {
    next(err);
  }
};

// GET POPULAR MEALS
const getPopularMeals = async (req, res, next) => {
  try {
    const value = req.query.minReviews;
    const minReviews = value === undefined ? 2 : Number(value);

    if (
      value !== undefined &&
      (
        typeof value !== "string" ||
        !/^\d+$/.test(value) ||
        !Number.isSafeInteger(minReviews) ||
        minReviews < 1
      )
    ) {
      return res.status(400).json({
        message: "minReviews must be a positive integer"
      });
    }

    const popular = await Review.aggregate([
      {
        $group: {
          _id: "$mealCode",
          reviewCount: { $sum: 1 },
          averageRating: { $avg: "$rating" }
        }
      },
      {
        $match: {
          reviewCount: { $gte: minReviews }
        }
      },
      {
        $sort: {
          reviewCount: -1,
          _id: 1
        }
      },
      {
        $project: {
          _id: 0,
          mealCode: "$_id",
          reviewCount: 1,
          averageRating: 1
        }
      }
    ]);

    return res.status(200).json({ popular });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createReview,
  getAllReviews,
  getReview,
  getPopularMeals
};
