import React from 'react'
import ReactDOM from 'react-dom/client'
import DesktopLayout from './pages/DesktopLayout'
import MapEditor from './pages/MapEditor'

function App() {
  return (
    <DesktopLayout>
      <MapEditor />
    </DesktopLayout>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
