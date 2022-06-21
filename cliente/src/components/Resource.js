import { useEffect, useState } from "react";
import Button from "@mui/material/Button";

import api from "../api";

const Resource = ({ resourceId, uuid, evtSource }) => {
  const [access, setAccess] = useState(false);
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    evtSource.addEventListener(`resource${resourceId}`, (event) => {
      const { granted } = JSON.parse(event.data);
      setAccess(granted);
      setWaiting(false);
    });
  }, [evtSource, resourceId]);

  const requestAccess = async (resourceId) => {
    if (access || waiting) return;

    const { granted } = await api.post(`/resource/${resourceId}`, { uuid });
    if (granted) {
      setAccess(true);
    } else {
      setWaiting(true);
    }
  };

  let text = `Solicitar recurso ${resourceId}`;
  let color = "primary";

  if (access) {
    text = `Acessando recurso ${resourceId}`;
    color = "success";
  }

  if (waiting) {
    text = `Aguardando recurso ${resourceId}`;
    color = "info";
  }

  return (
    <Button
      variant="contained"
      color={color}
      onClick={() => requestAccess(resourceId)}
    >
      {text}
    </Button>
  );
};

export default Resource;
