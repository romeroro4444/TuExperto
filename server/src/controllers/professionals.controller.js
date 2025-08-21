const pool = require("./../db");

const getProfessionals = async (req, res) => {
  try {
    const response = await pool.query("SELECT * FROM professionals");
    res.json(response.rows);
  } catch (error) {
    console.log(error);
  }
};

const getProfessionalById = async (req, res) => {
  try {
    const professional_id = req.params.professional_id;
    const response = await pool.query(
      "SELECT * FROM professionals WHERE professional_id = $1",
      [professional_id]
    );
    res.json(response.rows);
  } catch (error) {
    console.log(error);
  }
};

const createProfessional = async (req, res) => {
  try {
    const { profession_id, user_id, description, specialization } = req.body;
    // esto verifica si el usuario ya tiene una profesión
    const exists = await pool.query(
      "SELECT * FROM professionals WHERE user_id = $1",
      [user_id]
    );
    if (exists.rows.length > 0) {
      return res.status(400).json({
        message: "El usuario ya tiene una profesión asignada.",
      });
    }
    // si no existe se crea el nuevo profesional
    const text =
      "INSERT INTO professionals(profession_id, user_id, description, specialization) VALUES ($1,$2,$3,$4)";
    const values = [profession_id, user_id, description, specialization];
    const response = await pool.query(text, values);
    console.log(response);
    res.json({
      message: "professional added succesfully",
      body: {
        user: { profession_id, user_id, description, specialization },
      },
    });
  } catch (error) {
    console.log(error);
  }
};

const deleteProfessionalById = async (req, res) => {
  try {
    const professional_id = req.params.professional_id;
    const text = "DELETE FROM professionals WHERE professional_id = $1";
    const response = await pool.query(text, [professional_id]);
    console.log(response);
    res.json({
      message: `User with professional_id ${professional_id} deleted`,
    });
  } catch (error) {
    console.log(error);
  }
};

const editProfessional = async (req, res) => {
  try {
    const professional_id = req.params.professional_id;
    const { description, specialization } = req.body;
    const text =
      "UPDATE users SET description = $1, specialization = $2 WHERE professional_id = $3";
    const values = [description, specialization, professional_id];
    const response = await pool.query(text, values);
    console.log(response);
    res.json({
      message: "user edited succesfully",
      body: {
        user: { description, specialization },
      },
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getProfessionals,
  getProfessionalById,
  createProfessional,
  deleteProfessionalById,
  editProfessional,
};
