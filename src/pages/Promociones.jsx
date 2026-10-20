import { useNavigate } from "react-router-dom"; 
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Promociones = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();
    const { urgente } = store;

    const promos = [
        {
            id: "p1",
            servicioId: 6, // Revisión Pre-ITV del catálogo
            titulo: "PACK PRE-ITV",
            antes: "60€",
            ahora: "39€",
            precioNum: 39,
            descripcion: "Revisión de 50 puntos clave + reglaje de faros incluido. ¡Pasa la ITV a la primera!",
            valido: "Hasta fin de mes",
            color: "danger",
            image: "/preitv.png" // Imagen de inspección
        },
        {
            id: "p2",
            servicioId: 5, // Aire Acondicionado
            titulo: "CARGA AIRE ACONDICIONADO",
            antes: "80€",
            ahora: "60€",
            precioNum: 60,
            descripcion: "Carga de gas R134a + revisión de fugas + desinfección de conductos con ozono.",
            valido: "Especial Verano",
            color: "dark",
            image: "/aireacondicionado.jpg" // Imagen de aire acondicionado
        },
        {
            id: "p3",
            servicioId: 1, // Cambio de Aceite
            titulo: "CAMBIO ACEITE Y FILTRO",
            antes: "110€",
            ahora: "85€",
            precioNum: 85,
            descripcion: "Aceite sintético 5W30 (hasta 5L) + Filtro de aceite + Revisión de niveles gratuita.",
            valido: "Clientes Web",
            color: "danger",
            image: "/cambioaceite.jpg" // Imagen de cambio de aceite
        }
    ];

    // La promoción se reserva como su servicio del catálogo (la API solo acepta esos ids)
    // y se anota en la cita para que el taller aplique el precio de la oferta
    const manejarReserva = (promo) => {
        const estaEnCarrito = urgente.some(item => item.id === promo.servicioId);
        if (!estaEnCarrito) {
            dispatch({
                type: 'toggle_urgente',
                payload: {
                    id: promo.servicioId,
                    name: promo.titulo,
                    precio: promo.precioNum,
                    image: promo.image,
                    promo: promo.titulo
                }
            });
        }
        navigate("/reservar");
    };

    return (
        <div className="container py-4 py-lg-5">
            <div className="text-center mb-5">
                <h1 className="fw-bold display-4 text-uppercase">Ofertas <span className="text-danger">Especiales</span></h1>
                <p className="text-secondary lead">Descuentos exclusivos para que tu coche esté siempre a punto</p>
                <div className="mx-auto bg-danger" style={{ width: "60px", height: "4px" }}></div>
            </div>

            <div className="row g-4 mb-5">
                {promos.map((p) => {
                    const estaEnCarrito = urgente.some(item => item.id === p.servicioId);
                    
                    return (
                        <div className="col-md-4" key={p.id}>
                            <div className={`card h-100 border-0 shadow-lg position-relative overflow-hidden rounded-0`}>
                                
                                {/* CONTENEDOR DE IMAGEN CON ETIQUETA */}
                                <div className="position-relative" style={{ height: "200px" }}>
                                    <img 
                                        src={p.image} 
                                        className="w-100 h-100" 
                                        alt={p.titulo} 
                                        style={{ objectFit: "cover" }} 
                                    />
                                    <div className={`bg-${p.color} text-white position-absolute p-2 px-4 shadow`} 
                                         style={{ top: "15px", left: "0", fontWeight: "bold", zIndex: 1 }}>
                                        OFERTA LIMITADA
                                    </div>
                                    {/* Overlay oscuro para la imagen */}
                                    <div className="position-absolute top-0 start-0 w-100 h-100" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}></div>
                                </div>

                                <div className="card-body p-4 text-center">
                                    <h2 className="h4 fw-bold text-uppercase mb-3">{p.titulo}</h2>
                                    <div className="mb-3 d-flex align-items-center justify-content-center gap-2">
                                        <span className="text-muted text-decoration-line-through fs-5">{p.antes}</span>
                                        <span className={`display-6 fw-bold text-${p.color}`}>{p.ahora}</span>
                                    </div>
                                    <p className="small text-secondary mb-4" style={{ minHeight: "60px" }}>{p.descripcion}</p>
                                    
                                    <div className="border-top pt-3">
                                        <p className="text-uppercase mb-3 small fw-bold text-muted">
                                            <i className="fa-solid fa-calendar-check me-2 text-danger"></i>{p.valido}
                                        </p>
                                        <button 
                                            onClick={() => manejarReserva(p)}
                                            className={`btn btn-${estaEnCarrito ? 'dark' : p.color} w-100 fw-bold rounded-0 py-3 shadow`}
                                        >
                                            {estaEnCarrito ? (
                                                <><i className="fa-solid fa-check me-2"></i>VER EN MI CITA</>
                                            ) : (
                                                "RESERVAR AHORA"
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-dark text-white p-4 border-start border-5 border-danger shadow-sm mb-5">
                <div className="d-flex align-items-center">
                    <i className="fa-solid fa-circle-info fa-2x text-danger me-3"></i>
                    <p className="mb-0 small fw-bold">
                        * Promociones exclusivas para clientes web. Precios con IVA incluido. Válido en JaFrauto Motor Jaén para turismos estándar.
                    </p>
                </div>
            </div>
        </div>
    );
};