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
  const { loginEmail } = useContext(AuthContext);

  // User Form
  const [userEmail, setUserEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

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
              My Bookings
            </Typography>
            <Typography color="text.secondary" variant="body1">
              Enter your email to view and manage your bookings
            </Typography>
          </Box>

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
                    autoFocus
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
                    {submitting ? "Verifying..." : "Verify & View Bookings"}
                  </Button>
                  <Button onClick={() => setOtpSent(false)} sx={{ alignSelf: 'center' }}>
                    Change Email
                  </Button>
                </Stack>
              </form>
            )}
          </Stack>
        </Paper>
      </Fade>
    </Box>
  );
};

export default Login;
