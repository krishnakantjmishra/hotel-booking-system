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
                  overflow: "hidden",
                }}
              >
                {hotel.images && hotel.images.length > 0 ? (
                  <CardMedia
                    component="img"
                    height="180"
                    image={hotel.images[0].image_url}
                    sx={{ objectFit: "cover" }}
                    alt={hotel.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/400x180?text=No+Image";
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 180,
                      bgcolor: "primary.light",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)",
                    }}
                  >
                    <HotelIcon sx={{ fontSize: 80, color: "white", opacity: 0.3 }} />
                  </Box>
                )}
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                    <Typography variant="h6" fontWeight={700} sx={{ flex: 1, pr: 1 }}>
                      {hotel.name}
                    </Typography>
                    <Chip
                      icon={<LocationOnIcon />}
                      label={hotel.city}
                      size="small"
                      color="secondary"
                      sx={{ fontWeight: 600 }}
                    />
                  </Stack>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      minHeight: "2.5em",
                    }}
                  >
                    {hotel.description || "No description provided."}
                  </Typography>
                </CardContent>
                <CardActions sx={{ px: 3, pb: 3 }}>
                  <Button
                    size="medium"
                    variant="contained"
                    component={RouterLink}
                    to={`/hotels/${hotel.id}`}
                    fullWidth
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      py: 1.2,
                    }}
                  >
                    View Rooms
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
