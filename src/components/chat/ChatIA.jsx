import React, { useEffect, useState } from "react";
import { collection, addDoc, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../../database/firebaseConfig";
import { Button, Form, ListGroup, Spinner, Modal } from "react-bootstrap";

// Función para obtener respuesta desde Google AI API
const obtenerRespuestaIA = async (promptUsuario) => {
  const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
  const prompt = `Extrae el nombre y la descripción de categoría en este mensaje: "${promptUsuario}". Si el usuario no provee una descripción, genera una descripción corta basándote en el nombre. Asegúrate que el nombre y descripción contengan mayúsculas. Devuélvelo en JSON como {"nombre": "...", "descripcion": "..."}.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { response_mime_type: "application/json" },
        }),
      }
    );

    if (response.status === 429) {
      return "Has alcanzado el límite de solicitudes. Intenta de nuevo más tarde.";
    }

    const data = await response.json();
    const respuestaIA = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!respuestaIA) return "No hubo respuesta de la IA.";
    return respuestaIA;
  } catch (error) {
    console.error("Error al obtener respuesta de la IA:", error);
    return "No se pudo conectar con la IA. Verifica tu conexión o API Key.";
  }
};

const ChatIA = ({ showChatModal, setShowChatModal }) => {
  const [mensaje, setMensaje] = useState("");
  const [mensajes, setMensajes] = useState([]);
  const [cargando, setCargando] = useState(false);

  const chatCollection = collection(db, "chat");

  // Escucha mensajes en tiempo real
  useEffect(() => {
    const q = query(chatCollection, orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mensajesObtenidos = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMensajes(mensajesObtenidos);
    });
    return () => unsubscribe();
  }, []);

  // Función para enviar mensaje
  const enviarMensaje = async () => {
    if (!mensaje.trim()) return;

    const nuevoMensaje = {
      texto: mensaje,
      emisor: "usuario",
      timestamp: new Date(),
    };

    setCargando(true);
    setMensaje("");

    try {
      await addDoc(chatCollection, nuevoMensaje);

      const respuestaIA = await obtenerRespuestaIA(mensaje);
      await addDoc(chatCollection, {
        texto: `Ok, vamos a registrar ${respuestaIA} en la base de datos.`,
        emisor: "ia",
        timestamp: new Date(),
      });

      try {
        const datos = JSON.parse(respuestaIA);
        if (datos.nombre && datos.descripcion) {
          await addDoc(collection(db, "categorias"), {
            nombre: datos.nombre,
            descripcion: datos.descripcion,
          });

          await addDoc(chatCollection, {
            texto: `Categoría "${datos.nombre}" registrada con éxito.`,
            emisor: "ia",
            timestamp: new Date(),
          });
        } else {
          await addDoc(chatCollection, {
            texto: "No se pudo registrar la categoría. El JSON no contiene la información esperada.",
            emisor: "ia",
            timestamp: new Date(),
          });
        }
      } catch (err) {
        console.error("Error al procesar el JSON:", err);
        await addDoc(chatCollection, {
          texto: "La IA no devolvió un JSON válido.",
          emisor: "ia",
          timestamp: new Date(),
        });
      }
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      await addDoc(chatCollection, {
        texto: "Hubo un error al procesar tu solicitud. Por favor, intenta de nuevo más tarde.",
        emisor: "ia",
        timestamp: new Date(),
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal show={showChatModal} onHide={() => setShowChatModal(false)} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Chat con IA</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ListGroup style={{ maxHeight: "300px", overflow: "auto" }}>
          {mensajes.map((msg) => (
            <ListGroup.Item
              key={msg.id}
              variant={msg.emisor === "ia" ? "light" : "primary"}
            >
              <strong>{msg.emisor === "ia" ? "IA: " : "Tú: "}</strong>
              {msg.texto}
            </ListGroup.Item>
          ))}
        </ListGroup>

        <Form.Control
          className="mt-3"
          type="text"
          placeholder="Escribe tu mensaje..."
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && enviarMensaje()}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowChatModal(false)}>
          Cerrar
        </Button>
        <Button onClick={enviarMensaje} disabled={cargando}>
          {cargando ? <Spinner size="sm" animation="border" /> : "Enviar"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ChatIA;
