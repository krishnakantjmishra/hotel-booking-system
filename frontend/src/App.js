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
import AdminBookings from "./pages/AdminBookings";

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
      main: "#2563eb", // Modern Royal Blue
      light: "#60a5fa",
      dark: "#1d4ed8",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#0f172a", // Slate Dark
      light: "#334155",
      dark: "#020617",
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
    text: {
      primary: "#0f172a",
      secondary: "#64748b",
    },
    accent: {
      main: "#8b5cf6", // Purple accent
    }
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: '"Outfit", "Inter", sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 800 },
    h4: {
      fontWeight: 800,
      letterSpacing: "-0.03em",
    },
    h5: {
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    h6: {
      fontWeight: 700,
      letterSpacing: "-0.01em",
    },
    body1: {
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 700,
      letterSpacing: "0.01em",
    },
  },
  components: {
    MuiButton: {
      defaultProps: { variant: "contained", disableElevation: true },
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 12,
          padding: "12px 28px",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          fontSize: '0.95rem',
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 10px 15px -3px rgba(37, 99, 235, 0.2)",
          },
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: '1px solid #f1f5f9',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          border: '1px solid #f1f5f9',
          "&:hover": {
            boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
            transform: "translateY(-4px)",
            borderColor: '#e2e8f0',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 14,
            backgroundColor: '#f8fafc',
            transition: "all 0.2s ease",
            "& fieldset": {
              borderColor: '#e2e8f0',
            },
            "&:hover": {
              backgroundColor: '#f1f5f9',
              "& fieldset": {
                borderColor: "#2563eb",
              },
            },
            "&.Mui-focused": {
              backgroundColor: '#ffffff',
              "& fieldset": {
                borderWidth: '2px',
              },
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: 600,
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
                  <Route
                    path="/admin-ui/bookings"
                    element={
                      <AdminRoute>
                        <AdminBookings />
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
