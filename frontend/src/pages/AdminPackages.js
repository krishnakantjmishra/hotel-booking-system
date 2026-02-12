import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Card,
    CardContent,
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
    FormControlLabel,
    Switch,
    Slider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import BedIcon from "@mui/icons-material/Bed";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import api from "../api/axios";

const AdminPackages = () => {
    const [packages, setPackages] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [form, setForm] = useState({
        name: "",
        room: "",
        price: "",
        discount_percentage: "0",
        duration_nights: "1",
        includes_meals: false,
        includes_activities: false,
        description: "",
    });
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fetchPackages = async () => {
        try {
            const res = await api.get("/admin-api/packages/");
            setPackages(res.data.results || res.data);
        } catch (err) {
            console.error("Failed to load packages", err);
            setError("Failed to load packages");
        }
    };

    const fetchRooms = async () => {
        try {
            const res = await api.get("/admin-api/rooms/");
            setRooms(res.data.results || res.data);
        } catch (err) {
            console.error("Failed to load rooms", err);
        }
    };

    useEffect(() => {
        fetchPackages();
        fetchRooms();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleEdit = (pkg) => {
        setEditingId(pkg.id);
        setForm({
            name: pkg.name,
            room: pkg.room,
            price: pkg.price,
            discount_percentage: pkg.discount_percentage,
            duration_nights: pkg.duration_nights,
            includes_meals: pkg.includes_meals,
            includes_activities: pkg.includes_activities,
            description: pkg.description,
        });
        setShowForm(true);
        setError("");
        setSuccess("");
    };

    const handleCancel = () => {
        setEditingId(null);
        setForm({
            name: "",
            room: "",
            price: "",
            discount_percentage: "0",
            duration_nights: "1",
            includes_meals: false,
            includes_activities: false,
            description: "",
        });
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        try {
            // Find the selected room to get the hotel ID
            const selectedRoom = rooms.find(r => r.id === form.room);
            if (!selectedRoom) {
                setError("Please select a valid room");
                return;
            }

            const payload = {
                ...form,
                hotel: selectedRoom.hotel, // Include the hotel ID
                price: parseFloat(form.price),
                discount_percentage: parseFloat(form.discount_percentage),
                duration_nights: parseInt(form.duration_nights),
            };

            if (editingId) {
                await api.put(`/admin-api/packages/${editingId}/`, payload);
                setSuccess("Package updated successfully!");
            } else {
                await api.post("/admin-api/packages/", payload);
                setSuccess("Package created successfully!");
            }
            handleCancel();
            fetchPackages();
        } catch (err) {
            setError(
                err.response?.data?.error ||
                err.response?.data?.detail ||
                JSON.stringify(err.response?.data) ||
                "Failed to save package"
            );
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this package?"))
            return;
        try {
            await api.delete(`/admin-api/packages/${id}/`);
            if (editingId === id) handleCancel();
            setSuccess("Package deleted successfully!");
            fetchPackages();
        } catch (err) {
            setError(err.response?.data?.error || "Failed to delete package");
        }
    };

    const getRoomName = (roomId) => {
        const room = rooms.find((r) => r.id === roomId);
        return room ? `${room.room_name} (${room.hotel_name || "Unknown Hotel"})` : "Unknown Room";
    };

    return (
        <Box>
            {/* Header */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                }}
            >
                <Typography variant="h4" fontWeight={700}>
                    Packages Management
                </Typography>
                {!showForm && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setShowForm(true)}
                        sx={{ borderRadius: 2 }}
                    >
                        Add Package
                    </Button>
                )}
            </Box>

            {/* Alerts */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert
                    severity="success"
                    sx={{ mb: 2 }}
                    onClose={() => setSuccess("")}
                >
                    {success}
                </Alert>
            )}

            {/* Form */}
            {showForm && (
                <Fade in={showForm}>
                    <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                            {editingId ? "Edit Package" : "Add New Package"}
                        </Typography>
                        <Divider sx={{ mb: 3 }} />
                        <Box component="form" onSubmit={handleSubmit}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Package Name"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        fullWidth
                                        required
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LocalOfferIcon color="action" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth required>
                                        <InputLabel>Select Room</InputLabel>
                                        <Select
                                            name="room"
                                            value={form.room}
                                            onChange={handleChange}
                                            label="Select Room"
                                            startAdornment={
                                                <InputAdornment position="start">
                                                    <BedIcon color="action" />
                                                </InputAdornment>
                                            }
                                        >
                                            {rooms.map((r) => (
                                                <MenuItem key={r.id} value={r.id}>
                                                    {getRoomName(r.id)}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Price (₹)"
                                        name="price"
                                        value={form.price}
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
                                        label="Duration (Nights)"
                                        name="duration_nights"
                                        value={form.duration_nights}
                                        onChange={handleChange}
                                        type="number"
                                        fullWidth
                                        required
                                        inputProps={{ min: 1 }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <AccessTimeIcon color="action" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography gutterBottom>
                                        Discount Percentage: {form.discount_percentage}%
                                    </Typography>
                                    <Slider
                                        name="discount_percentage"
                                        value={typeof form.discount_percentage === 'number' ? form.discount_percentage : 0}
                                        onChange={(e, val) => setForm(prev => ({ ...prev, discount_percentage: val }))}
                                        valueLabelDisplay="auto"
                                        min={0}
                                        max={100}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={form.includes_meals}
                                                    onChange={handleChange}
                                                    name="includes_meals"
                                                />
                                            }
                                            label={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <RestaurantIcon fontSize="small" /> Includes Meals
                                                </Box>
                                            }
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={form.includes_activities}
                                                    onChange={handleChange}
                                                    name="includes_activities"
                                                />
                                            }
                                            label={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <DirectionsRunIcon fontSize="small" /> Includes Activities
                                                </Box>
                                            }
                                        />
                                    </Box>
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        label="Description"
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        fullWidth
                                        multiline
                                        rows={2}
                                    />
                                </Grid>
                            </Grid>
                            <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    sx={{ px: 4 }}
                                >
                                    {editingId ? "Update Package" : "Create Package"}
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </Button>
                            </Box>
                        </Box>
                    </Paper>
                </Fade>
            )}

            {/* Packages List */}
            {packages.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
                    <LocalOfferIcon
                        sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
                    />
                    <Typography variant="h6" color="text.secondary">
                        No packages found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Click "Add Package" to create your first package.
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {packages.map((pkg) => (
                        <Grid item xs={12} md={6} key={pkg.id}>
                            <Fade in={true}>
                                <Card
                                    sx={{
                                        borderRadius: 3,
                                        transition: "all 0.3s ease",
                                        overflow: "hidden",
                                        "&:hover": {
                                            boxShadow: 6,
                                        },
                                    }}
                                >
                                    <CardContent>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "flex-start",
                                                mb: 2,
                                            }}
                                        >
                                            <Box>
                                                <Typography variant="h6" fontWeight={600}>
                                                    {pkg.name}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                                                >
                                                    <BedIcon fontSize="small" /> {getRoomName(pkg.room)}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ textAlign: "right" }}>
                                                <Typography variant="h6" color="primary" fontWeight={700}>
                                                    ₹{pkg.final_price}
                                                </Typography>
                                                {pkg.discount_percentage > 0 && (
                                                    <Typography variant="caption" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                                                        ₹{pkg.price}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ mb: 2, minHeight: '3em' }}
                                        >
                                            {pkg.description || "No description provided."}
                                        </Typography>

                                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                                            <Chip
                                                icon={<AccessTimeIcon />}
                                                label={`${pkg.duration_nights} Night(s)`}
                                                size="small"
                                                variant="outlined"
                                            />
                                            {pkg.includes_meals && (
                                                <Chip
                                                    icon={<RestaurantIcon />}
                                                    label="Meals"
                                                    size="small"
                                                    color="success"
                                                    variant="outlined"
                                                />
                                            )}
                                            {pkg.includes_activities && (
                                                <Chip
                                                    icon={<DirectionsRunIcon />}
                                                    label="Activities"
                                                    size="small"
                                                    color="info"
                                                    variant="outlined"
                                                />
                                            )}
                                            {pkg.discount_percentage > 0 && (
                                                <Chip
                                                    label={`${pkg.discount_percentage}% OFF`}
                                                    size="small"
                                                    color="error"
                                                />
                                            )}
                                        </Box>

                                        <Divider sx={{ mb: 2 }} />

                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "flex-end",
                                                gap: 1,
                                            }}
                                        >
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={() => handleEdit(pkg)}
                                                title="Edit"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleDelete(pkg.id)}
                                                title="Delete"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
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

export default AdminPackages;
