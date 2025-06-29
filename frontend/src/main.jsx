import React from "react"
import ReactDOM from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import App from "./App.jsx"
import "./index.css"

// Suppress React Router warnings
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0] && typeof args[0] === 'string' && 
      (args[0].includes('React Router Future Flag Warning') || 
       args[0].includes('v7_startTransition') || 
       args[0].includes('v7_relativeSplatPath'))) {
    return;
  }
  originalWarn.apply(console, args);
};

const router = createBrowserRouter([
  {
    path: "*",
    element: <App />,
  },
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
})

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
