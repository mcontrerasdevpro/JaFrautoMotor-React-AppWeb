export const estadoInicial = {
  servicios: [],
  urgente: [],
  vehiculo: null,
  citas: [],
  cita_programada: { fecha: "", hora: "" },
  busqueda: "",
  usuario: null,
  token: null
};

const CLAVE_GUARDADO = "taller_app_data";

// Lo guardado en el navegador, mezclado con el estado inicial por si es de una versión anterior
export const leerGuardado = () => {
  try {
    const persistencia = localStorage.getItem(CLAVE_GUARDADO);
    return persistencia ? { ...estadoInicial, ...JSON.parse(persistencia) } : estadoInicial;
  } catch {
    return estadoInicial;
  }
};

export const guardar = (store) => {
  try {
    localStorage.setItem(CLAVE_GUARDADO, JSON.stringify(store));
  } catch {
    // Sin localStorage (modo privado estricto): la sesión dura lo que la pestaña
  }
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    // Carga lo guardado en el navegador después de hidratar una página prerenderizada
    case 'restaurar':
      return action.payload;

    case 'set_servicios':
      return { ...store, servicios: action.payload };

    case "set_busqueda":
      return { ...store, busqueda: action.payload };

    case 'set_fecha_cita':
      return {
        ...store,
        cita_programada: { ...store.cita_programada, ...action.payload }
      };

    case 'toggle_urgente': {
      const item = action.payload;
      const existe = store.urgente.some(serv => serv.id === item.id);

      return {
        ...store,
        urgente: existe
          ? store.urgente.filter(serv => serv.id !== item.id)
          : [...store.urgente, item]
      };
    }

    case 'vaciar_urgente':
      return { ...store, urgente: [] };

    case 'set_usuario':
      return { ...store, usuario: action.payload.user, token: action.payload.token };

    case 'logout':
      return { ...store, usuario: null, token: null, urgente: [], citas: [] };

    // La sesión caducó: pedimos login otra vez pero sin vaciar la selección de servicios
    case 'sesion_caducada':
      return { ...store, usuario: null, token: null, citas: [] };

    case 'set_citas':
      return { ...store, citas: action.payload };

    default:
      return store;
  }
}
