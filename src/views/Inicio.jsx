import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ModalInstalacionIOS from "../components/Inicio/ModalInstalacionIOS";
import Button from "react-bootstrap/Button"; // Asegúrate de tener instalado react-bootstrap
import "bootstrap-icons/font/bootstrap-icons.css"; // Asegúrate de importar los íconos

const Inicio = () => {
  const navigate = useNavigate();

  const [solicitudInstalacion, setSolicitudInstalacion] = useState(null);
  const [mostrarBotonInstalacion, setMostrarBotonInstalacion] = useState(false);
  const [esDispositivoIOS, setEsDispositivoIOS] = useState(false);
  const [mostrarModalInstrucciones, setMostrarModalInstrucciones] = useState(false);

  useEffect(() => {
    const esIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setEsDispositivoIOS(esIOS);
  }, []);

  useEffect(() => {
    const manejarSolicitudInstalacion = (evento) => {
      evento.preventDefault();
      setSolicitudInstalacion(evento);
      setMostrarBotonInstalacion(true);
    };

    window.addEventListener("beforeinstallprompt", manejarSolicitudInstalacion);

    return () => {
      window.removeEventListener("beforeinstallprompt", manejarSolicitudInstalacion);
    };
  }, []);

  const instalacion = async () => {
    if (!solicitudInstalacion) return;

    try {
      await solicitudInstalacion.prompt();
      const outcome = await solicitudInstalacion.userChoice;
      console.log(outcome === "accepted" ? "Instalación aceptada" : "Instalación rechazada");
    } catch (error) {
      console.error("Error al intentar instalar la PWA:", error);
    } finally {
      setSolicitudInstalacion(null);
      setMostrarBotonInstalacion(false);
    }
  };

  const abrirModalInstrucciones = () => setMostrarModalInstrucciones(true);
  const cerrarModalInstrucciones = () => setMostrarModalInstrucciones(false);

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Inicio</h1>

      <button style={styles.button} onClick={() => handleNavigate("/categorias")}>
        Ir a Categorías
      </button>
      <button style={styles.button} onClick={() => handleNavigate("/productos")}>
        Ir a Productos
      </button>
      <button style={styles.button} onClick={() => handleNavigate("/catalogo")}>
        Ir a Catálogo
      </button>

      {/* Botón para instalar en Android / navegadores compatibles */}
      {!esDispositivoIOS && mostrarBotonInstalacion && (
        <div className="my-4">
          <Button className="sombra" variant="primary" onClick={instalacion}>
            Instalar app Ferretería Selva <i className="bi bi-download"></i>
          </Button>
        </div>
      )}

      {/* Botón para mostrar instrucciones de instalación en iOS */}
      {esDispositivoIOS && (
        <div className="text-center my-4">
          <Button className="sombra" variant="primary" onClick={abrirModalInstrucciones}>
            Cómo instalar Ferretería Selva en iPhone <i className="bi bi-phone"></i>
          </Button>
        </div>
      )}

      {/* Modal de instrucciones para iOS */}
      <ModalInstalacionIOS
        mostrar={mostrarModalInstrucciones}
        cerrar={cerrarModalInstrucciones}
      />
    </div>
  );
};

const styles = {
  container: {
    textAlign: "center",
    padding: "50px",
  },
  title: {
    fontSize: "2rem",
    color: "#1e3d87",
    marginBottom: "20px",
  },
  button: {
    background: "linear-gradient(90deg, #0093E9 0%, #80D0C7 100%)",
    color: "#fff",
    padding: "10px 20px",
    fontSize: "16px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s ease-in-out",
    margin: "10px",
  },
};

export default Inicio;
