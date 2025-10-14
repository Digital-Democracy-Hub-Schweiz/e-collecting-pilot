import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './components/select-fix.css'
import './i18n'

createRoot(document.getElementById("root")!).render(<App />);
