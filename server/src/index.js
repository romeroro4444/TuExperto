const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
const PORT = 4000;

app.use(morgan("dev"));
app.use(cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//rutas
app.use(require("./routes/users.routes"));
app.use(require("./routes/professionals.routes"));
app.use(require("./routes/professions.routes"));
app.use(require("./routes/services.routes"));
app.use(require("./routes/requests.route"));
app.use(require("./routes/appointments.routes"));
app.use(require("./routes/payment.routes"));
app.use(require("./routes/reviews.routes"));
app.use(require("./routes/complaint.routes"));
app.use(require("./routes/paypal.routes"));
app.use(require("./routes/withdrawals.routes"));

app.listen(PORT);
console.log("Server on port", PORT);
