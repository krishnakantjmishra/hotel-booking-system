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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Collapse,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BedIcon from "@mui/icons-material/Bed";
import HotelIcon from "@mui/icons-material/Hotel";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import api from "../api/axios";
import ImageManager from "../components/ImageManager";

const AdminRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [form, setForm] = useState({ hotel: "", room_name: "", price_per_night: "", total_rooms: "1", max_adults: "2", max_children: "1" });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [expandedRoom, setExpandedRoom] = useState(null);

  const fetchRooms = async () => {
    try {
      const res = await api.get("/admin-api/rooms/");
      setRooms(res.data.results || res.data);
    } catch (err) {
      console.error("Failed to load rooms", err);
      setError("Failed to load rooms");
    }
  };

  const fetchHotels = async () => {
    try {
      const res = await api.get("/v1/hotels/");
      setHotels(res.data.results || res.data);
    } catch (err) {
      console.error("Failed to load hotels", err);
    }
  };

  useEffect(() => { fetchRooms(); fetchHotels(); }, []);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleEdit = (room) => {
    setEditingId(room.id);
    setForm({
      hotel: room.hotel,
      room_name: room.room_name,
      price_per_night: room.price_per_night || "",
      total_rooms: room.total_rooms || "1",
      max_adults: room.max_adults || "2",
      max_children: room.max_children || "1"
    });
    setShowForm(true);
    setExpandedRoom(null);
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({ hotel: "", room_name: "", price_per_night: "", total_rooms: "1", max_adults: "2", max_children: "1" });
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const payload = {
        ...form,
        price_per_night: parseFloat(form.price_per_night) || 0,
        total_rooms: parseInt(form.total_rooms) || 1,
        max_adults: parseInt(form.max_adults) || 2,
        max_children: parseInt(form.max_children) || 1,
      };
      if (editingId) {
        await api.put(`/admin-api/rooms/${editingId}/`, payload);
        setSuccess("Room updated successfully!");
      } else {
        await api.post("/admin-api/rooms/", payload);
        setSuccess("Room created successfully!");
      }
      setForm({ hotel: "", room_name: "", price_per_night: "", total_rooms: "1", max_adults: "2", max_children: "1" });
      setEditingId(null);
      setShowForm(false);
      fetchRooms();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || "Failed to save room");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;
    try {
      await api.delete(`/admin-api/rooms/${id}/`);
      if (editingId === id) handleCancel();
      setSuccess("Room deleted successfully!");
      fetchRooms();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete room");
    }
  };

  const getHotelName = (hotelId) => {
    const hotel = hotels.find(h => h.id === hotelId);
    return hotel ? hotel.name : "Unknown Hotel";
  };

  const toggleExpand = (id) => {
    setExpandedRoom(expandedRoom === id ? null : id);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Rooms Management
        </Typography>
        {!showForm && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowForm(true)}
            sx={{ borderRadius: 2 }}
          >
            Add Room
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
              {editingId ? "Edit Room" : "Add New Room"}
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Select Hotel</InputLabel>
                    <Select
                      name="hotel"
                      value={form.hotel}
                      onChange={handleChange}
                      label="Select Hotel"
                      startAdornment={
                        <InputAdornment position="start">
                          <HotelIcon color="action" />
                        </InputAdornment>
                      }
                    >
                      {hotels.map(h => (
                        <MenuItem key={h.id} value={h.id}>{h.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Room Name"
                    name="room_name"
                    value={form.room_name}
                    onChange={handleChange}
                    fullWidth
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BedIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Price per Night (₹)"
                    name="price_per_night"
                    value={form.price_per_night}
                    onChange={handleChange}
                    type="number"
                    fullWidth
                    required
                    inputProps={{ min: 0 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CurrencyRupeeIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Total Rooms Available"
                    name="total_rooms"
                    value={form.total_rooms}
                    onChange={handleChange}
                    type="number"
                    fullWidth
                    inputProps={{ min: 1 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MeetingRoomIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Max Adults"
                    name="max_adults"
                    value={form.max_adults}
                    onChange={handleChange}
                    type="number"
                    fullWidth
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Max Children"
                    name="max_children"
                    value={form.max_children}
                    onChange={handleChange}
                    type="number"
                    fullWidth
                    inputProps={{ min: 0 }}
                  />
                </Grid>
              </Grid>
              <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                <Button type="submit" variant="contained" size="large" sx={{ px: 4 }}>
                  {editingId ? "Update Room" : "Create Room"}
                </Button>
                <Button variant="outlined" size="large" onClick={handleCancel}>
                  Cancel
                </Button>
              </Box>
            </Box>
          </Paper>
        </Fade>
      )}

      {/* Rooms List */}
      {rooms.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
          <BedIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No rooms found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Click "Add Room" to create your first room.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {rooms.map((room) => (
            <Grid item xs={12} key={room.id}>
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
                          {room.room_name}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                          <HotelIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {room.hotel_name || getHotelName(room.hotel)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                          <Chip
                            icon={<CurrencyRupeeIcon />}
                            label={`₹${room.price_per_night || 0}/night`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          <Chip
                            icon={<MeetingRoomIcon />}
                            label={`${room.total_rooms || 1} rooms`}
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                          <Chip
                            label={`Max: ${room.max_adults || 2}A, ${room.max_children || 1}C`}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={5}>
                        <Typography variant="body2" color="text.secondary">
                          Management for room type: {room.room_name} at {room.hotel_name || getHotelName(room.hotel)}.
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                          <Button
                            variant="outlined"
                            startIcon={expandedRoom === room.id ? <ExpandLessIcon /> : <PhotoLibraryIcon />}
                            size="small"
                            onClick={() => toggleExpand(room.id)}
                            color={expandedRoom === room.id ? "secondary" : "primary"}
                          >
                            Images
                          </Button>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEdit(room)}
                            title="Edit"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(room.id)}
                            title="Delete"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Grid>
                    </Grid>

                    <Collapse in={expandedRoom === room.id}>
                      <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid #eee" }}>
                        <ImageManager type="room" id={room.id} onUpdate={fetchRooms} />
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

export default AdminRooms;


