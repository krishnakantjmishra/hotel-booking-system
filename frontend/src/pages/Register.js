import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
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
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import api from "../api/axios";

const Register = () => {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { logout, login, refreshProfile } = useContext(AuthContext);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      // Clear any existing tokens before register
      logout && logout();
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      const res = await api.post("/api/v1/auth/register/", form);
      // If backend returns tokens on register, store them; otherwise prompt login
      if (res?.data?.access) {
        login(res.data.access, res.data.refresh || res.data.refresh_token);
        const profile = await refreshProfile();
        if (profile?.is_staff) navigate("/admin");
        else navigate("/hotels");
      } else {
        setSuccess("Registered successfully. Please login.");
        setTimeout(() => navigate("/login"), 800);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        (err.response?.data && typeof err.response.data === "object"
          ? JSON.stringify(err.response.data)
          : err.response?.data) ||
        err.message ||
        "Registration failed";
      setError(errorMessage);
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
                Create account
              </Typography>
              <Typography color="text.secondary" variant="body1">
                Register to start booking the perfect stay
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
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
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
                {success && (
                  <Alert severity="success" sx={{ borderRadius: 2 }}>
                    {success}
                  </Alert>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={submitting}
                  startIcon={<PersonAddIcon />}
                  sx={{
                    py: 1.5,
                    mt: 1,
                    fontSize: "1rem",
                  }}
                >
                  {submitting ? "Creating..." : "Create Account"}
                </Button>
              </Stack>
            </form>

            <Typography variant="body2" textAlign="center" sx={{ mt: 2 }}>
              Already have an account?{" "}
              <MuiLink 
                component={RouterLink} 
                to="/login" 
                underline="hover"
                sx={{
                  fontWeight: 600,
                  color: "primary.main",
                  "&:hover": {
                    color: "primary.dark",
                  },
                }}
              >
                Sign in here
              </MuiLink>
            </Typography>
          </Stack>
        </Paper>
      </Fade>
    </Box>
  );
};

export default Register;
