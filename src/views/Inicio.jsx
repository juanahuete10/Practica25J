import { useNavigate } from "react-router-dom";

const Inicio = () => {
  const navigate = useNavigate();

  // Función de navegación
  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Inicio</h1>
      <button style={styles.button} onClick={() => handleNavigate("/categorias")}>
        Ir a Categorías
      </button>
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
  },
  buttonHover: {
    filter: "brightness(1.1)",
  },
};

export default Inicio;
