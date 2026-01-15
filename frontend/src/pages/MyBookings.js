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
} from "@mui/material";
import HotelIcon from "@mui/icons-material/Hotel";
import BedIcon from "@mui/icons-material/Bed";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import api from "../api/axios";
import Loader from "../components/Loader";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/v1/bookings/me/");
      // Handle paginated response or direct array
      const data = res.data.results || res.data || [];
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        (err.response?.status === 401
          ? "Please login again"
          : "Failed to load bookings");
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
      // Remove cancelled booking from list or update its status
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

  const calculateNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return <Loader label="Loading your bookings..." />;
  }

  const activeBookings = bookings.filter(
    (b) => b.status?.toLowerCase() !== "cancelled"
  );
  const cancelledBookings = bookings.filter(
    (b) => b.status?.toLowerCase() === "cancelled"
  );

  return (
    <Box>
      <Fade in={true} timeout={500}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              My Bookings
            </Typography>
            <Typography color="text.secondary" variant="body1">
              Manage and view all your hotel reservations
            </Typography>
          </Box>
        </Stack>
      </Fade>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {bookings.length === 0 && !error && (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          You don't have any bookings yet. Start exploring hotels to make your first booking!
        </Alert>
      )}

      {activeBookings.length > 0 && (
        <Box mb={4}>
          <Typography variant="h5" fontWeight={600} mb={2} sx={{ color: "primary.main" }}>
            Active Bookings ({activeBookings.length})
          </Typography>
          <Grid container spacing={3}>
            {activeBookings.map((booking, index) => (
              <Grid item xs={12} md={6} key={booking.id}>
                <Fade
                  in={true}
                  timeout={600}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Stack spacing={2}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="flex-start"
                        >
                          <Box sx={{ flex: 1 }}>
                            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                              <HotelIcon color="primary" />
                              <Typography variant="h6" fontWeight={700}>
                                {booking.hotel_name || "Hotel"}
                              </Typography>
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <BedIcon fontSize="small" color="action" />
                              <Typography variant="body1" color="text.secondary">
                                {booking.room_name || "Room"}
                              </Typography>
                            </Stack>
                          </Box>
                          <Chip
                            icon={getStatusIcon(booking.status)}
                            label={booking.status || "Unknown"}
                            color={getStatusColor(booking.status)}
                            sx={{ fontWeight: 600 }}
                          />
                        </Stack>

                        <Divider />

                        <Stack spacing={1.5}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <CalendarTodayIcon fontSize="small" color="action" />
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Check-in
                              </Typography>
                              <Typography variant="body1" fontWeight={600}>
                                {formatDate(booking.check_in)}
                              </Typography>
                            </Box>
                          </Stack>

                          <Stack direction="row" spacing={1} alignItems="center">
                            <CalendarTodayIcon fontSize="small" color="action" />
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Check-out
                              </Typography>
                              <Typography variant="body1" fontWeight={600}>
                                {formatDate(booking.check_out)}
                              </Typography>
                            </Box>
                          </Stack>

                          <Box
                            sx={{
                              p: 2,
                              bgcolor: "primary.light",
                              borderRadius: 2,
                              color: "primary.contrastText",
                            }}
                          >
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Stack direction="row" spacing={1} alignItems="center">
                                <AttachMoneyIcon />
                                <Box>
                                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    Total Price
                                  </Typography>
                                  <Typography variant="h6" fontWeight={700}>
                                    ₹{booking.total_price || 0}
                                  </Typography>
                                </Box>
                              </Stack>
                              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                {calculateNights(booking.check_in, booking.check_out)} night
                                {calculateNights(booking.check_in, booking.check_out) !== 1
                                  ? "s"
                                  : ""}
                              </Typography>
                            </Stack>
                          </Box>
                        </Stack>
                      </Stack>
                    </CardContent>
                    <Box sx={{ p: 2, pt: 0 }}>
                      <Button
                        variant="outlined"
                        color="error"
                        fullWidth
                        startIcon={<CancelIcon />}
                        onClick={() => handleCancelClick(booking)}
                        sx={{
                          borderRadius: 2,
                          py: 1.2,
                        }}
                      >
                        Cancel Booking
                      </Button>
                    </Box>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {cancelledBookings.length > 0 && (
        <Box>
          <Typography variant="h5" fontWeight={600} mb={2} sx={{ color: "text.secondary" }}>
            Cancelled Bookings ({cancelledBookings.length})
          </Typography>
          <Grid container spacing={3}>
            {cancelledBookings.map((booking, index) => (
              <Grid item xs={12} md={6} key={booking.id}>
                <Fade
                  in={true}
                  timeout={600}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <Card
                    sx={{
                      height: "100%",
                      opacity: 0.7,
                      bgcolor: "action.disabledBackground",
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Stack spacing={2}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="flex-start"
                        >
                          <Box sx={{ flex: 1 }}>
                            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                              <HotelIcon color="disabled" />
                              <Typography variant="h6" fontWeight={700}>
                                {booking.hotel_name || "Hotel"}
                              </Typography>
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <BedIcon fontSize="small" color="disabled" />
                              <Typography variant="body1" color="text.secondary">
                                {booking.room_name || "Room"}
                              </Typography>
                            </Stack>
                          </Box>
                          <Chip
                            icon={getStatusIcon(booking.status)}
                            label={booking.status || "Cancelled"}
                            color={getStatusColor(booking.status)}
                            sx={{ fontWeight: 600 }}
                          />
                        </Stack>

                        <Divider />

                        <Stack direction="row" spacing={3}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Check-in
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {formatDate(booking.check_in)}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Check-out
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {formatDate(booking.check_out)}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Total
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              ₹{booking.total_price || 0}
                            </Typography>
                          </Box>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={handleCancelClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cancel Booking?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel your booking at{" "}
            <strong>{selectedBooking?.hotel_name}</strong>? This action cannot be undone.
          </DialogContentText>
          {selectedBooking && (
            <Box sx={{ mt: 2, p: 2, bgcolor: "action.hover", borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Room: {selectedBooking.room_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Dates: {formatDate(selectedBooking.check_in)} -{" "}
                {formatDate(selectedBooking.check_out)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total: ₹{selectedBooking.total_price}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCancelClose} disabled={cancelling}>
            Keep Booking
          </Button>
          <Button
            onClick={handleCancelConfirm}
            variant="contained"
            color="error"
            disabled={cancelling}
            startIcon={<CancelIcon />}
          >
            {cancelling ? "Cancelling..." : "Yes, Cancel Booking"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyBookings;

