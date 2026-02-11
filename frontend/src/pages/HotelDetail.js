import React, { useEffect, useState, useContext, useRef } from "react";
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
import ImageSlider from "../components/ImageSlider";
import { AuthContext } from "../context/AuthContext";

const HotelDetail = () => {
  const today = new Date().toISOString().split('T')[0];
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
    adults: 1,
    children: 0,
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const messageRef = useRef(null);

  useEffect(() => {
    if (error || message) {
      messageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [error, message]);

  useEffect(() => {
    if (user) {
      setBooking(prev => ({ ...prev, user_name: user.username, user_email: user.email }));
    }
  }, [user]);

  const fetchRooms = async (checkIn, checkOut) => {
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
  };

  useEffect(() => {
    const fetchHotelData = async () => {
      try {
        setLoading(true);
        const hotelRes = await api.get(`/v1/hotels/${id}/`);
        setHotel(hotelRes.data);
      } catch (err) {
        setError("Failed to load hotel details");
      } finally {
        setLoading(false);
      }
    };
    fetchHotelData();
  }, [id]);

  useEffect(() => {
    fetchRooms(booking.check_in, booking.check_out);
  }, [id, booking.check_in, booking.check_out]);

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
        num_adults: booking.adults,
        num_children: booking.children,
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
            {rooms.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 4, py: 3 }}>
                <Typography variant="h6" fontWeight={700}>No rooms available</Typography>
                <Typography variant="body2">
                  We couldn't find any rooms available for the selected dates.
                  Try changing your check-in or check-out dates.
                </Typography>
              </Alert>
            ) : (
              rooms.map((room, index) => (
                <Fade in={true} timeout={600} key={room.id} style={{ transitionDelay: `${index * 100}ms` }}>
                  <Card sx={{
                    borderRadius: 5,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    bgcolor: 'background.paper',
                    mb: 3,
                    '&:hover': {
                      '& .room-image-slider': {
                        transform: 'scale(1.02)',
                      }
                    }
                  }}>
                    <Box className="room-image-slider" sx={{
                      width: { xs: '100%', sm: 260 },
                      height: { xs: 220, sm: 'auto' },
                      transition: 'transform 0.5s ease',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <ImageSlider
                        images={room.images}
                        height="100%"
                        altText={room.room_name}
                      />
                      {room.room_type && (
                        <Chip
                          label={room.room_type}
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 12,
                            left: 12,
                            zIndex: 2,
                            bgcolor: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(4px)',
                            fontWeight: 700,
                            fontSize: '0.75rem'
                          }}
                        />
                      )}
                    </Box>
                    <CardContent sx={{ flex: 1, p: { xs: 3, md: 4 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>{room.room_name}</Typography>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <PeopleIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary" fontWeight={600}>
                              Up to {room.max_adults || 2} Guests
                            </Typography>
                          </Stack>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="h4" color="primary" sx={{ fontWeight: 800, lineHeight: 1 }}>
                            ₹{room.price_per_night}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            per night
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Typography variant="caption" sx={{
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                          fontWeight: 700,
                          color: 'primary.main',
                          display: 'block',
                          mb: 1
                        }}>
                          In-room Amenities
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
                          {(room.amenities || "Free Wi-Fi, AC, TV").split(',').map((amenity, i) => (
                            <Chip
                              key={i}
                              label={amenity.trim()}
                              variant="outlined"
                              size="small"
                              sx={{ borderRadius: 2, fontSize: '0.7rem', height: 24 }}
                            />
                          ))}
                        </Stack>
                      </Box>

                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<BookOnlineIcon />}
                        onClick={() => {
                          setBooking(prev => ({ ...prev, room: room.id }));
                          const formElement = document.getElementById('booking-form');
                          if (formElement) {
                            formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }
                        }}
                        sx={{
                          py: 1.5,
                          borderRadius: 3,
                          fontWeight: 800,
                          fontSize: '1rem',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            bgcolor: 'primary.dark',
                            transform: 'scale(1.01)',
                          }
                        }}
                      >
                        Book this Room
                      </Button>
                    </CardContent>
                  </Card>
                </Fade>
              ))
            )}
          </Stack>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card
            id="booking-form"
            sx={{
              borderRadius: 5,
              position: { xs: 'static', md: 'sticky' },
              top: 100,
              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden'
            }}>
            <Box sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              p: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}>
              <BookOnlineIcon />
              <Typography variant="h6" fontWeight={800}>Secure Booking</Typography>
            </Box>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Box ref={messageRef}>
                {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 3, fontWeight: 600 }}>{error}</Alert>}
                {message && <Alert severity="success" sx={{ mb: 3, borderRadius: 3, fontWeight: 600 }}>{message}</Alert>}
              </Box>

              <form onSubmit={handleBookingSubmit}>
                <Stack spacing={2.5}>
                  <TextField
                    label="Full Name"
                    name="user_name"
                    value={booking.user_name}
                    onChange={handleBookingChange}
                    fullWidth
                    required
                  />
                  <TextField
                    type="email"
                    label="Email Address"
                    name="user_email"
                    value={booking.user_email}
                    onChange={handleBookingChange}
                    fullWidth
                    required
                    helperText="Booking confirmation will be sent here"
                  />

                  {booking.room ? (
                    <Box sx={{
                      p: 2.5,
                      bgcolor: 'primary.50',
                      borderRadius: 4,
                      border: '2px dashed',
                      borderColor: 'primary.light',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'primary.main', display: 'block', fontWeight: 800, textTransform: 'uppercase', mb: 0.5 }}>Selected Room</Typography>
                        <Typography variant="body1" fontWeight={800} color="text.primary">
                          {rooms.find(r => r.id === booking.room)?.room_name || "Room selected"}
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        onClick={() => setBooking(prev => ({ ...prev, room: "" }))}
                        sx={{
                          fontWeight: 700,
                          textTransform: 'none',
                          minWidth: 'auto',
                          bgcolor: 'white',
                          color: 'primary.main',
                          '&:hover': { bgcolor: '#f1f5f9' }
                        }}
                      >
                        Change
                      </Button>
                    </Box>
                  ) : (
                    <FormControl fullWidth required>
                      <InputLabel>Select Suite/Room</InputLabel>
                      <Select
                        label="Select Suite/Room"
                        name="room"
                        value={booking.room}
                        onChange={handleBookingChange}
                        sx={{ borderRadius: 3 }}
                      >
                        {rooms.map((room) => (
                          <MenuItem key={room.id} value={room.id}>
                            {room.room_name} (₹{room.price_per_night})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <FormControl fullWidth>
                        <InputLabel>Adults</InputLabel>
                        <Select
                          name="adults"
                          value={booking.adults}
                          onChange={handleBookingChange}
                          label="Adults"
                        >
                          {[...Array(Math.max(1, (booking.room ? rooms.find(r => r.id === booking.room)?.max_adults : 10) || 1)).keys()].map(n => (
                            <MenuItem key={n + 1} value={n + 1}>{n + 1}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl fullWidth>
                        <InputLabel>Children</InputLabel>
                        <Select
                          name="children"
                          value={booking.children}
                          onChange={handleBookingChange}
                          label="Children"
                        >
                          {[...Array((booking.room ? rooms.find(r => r.id === booking.room)?.max_children : 10) + 1 || 1).keys()].map(n => (
                            <MenuItem key={n} value={n}>{n}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>

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
                        inputProps={{ min: today }}
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
                        inputProps={{ min: booking.check_in || today }}
                      />
                    </Grid>
                  </Grid>

                  {booking.room && booking.check_in && booking.check_out && (
                    <Box sx={{
                      p: 3,
                      bgcolor: 'grey.50',
                      borderRadius: 4,
                      mt: 1,
                      border: '1px solid',
                      borderColor: 'divider'
                    }}>
                      {(() => {
                        const start = new Date(booking.check_in);
                        const end = new Date(booking.check_out);
                        const diffTime = end - start;
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        const room = rooms.find(r => r.id === booking.room);
                        const price = room?.price_per_night || 0;

                        if (diffDays > 0) {
                          return (
                            <Stack spacing={1.5}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                  {diffDays} night(s) x ₹{price}
                                </Typography>
                                <Typography variant="body2" fontWeight={700}>₹{diffDays * price}</Typography>
                              </Box>
                              <Divider sx={{ borderStyle: 'dashed' }} />
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="subtitle1" fontWeight={800}>Total Amount</Typography>
                                <Typography variant="h5" color="primary" fontWeight={900}>₹{diffDays * price}</Typography>
                              </Box>
                            </Stack>
                          );
                        }
                        return <Typography variant="body2" color="error" fontWeight={600}>Invalid dates selected</Typography>;
                      })()}
                    </Box>
                  )}
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={bookingLoading || rooms.length === 0}
                    fullWidth
                    sx={{
                      py: 2,
                      borderRadius: 4,
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      mt: 2,
                      boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.4)',
                    }}
                  >
                    {bookingLoading ? "Reserving..." : "Confirm My Stay"}
                  </Button>
                  <Typography variant="caption" textAlign="center" color="text.secondary" sx={{ display: 'block', mt: 1, fontWeight: 500 }}>
                    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                      🛡️ Secure SSL Encrypted Booking
                    </Box>
                  </Typography>
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

