import React from "react";
import { Box, Typography, Card, CardContent, Button, Grid, Fade } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import HotelIcon from "@mui/icons-material/Hotel";
import BedIcon from "@mui/icons-material/Bed";
import InventoryIcon from "@mui/icons-material/Inventory";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const dashboardItems = [
  {
    title: "Hotels",
    description: "Create and manage hotel properties",
    icon: HotelIcon,
    link: "/admin-ui/hotels",
    color: "#1976d2",
    bgColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  {
    title: "Rooms",
    description: "Create and manage room types",
    icon: BedIcon,
    link: "/admin-ui/rooms",
    color: "#2e7d32",
    bgColor: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
  },
  {
    title: "Inventory",
    description: "Manage per-date room availability",
    icon: InventoryIcon,
    link: "/admin-ui/inventory",
    color: "#ed6c02",
    bgColor: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  },
  {
    title: "Bookings",
    description: "View and manage all bookings",
    icon: BookOnlineIcon,
    link: "/admin-ui/bookings",
    color: "#9c27b0",
    bgColor: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  },
];

const AdminDashboard = () => {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your hotel booking system
        </Typography>
      </Box>

      {/* Dashboard Cards */}
      <Grid container spacing={3}>
        {dashboardItems.map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={item.title}>
            <Fade in={true} style={{ transitionDelay: `${index * 100}ms` }}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  transition: "all 0.3s ease",
                  overflow: "hidden",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
                  },
                }}
              >
                {/* Gradient Header */}
                <Box
                  sx={{
                    background: item.bgColor,
                    p: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <item.icon sx={{ fontSize: 48, color: "white" }} />
                </Box>

                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                    {item.description}
                  </Typography>
                  <Button
                    component={RouterLink}
                    to={item.link}
                    variant="contained"
                    fullWidth
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      borderRadius: 2,
                      py: 1,
                      textTransform: "none",
                      fontWeight: 600,
                    }}
                  >
                    Open
                  </Button>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AdminDashboard;

