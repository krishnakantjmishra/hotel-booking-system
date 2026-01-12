import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Button, Stack } from "@mui/material";

const AdminNav = () => {
  return (
    <Stack direction="row" spacing={1}>
      <Button component={RouterLink} to="/admin-ui" color="secondary">Admin</Button>
    </Stack>
  );
};

export default AdminNav;
