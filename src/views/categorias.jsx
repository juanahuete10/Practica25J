// Importaciones
import React, { useState, useEffect } from "react";
import { Container, Button } from "react-bootstrap";
import { db } from "../database/firebaseConfig";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";

// Importaciones de componentes personalizados
import TablaCategorias from "../components/Categorias/TablaCategorias";
import ModalRegistroCategoria from "../components/Categorias/ModalRegistroCategoria";
import ModalEdicionCategoria from "../components/Categorias/ModalEdicionCategoria";
import ModalEliminacionCategoria from "../components/Categorias/ModalEliminacionCategoria";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";

const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [categoriasFiltradas, setCategoriasFiltradas] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [nuevaCategoria, setNuevaCategoria] = useState({
    nombre: "",
    descripcion: "",
  });
  const [categoriaEditada, setCategoriaEditada] = useState(null);
  const [categoriaAEliminar, setCategoriaAEliminar] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Detectar cambios en la conexión
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      alert("¡Conexión restablecida!");
    };
    const handleOffline = () => {
      setIsOffline(true);
      alert("Estás offline. Los cambios se sincronizarán cuando vuelvas a conectarte.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const categoriasCollection = collection(db, "categorias");

  const fetchCategorias = () => {
    const stopListening = onSnapshot(
      categoriasCollection,
      (snapshot) => {
        const fetchedCategorias = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setCategorias(fetchedCategorias);
        setCategoriasFiltradas(fetchedCategorias);
        console.log("Categorías cargadas desde Firestore:", fetchedCategorias);
        if (isOffline) {
          console.log("Offline: Mostrando datos desde la caché local.");
        }
      },
      (error) => {
        console.error("Error al escuchar categorías:", error);
        if (isOffline) {
          console.log("Offline: Mostrando datos desde la caché local.");
        } else {
          alert("Error al cargar las categorías: " + error.message);
        }
      }
    );
    return stopListening;
  };

  useEffect(() => {
    const cleanupListener = fetchCategorias();
    return () => cleanupListener();
  }, []);

  const handleSearchChange = (e) => {
    const text = e.target.value.toLowerCase();
    setSearchText(text);
    const filtradas = categorias.filter(
      (cat) =>
        cat.nombre.toLowerCase().includes(text) ||
        cat.descripcion.toLowerCase().includes(text)
    );
    setCategoriasFiltradas(filtradas);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevaCategoria((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setCategoriaEditada((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Agregar categoría
  const handleAddCategoria = async () => {
    if (!nuevaCategoria.nombre || !nuevaCategoria.descripcion) {
      alert("Por favor, completa todos los campos antes de guardar.");
      return;
    }

    setShowModal(false);

    const tempId = `temp_${Date.now()}`;
    const categoriaConId = { ...nuevaCategoria, id: tempId };

    try {
      setCategorias((prev) => [...prev, categoriaConId]);
      setCategoriasFiltradas((prev) => [...prev, categoriaConId]);

      setNuevaCategoria({ nombre: "", descripcion: "" });

      await addDoc(categoriasCollection, nuevaCategoria);

      if (isOffline) {
        console.log("Categoría agregada localmente (sin conexión).");
      } else {
        console.log("Categoría agregada exitosamente en la nube.");
      }
    } catch (error) {
      console.error("Error al agregar la categoría:", error);

      if (isOffline) {
        console.log("Offline: Categoría almacenada localmente.");
      } else {
        setCategorias((prev) => prev.filter((cat) => cat.id !== tempId));
        setCategoriasFiltradas((prev) => prev.filter((cat) => cat.id !== tempId));
        alert("Error al agregar la categoría: " + error.message);
      }
    }
  };

  // Editar categoría
  const handleEditCategoria = async () => {
    if (!categoriaEditada?.nombre || !categoriaEditada?.descripcion) {
      alert("Por favor, completa todos los campos antes de actualizar.");
      return;
    }

    setShowEditModal(false);
    const categoriaRef = doc(db, "categorias", categoriaEditada.id);

    try {
      await updateDoc(categoriaRef, {
        nombre: categoriaEditada.nombre,
        descripcion: categoriaEditada.descripcion,
      });

      if (isOffline) {
        setCategorias((prev) =>
          prev.map((cat) =>
            cat.id === categoriaEditada.id ? { ...categoriaEditada } : cat
          )
        );
        setCategoriasFiltradas((prev) =>
          prev.map((cat) =>
            cat.id === categoriaEditada.id ? { ...categoriaEditada } : cat
          )
        );
        console.log("Categoría actualizada localmente (sin conexión).");
        alert("Sin conexión: Categoría actualizada localmente. Se sincronizará cuando haya internet.");
      } else {
        console.log("Categoría actualizada exitosamente en la nube.");
      }
    } catch (error) {
      console.error("Error al actualizar la categoría:", error);
      setCategorias((prev) =>
        prev.map((cat) =>
          cat.id === categoriaEditada.id ? { ...categoriaEditada } : cat
        )
      );
      setCategoriasFiltradas((prev) =>
        prev.map((cat) =>
          cat.id === categoriaEditada.id ? { ...categoriaEditada } : cat
        )
      );
      alert("Ocurrió un error al actualizar la categoría: " + error.message);
    }
  };

  // Eliminar categoría
  const handleDeleteCategoria = async () => {
    if (!categoriaAEliminar) return;

    setShowDeleteModal(false);

    try {
      setCategorias((prev) => prev.filter((cat) => cat.id !== categoriaAEliminar.id));
      setCategoriasFiltradas((prev) => prev.filter((cat) => cat.id !== categoriaAEliminar.id));

      const categoriaRef = doc(db, "categorias", categoriaAEliminar.id);
      await deleteDoc(categoriaRef);

      if (isOffline) {
        console.log("Categoría eliminada localmente (sin conexión).");
      } else {
        console.log("Categoría eliminada exitosamente en la nube.");
      }
    } catch (error) {
      console.error("Error al eliminar la categoría:", error);

      if (isOffline) {
        console.log("Offline: Eliminación almacenada localmente.");
      } else {
        setCategorias((prev) => [...prev, categoriaAEliminar]);
        setCategoriasFiltradas((prev) => [...prev, categoriaAEliminar]);
        alert("Error al eliminar la categoría: " + error.message);
      }
    }
  };

  const openEditModal = (categoria) => {
    setCategoriaEditada({ ...categoria });
    setShowEditModal(true);
  };

  const openDeleteModal = (categoria) => {
    setCategoriaAEliminar(categoria);
    setShowDeleteModal(true);
  };

  return (
    <Container className="mt-5">
      <h4>Gestión de Categorías</h4>
      <Button className="mb-3" onClick={() => setShowModal(true)}>
        Agregar categoría
      </Button>

      <CuadroBusquedas searchText={searchText} handleSearchChange={handleSearchChange} />

      <TablaCategorias
        categorias={categoriasFiltradas}
        openEditModal={openEditModal}
        openDeleteModal={openDeleteModal}
      />
      <ModalRegistroCategoria
        showModal={showModal}
        setShowModal={setShowModal}
        nuevaCategoria={nuevaCategoria}
        handleInputChange={handleInputChange}
        handleAddCategoria={handleAddCategoria}
      />
      <ModalEdicionCategoria
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        categoriaEditada={categoriaEditada}
        handleEditInputChange={handleEditInputChange}
        handleEditCategoria={handleEditCategoria}
      />
      <ModalEliminacionCategoria
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        handleDeleteCategoria={handleDeleteCategoria}
      />
    </Container>
  );
};

export default Categorias;
