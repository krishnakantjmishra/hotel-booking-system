import React from "react";
import { Box, Typography, Stack, Card, CardContent, Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const AdminDashboard = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="stretch">
        <Card sx={{ minWidth: 200, flex: '1 1 0', mb: { xs: 2, md: 0 }, width: { xs: '100%', md: 'auto' }, minHeight: 120 }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h6">Hotels</Typography>
              <Typography variant="body2">Create and manage hotels</Typography>
            </Box>
            <Button component={RouterLink} to="/admin-ui/hotels" sx={{ mt: 2, width: { xs: '100%', md: 'auto' } }}>Open</Button>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 200, flex: '1 1 0', mb: { xs: 2, md: 0 }, width: { xs: '100%', md: 'auto' }, minHeight: 120 }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h6">Rooms</Typography>
              <Typography variant="body2">Create and manage rooms</Typography>
            </Box>
            <Button component={RouterLink} to="/admin-ui/rooms" sx={{ mt: 2, width: { xs: '100%', md: 'auto' } }}>Open</Button>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 200, flex: '1 1 0', width: { xs: '100%', md: 'auto' }, minHeight: 120 }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h6">Inventory</Typography>
              <Typography variant="body2">Manage per-date room inventory</Typography>
            </Box>
            <Button component={RouterLink} to="/admin-ui/inventory" sx={{ mt: 2, width: { xs: '100%', md: 'auto' } }}>Open</Button>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default AdminDashboard;
