import React, { useContext, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Link as MuiLink,
  Paper,
  Stack,
  TextField,
  Typography,
  InputAdornment,
  Fade,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import LoginIcon from "@mui/icons-material/Login";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const { login, setLoading } = useContext(AuthContext);
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    setLoading(true);
    try {
      // Trim whitespace from username and password
      const trimmedForm = {
        username: form.username.trim(),
        password: form.password.trim()
      };
      
      const res = await api.post("/api/v1/auth/token/", trimmedForm, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      login(res.data.access);
      navigate("/hotels");
    } catch (err) {
      // Show more detailed error message
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          (err.response?.status === 401 ? "Invalid username or password" : 
                          err.message || "Login failed. Please check your credentials.");
      setError(errorMessage);
      console.error("Login error:", err.response?.data || err.message);
      console.error("Request data:", { username: form.username.trim(), password: "***" });
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <Fade in={true} timeout={600}>
        <Paper 
          elevation={8} 
          sx={{ 
            p: 5, 
            width: "100%", 
            maxWidth: 480,
            borderRadius: 4,
            background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
          }}
        >
          <Stack spacing={3}>
            <Box textAlign="center">
              <Typography variant="h4" fontWeight={700} gutterBottom sx={{ mb: 1 }}>
                Welcome back
              </Typography>
              <Typography color="text.secondary" variant="body1">
                Sign in to access the best hotel deals
              </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  label="Username"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "background.paper",
                    },
                  }}
                />
                <TextField
                  label="Password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "background.paper",
                    },
                  }}
                />
                {error && (
                  <Alert severity="error" sx={{ borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={submitting}
                  startIcon={<LoginIcon />}
                  sx={{
                    py: 1.5,
                    mt: 1,
                    fontSize: "1rem",
                  }}
                >
                  {submitting ? "Signing in..." : "Sign In"}
                </Button>
              </Stack>
            </form>

            <Typography variant="body2" textAlign="center" sx={{ mt: 2 }}>
              Don&apos;t have an account?{" "}
              <MuiLink 
                component={RouterLink} 
                to="/register" 
                underline="hover"
                sx={{
                  fontWeight: 600,
                  color: "primary.main",
                  "&:hover": {
                    color: "primary.dark",
                  },
                }}
              >
                Create one now
              </MuiLink>
            </Typography>
          </Stack>
        </Paper>
      </Fade>
    </Box>
  );
};

export default Login;
