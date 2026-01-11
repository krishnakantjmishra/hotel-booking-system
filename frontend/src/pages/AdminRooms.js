import React, { useEffect, useState } from "react";
import { Box, Typography, Stack, TextField, Button, Paper, List, ListItem, ListItemText, MenuItem } from "@mui/material";
import api from "../api/axios";

const AdminRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [form, setForm] = useState({ hotel: "", room_name: "", price_per_night: 0, total_rooms: 1 });
  const [editingId, setEditingId] = useState(null);

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
    setForm({ hotel: room.hotel, room_name: room.room_name, price_per_night: room.price_per_night, total_rooms: room.total_rooms });
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({ hotel: "", room_name: "", price_per_night: 0, total_rooms: 1 });
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await api.put(`/admin-api/rooms/${editingId}/`, form);
      } else {
        await api.post("/admin-api/rooms/", form);
      }
      setForm({ hotel: "", room_name: "", price_per_night: 0, total_rooms: 1 });
      setEditingId(null);
      fetchRooms();
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this room?")) return;
    try {
      await api.delete(`/admin-api/rooms/${id}/`);
      if (editingId === id) handleCancel();
      fetchRooms();
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Rooms Admin</Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField select label="Hotel" name="hotel" value={form.hotel} onChange={handleChange} fullWidth sx={{ minWidth: { sm: 200 } }}>
            {hotels.map(h => (
              <MenuItem key={h.id} value={h.id}>{h.name}</MenuItem>
            ))}
          </TextField>
          <TextField label="Room Name" name="room_name" value={form.room_name} onChange={handleChange} fullWidth />
          <TextField label="Price" name="price_per_night" type="number" value={form.price_per_night} onChange={handleChange} sx={{ width: { xs: '100%', sm: 'auto' } }} />
          <TextField label="Total Rooms" name="total_rooms" type="number" value={form.total_rooms} onChange={handleChange} sx={{ width: { xs: '100%', sm: 'auto' } }} />
          <Button variant="contained" onClick={handleSubmit} sx={{ width: { xs: '100%', sm: 'auto' } }}>{editingId ? 'Update' : 'Create'}</Button>
          {editingId && <Button variant="outlined" onClick={handleCancel} sx={{ width: { xs: '100%', sm: 'auto' } }}>Cancel</Button>}
        </Stack>
      </Paper>
      <List>
        {rooms.map(r => (
          <ListItem key={r.id} divider secondaryAction={
            <>
              <Button size="small" onClick={() => handleEdit(r)}>Edit</Button>
              <Button size="small" color="error" onClick={() => handleDelete(r.id)}>Delete</Button>
            </>
          }>
            <ListItemText primary={`${r.room_name} — ${r.hotel_name}`} secondary={`Price ${r.price_per_night} | total ${r.total_rooms}`} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default AdminRooms;
