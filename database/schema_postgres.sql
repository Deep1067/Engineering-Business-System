-- PostgreSQL Schema for Supabase

CREATE TYPE user_role AS ENUM('owner', 'employee', 'customer');
CREATE TYPE product_status AS ENUM('active', 'inactive');
CREATE TYPE change_type_enum AS ENUM('IN', 'OUT');
CREATE TYPE order_status AS ENUM('pending', 'partially_paid', 'completed', 'cancelled');
CREATE TYPE payment_method_enum AS ENUM('cash','upi','bank_transfer','cheque','card');

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'customer',
    is_verified BOOLEAN DEFAULT false,
    otp VARCHAR(10),
    otp_expiry TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    gst_percentage REAL DEFAULT 0,
    image_url VARCHAR(255),
    status product_status DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_variants (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL,
    size VARCHAR(255) NOT NULL,
    quantity REAL NOT NULL DEFAULT 0,
    unit VARCHAR(50) NOT NULL,
    price REAL NOT NULL DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    variant_id INT NOT NULL UNIQUE,
    quantity_available REAL NOT NULL DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS inventory_logs (
    id SERIAL PRIMARY KEY,
    variant_id INT NOT NULL,
    change_type change_type_enum NOT NULL,
    quantity REAL NOT NULL,
    reference_type VARCHAR(50) DEFAULT 'MANUAL',
    reference_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL,
    total_amount REAL NOT NULL DEFAULT 0,
    status order_status DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL,
    variant_id INT NOT NULL,
    quantity REAL NOT NULL,
    price REAL NOT NULL,
    subtotal REAL NOT NULL DEFAULT 0,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL UNIQUE,
    taxable_amount REAL NOT NULL DEFAULT 0,
    cgst REAL NOT NULL DEFAULT 0,
    sgst REAL NOT NULL DEFAULT 0,
    total_tax REAL NOT NULL DEFAULT 0,
    final_amount REAL NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL,
    amount_paid DECIMAL(12,2) NOT NULL,
    payment_method payment_method_enum NOT NULL DEFAULT 'cash',
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS employee_profiles (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    base_salary DECIMAL(12,2) NOT NULL DEFAULT 0,
    join_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS salary_records (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL,
    month SMALLINT NOT NULL,
    year SMALLINT NOT NULL,
    base_salary DECIMAL(12,2) NOT NULL,
    deductions DECIMAL(12,2) NOT NULL DEFAULT 0,
    net_salary DECIMAL(12,2) NOT NULL,
    notes TEXT,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (employee_id, month, year),
    FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE
);
