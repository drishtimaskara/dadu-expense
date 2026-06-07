# Dadu Expense Tracker

A full-stack expense tracking application that helps users manage expenses, monitor budgets, and analyze spending habits through interactive dashboards and bill scanning.

## Features

### Authentication

* User Registration *with OTP verification*
* User Login
* JWT-based Authentication
* Protected Routes

### Expense Management

* Add Expenses
* View Expense History
* Categorize Expenses
* Delete Expenses

### Budget Management

* Set Monthly Budget
* Track Budget Usage
* Remaining Budget Calculation
* Budget Alerts

### Analytics Dashboard

* Expense Summary
* Category-wise Expense Breakdown
* Interactive Pie Charts
* Spending Insights

### OCR Bill Scanner

* Upload Bill Images
* Extract Expense Amount Automatically
* Reduce Manual Data Entry

## Tech Stack

### Frontend

* React.js
* Vite
* Recharts
* Axios
* React Router

### Backend

* Node.js
* Express.js
* JWT Authentication

### Database

* PostgreSQL

### OCR

* Tesseract.js

## Project Structure

```text
backend/
├── controllers/
├── middleware/
├── models/
├── routes/
├── db/
└── server.js

frontend/
├── src/
│   ├── pages/
│   ├── components/
│   ├── routes/
│   └── services/
└── public/
```

## Installation

### Clone Repository

```bash
git clone https://github.com/drishtimaskara/dadu-expense.git
cd dadu-expense
```

## Backend Setup

Navigate to backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password
DB_NAME=expense_tracker

JWT_SECRET=your_secret_key
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_app_password
```

Start backend:

```bash
npm start
```

## Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start frontend:

```bash
npm run dev
```

Frontend will run on:

```text
http://localhost:5173
```

## Database Setup

Create PostgreSQL database:

```sql
CREATE DATABASE expense_tracker;
```

Import:

```bash
expense_tracker psql.sql
```

or execute the SQL file manually inside PostgreSQL.

## Future Improvements

* Multi-currency support
* AI-powered expense categorization
* Advanced budget forecasting
* Cloud OCR service integration
* Email notifications
* Mobile responsive enhancements

## Author

Drishti Maskara

GitHub:
https://github.com/drishtimaskara/dadu-expense
