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
  const { login, refreshProfile, logout } = useContext(AuthContext);
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

    try {
      // Clear old tokens (CORRECT KEYS)
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");

      const payload = {
        username: form.username.trim(),
        password: form.password.trim(),
      };

      // Login request
      const res = await api.post("/api/v1/auth/token/", payload);

      // SAVE TOKENS (SINGLE SOURCE OF TRUTH)
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      // Update context
      login(res.data.access, res.data.refresh);

      // Fetch profile AFTER token is stored
      const profile = await refreshProfile();

      if (profile?.is_staff) navigate("/admin-ui");
      else navigate("/hotels");

    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        (err.response?.status === 401
          ? "Invalid username or password"
          : "Login failed");

      setError(msg);
    } finally {
      setSubmitting(false);
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
                Admin sign-in only. Normal users do not use username/password.
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

            {/* Registration is disabled for normal users */}
            <Typography variant="body2" textAlign="center" sx={{ mt: 2 }}>
              Registration is disabled. Admins must be created via the Django admin panel.
            </Typography>
          </Stack>
        </Paper>
      </Fade>
    </Box>
  );
};

export default Login;
