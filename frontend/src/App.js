import React, { useEffect, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import { CssBaseline, ThemeProvider, Container, Box, createTheme } from "@mui/material";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import NonAdminRoute from "./components/NonAdminRoute";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Hotels from "./pages/Hotels";
import AdminDashboard from "./pages/AdminDashboard";
import AdminHotels from "./pages/AdminHotels";
import AdminRooms from "./pages/AdminRooms";
import AdminInventory from "./pages/AdminInventory";
import HotelDetail from "./pages/HotelDetail";
import MyBookings from "./pages/MyBookings";
import AdminLogin from "./pages/AdminLogin";

// Listens for auth-related events emitted by low-level modules (e.g. axios)
// and performs SPA-safe navigation using react-router's `navigate` and AuthContext.
const AuthEventListener = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const onUnauthorized = () => {
      // Clear auth state and navigate using react-router (no full page reload)
      logout();
      navigate("/login");
    };

    window.addEventListener("auth:unauthorized", onUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", onUnauthorized);
  }, [logout, navigate]);

  return null;
};

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
      light: "#42a5f5",
      dark: "#1565c0",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#00acc1",
      light: "#4dd0e1",
      dark: "#00838f",
    },
    background: {
      default: "#f5f7fa",
      paper: "#ffffff",
    },
    text: {
      primary: "#1a1a1a",
      secondary: "#6b7280",
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    h5: {
      fontWeight: 600,
      letterSpacing: "-0.01em",
    },
    h6: {
      fontWeight: 600,
      letterSpacing: "-0.01em",
    },
    button: {
      fontWeight: 600,
      letterSpacing: "0.02em",
    },
  },
  components: {
    MuiButton: {
      defaultProps: { variant: "contained" },
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 10,
          padding: "10px 24px",
          boxShadow: "0 2px 8px rgba(25, 118, 210, 0.2)",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
            transform: "translateY(-1px)",
          },
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 2 },
      styleOverrides: {
        root: {
          borderRadius: 16,
          transition: "all 0.3s ease",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
            transform: "translateY(-4px)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 10,
            transition: "all 0.2s ease",
            "&:hover": {
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#1976d2",
              },
            },
          },
        },
      },
    },
  },
});

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Box
            sx={{
              minHeight: "100vh",
              background: "linear-gradient(135deg, #f5f7fa 0%, #e8f0f8 50%, #f5f7fa 100%)",
              backgroundAttachment: "fixed",
            }}
          >
            <Navbar />
            {/* Handle auth events emitted by api layer (e.g. 401 responses) */}
            <AuthEventListener />
            <Container maxWidth="lg">
              <Box pt={4} pb={6}>
                <Routes>
                  <Route path="/" element={
                    <NonAdminRoute>
                      <Hotels />
                    </NonAdminRoute>
                  } />
                  <Route path="/login" element={<Login />} />
                  <Route path="/admin-login" element={<AdminLogin />} />
                  <Route path="/register" element={<Register />} />
                  <Route
                    path="/hotels"
                    element={
                      <NonAdminRoute>
                        <Hotels />
                      </NonAdminRoute>
                    }
                  />
                  <Route
                    path="/hotels/:id"
                    element={
                      <HotelDetail />
                    }
                  />
                  <Route
                    path="/bookings"
                    element={
                      <ProtectedRoute>
                        <MyBookings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin-ui"
                    element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin-ui/hotels"
                    element={
                      <AdminRoute>
                        <AdminHotels />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin-ui/rooms"
                    element={
                      <AdminRoute>
                        <AdminRooms />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin-ui/inventory"
                    element={
                      <AdminRoute>
                        <AdminInventory />
                      </AdminRoute>
                    }
                  />
                  <Route path="*" element={<NonAdminRoute><Hotels /></NonAdminRoute>} />
                </Routes>
              </Box>
            </Container>
          </Box>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
