import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  IconButton,
  Divider,
  Fade,
  InputAdornment,
  Alert,
  Collapse,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import HotelIcon from "@mui/icons-material/Hotel";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import StarIcon from "@mui/icons-material/Star";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import api from "../api/axios";
import ImageManager from "../components/ImageManager";

const AdminHotels = () => {
  const [hotels, setHotels] = useState([]);
  const [form, setForm] = useState({ name: "", city: "", address: "", rating: "", price_min: "" });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [expandedHotel, setExpandedHotel] = useState(null);

  const fetchHotels = async () => {
    try {
      const res = await api.get("/admin-api/hotels/");
      setHotels(res.data.results || res.data);
    } catch (err) {
      console.error("Failed to load hotels", err);
      setError("Failed to load hotels");
    }
  };

  useEffect(() => { fetchHotels(); }, []);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleEdit = (hotel) => {
    setEditingId(hotel.id);
    setForm({ name: hotel.name, city: hotel.city, address: hotel.address || "", rating: hotel.rating || "", price_min: hotel.price_min || "" });
    setShowForm(true);
    setExpandedHotel(null);
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({ name: "", city: "", address: "", rating: "", price_min: "" });
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const payload = {
        ...form,
        rating: parseFloat(form.rating) || 0,
        price_min: parseFloat(form.price_min) || 0,
      };
      if (editingId) {
        await api.put(`/admin-api/hotels/${editingId}/`, payload);
        setSuccess("Hotel updated successfully!");
      } else {
        await api.post("/admin-api/hotels/", payload);
        setSuccess("Hotel created successfully!");
      }
      setForm({ name: "", city: "", address: "", rating: "", price_min: "" });
      setEditingId(null);
      setShowForm(false);
      fetchHotels();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || "Failed to save hotel");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this hotel?")) return;
    try {
      await api.delete(`/admin-api/hotels/${id}/`);
      if (editingId === id) handleCancel();
      setSuccess("Hotel deleted successfully!");
      fetchHotels();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete hotel");
    }
  };

  const toggleExpand = (id) => {
    setExpandedHotel(expandedHotel === id ? null : id);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Hotels Management
        </Typography>
        {!showForm && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowForm(true)}
            sx={{ borderRadius: 2 }}
          >
            Add Hotel
          </Button>
        )}
      </Box>

      {/* Alerts */}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      {/* Form */}
      {showForm && (
        <Fade in={showForm}>
          <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              {editingId ? "Edit Hotel" : "Add New Hotel"}
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Hotel Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    fullWidth
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <HotelIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="City"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    fullWidth
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOnIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Rating"
                    name="rating"
                    value={form.rating}
                    onChange={handleChange}
                    type="number"
                    fullWidth
                    inputProps={{ min: 0, max: 5, step: 0.1 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <StarIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    helperText="Rating from 0 to 5"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Minimum Price (₹)"
                    name="price_min"
                    value={form.price_min}
                    onChange={handleChange}
                    type="number"
                    fullWidth
                    inputProps={{ min: 0 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CurrencyRupeeIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    helperText="Minimum price per night"
                  />
                </Grid>
              </Grid>
              <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                <Button type="submit" variant="contained" size="large" sx={{ px: 4 }}>
                  {editingId ? "Update Hotel" : "Create Hotel"}
                </Button>
                <Button variant="outlined" size="large" onClick={handleCancel}>
                  Cancel
                </Button>
              </Box>
            </Box>
          </Paper>
        </Fade>
      )}

      {/* Hotels List */}
      {hotels.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
          <HotelIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No hotels found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Click "Add Hotel" to create your first hotel.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {hotels.map((hotel) => (
            <Grid item xs={12} key={hotel.id}>
              <Fade in={true}>
                <Card sx={{
                  borderRadius: 3,
                  transition: "all 0.3s ease",
                  overflow: "hidden",
                  "&:hover": {
                    boxShadow: 6,
                  }
                }}>
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={4}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          {hotel.name}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                          <LocationOnIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {hotel.city}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                          <Chip
                            icon={<StarIcon />}
                            label={`${hotel.rating || 0}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          <Chip
                            icon={<CurrencyRupeeIcon />}
                            label={`${hotel.price_min || 0}`}
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={5}>
                        <Typography variant="body2" color="text.secondary" sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}>
                          {hotel.address || "No address provided."}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                          <Button
                            variant="outlined"
                            startIcon={expandedHotel === hotel.id ? <ExpandLessIcon /> : <PhotoLibraryIcon />}
                            size="small"
                            onClick={() => toggleExpand(hotel.id)}
                            color={expandedHotel === hotel.id ? "secondary" : "primary"}
                          >
                            Images
                          </Button>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEdit(hotel)}
                            title="Edit"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(hotel.id)}
                            title="Delete"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Grid>
                    </Grid>

                    <Collapse in={expandedHotel === hotel.id}>
                      <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid #eee" }}>
                        <ImageManager type="hotel" id={hotel.id} onUpdate={fetchHotels} />
                      </Box>
                    </Collapse>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default AdminHotels;


