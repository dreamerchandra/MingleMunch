import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { Root } from './root.tsx'
import 'rsuite/dist/rsuite.min.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
