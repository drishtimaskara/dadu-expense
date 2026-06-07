CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password TEXT
);

CREATE TABLE expenses(
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    amount NUMERIC,
    category VARCHAR(50),
    description TEXT,
    expense_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE budgets(
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    monthly_limit NUMERIC
);