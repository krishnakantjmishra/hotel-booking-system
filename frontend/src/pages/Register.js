import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  Alert,
  Box,
  Button,
  Link as MuiLink,
  Paper,
  Stack,
  TextField,
  Typography,
  InputAdornment,
  Fade,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import api from "../api/axios";

const Register = () => {
  // Registration is disabled for normal users per new requirements.
  // Keep the page so old links do not 404; explain how to get admin accounts instead.
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <Fade in={true} timeout={600}>
        <Paper 
          elevation={8} 
          sx={{ 
            p: 5, 
            width: "100%", 
            maxWidth: 480,
            borderRadius: 4,
            background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
          }}
        >
          <Stack spacing={3}>
            <Box textAlign="center">
              <Typography variant="h4" fontWeight={700} gutterBottom sx={{ mb: 1 }}>
                Registration disabled
              </Typography>
              <Typography color="text.secondary" variant="body1">
                Creating normal user accounts is disabled. Admin users must be created via the Django admin panel.
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Fade>
    </Box>
  );
};

export default Register;
