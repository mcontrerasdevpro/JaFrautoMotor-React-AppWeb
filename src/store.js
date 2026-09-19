export const initialStore = () => {
  const persistencia = localStorage.getItem("taller_app_data");
  
  if (persistencia) {
      try {
          return JSON.parse(persistencia);
      } catch (e) {
          console.error("Error al leer el localStorage", e);
      }
  }

  return {
    servicios: [],
    urgente: [],
    vehiculo: null,
    citas: [],
    cita_programada: { fecha: "", hora: "" },
    busqueda: "",
    usuario: null,
    token: null
  };
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case 'set_servicios':
      return { ...store, servicios: action.payload };

        case "set_busqueda":
      // Actualizamos la búsqueda (no hace falta persistirla en localStorage si no quieres)
      return { ...store, busqueda: action.payload };

    
    case 'set_fecha_cita':
    return { 
        ...store, 
        cita_programada: { ...store.cita_programada, ...action.payload } 
    };

    case 'toggle_urgente':
      const item = action.payload;
      const existe = store.urgente.some(serv => serv.id === item.id);

      return {
        ...store,
        urgente: existe
          ? store.urgente.filter(serv => serv.id !== item.id)
          : [...store.urgente, item]
      };

    case 'set_usuario':
      return { ...store, usuario: action.payload.user, token: action.payload.token };

    case 'logout':
      return { ...store, usuario: null, token: null, urgente: [], citas: [] };

    case 'set_citas':
      return { ...store, citas: action.payload };

    default:
      return store;
  }
}