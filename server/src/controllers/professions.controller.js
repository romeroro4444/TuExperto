const pool = require("./../db");

const getProfessions = async (req, res) => {
  try {
    const response = await pool.query("SELECT * FROM professions");
    res.json(response.rows);
  } catch (error) {
    console.error(error);
  }
};

const getProfessionById = async (req, res) => {
  try {
    const profession_id = req.params.profession_id;
    const response = await pool.query(
      "SELECT * FROM professions WHERE profession_id = $1",
      [profession_id]
    );
    if (response.rows.length === 0) {
      return res.status(404).json({
        message: "La profesión no existe.",
      });
    }
    res.json(response.rows[0]);
  } catch (error) {
    console.error(error);
  }
};

const createProfession = async (req, res) => {
  try {
    const { profession_name } = req.body;
    // validar si existe ya la profesión por el nombre
    const exists = await pool.query(
      "SELECT * FROM professions WHERE profession_name = $1",
      [profession_name]
    );
    if (exists.rows.length > 0) {
      return res.status(400).json({
        message: "La profesión ya existe.",
      });
    }
    const response = await pool.query(
      "INSERT INTO professions(profession_name) VALUES ($1)",
      [profession_name]
    );
    console.log(response);
    res.json({
      message: "profession added succesfully",
      body: {
        profession: { profession_name },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

const deleteProfessionById = async (req, res) => {
  try {
    const profession_id = req.params.profession_id;
    // obtener el nombre antes de eliminar
    const response = await pool.query(
      "SELECT profession_name FROM professions WHERE profession_id = $1",
      [profession_id]
    );
    if (response.rows.length === 0) {
      return res.status(404).json({ message: "La profesión no existe." });
    }
    const profession_name = response.rows[0].profession_name;
    await pool.query("DELETE FROM professions WHERE profession_id = $1", [
      profession_id,
    ]);
    console.log(response);
    res.json({
      message: `La profesión '${profession_name}' fue eliminada correctamente.`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

const editProfession = async (req, res) => {
  try {
    const profession_id = req.params.profession_id;
    const { profession_name } = req.body;
    const response = await pool.query(
      "UPDATE professions SET profession_name = $1 WHERE profession_id = $2",
      [profession_name, profession_id]
    );
    console.log(response);
    res.json({
      message: "profession edited succesfully",
      body: {
        profesion: { profession_id, profession_name },
      },
    });
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  getProfessionById,
  getProfessions,
  createProfession,
  deleteProfessionById,
  editProfession,
};
