import pool from "../db/db.js";

export const getDashboard = async (req, res) => {
  try {
    const todaySalesRes = await pool.query(`
      SELECT COALESCE(SUM(total_amount), 0) AS total_sales
      FROM receipts
      WHERE DATE(created_at) = CURRENT_DATE
    `);

    const todayCountRes = await pool.query(`
      SELECT COUNT(*) AS total_receipts
      FROM receipts
      WHERE DATE(created_at) = CURRENT_DATE
    `);

    const stockCountRes = await pool.query(`
      SELECT COUNT(*) AS total_products
      FROM products
    `);

    const lowStockRes = await pool.query(`
      SELECT id, name, stock_qty
      FROM products
      WHERE stock_qty <= 10
      ORDER BY stock_qty ASC
      LIMIT 10
    `);

    const topProductsRes = await pool.query(`
      SELECT 
        p.id,
        p.name,
        SUM(ri.quantity) AS total_sold,
        SUM(ri.subtotal) AS total_revenue
      FROM receipt_items ri
      JOIN products p ON ri.product_id = p.id
      JOIN receipts r ON r.id = ri.receipt_id
      WHERE DATE(r.created_at) = CURRENT_DATE
      GROUP BY p.id, p.name
      ORDER BY total_sold DESC
      LIMIT 10
    `);

    res.json({
      data: {
        today_sales: Number(todaySalesRes.rows[0].total_sales),
        today_receipts: Number(todayCountRes.rows[0].total_receipts),
        total_products: Number(stockCountRes.rows[0].total_products),
        low_stock: lowStockRes.rows,
        topProducts: topProductsRes.rows,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "server error",
    });
  }
};

export const getDashboardSalesGraph = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        EXTRACT(DAY FROM created_at) AS day,
        COALESCE(SUM(total_amount), 0) AS total
      FROM receipts
      WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
      GROUP BY day
      ORDER BY day
    `);

    // 📅 จำนวนวันในเดือนนี้
    const now = new Date();
    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
    ).getDate();

    // 🧠 แปลงเป็น map
    const salesMap = {};
    result.rows.forEach((row) => {
      salesMap[Number(row.day)] = Number(row.total);
    });

    // 🔥 fill วันที่ไม่มีข้อมูล
    const data = [];
    for (let i = 1; i <= daysInMonth; i++) {
      data.push({
        date: String(i),
        value: salesMap[i] || 0,
      });
    }

    res.json({ data });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "server error",
    });
  }
};
