const express = require("express");
const morgan = require("express");
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

app.listen(PORT);
console.log("Server on port", PORT);
