import React, { useEffect, useState, useContext } from "react";
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
  CardMedia,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import StarIcon from "@mui/icons-material/Star";
import BedIcon from "@mui/icons-material/Bed";
import PeopleIcon from "@mui/icons-material/People";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import Loader from "../components/Loader";
import { AuthContext } from "../context/AuthContext";

const HotelDetail = () => {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const { user } = useContext(AuthContext);

  const [booking, setBooking] = useState({
    room: "",
    check_in: "",
    check_out: "",
    user_name: user?.username || "",
    user_email: user?.email || "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (user) {
      setBooking(prev => ({ ...prev, user_name: user.username, user_email: user.email }));
    }
  }, [user]);

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
        user_name: booking.user_name,
        user_email: booking.user_email,
      };
      const res = await api.post("/v1/bookings/", payload);
      setMessage("Booking confirmed! ID: " + res.data.id + ". Check your email for confirmation.");
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

  const hotelImages = hotel?.images || [];

  return (
    <Box>
      {hotel && (
        <Fade in={true} timeout={500}>
          <Box sx={{ mb: 4 }}>
            {/* Image Gallery Section */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={hotelImages.length > 0 ? 8 : 12}>
                <Card sx={{ borderRadius: 4, overflow: 'hidden', height: { xs: 300, md: 450 } }}>
                  {hotelImages.length > 0 ? (
                    <CardMedia
                      component="img"
                      image={hotelImages[activeImage].image_url}
                      sx={{ height: '100%', objectFit: 'cover' }}
                      alt={hotel.name}
                    />
                  ) : (
                    <Box sx={{
                      height: '100%',
                      background: "linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)",
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <PhotoLibraryIcon sx={{ fontSize: 100, color: 'white', opacity: 0.2 }} />
                    </Box>
                  )}
                </Card>
              </Grid>
              {hotelImages.length > 1 && (
                <Grid item xs={12} md={4}>
                  <Grid container spacing={2} sx={{ height: '100%' }}>
                    {hotelImages.slice(1, 5).map((img, idx) => (
                      <Grid item xs={6} key={img.id}>
                        <Card
                          sx={{
                            borderRadius: 3,
                            cursor: 'pointer',
                            height: { xs: 100, md: 215 },
                            position: 'relative',
                            border: activeImage === idx + 1 ? '3px solid #1976d2' : 'none',
                            '&:hover': { opacity: 0.8 }
                          }}
                          onClick={() => setActiveImage(idx + 1)}
                        >
                          <CardMedia
                            component="img"
                            image={img.image_url}
                            sx={{ height: '100%', objectFit: 'cover' }}
                          />
                        </Card>
                      </Grid>
                    ))}
                    {hotelImages.length > 5 && (
                      <Grid item xs={12}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<PhotoLibraryIcon />}
                          sx={{ borderRadius: 2 }}
                        >
                          View all {hotelImages.length} photos
                        </Button>
                      </Grid>
                    )}
                  </Grid>
                </Grid>
              )}
            </Grid>

            {/* Hotel Info Card */}
            <Card sx={{ borderRadius: 4, bgcolor: 'background.paper', boxShadow: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h3" fontWeight={800} gutterBottom sx={{ fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
                      {hotel.name}
                    </Typography>
                    <Stack direction="row" spacing={1.5} alignItems="center" mt={1} flexWrap="wrap">
                      <Chip
                        icon={<LocationOnIcon />}
                        label={hotel.city}
                        color="secondary"
                        size="medium"
                        sx={{ fontWeight: 600, borderRadius: 2 }}
                      />
                      <Typography variant="body1" color="text.secondary">
                        {hotel.address}
                      </Typography>
                    </Stack>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end', mb: 1 }}>
                      <StarIcon sx={{ color: '#ffc107', fontSize: 28 }} />
                      <Typography variant="h4" fontWeight={700}>{hotel.rating}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">Exceptional Service</Typography>
                  </Box>
                </Stack>
                <Typography variant="body1" color="text.secondary" mt={4} sx={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
                  {hotel.description || "Experience luxury and comfort in the heart of the city."}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Fade>
      )}

      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Typography variant="h5" fontWeight={700} mb={3} display="flex" alignItems="center" gap={1}>
            <BedIcon color="primary" /> Available Accommodations
          </Typography>
          <Stack spacing={3}>
            {rooms.map((room, index) => (
              <Fade in={true} timeout={600} key={room.id} style={{ transitionDelay: `${index * 100}ms` }}>
                <Card sx={{
                  borderRadius: 4,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  transition: '0.3s',
                  '&:hover': { boxShadow: 10, transform: 'translateY(-2px)' }
                }}>
                  <Box sx={{ width: { xs: '100%', sm: 220 }, height: { xs: 200, sm: 'auto' } }}>
                    {room.images && room.images.length > 0 ? (
                      <CardMedia
                        component="img"
                        image={room.images[0].image_url}
                        sx={{ height: '100%', objectFit: 'cover' }}
                        alt={room.room_name}
                      />
                    ) : (
                      <Box sx={{
                        height: '100%',
                        bgcolor: 'action.hover',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <BedIcon sx={{ fontSize: 50, color: 'text.disabled' }} />
                      </Box>
                    )}
                  </Box>
                  <CardContent sx={{ flex: 1, p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" mb={1}>
                      <Typography variant="h6" fontWeight={700}>{room.room_name}</Typography>
                      <Typography variant="h6" color="primary" fontWeight={700}>₹{room.price_per_night}<Typography component="span" variant="body2" color="text.secondary">/night</Typography></Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} mb={2}>
                      <Chip label={room.room_type} size="small" variant="outlined" />
                      <Chip icon={<PeopleIcon />} label={`${room.max_guests} Guests`} size="small" variant="outlined" />
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                      Amenities: {room.amenities || "Free Wi-Fi, AC, TV"}
                    </Typography>
                    <Button
                      variant="text"
                      color="primary"
                      onClick={() => setBooking(prev => ({ ...prev, room: room.id }))}
                      sx={{ mt: 2, fontWeight: 600, p: 0 }}
                    >
                      Select this room
                    </Button>
                  </CardContent>
                </Card>
              </Fade>
            ))}
          </Stack>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{
            borderRadius: 4,
            position: { xs: 'static', md: 'sticky' },
            top: 100,
            boxShadow: 8,
            border: '1px solid',
            borderColor: 'primary.light'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" fontWeight={800} mb={3}>Secure Booking</Typography>
              {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
              {message && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{message}</Alert>}

              <form onSubmit={handleBookingSubmit}>
                <Stack spacing={3}>
                  <TextField
                    label="Full Name"
                    name="user_name"
                    value={booking.user_name}
                    onChange={handleBookingChange}
                    fullWidth
                    required
                    variant="outlined"
                  />
                  <TextField
                    type="email"
                    label="Email Address"
                    name="user_email"
                    value={booking.user_email}
                    onChange={handleBookingChange}
                    fullWidth
                    required
                    helperText="OTP and confirmation will be sent here"
                  />
                  <FormControl fullWidth required>
                    <InputLabel>Select Suite/Room</InputLabel>
                    <Select
                      label="Select Suite/Room"
                      name="room"
                      value={booking.room}
                      onChange={handleBookingChange}
                    >
                      {rooms.map((room) => (
                        <MenuItem key={room.id} value={room.id}>
                          {room.room_name} (₹{room.price_per_night})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        type="date"
                        label="Check-in"
                        name="check_in"
                        value={booking.check_in}
                        onChange={handleBookingChange}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        required
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        type="date"
                        label="Check-out"
                        name="check_out"
                        value={booking.check_out}
                        onChange={handleBookingChange}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        required
                      />
                    </Grid>
                  </Grid>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={bookingLoading || rooms.length === 0}
                    fullWidth
                    sx={{ py: 2, borderRadius: 3, fontSize: '1.1rem', fontWeight: 700, mt: 2 }}
                  >
                    {bookingLoading ? "Reserving..." : "Complete Booking"}
                  </Button>
                </Stack>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HotelDetail;

