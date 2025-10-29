const { Router } = require("express");
const router = Router();

const {
  makeAppointment,
  getAppointments,
  getMyAppointments,
  getNotifications,
  cancelAppointment,
  decisionAppointment,
} = require("../controllers/appointments.controller");
const authorization = require("../middleware/authorization");

router.get("/appointments", getAppointments);
router.get("/notifications", getNotifications);
router.post("/appointment", makeAppointment);
router.get("/my-appointments", authorization, getMyAppointments);
router.put("/cancel-appointment/:appointment_id", cancelAppointment);
router.put("/decision-appointment/:appointment_id", decisionAppointment);

module.exports = router;
