import React, { useEffect, useState, useRef } from "react";
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
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

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
  const alertRef = useRef(null);

  // Bulk upload state
  const [bulkRoom, setBulkRoom] = useState("");
  const [bulkStartDate, setBulkStartDate] = useState("");
  const [bulkEndDate, setBulkEndDate] = useState("");
  const [bulkTotalRooms, setBulkTotalRooms] = useState(0);
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    if (error || success) {
      alertRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [error, success]);

  const fetchInventories = async () => {
    try {
      // Fetch next 14 days of inventory for Matrix View
      const today = new Date();
      const next14 = new Date();
      next14.setDate(today.getDate() + 14);

      const dateFrom = today.toISOString().split('T')[0];
      const dateTo = next14.toISOString().split('T')[0];

      const res = await api.get("/admin-api/inventory/", {
        params: {
          date_from: dateFrom,
          date_to: dateTo,
          page_size: 1000 // Get all data for matrix
        }
      });
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

  const handleBulkUpdate = async () => {
    if (!bulkRoom || !bulkStartDate || !bulkEndDate || bulkTotalRooms < 0) {
      setError("Please fill in all bulk update fields");
      return;
    }

    setError("");
    setSuccess("");
    setBulkLoading(true);

    try {
      const response = await api.post("/admin-api/inventory/bulk/", {
        room: bulkRoom,
        start_date: bulkStartDate,
        end_date: bulkEndDate,
        total_rooms: Number(bulkTotalRooms)
      });

      const { created, updated, total, room } = response.data;
      setSuccess(`✓ Bulk update complete! ${total} dates processed (${created} created, ${updated} updated) for ${room}`);

      // Reset bulk form
      setBulkRoom("");
      setBulkStartDate("");
      setBulkEndDate("");
      setBulkTotalRooms(0);

      // Refresh data
      fetchInventories();
      if (selectedRoom) fetchRoomInventories(selectedRoom);

    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.end_date?.[0] || "Failed to bulk update inventory");
    } finally {
      setBulkLoading(false);
    }
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
      <Box ref={alertRef}>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}
      </Box>

      {/* Bulk Update Section */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3, bgcolor: "#f8f9fa" }}>
        <Typography variant="h6" fontWeight={600} gutterBottom color="primary">
          📅 Bulk Update (Date Range)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Set inventory for multiple dates at once (max 14 days)
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Select Room</InputLabel>
              <Select
                value={bulkRoom}
                onChange={(e) => setBulkRoom(e.target.value)}
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

          {bulkRoom && (
            <>
              <Grid item xs={12} sm={2.5}>
                <TextField
                  label="Start Date"
                  type="date"
                  value={bulkStartDate}
                  onChange={(e) => setBulkStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: today }}
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

              <Grid item xs={12} sm={2.5}>
                <TextField
                  label="End Date"
                  type="date"
                  value={bulkEndDate}
                  onChange={(e) => setBulkEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: bulkStartDate || today }}
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

              <Grid item xs={12} sm={2}>
                <TextField
                  label="Total Rooms"
                  type="number"
                  value={bulkTotalRooms}
                  onChange={(e) => setBulkTotalRooms(e.target.value)}
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
                  onClick={handleBulkUpdate}
                  fullWidth
                  disabled={bulkLoading || !bulkStartDate || !bulkEndDate}
                  startIcon={<SaveIcon />}
                  sx={{ py: 1.75, borderRadius: 2 }}
                >
                  {bulkLoading ? "Updating..." : "Apply to Range"}
                </Button>
              </Grid>
            </>
          )}
        </Grid>
      </Paper>

      {/* Selection Form */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Update Single Date
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
                inputProps={{ min: today }}
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

      {/* 14-Day Availability Matrix */}
      <Paper sx={{ p: 3, borderRadius: 3, overflowX: "auto" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            14-Day Availability Matrix
          </Typography>
          <Box display="flex" gap={2}>
            <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.875rem" }}>
              <Box sx={{ width: 12, height: 12, bgcolor: "#4caf50", borderRadius: "50%" }} /> Available
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.875rem" }}>
              <Box sx={{ width: 12, height: 12, bgcolor: "#f44336", borderRadius: "50%" }} /> Full
            </span>
          </Box>
        </Box>
        <Divider sx={{ mb: 2 }} />

        <TableContainer>
          <Table size="small" sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, position: "sticky", left: 0, bgcolor: "background.paper", zIndex: 1 }}>
                  Room
                </TableCell>
                {Array.from({ length: 14 }).map((_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() + i);
                  const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  const dayStr = d.toLocaleDateString("en-US", { weekday: "narrow" });
                  return (
                    <TableCell key={i} align="center" sx={{ fontWeight: 600, minWidth: 60 }}>
                      <div style={{ fontSize: "0.75rem", color: "gray" }}>{dayStr}</div>
                      {dateStr}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {rooms.map((room) => {
                // Determine inventory for this room across next 14 days
                const roomRow = Array.from({ length: 14 }).map((_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() + i);
                  const dateKey = d.toISOString().split("T")[0];

                  // Find inventory record
                  const inv = inventories.find(x => x.room === room.id && x.date === dateKey);

                  // If no record, assume default availability (total rooms)
                  // But wait, if we strictly don't have a record, assume full avail? 
                  // Yes, usually creating a room implies standard availability unless booked.
                  // However, logical approach: if no record, we assume total_rooms available (0 booked).

                  const total = inv ? inv.total_rooms : room.total_rooms;
                  const available = inv ? inv.available_rooms : room.total_rooms; // If no record, 0 booked
                  const isFull = available === 0;

                  return { date: dateKey, available, total, isFull, id: inv?.id };
                });

                return (
                  <TableRow key={room.id} hover>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        position: "sticky",
                        left: 0,
                        bgcolor: "white",
                        zIndex: 1,
                        borderRight: "1px solid #eee"
                      }}
                    >
                      {room.room_name}
                      <Typography variant="caption" display="block" color="text.secondary">
                        {room.hotel_name}
                      </Typography>
                    </TableCell>
                    {roomRow.map((cell) => (
                      <TableCell
                        key={cell.date}
                        align="center"
                        onClick={() => {
                          setSelectedRoom(room.id);
                          setSelectedDate(cell.date);
                          setAvailableValue(cell.total); // Set total for editing
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        sx={{
                          cursor: "pointer",
                          bgcolor: cell.isFull ? "#ffebee" : (cell.available < 3 ? "#fff3e0" : "inherit"),
                          '&:hover': { bgcolor: "#f5f5f5" }
                        }}
                      >
                        <Chip
                          label={cell.available}
                          size="small"
                          sx={{
                            height: 24,
                            width: 32,
                            fontWeight: 700,
                            bgcolor: cell.isFull ? "#ef5350" : (cell.available < 3 ? "#ff9800" : "#66bb6a"),
                            color: "white"
                          }}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default AdminInventory;

