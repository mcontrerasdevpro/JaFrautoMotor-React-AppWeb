import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PropTypes from "prop-types";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { apiFetch } from "../api";
import { TALLER } from "../config";
import { CasillaPrivacidad } from "../components/CasillaPrivacidad";
import { SelectorHueco } from "../components/reserva/SelectorHueco";
import { textoFecha } from "../utils/fechas";
import { paginaPorSlug } from "../data/paginasServicio";
import { Seo } from "../components/Seo";
import { Icono } from "../components/Icono";

const ID_DIAGNOSIS = 3;

const PASOS = ["Problema", "Servicio", "Día y hora", "Tus datos", "Confirmar"];

const SINTOMAS_RAPIDOS = [
    "Ruido o chirrido al frenar",
    "Se ha encendido un testigo",
    "Toca revisión y cambio de aceite",
    "Quiero pasar la ITV",
    "El aire acondicionado no enfría",
    "Vibra el volante o he pinchado"
];

const DATOS_VACIOS = { name: "", phone: "", email: "", vehicle: "", plate: "" };

// Asistente de reservas paso a paso. Sirve para invitados y para clientes con cuenta.
export const Reservar = () => {
    const { store, dispatch } = useGlobalReducer();
    const usuario = store.usuario;

    // Desde una página de servicio llega ?servicio=<slug>: servicio ya elegido (o el motivo
    // escrito si no está en el catálogo, con una revisión/diagnosis como servicio)
    const [params] = useSearchParams();
    const [desdeServicio] = useState(() => paginaPorSlug(params.get("servicio") || ""));
    const idsIniciales = desdeServicio
        ? [desdeServicio.servicioId ?? ID_DIAGNOSIS]
        : store.urgente.map((s) => s.id).filter(Number.isInteger);

    const [paso, setPaso] = useState(idsIniciales.length > 0 ? 2 : 1);
    const [apiDespierta, setApiDespierta] = useState(true);
    const [catalogo, setCatalogo] = useState(store.servicios);
    const [sintoma, setSintoma] = useState(desdeServicio?.motivo || "");
    const [sugerencia, setSugerencia] = useState(desdeServicio?.motivo ? {
        urgente: false,
        mensaje: `Has pedido: ${desdeServicio.motivo}. Lo anotamos en la cita y Francisco o Jacinto revisarán el coche antes de darte presupuesto.`
    } : null);
    const [usoAsistente, setUsoAsistente] = useState(false);
    const [seleccion, setSeleccion] = useState(idsIniciales);
    const [hueco, setHueco] = useState(null);
    const [recargarHuecos, setRecargarHuecos] = useState(0);
    const [datos, setDatos] = useState(DATOS_VACIOS);
    const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");
    const [confirmada, setConfirmada] = useState(null);

    // Despierta la API nada más entrar (en el plan gratuito de Render tarda en arrancar)
    useEffect(() => {
        const aviso = setTimeout(() => setApiDespierta(false), 2500);
        apiFetch("/health").catch(() => null).finally(() => {
            clearTimeout(aviso);
            setApiDespierta(true);
        });
        apiFetch("/services")
            .then((data) => setCatalogo(data.map((s) => ({ id: s.id, name: s.name, description: s.description || "", precio: s.price }))))
            .catch(() => null);
        return () => clearTimeout(aviso);
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [paso, confirmada]);

    const promociones = store.urgente.filter((s) => s.promo).map((s) => s.promo);
    const serviciosElegidos = useMemo(() => catalogo.filter((s) => seleccion.includes(s.id)), [catalogo, seleccion]);
    const totalEstimado = serviciosElegidos.reduce((acc, s) => acc + (Number(s.precio) || 0), 0);

    const cambiarDato = (campo) => (e) => setDatos({ ...datos, [campo]: e.target.value });

    const alternarServicio = (id) =>
        setSeleccion(seleccion.includes(id) ? seleccion.filter((x) => x !== id) : [...seleccion, id]);

    const pedirSugerencia = async (e) => {
        e.preventDefault();
        setError("");
        setCargando(true);
        try {
            const data = await apiFetch("/assistant/suggest", { method: "POST", body: { text: sintoma } });
            setSugerencia(data);
            setUsoAsistente(true);
            if (data.service_ids.length) setSeleccion(data.service_ids);
            setPaso(2);
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    const confirmar = async () => {
        setError("");
        setCargando(true);
        const notas = [sintoma.trim(), ...promociones.map((p) => `Promoción: ${p}`)].filter(Boolean).join("\n");
        const cuerpo = {
            service_ids: seleccion,
            date: hueco.date,
            time: hueco.time,
            vehicle: datos.vehicle,
            plate: datos.plate,
            symptom: notas || undefined,
            source: usoAsistente ? "asistente" : "web"
        };
        if (!usuario) {
            Object.assign(cuerpo, { name: datos.name, phone: datos.phone, email: datos.email || undefined, acepta_privacidad: aceptaPrivacidad });
        }
        try {
            const data = await apiFetch("/appointment", { method: "POST", token: store.token, body: cuerpo });
            setConfirmada(data);
            dispatch({ type: "vaciar_urgente" });
        } catch (err) {
            setError(err.message);
            // Si alguien se ha llevado el hueco mientras tanto, volvemos a elegir hora
            if (err.code === "slot_unavailable") {
                setHueco(null);
                setRecargarHuecos((n) => n + 1);
                setPaso(3);
            }
            // Sesión caducada: ahora reserva como invitado y tiene que poner sus datos
            if (err.status === 401) setPaso(4);
        } finally {
            setCargando(false);
        }
    };

    if (confirmada) {
        return <CitaConfirmada confirmada={confirmada} invitado={!usuario} emailInicial={datos.email} />;
    }

    const puedeSeguir = {
        2: seleccion.length > 0,
        3: !!hueco,
        4: datos.vehicle.trim().length > 1 && datos.plate.trim().length > 3 &&
            (usuario || (datos.name.trim().length > 1 && datos.phone.trim().length >= 9 && aceptaPrivacidad))
    };

    return (
        <div className="container py-4 py-lg-5 text-dark" style={{ maxWidth: "860px" }}>
            <Seo titulo="Pide cita en el taller" descripcion="Reserva tu cita en JaFrauto Motor (Jaén) en unos pasos y sin crear una cuenta." ruta="/reservar" noindex />
            <h1 className="fw-bold text-uppercase mb-1">Pide tu <span className="text-danger">cita</span></h1>
            <p className="text-secondary mb-4">En unos pasos y sin necesidad de crear una cuenta. Si es urgente, llámanos al{" "}
                <a href={TALLER.telefono.href} className="fw-bold text-danger">{TALLER.telefono.texto}</a>.</p>

            {/* INDICADOR DE PASOS */}
            <ol className="list-unstyled d-flex gap-1 mb-4" aria-label="Pasos de la reserva">
                {PASOS.map((nombre, i) => {
                    const n = i + 1;
                    const estado = n < paso ? "bg-dark text-white" : n === paso ? "bg-danger text-white" : "bg-light text-muted";
                    return (
                        <li key={nombre} className={`flex-fill text-center py-2 small fw-bold ${estado}`} aria-current={n === paso ? "step" : undefined}>
                            <span className="d-none d-md-inline">{n}. {nombre}</span>
                            <span className="d-md-none">{n}</span>
                        </li>
                    );
                })}
            </ol>

            {!apiDespierta && (
                <div className="alert alert-info small" role="status">
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Preparando la agenda... puede tardar unos segundos.
                </div>
            )}

            {error && <div className="alert alert-danger" role="alert">{error}</div>}

            <div className="card border-0 shadow-lg rounded-0 border-top border-5 border-danger p-3 p-md-4">

                {/* PASO 1: QUÉ LE PASA AL COCHE */}
                {paso === 1 && (
                    <form onSubmit={pedirSugerencia}>
                        <h2 className="h4 fw-bold mb-3">¿Qué le pasa a tu coche?</h2>
                        <div className="d-flex flex-wrap gap-2 mb-3">
                            {SINTOMAS_RAPIDOS.map((texto) => (
                                <button key={texto} type="button" onClick={() => setSintoma(texto)}
                                    className={`btn btn-sm rounded-pill ${sintoma === texto ? "btn-dark" : "btn-outline-dark"}`}>
                                    {texto}
                                </button>
                            ))}
                        </div>
                        <label htmlFor="res-sintoma" className="small fw-bold text-muted">CUÉNTANOS CON TUS PALABRAS</label>
                        <textarea id="res-sintoma" className="form-control bg-light border-0 mb-3" rows="3" maxLength={500}
                            placeholder="Ej: al frenar hace un ruido metálico y vibra el volante"
                            value={sintoma} onChange={(e) => setSintoma(e.target.value)} />
                        <div className="d-flex flex-column flex-sm-row gap-2 justify-content-between">
                            <button type="button" className="btn btn-link text-dark px-0" onClick={() => setPaso(2)}>
                                Ya sé qué servicio quiero
                            </button>
                            <button type="submit" className="btn btn-danger fw-bold rounded-0 px-4" disabled={sintoma.trim().length < 3 || cargando}>
                                {cargando ? "Pensando..." : "SIGUIENTE"}
                            </button>
                        </div>
                    </form>
                )}

                {/* PASO 2: SERVICIOS */}
                {paso === 2 && (
                    <div>
                        <h2 className="h4 fw-bold mb-3">¿Qué servicio necesitas?</h2>
                        {sugerencia && (
                            <div className={`alert ${sugerencia.urgente ? "alert-danger" : "alert-secondary"} small`} role="status">
                                <Icono nombre={sugerencia.urgente ? "triangle-exclamation" : "lightbulb"} className="me-2" />
                                {sugerencia.mensaje}
                                {sugerencia.urgente && (
                                    <a href={TALLER.telefono.href} className="btn btn-danger btn-sm fw-bold rounded-0 ms-md-2 mt-2 mt-md-0">
                                        <Icono nombre="phone" className="me-1" />LLAMAR AHORA
                                    </a>
                                )}
                            </div>
                        )}
                        {promociones.length > 0 && (
                            <p className="small text-success fw-bold"><Icono nombre="tag" className="me-1" />Promoción: {promociones.join(", ")}</p>
                        )}
                        <div className="row g-2 mb-3">
                            {catalogo.map((s) => {
                                const marcado = seleccion.includes(s.id);
                                return (
                                    <div className="col-md-6" key={s.id}>
                                        <label className={`d-flex align-items-start gap-2 p-3 h-100 border ${marcado ? "border-danger bg-danger bg-opacity-10" : "border-light-subtle"}`}
                                            style={{ cursor: "pointer" }}>
                                            <input type="checkbox" className="form-check-input mt-1" checked={marcado} onChange={() => alternarServicio(s.id)} />
                                            <span>
                                                <span className="fw-bold d-block">{s.name}</span>
                                                <span className="small text-secondary">{s.description}</span>
                                            </span>
                                        </label>
                                    </div>
                                );
                            })}
                        </div>
                        <NavegacionPasos atras={() => setPaso(1)} siguiente={() => setPaso(3)} habilitado={puedeSeguir[2]} />
                    </div>
                )}

                {/* PASO 3: DÍA Y HORA */}
                {paso === 3 && (
                    <div>
                        <h2 className="h4 fw-bold mb-3">¿Cuándo te viene bien traerlo?</h2>
                        <SelectorHueco valor={hueco} onChange={setHueco} recargar={recargarHuecos} />
                        <div className="mt-3">
                            <NavegacionPasos atras={() => setPaso(2)} siguiente={() => setPaso(4)} habilitado={puedeSeguir[3]} />
                        </div>
                    </div>
                )}

                {/* PASO 4: DATOS */}
                {paso === 4 && (
                    <form onSubmit={(e) => { e.preventDefault(); setPaso(5); }}>
                        <h2 className="h4 fw-bold mb-3">Tus datos y los del coche</h2>
                        {usuario && (
                            <p className="small text-secondary">
                                Reservas como <strong>{usuario.name}</strong> ({usuario.phone}). Puedes cambiar tus datos en{" "}
                                <Link to="/mi-cuenta" className="text-danger">Mi cuenta</Link>.
                            </p>
                        )}
                        <div className="row g-3">
                            {!usuario && (
                                <>
                                    <div className="col-md-6">
                                        <label htmlFor="res-nombre" className="small fw-bold text-muted">NOMBRE</label>
                                        <input id="res-nombre" className="form-control bg-light border-0" autoComplete="name" maxLength={100}
                                            value={datos.name} onChange={cambiarDato("name")} required />
                                    </div>
                                    <div className="col-md-6">
                                        <label htmlFor="res-telefono" className="small fw-bold text-muted">TELÉFONO</label>
                                        <input id="res-telefono" type="tel" className="form-control bg-light border-0" autoComplete="tel"
                                            placeholder="600 000 000" value={datos.phone} onChange={cambiarDato("phone")} required />
                                    </div>
                                    <div className="col-12">
                                        <label htmlFor="res-email" className="small fw-bold text-muted">EMAIL (OPCIONAL, PARA RECIBIR LA CONFIRMACIÓN)</label>
                                        <input id="res-email" type="email" className="form-control bg-light border-0" autoComplete="email" maxLength={120}
                                            value={datos.email} onChange={cambiarDato("email")} />
                                    </div>
                                </>
                            )}
                            <div className="col-md-7">
                                <label htmlFor="res-vehiculo" className="small fw-bold text-muted">MARCA Y MODELO</label>
                                <input id="res-vehiculo" className="form-control bg-light border-0" placeholder="Ej: Peugeot 308" maxLength={100}
                                    value={datos.vehicle} onChange={cambiarDato("vehicle")} required />
                            </div>
                            <div className="col-md-5">
                                <label htmlFor="res-matricula" className="small fw-bold text-muted">MATRÍCULA</label>
                                <input id="res-matricula" className="form-control bg-light border-0 text-uppercase" placeholder="1234 ABC" maxLength={12}
                                    value={datos.plate} onChange={cambiarDato("plate")} required />
                            </div>
                        </div>
                        {!usuario && (
                            <CasillaPrivacidad id="res-privacidad" checked={aceptaPrivacidad} onChange={setAceptaPrivacidad} />
                        )}
                        <div className="mt-3">
                            <NavegacionPasos atras={() => setPaso(3)} habilitado={puedeSeguir[4]} enviar />
                        </div>
                    </form>
                )}

                {/* PASO 5: RESUMEN */}
                {paso === 5 && hueco && (
                    <div>
                        <h2 className="h4 fw-bold mb-3">Revisa y confirma</h2>
                        <dl className="row mb-3">
                            <dt className="col-sm-4 text-muted small text-uppercase">Cuándo</dt>
                            <dd className="col-sm-8 fw-bold">{textoFecha(hueco.date)} a las {hueco.time}</dd>
                            <dt className="col-sm-4 text-muted small text-uppercase">Servicios</dt>
                            <dd className="col-sm-8">{serviciosElegidos.map((s) => s.name).join(", ")}</dd>
                            <dt className="col-sm-4 text-muted small text-uppercase">Vehículo</dt>
                            <dd className="col-sm-8">{datos.vehicle} · <span className="text-uppercase">{datos.plate}</span></dd>
                            <dt className="col-sm-4 text-muted small text-uppercase">Contacto</dt>
                            <dd className="col-sm-8">{usuario ? `${usuario.name} · ${usuario.phone}` : `${datos.name} · ${datos.phone}`}</dd>
                            {sintoma.trim() && (
                                <>
                                    <dt className="col-sm-4 text-muted small text-uppercase">Lo que nos cuentas</dt>
                                    <dd className="col-sm-8">{sintoma}</dd>
                                </>
                            )}
                            <dt className="col-sm-4 text-muted small text-uppercase">Total estimado</dt>
                            <dd className="col-sm-8">{totalEstimado}€ <span className="small text-muted">(orientativo: el precio final lo confirma el taller tras revisar el coche)</span></dd>
                        </dl>
                        <div className="d-flex flex-column flex-sm-row gap-2 justify-content-between">
                            <button type="button" className="btn btn-outline-dark rounded-0" onClick={() => setPaso(4)}>
                                <Icono nombre="chevron-left" className="me-1" />ATRÁS
                            </button>
                            <button type="button" className="btn btn-danger fw-bold rounded-0 px-4 py-2" onClick={confirmar} disabled={cargando}>
                                {cargando ? "Reservando..." : "CONFIRMAR CITA"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const NavegacionPasos = ({ atras, siguiente, habilitado, enviar = false }) => (
    <div className="d-flex flex-column flex-sm-row gap-2 justify-content-between">
        <button type="button" className="btn btn-outline-dark rounded-0" onClick={atras}>
            <Icono nombre="chevron-left" className="me-1" />ATRÁS
        </button>
        <button type={enviar ? "submit" : "button"} className="btn btn-danger fw-bold rounded-0 px-4"
            onClick={enviar ? undefined : siguiente} disabled={!habilitado}>
            SIGUIENTE<Icono nombre="chevron-right" className="ms-1" />
        </button>
    </div>
);

NavegacionPasos.propTypes = {
    atras: PropTypes.func.isRequired,
    siguiente: PropTypes.func,
    habilitado: PropTypes.bool,
    enviar: PropTypes.bool
};

// Pantalla final: datos de la cita, enlace para gestionarla y cuenta opcional
const CitaConfirmada = ({ confirmada, invitado, emailInicial }) => {
    const { dispatch } = useGlobalReducer();
    const cita = confirmada.appointment;
    const enlace = `/cita/${confirmada.manage_token}`;
    const [email, setEmail] = useState(emailInicial || "");
    const [password, setPassword] = useState("");
    const [estadoCuenta, setEstadoCuenta] = useState({ enviando: false, error: "", creada: false });

    const crearCuenta = async (e) => {
        e.preventDefault();
        setEstadoCuenta({ enviando: true, error: "", creada: false });
        try {
            const data = await apiFetch("/register", {
                method: "POST",
                body: { name: cita.client, phone: cita.contact, email, password, acepta_privacidad: true, manage_token: confirmada.manage_token }
            });
            dispatch({ type: "set_usuario", payload: data });
            setEstadoCuenta({ enviando: false, error: "", creada: true });
        } catch (err) {
            setEstadoCuenta({ enviando: false, error: err.message, creada: false });
        }
    };

    return (
        <div className="container py-4 py-lg-5 text-dark" style={{ maxWidth: "720px" }}>
            <div className="card border-0 shadow-lg p-4 p-md-5 text-center rounded-0 border-top border-5 border-success">
                <Icono nombre="calendar-check" className="fa-4x text-success mb-3" />
                <h1 className="h2 fw-bold">¡Cita registrada!</h1>
                <p className="lead mb-1">{textoFecha(cita.date)} a las {cita.time}</p>
                <p className="text-secondary mb-1">{(cita.services || []).map((s) => s.name).join(", ")} · {cita.vehicle} {cita.plate}</p>
                <p className="text-secondary">Francisco o Jacinto te contactarán para confirmarla.{cita.email && " Te hemos enviado un email con los detalles."}</p>
                <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center my-3">
                    <Link to={enlace} className="btn btn-outline-dark rounded-0 fw-bold">
                        <Icono nombre="pen-to-square" className="me-2" />CAMBIAR O CANCELAR
                    </Link>
                    <a href={TALLER.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-success rounded-0 fw-bold">
                        <Icono nombre="whatsapp" className="me-2" />ESCRIBIRNOS
                    </a>
                </div>
                <p className="small text-muted mb-0">
                    Guarda este enlace para cambiar o cancelar la cita: <Link to={enlace} className="text-break">{window.location.origin}{enlace}</Link>
                </p>
            </div>

            {invitado && (
                <div className="card border-0 shadow p-4 mt-4 rounded-0">
                    {estadoCuenta.creada ? (
                        <p className="mb-0 text-success fw-bold"><Icono nombre="circle-check" className="me-2" />Cuenta creada. Verás esta cita en <Link to="/mi-cuenta">Mi cuenta</Link>.</p>
                    ) : (
                        <form onSubmit={crearCuenta}>
                            <h2 className="h5 fw-bold">¿Quieres ver tus citas cuando quieras? <span className="text-muted fw-normal small">(opcional)</span></h2>
                            <p className="small text-secondary">Crea una contraseña y guardaremos esta cita en tu cuenta.</p>
                            <div className="row g-2">
                                <div className="col-md-6">
                                    <label htmlFor="cuenta-email" className="visually-hidden">Email</label>
                                    <input id="cuenta-email" type="email" className="form-control" placeholder="Email" autoComplete="email"
                                        value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="cuenta-password" className="visually-hidden">Contraseña</label>
                                    <input id="cuenta-password" type="password" className="form-control" placeholder="Contraseña (mín. 8)" autoComplete="new-password"
                                        minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
                                </div>
                            </div>
                            {estadoCuenta.error && <div className="text-danger small mt-2" role="alert">{estadoCuenta.error}</div>}
                            <button type="submit" className="btn btn-dark rounded-0 fw-bold mt-3" disabled={estadoCuenta.enviando}>
                                {estadoCuenta.enviando ? "Creando..." : "CREAR CUENTA"}
                            </button>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
};

CitaConfirmada.propTypes = {
    confirmada: PropTypes.shape({
        appointment: PropTypes.object.isRequired,
        manage_token: PropTypes.string.isRequired
    }).isRequired,
    invitado: PropTypes.bool,
    emailInicial: PropTypes.string
};
