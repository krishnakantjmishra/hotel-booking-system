import React, { useEffect, useState } from "react";
import { Box, Typography, Stack, TextField, Button, Paper, List, ListItem, ListItemText, MenuItem } from "@mui/material";
import api from "../api/axios";

const AdminInventory = () => {
  const [inventories, setInventories] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [currentInventory, setCurrentInventory] = useState(null);
  const [availableValue, setAvailableValue] = useState(0);
  const [roomInventories, setRoomInventories] = useState([]);

  const fetchInventories = async () => {
    try {
      const res = await api.get("/admin-api/inventory/");
      setInventories(res.data.results || res.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to load inventories", err.response?.data || err.message);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await api.get("/admin-api/rooms/");
      setRooms(res.data.results || res.data);
    } catch (err) {
      console.error("Failed to load rooms", err.response?.data || err.message);
    }
  };

  const fetchRoomInventories = async (roomId) => {
    if (!roomId) return setRoomInventories([]);
    try {
      const res = await api.get("/admin-api/inventory/", { params: { room_id: roomId, ordering: 'date' } });
      setRoomInventories(res.data.results || res.data || []);
    } catch (err) {
      console.error("Failed to load room inventories", err.response?.data || err.message);
    }
  };

  useEffect(() => { fetchInventories(); fetchRooms(); }, []);

  // Poll inventories periodically so the UI auto-refreshes
  useEffect(() => {
    const id = setInterval(() => {
      fetchInventories();
      if (selectedRoom) fetchRoomInventories(selectedRoom);
    }, 10000); // 10s
    return () => clearInterval(id);
  }, []);

  const handleRoomChange = (e) => {
    setSelectedRoom(e.target.value);
    setSelectedDate("");
    setCurrentInventory(null);
    setAvailableValue(0);
    fetchRoomInventories(e.target.value);
  };

  const handleDateChange = async (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    if (!selectedRoom || !date) return;

    try {
      const res = await api.get("/admin-api/inventory/", { params: { room_id: selectedRoom, date_from: date, date_to: date } });
      const items = res.data.results || res.data || [];
      if (items.length > 0) {
        const inv = items[0];
        setCurrentInventory(inv);
        setAvailableValue(inv.available_rooms);
      } else {
        // Find room default values
        const r = rooms.find(x => x.id === Number(selectedRoom));
        const defaultTotal = r ? r.total_rooms : 1;
        setCurrentInventory(null);
        setAvailableValue(defaultTotal);
      }
    } catch (err) {
      console.error("Failed to fetch inventory for date", err.response?.data || err.message);
    }
  };

  const handleSaveAvailable = async () => {
    if (!selectedRoom || !selectedDate) return;
    try {
      if (currentInventory) {
        const newTotal = currentInventory.booked_rooms + Number(availableValue);
        await api.patch(`/admin-api/inventory/${currentInventory.id}/`, { total_rooms: newTotal });
      } else {
        await api.post(`/admin-api/inventory/`, { room: selectedRoom, date: selectedDate, total_rooms: Number(availableValue), booked_rooms: 0 });
      }
      fetchInventories();
      fetchRoomInventories(selectedRoom);
      // Refresh current inventory for selected date
      const res = await api.get("/admin-api/inventory/", { params: { room_id: selectedRoom, date_from: selectedDate, date_to: selectedDate } });
      const items = res.data.results || res.data || [];
      if (items.length > 0) {
        setCurrentInventory(items[0]);
        setAvailableValue(items[0].available_rooms);
      }
    } catch (err) {
      console.error("Failed to save inventory", err.response?.data || err.message);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Inventory Admin
        {lastUpdated && (
          <Typography component="span" variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
            (Last updated: {new Date(lastUpdated).toLocaleTimeString()})
          </Typography>
        )}
      </Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField select label="Room" name="room" value={selectedRoom} onChange={handleRoomChange} sx={{ minWidth: 250 }}>
            <MenuItem value="">Select a room</MenuItem>
            {rooms.map(r => (
              <MenuItem key={r.id} value={r.id}>{r.room_name} — {r.hotel_name}</MenuItem>
            ))}
          </TextField>

          {selectedRoom && (
            <TextField label="Date" name="date" type="date" value={selectedDate} onChange={handleDateChange} InputLabelProps={{ shrink: true }} />
          )}

          {selectedDate && (
            <>
              <TextField label="Available" name="available" type="number" value={availableValue} onChange={(e) => setAvailableValue(e.target.value)} />
              <Button variant="contained" onClick={handleSaveAvailable}>Save</Button>
            </>
          )}
        </Stack>
      </Paper>

      {/* Show all inventory dates for selected room */}
      {selectedRoom && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6">Dates for selected room</Typography>
          {roomInventories.length === 0 ? (
            <Typography variant="body2" sx={{ mt: 1 }}>No inventory entries for this room.</Typography>
          ) : (
            <List>
              {roomInventories.map(inv => (
                <ListItem key={inv.id} button selected={selectedDate === inv.date} onClick={() => { setSelectedDate(inv.date); setCurrentInventory(inv); setAvailableValue(inv.available_rooms); }}>
                  <ListItemText primary={inv.date} secondary={`Total: ${inv.total_rooms} | Booked: ${inv.booked_rooms} | Available: ${inv.available_rooms}`} />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      )}

      <List>
        {inventories.map(inv => (
          <ListItem key={inv.id} divider>
            <ListItemText primary={`${inv.room_name} — ${inv.hotel_name} | ${inv.date}`} secondary={`Total: ${inv.total_rooms} | Booked: ${inv.booked_rooms} | Available: ${inv.available_rooms}`} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default AdminInventory;
