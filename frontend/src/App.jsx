import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import ProtectedRoute from "./routes/ProtectedRoute";
import Budget from "./pages/Budget";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* DEFAULT */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* LOGIN */}
        <Route path="/login" element={<Login />} />

         {/* REGISTER (NEW) */}
        <Route path="/register" element={<Register />} />

        {/* PROTECTED DASHBOARD */}
        <Route path="/dashboard"
          element={  <ProtectedRoute>  <Dashboard /> </ProtectedRoute>  } />

          {/*budget limit */}
          <Route path="/budget" 
          element={ <ProtectedRoute><Budget /></ProtectedRoute>} />

        {/* VERY IMPORTANT: CATCH ALL */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;