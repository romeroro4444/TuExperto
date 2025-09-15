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
    // Verifica si el usuario ya tiene una profesión
    const exists = await pool.query(
      "SELECT * FROM professionals WHERE user_id = $1",
      [user_id]
    );
    if (exists.rows.length > 0) {
      return res.status(400).json({
        message: "El usuario ya tiene una profesión asignada.",
      });
    }
    // Crea el profesional
    const text =
      "INSERT INTO professionals(profession_id, user_id, description) VALUES ($1,$2,$3) RETURNING professional_id";
    const values = [profession_id, user_id, description];
    const response = await pool.query(text, values);
    const professional_id = response.rows[0].professional_id;

    // procesa especializaciones (puede venir como string separado por comas)
    let specs = [];
    if (specialization) {
      if (Array.isArray(specialization)) {
        specs = specialization;
      } else {
        specs = specialization
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s);
      }
    }

    for (const specName of specs) {
      // verifica si la especialización existe
      let specRes = await pool.query(
        "SELECT specialization_id FROM specializations WHERE LOWER(specialization_name) = LOWER($1)",
        [specName]
      );
      let specialization_id;
      if (specRes.rows.length === 0) {
        // si no existe
        const insertSpec = await pool.query(
          "INSERT INTO specializations(specialization_name) VALUES ($1) RETURNING specialization_id",
          [specName]
        );
        specialization_id = insertSpec.rows[0].specialization_id;
      } else {
        specialization_id = specRes.rows[0].specialization_id;
      }
      await pool.query(
        "INSERT INTO professionals_specialization(professional_id, specialization_id) VALUES ($1, $2)",
        [professional_id, specialization_id]
      );
    }

    res.json({
      message: "professional added succesfully",
      body: {
        user: { profession_id, user_id, description, specializations: specs },
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al crear profesional" });
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
