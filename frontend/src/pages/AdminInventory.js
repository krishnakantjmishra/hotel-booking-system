import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Chip,
  Alert,
  Divider,
  InputAdornment,
} from "@mui/material";
import InventoryIcon from "@mui/icons-material/Inventory";
import BedIcon from "@mui/icons-material/Bed";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import SaveIcon from "@mui/icons-material/Save";
import RefreshIcon from "@mui/icons-material/Refresh";
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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  useEffect(() => {
    const id = setInterval(() => {
      fetchInventories();
      if (selectedRoom) fetchRoomInventories(selectedRoom);
    }, 10000);
    return () => clearInterval(id);
  }, [selectedRoom]);

  const handleRoomChange = (e) => {
    setSelectedRoom(e.target.value);
    setSelectedDate("");
    setCurrentInventory(null);
    setAvailableValue(0);
    setError("");
    setSuccess("");
    fetchRoomInventories(e.target.value);
  };

  const handleDateChange = async (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setError("");
    setSuccess("");
    if (!selectedRoom || !date) return;

    try {
      const res = await api.get("/admin-api/inventory/", { params: { room_id: selectedRoom, date_from: date, date_to: date } });
      const items = res.data.results || res.data || [];
      if (items.length > 0) {
        const inv = items[0];
        setCurrentInventory(inv);
        setAvailableValue(inv.available_rooms);
      } else {
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
    setError("");
    setSuccess("");
    try {
      if (currentInventory) {
        const newTotal = currentInventory.booked_rooms + Number(availableValue);
        await api.patch(`/admin-api/inventory/${currentInventory.id}/`, { total_rooms: newTotal });
      } else {
        await api.post(`/admin-api/inventory/`, { room: selectedRoom, date: selectedDate, total_rooms: Number(availableValue), booked_rooms: 0 });
      }
      setSuccess("Inventory saved successfully!");
      fetchInventories();
      fetchRoomInventories(selectedRoom);
      const res = await api.get("/admin-api/inventory/", { params: { room_id: selectedRoom, date_from: selectedDate, date_to: selectedDate } });
      const items = res.data.results || res.data || [];
      if (items.length > 0) {
        setCurrentInventory(items[0]);
        setAvailableValue(items[0].available_rooms);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save inventory");
    }
  };

  const handleRefresh = () => {
    fetchInventories();
    if (selectedRoom) fetchRoomInventories(selectedRoom);
    setSuccess("Data refreshed!");
    setTimeout(() => setSuccess(""), 2000);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Inventory Management
          </Typography>
          {lastUpdated && (
            <Typography variant="body2" color="text.secondary">
              Last updated: {new Date(lastUpdated).toLocaleTimeString()}
            </Typography>
          )}
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          sx={{ borderRadius: 2 }}
        >
          Refresh
        </Button>
      </Box>

      {/* Alerts */}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      {/* Selection Form */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Update Inventory
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Select Room</InputLabel>
              <Select
                value={selectedRoom}
                onChange={handleRoomChange}
                label="Select Room"
                startAdornment={
                  <InputAdornment position="start">
                    <BedIcon color="action" />
                  </InputAdornment>
                }
              >
                <MenuItem value="">Select a room</MenuItem>
                {rooms.map(r => (
                  <MenuItem key={r.id} value={r.id}>{r.room_name} — {r.hotel_name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {selectedRoom && (
            <Grid item xs={12} sm={3}>
              <TextField
                label="Date"
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarTodayIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          )}

          {selectedDate && (
            <>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Available Rooms"
                  type="number"
                  value={availableValue}
                  onChange={(e) => setAvailableValue(e.target.value)}
                  fullWidth
                  inputProps={{ min: 0 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <InventoryIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button
                  variant="contained"
                  onClick={handleSaveAvailable}
                  fullWidth
                  startIcon={<SaveIcon />}
                  sx={{ py: 1.75, borderRadius: 2 }}
                >
                  Save
                </Button>
              </Grid>
            </>
          )}
        </Grid>
      </Paper>

      {/* Room Inventory Table */}
      {selectedRoom && (
        <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Inventory for Selected Room
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {roomInventories.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No inventory entries for this room. Select a date above to add one.
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Total</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Booked</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Available</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {roomInventories.map(inv => (
                    <TableRow
                      key={inv.id}
                      hover
                      selected={selectedDate === inv.date}
                      onClick={() => {
                        setSelectedDate(inv.date);
                        setCurrentInventory(inv);
                        setAvailableValue(inv.available_rooms);
                      }}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell>{inv.date}</TableCell>
                      <TableCell align="center">{inv.total_rooms}</TableCell>
                      <TableCell align="center">{inv.booked_rooms}</TableCell>
                      <TableCell align="center">{inv.available_rooms}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={inv.available_rooms > 0 ? "Available" : "Fully Booked"}
                          size="small"
                          color={inv.available_rooms > 0 ? "success" : "error"}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {/* All Inventory (Summary) */}
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          All Inventory Overview
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {inventories.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No inventory records found.
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Room</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Hotel</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Total</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Booked</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Available</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inventories.slice(0, 20).map(inv => (
                  <TableRow key={inv.id} hover>
                    <TableCell>{inv.room_name}</TableCell>
                    <TableCell>{inv.hotel_name}</TableCell>
                    <TableCell>{inv.date}</TableCell>
                    <TableCell align="center">{inv.total_rooms}</TableCell>
                    <TableCell align="center">{inv.booked_rooms}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={inv.available_rooms}
                        size="small"
                        color={inv.available_rooms > 0 ? "success" : "error"}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {inventories.length > 20 && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Showing 20 of {inventories.length} records
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default AdminInventory;

