import React, { useContext, useState } from "react";
import {
    Alert,
    Box,
    Button,
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
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const AdminLogin = () => {
    const { login, refreshProfile } = useContext(AuthContext);
    const [adminForm, setAdminForm] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

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

            if (profile?.is_staff) {
                navigate("/admin-ui");
            } else {
                setError("Access denied. Admin only.");
                // Clear tokens if not staff
                localStorage.removeItem("access");
                localStorage.removeItem("refresh");
            }

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
                        p: 4,
                        width: "100%",
                        maxWidth: 480,
                        borderRadius: 4,
                        background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
                    }}
                >
                    <Box textAlign="center" mb={3}>
                        <Typography variant="h4" fontWeight={700} gutterBottom>
                            Admin Access
                        </Typography>
                        <Typography color="text.secondary" variant="body1">
                            Administrator Login
                        </Typography>
                    </Box>

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
                                fullWidth
                            >
                                {submitting ? "Signing in..." : "Sign In"}
                            </Button>
                        </Stack>
                    </form>
                </Paper>
            </Fade>
        </Box>
    );
};

export default AdminLogin;
