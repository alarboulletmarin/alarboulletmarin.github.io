import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Nuancier from './Nuancier.jsx';
import './nuancier.css';

createRoot(document.getElementById('root')).render(<StrictMode><Nuancier /></StrictMode>);
