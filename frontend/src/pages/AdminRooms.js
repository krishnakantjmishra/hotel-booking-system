import React, { useEffect, useState } from "react";
import { Box, Typography, Stack, TextField, Button, Paper, List, ListItem, ListItemText, MenuItem } from "@mui/material";
import api from "../api/axios";

const AdminRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [form, setForm] = useState({ hotel: "", room_name: "", price_per_night: 0, total_rooms: 1 });

  const fetchRooms = async () => {
    try {
      const res = await api.get("/admin-api/rooms/");
      setRooms(res.data.results || res.data);
    } catch (err) {
      console.error("Failed to load rooms", err);
    }
  };

  const fetchHotels = async () => {
    try {
      const res = await api.get("/api/v1/hotels/");
      setHotels(res.data.results || res.data);
    } catch (err) {
      console.error("Failed to load hotels", err);
    }
  };

  useEffect(() => { fetchRooms(); fetchHotels(); }, []);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    try {
      await api.post("/admin-api/rooms/", form);
      setForm({ hotel: "", room_name: "", price_per_night: 0, total_rooms: 1 });
      fetchRooms();
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Rooms Admin</Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField select label="Hotel" name="hotel" value={form.hotel} onChange={handleChange} sx={{ minWidth: 200 }}>
            {hotels.map(h => (
              <MenuItem key={h.id} value={h.id}>{h.name}</MenuItem>
            ))}
          </TextField>
          <TextField label="Room Name" name="room_name" value={form.room_name} onChange={handleChange} />
          <TextField label="Price" name="price_per_night" type="number" value={form.price_per_night} onChange={handleChange} />
          <TextField label="Total Rooms" name="total_rooms" type="number" value={form.total_rooms} onChange={handleChange} />
          <Button variant="contained" onClick={handleSubmit}>Create</Button>
        </Stack>
      </Paper>
      <List>
        {rooms.map(r => (
          <ListItem key={r.id} divider>
            <ListItemText primary={`${r.room_name} — ${r.hotel_name}`} secondary={`Price ${r.price_per_night} | total ${r.total_rooms}`} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default AdminRooms;
