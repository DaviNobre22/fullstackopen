import { Link } from 'react-router-dom'
import { AppBar, Toolbar, Button, Typography, Box } from '@mui/material'

// user is the logged-in user, or null
const NavBar = ({ user, logout }) => {
  return (
    <AppBar position="static" sx={{ mb: 3 }}>
      <Toolbar>
        <Button color="inherit" component={Link} to="/">
          blogs
        </Button>
        {user && (
          <Button color="inherit" component={Link} to="/create">
            create new
          </Button>
        )}

        {/* pushes the user's name and the login/logout button to the right */}
        <Box sx={{ flexGrow: 1 }} />

        {user ? (
          <>
            <Typography sx={{ mr: 2 }}>{user.name} logged in</Typography>
            <Button color="inherit" variant="outlined" onClick={logout}>
              logout
            </Button>
          </>
        ) : (
          <Button color="inherit" component={Link} to="/login">
            login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  )
}

export default NavBar
