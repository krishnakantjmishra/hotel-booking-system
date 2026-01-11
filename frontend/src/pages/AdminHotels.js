import React, { useEffect, useState } from "react";
import { Box, Typography, Stack, TextField, Button, Paper, List, ListItem, ListItemText } from "@mui/material";
import api from "../api/axios";

const AdminHotels = () => {
  const [hotels, setHotels] = useState([]);
  const [form, setForm] = useState({ name: "", city: "", address: "", rating: 0, price_min: 0 });
  const [editingId, setEditingId] = useState(null);

  const fetchHotels = async () => {
    try {
      const res = await api.get("/admin-api/hotels/");
      setHotels(res.data.results || res.data);
    } catch (err) {
      console.error("Failed to load hotels", err);
    }
  };

  useEffect(() => { fetchHotels(); }, []);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleEdit = (hotel) => {
    setEditingId(hotel.id);
    setForm({ name: hotel.name, city: hotel.city, address: hotel.address, rating: hotel.rating, price_min: hotel.price_min });
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({ name: "", city: "", address: "", rating: 0, price_min: 0 });
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await api.put(`/admin-api/hotels/${editingId}/`, form);
      } else {
        await api.post("/admin-api/hotels/", form);
      }
      setForm({ name: "", city: "", address: "", rating: 0, price_min: 0 });
      setEditingId(null);
      fetchHotels();
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this hotel?")) return;
    try {
      await api.delete(`/admin-api/hotels/${id}/`);
      if (editingId === id) handleCancel();
      fetchHotels();
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Hotels Admin</Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField label="Name" name="name" value={form.name} onChange={handleChange} fullWidth sx={{ minWidth: 140 }} />
          <TextField label="City" name="city" value={form.city} onChange={handleChange} fullWidth sx={{ minWidth: 120 }} />
          <TextField label="Address" name="address" value={form.address} onChange={handleChange} fullWidth sx={{ minWidth: 160 }} />
          <TextField label="Rating" name="rating" value={form.rating} type="number" onChange={handleChange} sx={{ width: { xs: '100%', sm: 100 } }} />
          <TextField label="Price Min" name="price_min" value={form.price_min} type="number" onChange={handleChange} sx={{ width: { xs: '100%', sm: 140 } }} />
          <Button variant="contained" onClick={handleSubmit} sx={{ width: { xs: '100%', sm: 'auto' } }}>{editingId ? 'Update' : 'Create'}</Button>
          {editingId && <Button variant="outlined" onClick={handleCancel} sx={{ width: { xs: '100%', sm: 'auto' } }}>Cancel</Button>}
        </Stack>
      </Paper>
      <List>
        {hotels.map(h => (
          <ListItem key={h.id} divider secondaryAction={
            <>
              <Button size="small" onClick={() => handleEdit(h)}>Edit</Button>
              <Button size="small" color="error" onClick={() => handleDelete(h.id)}>Delete</Button>
            </>
          }>
            <ListItemText primary={`${h.name} — ${h.city}`} secondary={`Rating ${h.rating} | price_min ${h.price_min}`} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default AdminHotels;
