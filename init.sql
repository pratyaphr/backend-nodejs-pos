DROP TABLE IF EXISTS receipt_items;
DROP TABLE IF EXISTS receipts;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS employees;

CREATE TABLE employees (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  tel TEXT UNIQUE NOT NULL CHECK (tel ~ '^[0-9]{10}$'),
  pin TEXT NOT NULL,
  role TEXT DEFAULT 'cashier',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  barcode TEXT UNIQUE NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  stock_qty INT DEFAULT 0 CHECK (stock_qty >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE receipts (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  receipt_no TEXT UNIQUE,
  employee_id INT,
  total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
  payment_method TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE TABLE receipt_items (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  receipt_id INT NOT NULL,
  product_id INT NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  quantity INT NOT NULL CHECK (quantity > 0),
  subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),

  FOREIGN KEY (receipt_id) REFERENCES receipts(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_receipts_created_at ON receipts(created_at);
CREATE INDEX idx_receipt_items_receipt_id ON receipt_items(receipt_id);

INSERT INTO employees (name, email,tel, pin, role)
VALUES 
('Admin', 'admin@mail.com','0800000000', '123456', 'admin')