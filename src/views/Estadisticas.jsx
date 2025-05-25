// src/views/Estadisticas.jsx
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import { GraficoProductos } from "../components/estadisticas/GraficoProductos";
import { db } from "../database/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

const Estadisticas = () => {
  const [nombres, setNombres] = useState([]);
  const [precios, setPrecios] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "productos"));
        const nombresTemp = [];
        const preciosTemp = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          nombresTemp.push(data.nombre);
          preciosTemp.push(data.precio);
        });

        setNombres(nombresTemp);
        setPrecios(preciosTemp);
        setCargando(false);
      } catch (error) {
        console.error("Error obteniendo productos:", error);
      }
    };

    obtenerDatos();
  }, []);

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">Estadísticas de Productos</h2>
      {cargando ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : (
        <Row className="justify-content-center">
          <Col md={8}>
            <GraficoProductos nombres={nombres} precios={precios} />
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Estadisticas;
