import pool from "../db/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const authLogin = async (req, res) => {
  try {
    const { employee_id, pin } = req.body;

    if (!employee_id || !pin) {
      return res.status(400).json({
        message: "กรุณาใส่ PIN",
      });
    }

    const result = await pool.query(
      "SELECT id, name, role , pin FROM employees WHERE id = $1",
      [employee_id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "ไม่พบพนักงาน",
      });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(pin, user.pin);

    if (!isMatch) {
      return res.status(401).json({
        message: "PIN ไม่ถูกต้อง",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
    );

    res.json({
      message: "เข้าสู่ระบบสำเร็จ",
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "server error",
    });
  }
};
