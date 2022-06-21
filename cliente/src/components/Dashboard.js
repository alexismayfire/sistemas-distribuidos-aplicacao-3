import { useEffect, useState, useMemo } from "react";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";

import api from "../api";
import Menu from "./Menu";
import Resource from "./Resource";

const Dashboard = ({ uuid, name, logout }) => {
  // Por alguma razão o request trava quando uso componentizado...
  // const evt = useMemo(
  //   () => new EventSource(`http://localhost:5000/stream?channel=${uuid}`),
  //   [uuid]
  // );

  // return (
  //   <Menu name={name} uuid={uuid} logout={logout}>
  //     <Container maxWidth="lg" sx={{ p: 3 }}>
  //       <Resource resourceId={1} uuid={uuid} evtSource={evt} />
  //       <Resource resourceId={2} uuid={uuid} evtSource={evt} />
  //     </Container>
  //   </Menu>
  // );

  const [access, setAccess] = useState({ 1: false, 2: false });
  const [waiting, setWaiting] = useState({ 1: false, 2: false });

  useEffect(() => {
    const evt = new EventSource(`http://localhost:5000/stream?channel=${uuid}`);

    evt.addEventListener("resource1", (event) => {
      const { granted, resource } = JSON.parse(event.data);
      setAccess((access) => ({ ...access, [resource]: granted }));
      setWaiting((waiting) => ({ ...waiting, [resource]: false }));
    });

    evt.addEventListener("resource2", (event) => {
      const { granted, resource } = JSON.parse(event.data);
      setAccess((access) => ({ ...access, [resource]: granted }));
      setWaiting((waiting) => ({ ...waiting, [resource]: false }));
    });
  }, [uuid]);

  const requestAcess = async (resourceId) => {
    if (access[resourceId]) {
      const { released } = await api.post(`/release/${resourceId}`, { uuid });
      if (released) {
        setAccess((access) => ({ ...access, [resourceId]: false }));
      }
      return;
    }

    if (waiting[resourceId]) return;

    const { granted } = await api.post(`/resource/${resourceId}`, { uuid });
    if (granted) {
      setAccess((access) => ({ ...access, [resourceId]: true }));
    } else {
      setWaiting((waiting) => ({ ...waiting, [resourceId]: true }));
    }
  };

  const renderButtonText = (resourceId) => {
    console.log(access, waiting);
    if (access[resourceId])
      return `Acessando recurso ${resourceId} - Clique para liberar`;
    if (waiting[resourceId]) return `Aguardando recurso ${resourceId}`;
    return `Solicitar recurso ${resourceId}`;
  };

  const getButtonColor = (resourceId) => {
    if (access[resourceId]) return "success";
    if (waiting[resourceId]) return "info";
    return "primary";
  };

  return (
    <Menu name={name} uuid={uuid} logout={logout}>
      <Container maxWidth="lg" sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item>
            <Button
              variant="contained"
              color={getButtonColor(1)}
              onClick={() => requestAcess(1)}
            >
              {renderButtonText(1)}
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color={getButtonColor(2)}
              onClick={() => requestAcess(2)}
            >
              {renderButtonText(2)}
            </Button>
          </Grid>
        </Grid>
      </Container>
    </Menu>
  );
};

export default Dashboard;
