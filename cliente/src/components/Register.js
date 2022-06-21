import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useForm, Controller } from "react-hook-form";

import api from "../api";

const Register = ({ authenticate }) => {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data) => {
    const { user } = await api.post("/login", data);
    authenticate(user.id, user.name);
  };

  return (
    <Box my={4} maxWidth="sm">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box display="flex" flexDirection="column">
          <Controller
            name="name"
            control={control}
            render={({ field }) => <TextField {...field} label="Nome" />}
          />
          <Button type="submit">Entrar</Button>
        </Box>
      </form>
    </Box>
  );
};

export default Register;
