import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./database/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute"; 
import Login from './views/Login'
import Encabezado from "./components/Encabezado";
import Inicio from "./views/Inicio";
import Categorias from "./views/categorias"
import Productos from "./views/Productos";
import Libros from "./views/Libros";
import Catalogo from "./views/Catalogo";
import Clima from "./views/Clima";

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
                <Route path="/catalogo" element={<ProtectedRoute element={<Catalogo />} />}/>
                <Route path="/libros" element={<ProtectedRoute element={<Libros />} />}/>
                <Route path="/clima" element={<ProtectedRoute element={<Clima />} />}/>

              </Routes>
            </main>
         
        </Router>
      </AuthProvider>
    </>
  )
}

export default App
