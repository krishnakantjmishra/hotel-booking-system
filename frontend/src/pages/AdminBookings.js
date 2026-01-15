import React, { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Grid,
    Stack,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Fade,
    Divider,
    TextField,
    InputAdornment,
} from "@mui/material";
import HotelIcon from "@mui/icons-material/Hotel";
import BedIcon from "@mui/icons-material/Bed";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import api from "../api/axios";
import Loader from "../components/Loader";

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [cancelling, setCancelling] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await api.get("/v1/bookings/admin/");
            // Handle paginated response or direct array
            const data = res.data.results || res.data || [];
            setBookings(Array.isArray(data) ? data : []);
        } catch (err) {
            const errorMessage =
                err.response?.data?.detail ||
                err.response?.data?.message ||
                "Failed to load all bookings";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelClick = (booking) => {
        setSelectedBooking(booking);
        setCancelDialogOpen(true);
    };

    const handleCancelConfirm = async () => {
        if (!selectedBooking) return;

        try {
            setCancelling(true);
            await api.delete(`/v1/bookings/${selectedBooking.id}/cancel/`);
            setBookings((prev) =>
                prev.map((booking) =>
                    booking.id === selectedBooking.id
                        ? { ...booking, status: "cancelled" }
                        : booking
                )
            );
            setCancelDialogOpen(false);
            setSelectedBooking(null);
        } catch (err) {
            setError(
                err.response?.data?.error ||
                err.response?.data?.message ||
                "Failed to cancel booking"
            );
        } finally {
            setCancelling(false);
        }
    };

    const handleCancelClose = () => {
        setCancelDialogOpen(false);
        setSelectedBooking(null);
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "confirmed":
                return "success";
            case "cancelled":
                return "error";
            default:
                return "default";
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case "confirmed":
                return <CheckCircleIcon />;
            case "cancelled":
                return <CancelIcon />;
            default:
                return <AccessTimeIcon />;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    if (loading) {
        return <Loader label="Loading all bookings..." />;
    }

    const filteredBookings = bookings.filter(b =>
        b.hotel_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.id.toString().includes(searchTerm)
    );

    return (
        <Box>
            <Fade in={true} timeout={500}>
                <Stack spacing={3} mb={4}>
                    <Box>
                        <Typography variant="h4" fontWeight={700} gutterBottom>
                            Global Booking Management
                        </Typography>
                        <Typography color="text.secondary" variant="body1">
                            View and manage every reservation in the system
                        </Typography>
                    </Box>

                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Search by Guest Name, Email, Hotel, or Booking ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: 3, bgcolor: 'background.paper' }
                        }}
                    />
                </Stack>
            </Fade>

            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                </Alert>
            )}

            {filteredBookings.length === 0 && !error && (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                    {searchTerm ? "No bookings match your search." : "No bookings found in the system."}
                </Alert>
            )}

            <Grid container spacing={3}>
                {filteredBookings.map((booking, index) => (
                    <Grid item xs={12} key={booking.id}>
                        <Fade
                            in={true}
                            timeout={600}
                            style={{ transitionDelay: `${index * 50}ms` }}
                        >
                            <Card sx={{ borderRadius: 3 }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Grid container spacing={3} alignItems="center">
                                        <Grid item xs={12} md={3}>
                                            <Stack spacing={1}>
                                                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
                                                    Booking ID: #{booking.id}
                                                </Typography>
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <HotelIcon color="primary" fontSize="small" />
                                                    <Typography variant="h6" fontWeight={700}>
                                                        {booking.hotel_name}
                                                    </Typography>
                                                </Stack>
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <BedIcon fontSize="small" color="action" />
                                                    <Typography variant="body2" color="text.secondary">
                                                        {booking.room_name}
                                                    </Typography>
                                                </Stack>
                                            </Stack>
                                        </Grid>

                                        <Grid item xs={12} md={3}>
                                            <Stack spacing={1}>
                                                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
                                                    Guest Details
                                                </Typography>
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <PersonIcon color="action" fontSize="small" />
                                                    <Typography variant="body1" fontWeight={600}>
                                                        {booking.user_name}
                                                    </Typography>
                                                </Stack>
                                                <Typography variant="body2" color="text.secondary">
                                                    {booking.user_email}
                                                </Typography>
                                            </Stack>
                                        </Grid>

                                        <Grid item xs={12} md={2}>
                                            <Stack spacing={1}>
                                                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
                                                    Stay Dates
                                                </Typography>
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <CalendarTodayIcon fontSize="small" color="action" />
                                                    <Typography variant="body2">
                                                        {formatDate(booking.check_in)} - {formatDate(booking.check_out)}
                                                    </Typography>
                                                </Stack>
                                            </Stack>
                                        </Grid>

                                        <Grid item xs={12} md={2}>
                                            <Stack spacing={1}>
                                                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
                                                    Total Amount
                                                </Typography>
                                                <Stack direction="row" spacing={0.5} alignItems="center">
                                                    <AttachMoneyIcon fontSize="small" color="primary" />
                                                    <Typography variant="h6" fontWeight={700} color="primary.main">
                                                        ₹{booking.total_price}
                                                    </Typography>
                                                </Stack>
                                            </Stack>
                                        </Grid>

                                        <Grid item xs={12} md={2}>
                                            <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                                                <Chip
                                                    icon={getStatusIcon(booking.status)}
                                                    label={booking.status || "Unknown"}
                                                    color={getStatusColor(booking.status)}
                                                    sx={{ fontWeight: 600 }}
                                                />
                                                {booking.status?.toLowerCase() !== "cancelled" && (
                                                    <Button
                                                        size="small"
                                                        color="error"
                                                        variant="outlined"
                                                        onClick={() => handleCancelClick(booking)}
                                                        sx={{ minWidth: 'auto', borderRadius: 2 }}
                                                    >
                                                        Cancel
                                                    </Button>
                                                )}
                                            </Stack>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Fade>
                    </Grid>
                ))}
            </Grid>

            {/* Cancel Confirmation Dialog */}
            <Dialog
                open={cancelDialogOpen}
                onClose={handleCancelClose}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Force Cancel Booking?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        As an administrator, you are about to cancel booking <strong>#{selectedBooking?.id}</strong> for <strong>{selectedBooking?.user_name}</strong> at <strong>{selectedBooking?.hotel_name}</strong>.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleCancelClose} disabled={cancelling}>
                        Go Back
                    </Button>
                    <Button
                        onClick={handleCancelConfirm}
                        variant="contained"
                        color="error"
                        disabled={cancelling}
                        startIcon={<CancelIcon />}
                    >
                        {cancelling ? "Processing..." : "Confirm Cancellation"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdminBookings;
