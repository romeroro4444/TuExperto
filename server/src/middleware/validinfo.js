module.exports = function (req, res, next) {
  const { email, name, password, lastname, telefono } = req.body;

  const validEmail = (userEmail) => {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(userEmail);
  };

  if (req.path === "/register") {
    console.log(!email.length);
    if (![email, name, password, lastname, telefono].every(Boolean)) {
      return res.status(401).json("Faltan campos por llenar");
    } else if (!validEmail(email)) {
      return res.status(401).json("Email Invalido");
    }
  } else if (req.path === "/login") {
    if (![email, password].every(Boolean)) {
      return res.status(401).json("Faltan campos por llenar");
    } else if (!validEmail(email)) {
      return res.status(401).json("Email Invalido");
    }
  }

  next();
};
