import React, { useEffect, useState } from "react";
import { Box, Typography, Stack, TextField, Button, Paper, List, ListItem, ListItemText } from "@mui/material";
import api from "../api/axios";

const AdminHotels = () => {
  const [hotels, setHotels] = useState([]);
  const [form, setForm] = useState({ name: "", city: "", address: "", rating: 0, price_min: 0 });

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

  const handleSubmit = async () => {
    try {
      await api.post("/admin-api/hotels/", form);
      setForm({ name: "", city: "", address: "", rating: 0, price_min: 0 });
      fetchHotels();
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Hotels Admin</Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField label="Name" name="name" value={form.name} onChange={handleChange} />
          <TextField label="City" name="city" value={form.city} onChange={handleChange} />
          <TextField label="Address" name="address" value={form.address} onChange={handleChange} />
          <TextField label="Rating" name="rating" value={form.rating} type="number" onChange={handleChange} />
          <TextField label="Price Min" name="price_min" value={form.price_min} type="number" onChange={handleChange} />
          <Button variant="contained" onClick={handleSubmit}>Create</Button>
        </Stack>
      </Paper>
      <List>
        {hotels.map(h => (
          <ListItem key={h.id} divider>
            <ListItemText primary={`${h.name} — ${h.city}`} secondary={`Rating ${h.rating} | price_min ${h.price_min}`} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default AdminHotels;
