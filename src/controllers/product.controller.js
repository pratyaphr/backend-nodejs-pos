import pool from "../db/db.js";

export const getProducts = async (req, res) => {
  const result = await pool.query("SELECT * FROM products ORDER BY id ASC");
  res.json(result.rows);
};

export const addProduct = async (req, res) => {
  try {
    const { name, barcode, price, stock_qty } = req.body;

    if (!name || !price) {
      return res.status(400).json({
        message: "name และ price จำเป็น",
      });
    }

    if (price < 0 || stock_qty < 0) {
      return res.status(400).json({
        message: "price หรือ stock ห้ามติดลบ",
      });
    }

    if (barcode) {
      const check = await pool.query(
        "SELECT id FROM products WHERE barcode = $1",
        [barcode],
      );

      if (check.rows.length > 0) {
        return res.status(400).json({
          message: "barcode นี้มีอยู่แล้ว",
        });
      }
    }

    const result = await pool.query(
      `INSERT INTO products (name, barcode, price, stock_qty)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, barcode, price, stock_qty || 0],
    );

    res.status(201).json({
      message: "เพิ่มสินค้าเรียบร้อย",
      data: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: `server ${err}`,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, barcode, price, stock_qty } = req.body;

    const product = await pool.query("SELECT * FROM products WHERE id = $1", [
      id,
    ]);

    if (product.rows.length === 0) {
      return res.status(404).json({
        message: "ไม่พบสินค้า",
      });
    }

    if (barcode) {
      const check = await pool.query(
        "SELECT id FROM products WHERE barcode = $1 AND id != $2",
        [barcode, id],
      );

      if (check.rows.length > 0) {
        return res.status(400).json({
          message: "barcode นี้มีอยู่แล้ว",
        });
      }
    }

    if (price !== undefined && price < 0) {
      return res.status(400).json({
        message: "price ห้ามติดลบ",
      });
    }

    if (stock_qty !== undefined && stock_qty < 0) {
      return res.status(400).json({
        message: "stock ห้ามติดลบ",
      });
    }

    const result = await pool.query(
      `UPDATE products SET
        name = COALESCE($1, name),
        barcode = COALESCE($2, barcode),
        price = COALESCE($3, price),
        stock_qty = COALESCE($4, stock_qty)
      WHERE id = $5
      RETURNING *`,
      [name, barcode, price, stock_qty, id],
    );

    res.json({
      message: "อัปเดตสินค้าเรียบร้อย",
      data: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "server error",
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await pool.query("SELECT * FROM products WHERE id = $1", [
      id,
    ]);

    if (product.rows.length === 0) {
      return res.status(404).json({
        message: "ไม่พบสินค้า",
      });
    }

    const used = await pool.query(
      "SELECT 1 FROM receipt_items WHERE product_id = $1 LIMIT 1",
      [id],
    );

    if (used.rows.length > 0) {
      return res.status(400).json({
        message: "สินค้านี้มีประวัติการขายแล้ว ห้ามลบ",
      });
    }

    const result = await pool.query(
      "DELETE FROM products WHERE id = $1 RETURNING *",
      [id],
    );

    res.json({
      message: "ลบสินค้าเรียบร้อย",
      data: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "server error",
    });
  }
};
