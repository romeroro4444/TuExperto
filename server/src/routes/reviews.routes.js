const { Router } = require("express");
const router = Router();

const {
  createReview,
  getReviews,
  getMyReviews,
  getReviewsByService,
  clientReview,
} = require("../controllers/reviews.controller");
const authorization = require("../middleware/authorization");

router.post("/review", createReview);
router.get("/reviews", getReviews);
router.get("/service/:service_id/reviews", getReviewsByService);
router.get("/review", authorization, getMyReviews);
router.get("/client-reviews", authorization, clientReview);

module.exports = router;
