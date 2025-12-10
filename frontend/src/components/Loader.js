import React from "react";
import { Box, CircularProgress, Typography, Stack, Fade } from "@mui/material";

const Loader = ({ label = "Loading..." }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "400px",
      width: "100%",
    }}
  >
    <Fade in={true} timeout={500}>
      <Stack spacing={3} alignItems="center">
        <CircularProgress 
          size={56}
          thickness={4}
          sx={{
            color: "primary.main",
            animationDuration: "1.2s",
          }}
        />
        {label && (
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{
              fontWeight: 500,
              letterSpacing: "0.02em",
            }}
          >
            {label}
          </Typography>
        )}
      </Stack>
    </Fade>
  </Box>
);

export default Loader;

