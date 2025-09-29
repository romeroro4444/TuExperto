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

app.listen(PORT);
console.log("Server on port", PORT);
