import { generatePDF } from "../services/pdf.service.js";
import pool from "../db/db.js";

export const getPDF = async (req, res) => {
  try {
    const { html } = req.body;

    const pdf = await generatePDF(html);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=receipt.pdf",
    });

    res.send(pdf);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getReceipts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `
      SELECT
        r.id,
        r.receipt_no,
        r.total_amount,
        r.payment_method,
        r.created_at,
        e.name AS employee_name
      FROM receipts r
      LEFT JOIN employees e ON r.employee_id = e.id
      ORDER BY r.id DESC
      LIMIT $1 OFFSET $2
      `,
      [limit, offset],
    );

    const countResult = await pool.query("SELECT COUNT(*) FROM receipts");

    const total = parseInt(countResult.rows[0].count);

    res.json({
      data: result.rows,
      pagination: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "server error",
    });
  }
};

export const createReceipts = async (req, res) => {
  try {
    const { items, payment_method } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        message: "ไม่มีสินค้า",
      });
    }

    await pool.query("BEGIN");

    let totalAmount = 0;

    const productMap = {};

    for (const item of items) {
      const { product_id, quantity } = item;

      const productRes = await pool.query(
        "SELECT * FROM products WHERE id = $1 FOR UPDATE",
        [product_id],
      );

      if (productRes.rows.length === 0) {
        throw new Error(`ไม่พบสินค้า id ${product_id}`);
      }

      const product = productRes.rows[0];

      if (product.stock_qty < quantity) {
        throw new Error(`สินค้า ${product.name} ไม่พอ`);
      }

      const subtotal = product.price * quantity;
      totalAmount += subtotal;

      productMap[product_id] = {
        price: product.price,
        quantity,
        subtotal,
      };

      await pool.query(
        "UPDATE products SET stock_qty = stock_qty - $1 WHERE id = $2",
        [quantity, product_id],
      );
    }

    const receiptNo = `RC${Date.now()}`;

    const employeeId = req.user?.id || null;

    const receiptRes = await pool.query(
      `INSERT INTO receipts (receipt_no, employee_id, total_amount, payment_method)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [receiptNo, employeeId, totalAmount, payment_method],
    );

    const receipt = receiptRes.rows[0];

    for (const product_id in productMap) {
      const item = productMap[product_id];

      await pool.query(
        `INSERT INTO receipt_items (receipt_id, product_id, price, quantity, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [receipt.id, product_id, item.price, item.quantity, item.subtotal],
      );
    }

    await pool.query("COMMIT");

    res.json({
      message: "สร้างใบเสร็จสำเร็จ",
      data: receipt,
    });
  } catch (error) {
    console.error(err);
    await client.query("ROLLBACK");

    res.status(500).json({
      message: "server error",
    });
  }
};

export const getReceiptDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const receiptRes = await pool.query(
      `
      SELECT 
        r.id,
        r.receipt_no,
        r.total_amount,
        r.payment_method,
        r.created_at,
        e.name AS employee_name
      FROM receipts r
      LEFT JOIN employees e ON r.employee_id = e.id
      WHERE r.id = $1
      `,
      [id],
    );

    if (receiptRes.rows.length === 0) {
      return res.status(404).json({
        message: "ไม่พบใบเสร็จ",
      });
    }

    const receipt = receiptRes.rows[0];

    const itemsRes = await pool.query(
      `
      SELECT 
        ri.id,
        ri.product_id,
        p.name AS product_name,
        ri.price,
        ri.quantity,
        ri.subtotal
      FROM receipt_items ri
      JOIN products p ON ri.product_id = p.id
      WHERE ri.receipt_id = $1
      `,
      [id],
    );

    res.json({
      ...receipt,
      items: itemsRes.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "server error",
    });
  }
};
