import pool from "../db/db.js";
import bcrypt from "bcrypt";

export const getEmployees = async (req, res) => {
  const result = await pool.query("SELECT * FROM employees ORDER BY id ASC");
  res.json(result.rows);
};

export const createEmployees = async (req, res) => {
  try {
    const { name, email, tel, pin, role } = req.body;

    if (!name || !pin) {
      return res.status(400).json({
        message: "name และ pin จำเป็น",
      });
    }

    if (tel) {
      if (tel && !/^[0-9]{10}$/.test(tel)) {
        return res.status(400).json({
          message: "เบอร์โทรต้องเป็นตัวเลข 10 หลัก",
        });
      }

      const checkTel = await pool.query(
        "SELECT id FROM employees WHERE tel = $1",
        [tel],
      );

      if (checkTel.rows.length > 0) {
        return res.status(400).json({
          message: "เบอร์โทรนี้ถูกใช้งานแล้ว",
        });
      }
    }

    if (email) {
      const checkEmail = await pool.query(
        "SELECT id FROM employees WHERE email = $1",
        [email],
      );

      if (checkEmail.rows.length > 0) {
        return res.status(400).json({
          message: "email นี้ถูกใช้งานแล้ว",
        });
      }
    }

    const hashedPin = await bcrypt.hash(`${pin}`, 10);

    const result = await pool.query(
      `INSERT INTO employees (name, email, tel, pin, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, tel, role, created_at`,
      [name, email || null, tel || null, hashedPin, role || "cashier"],
    );

    res.status(201).json({
      message: "เพิ่มพนักงานสำเร็จ",
      data: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: `server error : ${err}`,
    });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await pool.query("SELECT * FROM employees WHERE id = $1", [
      id,
    ]);

    if (employee.rows.length === 0) {
      return res.status(404).json({
        message: "ไม่พบสินค้า",
      });
    }

    const result = await pool.query(
      "DELETE FROM employees WHERE id = $1 RETURNING *",
      [id],
    );

    res.json({
      message: "ลบพนักงานเรียบร้อย",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "server error",
    });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, tel, pin, role } = req.body;

    const employee = await pool.query("SELECT * FROM employees WHERE id = $1", [
      id,
    ]);

    if (employee.rows.length === 0) {
      return res.status(404).json({
        message: "ไม่พบพนักงาน",
      });
    }

    const current = employee.rows[0];

    let updatedName = name ?? current.name;
    let updatedEmail = email ?? current.email;
    let updatedTel = tel ?? current.tel;
    let updatedRole = role ?? current.role;
    let updatedPin = current.pin;

    if (tel && !/^[0-9]{10}$/.test(tel)) {
      return res.status(400).json({
        message: "เบอร์โทรต้องเป็นตัวเลข 10 หลัก",
      });
    }

    if (email && email !== current.email) {
      const checkEmail = await pool.query(
        "SELECT id FROM employees WHERE email = $1 AND id != $2",
        [email, id],
      );

      if (checkEmail.rows.length > 0) {
        return res.status(400).json({
          message: "email นี้ถูกใช้งานแล้ว",
        });
      }
    }

    if (pin) {
      updatedPin = await bcrypt.hash(pin, 10);
    }

    const result = await pool.query(
      `UPDATE employees
       SET name = $1,
           email = $2,
           tel = $3,
           pin = $4,
           role = $5
       WHERE id = $6
       RETURNING id, name, email, tel, role, created_at`,
      [updatedName, updatedEmail, updatedTel, updatedPin, updatedRole, id],
    );

    res.json({
      message: "แก้ไขพนักงานสำเร็จ",
      data: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "server error",
    });
  }
};
