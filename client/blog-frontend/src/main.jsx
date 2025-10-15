import { StrictMode } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'
import "./App.css"
import '@fortawesome/fontawesome-free/css/all.min.css';
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './AuthContext.jsx';
import { BookmarkProvider } from './BookmarkContext.jsx';
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BookmarkProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      </BookmarkProvider>
    </AuthProvider>
  </StrictMode>,
)
