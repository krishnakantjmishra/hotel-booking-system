import React, { useEffect, useState, useContext, useCallback } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Fade,
  Grid,
  Stack,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import StarIcon from "@mui/icons-material/Star";
import BedIcon from "@mui/icons-material/Bed";
import PeopleIcon from "@mui/icons-material/People";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import SearchIcon from "@mui/icons-material/Search";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import Loader from "../components/Loader";
import ImageSlider from "../components/ImageSlider";
import { AuthContext } from "../context/AuthContext";

const HotelDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searched, setSearched] = useState(false);

  // Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);

  // Get today and tomorrow as default dates
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [searchParams, setSearchParams] = useState({
    check_in: formatDate(today),
    check_out: formatDate(tomorrow),
    adults: 1,
    children: 0,
  });

  const [booking, setBooking] = useState({
    check_in: formatDate(today),
    check_out: formatDate(tomorrow),
    guests: 1,
    adults: 1,
    children: 0,
    email: user?.email || "",
    full_name: user?.username || "",
  });

  useEffect(() => {
    if (user) {
      setBooking((prev) => ({
        ...prev,
        email: user.email || "",
        full_name: user.username || "",
      }));
    }
  }, [user]);

  const fetchRooms = useCallback(async (checkIn, checkOut) => {
    try {
      const params = {};
      if (checkIn && checkOut) {
        params.check_in = checkIn;
        params.check_out = checkOut;
      }
      const roomsRes = await api.get(`/v1/hotels/${id}/rooms/`, { params });
      const roomsData = roomsRes.data.results || roomsRes.data || [];
      setRooms(roomsData);
    } catch (err) {
      console.error("Failed to load rooms", err);
    }
  }, [id]);

  useEffect(() => {
    const fetchHotelData = async () => {
      try {
        setLoading(true);
        const hotelRes = await api.get(`/v1/hotels/${id}/`);
        setHotel(hotelRes.data);

        // Automatically fetch rooms with default dates (today to tomorrow)
        await fetchRooms(searchParams.check_in, searchParams.check_out);
        setSearched(true);
      } catch (err) {
        console.error("Failed to load hotel", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHotelData();
  }, [id, fetchRooms, searchParams.check_in, searchParams.check_out]);

  const handleSearch = () => {
    fetchRooms(searchParams.check_in, searchParams.check_out);
    setSearched(true);
    setBooking(prev => ({
      ...prev,
      check_in: searchParams.check_in,
      check_out: searchParams.check_out,
    }));
  };

  const handleBooking = (room, pkg) => {
    setSelectedRoom(room);
    setSelectedPackage(pkg);
    setBooking(prev => ({ ...prev, adults: 1, children: 0 }));
    setOpenDialog(true);
  };

  const confirmBooking = async () => {
    if (!booking.full_name || !booking.email) {
      alert("Please provide your name and email to continue.");
      return;
    }

    try {
      const bookingData = {
        room: selectedRoom.id,
        package: selectedPackage?.id || null, // Optional
        check_in: booking.check_in,
        check_out: booking.check_out,
        user_name: booking.full_name,
        user_email: booking.email,
        num_adults: parseInt(booking.adults) || 1,
        num_children: parseInt(booking.children) || 0,
      };

      const res = await api.post("/v1/bookings/", bookingData);
      setOpenDialog(false);
      alert(`Booking successful! Confirmation ID: ${res.data.id}\nPlease check your email for details.`);

      // Reset booking form if it was a guest booking
      if (!user) {
        setBooking(prev => ({ ...prev, full_name: "", email: "" }));
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Booking failed. Please try again.";
      alert(errorMsg);
    }
  };

  if (loading) {
    return <Loader label="Loading hotel details..." />;
  }

  return (
    <Box>
      {hotel && (
        <Fade in={true} timeout={500}>
          <Box sx={{ mb: 3 }}>
            {/* Hotel Info Card */}
            <Card sx={{ borderRadius: 2, bgcolor: 'background.paper', boxShadow: 2, mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                      {hotel.name}
                    </Typography>
                    <Stack direction="row" spacing={1.5} alignItems="center" mt={1} flexWrap="wrap">
                      <Chip
                        icon={<LocationOnIcon />}
                        label={hotel.city}
                        color="secondary"
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {hotel.address}
                      </Typography>
                    </Stack>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end', mb: 0.5 }}>
                      <StarIcon sx={{ color: '#ffc107', fontSize: 20 }} />
                      <Typography variant="h6" fontWeight={700}>{hotel.rating}</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">Exceptional</Typography>
                  </Box>
                </Stack>
                <Typography variant="body2" color="text.secondary" mt={2} sx={{ lineHeight: 1.6 }}>
                  {hotel.description || "Experience luxury and comfort in the heart of the city."}
                </Typography>
              </CardContent>
            </Card>

            {/* Search Card */}
            <Card sx={{
              borderRadius: 3,
              bgcolor: 'background.paper',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={2} display="flex" alignItems="center" gap={1} color="primary.main">
                  <SearchIcon /> Search Available Rooms
                </Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label="Check-in"
                      type="date"
                      value={searchParams.check_in}
                      onChange={(e) => setSearchParams(prev => ({ ...prev, check_in: e.target.value }))}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label="Check-out"
                      type="date"
                      value={searchParams.check_out}
                      onChange={(e) => setSearchParams(prev => ({ ...prev, check_out: e.target.value }))}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      label="Adults"
                      type="number"
                      value={searchParams.adults}
                      onChange={(e) => setSearchParams(prev => ({ ...prev, adults: parseInt(e.target.value) }))}
                      fullWidth
                      inputProps={{ min: 1 }}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      label="Children"
                      type="number"
                      value={searchParams.children}
                      onChange={(e) => setSearchParams(prev => ({ ...prev, children: parseInt(e.target.value) }))}
                      fullWidth
                      inputProps={{ min: 0 }}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handleSearch}
                      sx={{
                        py: 1,
                        fontWeight: 700,
                        height: '40px'
                      }}
                      startIcon={<SearchIcon />}
                    >
                      Search
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        </Fade>
      )}

      {/* Room Listings */}
      <Box>
        <Typography variant="h5" fontWeight={700} mb={2} display="flex" alignItems="center" gap={1}>
          <BedIcon color="primary" /> Available Accommodations
        </Typography>

        {!searched ? (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            <Typography variant="body1" fontWeight={600}>Select dates above to view available rooms and packages</Typography>
          </Alert>
        ) : rooms.length === 0 ? (
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            <Typography variant="body1" fontWeight={600}>No rooms available</Typography>
            <Typography variant="body2">
              We couldn't find any rooms available for the selected dates. Try changing your dates.
            </Typography>
          </Alert>
        ) : (
          <Stack spacing={3}>
            {rooms.map((room, index) => (
              <Fade in={true} timeout={600} key={room.id} style={{ transitionDelay: `${index * 100}ms` }}>
                <Card sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 2 }}>
                  <Grid container>
                    <Grid item xs={12} md={4}>
                      <ImageSlider images={room.images} height={250} altText={room.room_name} />
                    </Grid>
                    <Grid item xs={12} md={8}>
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="h5" fontWeight={700} gutterBottom>
                          {room.room_name}
                        </Typography>
                        <Stack direction="row" spacing={2} mb={2} flexWrap="wrap">
                          <Chip icon={<PeopleIcon />} label={`Up to ${room.max_guests} Guests`} size="small" />
                          <Chip icon={<BedIcon />} label={room.bed_type} size="small" />
                        </Stack>

                        {/* Packages */}
                        {room.packages && room.packages.length > 0 ? (
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600} color="primary" mb={1}>
                              Available Packages:
                            </Typography>
                            <Stack spacing={2}>
                              {room.packages.map((pkg) => (
                                <Card key={pkg.id} variant="outlined" sx={{ borderRadius: 1, p: 2 }}>
                                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Box>
                                      <Typography variant="h6" fontWeight={700}>
                                        {pkg.name}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        {pkg.description}
                                      </Typography>
                                      {pkg.includes_meals && <Chip label="Meals Included" size="small" sx={{ mt: 1, mr: 1 }} />}
                                      {pkg.includes_activities && <Chip label="Activities" size="small" sx={{ mt: 1 }} />}
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                      <Typography variant="h5" fontWeight={800} color="primary">
                                        ₹{pkg.final_price}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">per night</Typography>
                                      <Button
                                        variant="contained"
                                        size="small"
                                        fullWidth
                                        sx={{ mt: 1, fontWeight: 700 }}
                                        startIcon={<BookOnlineIcon />}
                                        onClick={() => handleBooking(room, pkg)}
                                      >
                                        Book Now
                                      </Button>
                                    </Box>
                                  </Stack>
                                </Card>
                              ))}
                            </Stack>
                          </Box>
                        ) : (
                          <Alert severity="info" sx={{ mt: 2 }}>
                            No packages available for this room during selected dates.
                          </Alert>
                        )}
                      </CardContent>
                    </Grid>
                  </Grid>
                </Card>
              </Fade>
            ))}
          </Stack>
        )}
      </Box>

      {/* Booking Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle variant="h6" fontWeight={700}>
          Confirm Your Booking
        </DialogTitle>
        <DialogContent dividers>
          {selectedRoom && selectedPackage && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                {selectedRoom.room_name} - {selectedPackage.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Dates: {booking.check_in} to {booking.check_out}
              </Typography>
              <Typography variant="h6" color="primary" fontWeight={700}>
                Total Price: ₹{selectedPackage.final_price} <Typography component="span" variant="caption" color="text.secondary">via {selectedPackage.duration_nights} night(s)</Typography>
              </Typography>
            </Box>
          )}

          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            Guest Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Full Name"
                fullWidth
                required
                value={booking.full_name}
                onChange={(e) => setBooking(prev => ({ ...prev, full_name: e.target.value }))}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Email Address"
                type="email"
                fullWidth
                required
                value={booking.email}
                onChange={(e) => setBooking(prev => ({ ...prev, email: e.target.value }))}
                size="small"
                helperText="We'll send your booking confirmation here."
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Adults"
                type="number"
                fullWidth
                value={booking.adults || ""}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  if (selectedRoom && val > (selectedRoom.max_adults || 5)) return;
                  setBooking(prev => ({ ...prev, adults: val }));
                }}
                size="small"
                inputProps={{ min: 1, max: selectedRoom?.max_adults || 5 }}
                helperText={`Max: ${selectedRoom?.max_adults || "N/A"}`}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Children"
                type="number"
                fullWidth
                value={booking.children || ""}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  if (selectedRoom && val > (selectedRoom.max_children || 5)) return;
                  setBooking(prev => ({ ...prev, children: val }));
                }}
                size="small"
                inputProps={{ min: 0, max: selectedRoom?.max_children || 5 }}
                helperText={`Max: ${selectedRoom?.max_children || "N/A"}`}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={confirmBooking} variant="contained" disabled={!booking.full_name || !booking.email}>
            Confirm & Book
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HotelDetail;
