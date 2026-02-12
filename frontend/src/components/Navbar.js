import React, { useContext } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Stack,
  Chip,
  Container,
  useScrollTrigger,
  Slide,
  Paper,
  Box,
} from "@mui/material";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import LogoutIcon from "@mui/icons-material/Logout";
import HotelIcon from "@mui/icons-material/Hotel";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import SearchIcon from "@mui/icons-material/Search";
import { AuthContext } from "../context/AuthContext";

const HideOnScroll = ({ children }) => {
  const trigger = useScrollTrigger();
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout, user } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate("/hotels");
  };


  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <HideOnScroll>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backdropFilter: "blur(12px)",
          backgroundColor: "rgba(255,255,255,0.8)",
          borderBottom: "1px solid",
          borderColor: "rgba(226, 232, 240, 0.8)",
          transition: "all 0.3s ease",
          zIndex: 1100
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: "space-between", py: 1.2, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              component={RouterLink}
              to="/hotels"
              sx={{
                textDecoration: "none",
                color: "text.primary",
                cursor: "pointer",
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 1.25,
                  background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  color: "white",
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
                }}
              >
                <HotelIcon sx={{ fontSize: 26 }} />
              </Paper>
              <Box>
                <Typography variant="h6" fontWeight={900} sx={{ lineHeight: 1, letterSpacing: '-0.02em', mb: 0.5 }}>
                  KKM Hotels
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                  Luxury • Comfort • Seamless
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
              {isAuthenticated ? (
                <>
                  {/* Show Hotels and Bookings only for non-admin users */}
                  {!user?.is_staff && (
                    <>
                      <Button
                        startIcon={<TravelExploreIcon />}
                        color={isActive("/hotels") ? "primary" : "inherit"}
                        variant={isActive("/hotels") ? "contained" : "text"}
                        component={RouterLink}
                        to="/hotels"
                        sx={{
                          borderRadius: 2,
                          px: { xs: 1.2, md: 2 },
                          fontSize: { xs: '0.85rem', md: 'inherit' }
                        }}
                      >
                        Hotels
                      </Button>
                      <Button
                        startIcon={<BookOnlineIcon />}
                        color={isActive("/bookings") ? "primary" : "inherit"}
                        variant={isActive("/bookings") ? "contained" : "text"}
                        component={RouterLink}
                        to="/bookings"
                        sx={{
                          borderRadius: 2,
                          px: { xs: 1.2, md: 2 },
                          fontSize: { xs: '0.85rem', md: 'inherit' }
                        }}
                      >
                        My Bookings
                      </Button>
                      <Button
                        startIcon={<SearchIcon />}
                        color="secondary"
                        variant="contained"
                        component={RouterLink}
                        to="/hotels"
                        sx={{
                          borderRadius: 2,
                          px: { xs: 1.2, md: 2 },
                          fontSize: { xs: '0.85rem', md: 'inherit' },
                          ml: 1 // Add margin left
                        }}
                      >
                        Book More
                      </Button>
                    </>
                  )}

                  {/* Show Admin only to staff users */}
                  {user?.is_staff && (
                    <Button
                      color={isActive("/admin-ui") ? "primary" : "inherit"}
                      variant={isActive("/admin-ui") ? "contained" : "text"}
                      component={RouterLink}
                      to="/admin-ui"
                      sx={{
                        borderRadius: 2,
                        px: { xs: 1.2, md: 2 },
                        fontSize: { xs: '0.85rem', md: 'inherit' }
                      }}
                    >
                      Admin
                    </Button>
                  )}
                  <Button
                    startIcon={<LogoutIcon />}
                    variant="outlined"
                    color="error"
                    onClick={handleLogout}
                    sx={{
                      borderRadius: 2,
                      px: { xs: 1.2, md: 2 },
                      borderWidth: 2,
                      fontSize: { xs: '0.85rem', md: 'inherit' },
                      "&:hover": {
                        borderWidth: 2,
                        bgcolor: "error.light",
                        color: "error.contrastText",
                      },
                    }}
                  >
                    Logout
                  </Button>
                  {/* Role indicator */}
                  {user && (
                    <Chip label={user.is_staff ? 'Admin' : 'User'} size="small" sx={{ ml: 1 }} />
                  )}
                </>
              ) : (
                <>
                  <Button
                    startIcon={<TravelExploreIcon />}
                    color={isActive("/hotels") ? "primary" : "inherit"}
                    variant={isActive("/hotels") ? "contained" : "text"}
                    component={RouterLink}
                    to="/hotels"
                    sx={{
                      borderRadius: 2,
                      px: { xs: 1.2, md: 2 },
                      fontSize: { xs: '0.85rem', md: 'inherit' }
                    }}
                  >
                    Hotels
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<BookOnlineIcon />}
                    component={RouterLink}
                    to="/login"
                    sx={{
                      borderRadius: 2,
                      px: { xs: 1.2, md: 2 },
                      fontSize: { xs: '0.85rem', md: 'inherit' },
                      borderWidth: 2,
                      "&:hover": {
                        borderWidth: 2,
                      }
                    }}
                  >
                    My Bookings
                  </Button>
                </>
              )}
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>
    </HideOnScroll>
  );
};

export default Navbar;

