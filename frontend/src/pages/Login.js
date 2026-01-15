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
  const { login, loginEmail, refreshProfile } = useContext(AuthContext);
  const [tab, setTab] = useState(0); // 0 = User (OTP), 1 = Admin (Password)

  // Admin Form
  const [adminForm, setAdminForm] = useState({ username: "", password: "" });

  // User Form
  const [userEmail, setUserEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
    setError("");
    setSuccessMsg("");
    setOtpSent(false);
  };

  const handleAdminChange = (e) => {
    setAdminForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");

      const payload = {
        username: adminForm.username.trim(),
        password: adminForm.password.trim(),
      };

      const res = await api.post("/api/v1/auth/token/", payload);

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      login(res.data.access, res.data.refresh);

      const profile = await refreshProfile();

      if (profile?.is_staff) navigate("/admin-ui");
      else navigate("/hotels"); // Should not happen for admins usually

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

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setSubmitting(true);
    try {
      await api.post("/v1/bookings/otp/request/", { email: userEmail });
      setOtpSent(true);
      setSuccessMsg("OTP sent to your email!");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send OTP. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await api.post("/v1/bookings/otp/verify/", { email: userEmail, otp });
      // response contains { token: "..." } which is the email_token
      loginEmail(res.data.token);
      navigate("/bookings");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid OTP");
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
            p: 4,
            width: "100%",
            maxWidth: 480,
            borderRadius: 4,
            background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
          }}
        >
          <Box textAlign="center" mb={3}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Welcome
            </Typography>
            <Typography color="text.secondary" variant="body1">
              Manage your bookings
            </Typography>
          </Box>

          {/* Use MuiTabs directly if imported, else assume standard Tabs/Tab from @mui/material which I need to add to import */}
          {/* Since I cannot see imports fully, I will assume I need to update imports too. 
             But replace_file_content replaces a block. I will use the imports present or add them. 
             Wait, I see imports in the file view. I need to add Tabs, Tab. */}

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            {/* Creating a simple tab implementation if Tabs not imported? 
                 Better to use existing imports or request import update. 
                 I'll stick to a simple toggle for now to avoid import errors if I can't see top of file easily? 
                 Actually I saw lines 1-176. I can add Tabs/Tab to imports. */}

            {/* I'll use buttons for tabs if I don't want to risk import issues with replace_file_content in the middle */}
            <Stack direction="row" spacing={2} justifyContent="center" mb={2}>
              <Button
                variant={tab === 0 ? "contained" : "text"}
                onClick={(e) => handleTabChange(e, 0)}
                sx={{ flex: 1 }}
              >
                User Login
              </Button>
              <Button
                variant={tab === 1 ? "contained" : "text"}
                onClick={(e) => handleTabChange(e, 1)}
                sx={{ flex: 1 }}
              >
                Admin Login
              </Button>
            </Stack>
          </Box>

          {/* User Login (OTP) */}
          {tab === 0 && (
            <Stack spacing={3}>
              {error && <Alert severity="error">{error}</Alert>}
              {successMsg && <Alert severity="success">{successMsg}</Alert>}

              {!otpSent ? (
                <form onSubmit={handleSendOTP}>
                  <Stack spacing={3}>
                    <TextField
                      label="Email Address"
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      fullWidth
                      required
                      helperText="Enter the email you used for booking"
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={submitting}
                      fullWidth
                    >
                      {submitting ? "Sending..." : "Send OTP"}
                    </Button>
                  </Stack>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP}>
                  <Stack spacing={3}>
                    <Typography variant="body2" textAlign="center">
                      Enter the OTP sent to <strong>{userEmail}</strong>
                    </Typography>
                    <TextField
                      label="OTP Code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      fullWidth
                      required
                      autoFocus
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={submitting}
                      fullWidth
                    >
                      {submitting ? "Verifying..." : "Verify & Login"}
                    </Button>
                    <Button onClick={() => setOtpSent(false)} sx={{ alignSelf: 'center' }}>
                      Change Email
                    </Button>
                  </Stack>
                </form>
              )}
            </Stack>
          )}

          {/* Admin Login */}
          {tab === 1 && (
            <form onSubmit={handleAdminSubmit}>
              <Stack spacing={3}>
                <TextField
                  label="Username"
                  name="username"
                  value={adminForm.username}
                  onChange={handleAdminChange}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Password"
                  type="password"
                  name="password"
                  value={adminForm.password}
                  onChange={handleAdminChange}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                {error && tab === 1 && (
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
                >
                  {submitting ? "Signing in..." : "Sign In"}
                </Button>
              </Stack>
            </form>
          )}

        </Paper>
      </Fade>
    </Box>
  );
};

export default Login;
