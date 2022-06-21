import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";

const Offset = styled("div")(({ theme }) => theme.mixins.toolbar);

const Menu = ({ children, name, uuid, logout }) => {
  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            color="inherit"
            component="div"
            sx={{ flexGrow: 1 }}
          >
            Olá, {name} ({uuid})
          </Typography>
          <Button onClick={logout} variant="contained" color="secondary">
            Sair
          </Button>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Offset />
        {children}
      </Box>
    </Box>
  );
};

export default Menu;
