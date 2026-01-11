import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Fade,
  InputAdornment,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import StarIcon from "@mui/icons-material/Star";
import BedIcon from "@mui/icons-material/Bed";
import PeopleIcon from "@mui/icons-material/People";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import Loader from "../components/Loader";

const HotelDetail = () => {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [booking, setBooking] = useState({
    room: "",
    check_in: "",
    check_out: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchHotelAndRooms = async () => {
      try {
        setLoading(true);
        const hotelRes = await api.get(`/v1/hotels/${id}/`);
        setHotel(hotelRes.data);

        const roomsRes = await api.get(`/v1/hotels/${id}/rooms/`);
        const roomsData = roomsRes.data.results || roomsRes.data || [];
        setRooms(roomsData);
      } catch (err) {
        setError("Failed to load hotel or rooms");
      } finally {
        setLoading(false);
      }
    };
    fetchHotelAndRooms();
  }, [id]);

  const handleBookingChange = (e) => {
    setBooking((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setBookingLoading(true);
    try {
      const payload = {
        room: booking.room,
        check_in: booking.check_in,
        check_out: booking.check_out,
      };
      const res = await api.post("/v1/bookings/", payload);
      setMessage("Booking confirmed! ID: " + res.data.id);
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Booking failed");
      }
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return <Loader label="Loading hotel details..." />;
  }

  return (
    <Box>
      {hotel && (
        <Fade in={true} timeout={500}>
          <Card sx={{ mb: 4, overflow: "hidden" }}>
            <CardContent sx={{ p: 4 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    {hotel.name}
                  </Typography>
                  <Stack direction="row" spacing={1.5} alignItems="center" mt={1.5} flexWrap="wrap">
                    <Chip 
                      icon={<LocationOnIcon />}
                      label={hotel.city} 
                      color="secondary" 
                      size="medium"
                      sx={{ fontWeight: 600 }}
                    />
                    {hotel.address && (
                      <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        {hotel.address}
                      </Typography>
                    )}
                  </Stack>
                </Box>
                {hotel.rating && (
                  <Chip 
                    icon={<StarIcon />}
                    label={`${hotel.rating}`} 
                    color="primary" 
                    variant="outlined"
                    sx={{ 
                      fontWeight: 700,
                      fontSize: "1rem",
                      height: 40,
                    }}
                  />
                )}
              </Stack>
              <Typography variant="body1" color="text.secondary" mt={3} sx={{ lineHeight: 1.7 }}>
                {hotel.description || "No description provided."}
              </Typography>
            </CardContent>
          </Card>
        </Fade>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Fade in={true} timeout={600}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  Available Rooms
                </Typography>
                <Divider sx={{ mb: 3, mt: 1 }} />
                {rooms.length === 0 && (
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    No rooms found for this hotel.
                  </Alert>
                )}
                <Stack spacing={2.5}>
                  {rooms.map((room, index) => (
                    <Fade in={true} timeout={600} key={room.id} style={{ transitionDelay: `${index * 100}ms` }}>
                      <Box
                        sx={{
                          p: 3,
                          border: "2px solid",
                          borderColor: "divider",
                          borderRadius: 3,
                          transition: "all 0.3s ease",
                          "&:hover": {
                            borderColor: "primary.main",
                            bgcolor: "action.hover",
                            transform: "translateX(4px)",
                          },
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                          <Box sx={{ flex: 1 }}>
                            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                              <BedIcon color="primary" />
                              <Typography variant="h6" fontWeight={700}>
                                {room.room_name}
                              </Typography>
                            </Stack>
                            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                              <Chip 
                                label={room.room_type} 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                                sx={{ fontWeight: 600 }}
                              />
                              <Stack direction="row" spacing={0.5} alignItems="center">
                                <PeopleIcon fontSize="small" color="action" />
                                <Typography variant="body2" color="text.secondary">
                                  {room.max_guests} guests
                                </Typography>
                              </Stack>
                            </Stack>
                            {room.amenities && (
                              <Typography variant="body2" color="text.secondary" mt={1.5} sx={{ fontStyle: "italic" }}>
                                ✨ {room.amenities}
                              </Typography>
                            )}
                          </Box>
                          <Typography variant="h5" color="primary" fontWeight={700}>
                            ₹{room.price_per_night}
                            <Typography component="span" variant="body2" color="text.secondary">
                              /night
                            </Typography>
                          </Typography>
                        </Stack>
                      </Box>
                    </Fade>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Fade>
        </Grid>

        <Grid item xs={12} md={5}>
          <Fade in={true} timeout={800}>
            <Card sx={{ position: { xs: 'static', md: 'sticky' }, top: { md: 100 }, }} className="booking-sticky">
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                  <BookOnlineIcon color="primary" />
                  <Typography variant="h5" fontWeight={700}>
                    Book a Room
                  </Typography>
                </Stack>
                <Divider sx={{ mb: 3 }} />
                {error && (
                  <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}
                {message && (
                  <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                    {message}
                  </Alert>
                )}
                <form onSubmit={handleBookingSubmit}>
                  <Stack spacing={2.5}>
                    <FormControl fullWidth required>
                      <InputLabel id="room-label">Select Room</InputLabel>
                      <Select
                        labelId="room-label"
                        label="Select Room"
                        name="room"
                        value={booking.room}
                        onChange={handleBookingChange}
                        sx={{
                          borderRadius: 2,
                        }}
                      >
                        {rooms.map((room) => (
                          <MenuItem key={room.id} value={room.id}>
                            {room.room_name} ({room.room_type}) - ₹{room.price_per_night}/night
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      type="date"
                      label="Check-in Date"
                      name="check_in"
                      value={booking.check_in}
                      onChange={handleBookingChange}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarTodayIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                      fullWidth
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    />
                    <TextField
                      type="date"
                      label="Check-out Date"
                      name="check_out"
                      value={booking.check_out}
                      onChange={handleBookingChange}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarTodayIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                      fullWidth
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={bookingLoading || rooms.length === 0}
                      fullWidth
                      startIcon={<BookOnlineIcon />}
                      sx={{
                        py: 1.5,
                        mt: 1,
                        fontSize: "1rem",
                        fontWeight: 600,
                      }}
                    >
                      {bookingLoading ? "Processing..." : "Confirm Booking"}
                    </Button>
                  </Stack>
                </form>
              </CardContent>
            </Card>
          </Fade>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HotelDetail;
