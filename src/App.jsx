import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./database/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute"; 
import Login from './views/Login'
import Encabezado from "./components/Encabezado";
import Inicio from "./views/Inicio";
import Categorias from "./views/categorias";// importacion de categorias
import Productos from "./views/Productos";


import './App.css'

function App() {

  return (
    <>
      <AuthProvider>
        <Router>
        
            <Encabezado />
            <main className="margen-superior-main">
            <Routes>
                
                <Route path="/" element={<Login />} />
                <Route path="/inicio" element={<ProtectedRoute element={<Inicio />} />} />
                <Route path="/categorias" element={<ProtectedRoute element={<Categorias />} />}/> //Ruta de Categorias protegida
                <Route path="/productos" element={<ProtectedRoute element={<Productos />} />}/>

              </Routes>
            </main>
         
        </Router>
      </AuthProvider>
    </>
  )
}

export default App
