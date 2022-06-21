import { useCallback, useState } from "react";
import Container from "@mui/material/Container";

import Dashboard from "./components/Dashboard";
import Register from "./components/Register";

const App = () => {
  const [name, setName] = useState("");
  const [id, setId] = useState("");

  const authenticate = useCallback((id, name) => {
    setId(id);
    setName(name);
  }, []);

  const logout = useCallback(() => {
    setId("");
    setName("");
  }, []);

  if (!id) {
    return (
      <Container>
        <Register authenticate={authenticate} />
      </Container>
    );
  }

  return <Dashboard uuid={id} name={name} logout={logout} />;
};

export default App;
