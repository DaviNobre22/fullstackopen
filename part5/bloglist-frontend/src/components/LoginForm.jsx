import { useState } from 'react'
import { Paper, Stack, TextField, Button, Typography } from '@mui/material'

// the form keeps its own field values; login is called with { username, password }
const LoginForm = ({ login }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    await login({ username, password })
  }

  return (
    <Paper sx={{ p: 3, maxWidth: 400 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Log in to application
      </Typography>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            id="username"
            label="username"
            value={username}
            onChange={({ target }) => setUsername(target.value)}
            autoComplete="username"
          />
          <TextField
            id="password"
            label="password"
            type="password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
            autoComplete="current-password"
          />
          <Button variant="contained" type="submit">
            login
          </Button>
        </Stack>
      </form>
    </Paper>
  )
}

export default LoginForm
