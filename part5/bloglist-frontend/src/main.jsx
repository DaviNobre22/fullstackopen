import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CssBaseline } from '@mui/material'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    {/* Material UI's base styles: same margins and font in every browser */}
    <CssBaseline />
    <App />
  </BrowserRouter>
)
