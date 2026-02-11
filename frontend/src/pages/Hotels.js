import React, { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
  CardMedia,
  Fade,
} from "@mui/material";
import HotelIcon from "@mui/icons-material/Hotel";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import api from "../api/axios";
import Loader from "../components/Loader";
import ImageSlider from "../components/ImageSlider";

const Hotels = () => {
  const [hotels, setHotels] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get("/v1/hotels/");
        let data = [];
        if (res.data && Array.isArray(res.data.results)) {
          data = res.data.results;
        } else if (Array.isArray(res.data)) {
          data = res.data;
        }
        setHotels(data || []);
      } catch (err) {
        const errorMessage =
          err.response?.data?.detail ||
          err.response?.data?.message ||
          (err.response?.status === 401
            ? "Please login again"
            : "Failed to load hotels");
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, []);

  if (loading) {
    return <Loader label="Loading hotels..." />;
  }

  return (
    <Box>
      <Fade in={true} timeout={500}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Discover Hotels
            </Typography>
            <Typography color="text.secondary" variant="body1">
              Browse and pick the perfect stay for your trip
            </Typography>
          </Box>
        </Stack>
      </Fade>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {hotels.length === 0 && !error && (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          No hotels available right now.
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {hotels.map((hotel, index) => (
          <Grid item xs={12} sm={6} md={4} key={hotel.id}>
            <Fade in={true} timeout={600} style={{ transitionDelay: `${index * 100}ms` }}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  position: 'relative',
                  '&:after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    backgroundColor: 'primary.main',
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                  },
                  '&:hover:after': {
                    opacity: 1,
                  }
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <ImageSlider
                    images={hotel.images}
                    height={220}
                    altText={hotel.name}
                  />
                  <Box sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    zIndex: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}>
                    <Chip
                      icon={<LocationOnIcon sx={{ fontSize: '1rem !important' }} />}
                      label={hotel.city}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(4px)',
                        fontWeight: 700,
                        color: 'secondary.main',
                        '& .MuiChip-icon': { color: 'primary.main' }
                      }}
                    />
                  </Box>
                </Box>
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography variant="h5" gutterBottom sx={{
                    fontSize: '1.25rem',
                    mb: 1.5,
                    color: 'text.primary'
                  }}>
                    {hotel.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      minHeight: "3em",
                      lineHeight: 1.6,
                      fontSize: '0.9rem'
                    }}
                  >
                    {hotel.description || "Experience the perfect blend of luxury and convenience at our premier location."}
                  </Typography>
                </CardContent>
                <CardActions sx={{ px: 3, pb: 3, pt: 0 }}>
                  <Button
                    variant="contained"
                    component={RouterLink}
                    to={`/hotels/${hotel.id}`}
                    fullWidth
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      py: 1.5,
                      fontWeight: 800,
                      borderRadius: 3,
                      fontSize: '1rem',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                      '&:hover': {
                        transform: 'translateX(4px)',
                      }
                    }}
                  >
                    Explore Rooms
                  </Button>
                </CardActions>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Hotels;
