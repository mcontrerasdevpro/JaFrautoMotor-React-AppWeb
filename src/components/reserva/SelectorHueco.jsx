import { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { apiFetch } from "../../api";
import { diaSiguiente, partesFecha, textoFecha } from "../../utils/fechas";

const DIAS_POR_PAGINA = 10;

// Elige día y hora entre los huecos libres que devuelve GET /availability
export const SelectorHueco = ({ valor, onChange, recargar = 0 }) => {
    const [dias, setDias] = useState([]);
    const [desde, setDesde] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [diaActivo, setDiaActivo] = useState(valor?.date || null);

    const cargar = useCallback(async (fechaDesde) => {
        setCargando(true);
        setError("");
        try {
            const query = fechaDesde ? `?from=${fechaDesde}&days=${DIAS_POR_PAGINA}` : `?days=${DIAS_POR_PAGINA}`;
            const data = await apiFetch(`/availability${query}`);
            setDias(data.days);
            setDiaActivo((actual) => {
                if (actual && data.days.some((d) => d.date === actual)) return actual;
                const primeroLibre = data.days.find((d) => !d.blocked && d.slots.some((s) => s.free > 0));
                return primeroLibre ? primeroLibre.date : null;
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        cargar(desde);
    }, [cargar, desde, recargar]);

    const siguientePagina = () => {
        if (!dias.length) return;
        setDesde(diaSiguiente(dias[dias.length - 1].date));
    };

    const dia = dias.find((d) => d.date === diaActivo);

    if (error) {
        return (
            <div className="alert alert-warning" role="alert">
                {error}
                <button type="button" className="btn btn-sm btn-outline-dark ms-2" onClick={() => cargar(desde)}>Reintentar</button>
            </div>
        );
    }

    return (
        <div>
            <div className="d-flex align-items-center justify-content-between mb-2">
                <h3 className="h6 fw-bold text-uppercase mb-0">Elige el día</h3>
                <div className="d-flex gap-2">
                    {desde && (
                        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setDesde(null)}>
                            <i className="fa-solid fa-chevron-left me-1"></i>Primeros días
                        </button>
                    )}
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={siguientePagina} disabled={cargando}>
                        Más días<i className="fa-solid fa-chevron-right ms-1"></i>
                    </button>
                </div>
            </div>

            {cargando ? (
                <div className="text-center py-4 text-muted">
                    <div className="spinner-border spinner-border-sm text-danger me-2" role="status"></div>Cargando huecos libres...
                </div>
            ) : dias.length === 0 ? (
                <p className="text-muted">No hay más días disponibles para reservar por la web. Llámanos y te buscamos hueco.</p>
            ) : (
                <>
                    <div className="d-flex gap-2 overflow-auto pb-2 mb-3" role="listbox" aria-label="Días disponibles">
                        {dias.map((d) => {
                            const f = partesFecha(d.date);
                            const libres = d.slots.reduce((acc, s) => acc + s.free, 0);
                            const deshabilitado = d.blocked || libres === 0;
                            const activo = d.date === diaActivo;
                            return (
                                <button
                                    key={d.date}
                                    type="button"
                                    role="option"
                                    aria-selected={activo}
                                    disabled={deshabilitado}
                                    title={d.blocked ? (d.reason || "Taller cerrado") : libres === 0 ? "Completo" : ""}
                                    onClick={() => setDiaActivo(d.date)}
                                    className={`btn flex-shrink-0 rounded-0 text-center px-2 py-2 ${activo ? "btn-danger" : "btn-outline-dark"}`}
                                    style={{ width: "72px" }}
                                >
                                    <div className="small text-uppercase">{f.semana}</div>
                                    <div className="fs-4 fw-bold lh-1">{f.numero}</div>
                                    <div className="small text-uppercase">{f.mes}</div>
                                    <div className="small mt-1" style={{ fontSize: "0.65rem" }}>
                                        {d.blocked ? "CERRADO" : libres === 0 ? "COMPLETO" : "LIBRE"}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {dia && (
                        <>
                            <h3 className="h6 fw-bold text-uppercase mb-2">Hora de entrada · {textoFecha(dia.date)}</h3>
                            <div className="row g-2">
                                {dia.slots.map((s) => {
                                    const elegido = valor?.date === dia.date && valor?.time === s.time;
                                    return (
                                        <div className="col-4 col-md-2" key={s.time}>
                                            <button
                                                type="button"
                                                disabled={s.free === 0}
                                                onClick={() => onChange({ date: dia.date, time: s.time })}
                                                aria-pressed={elegido}
                                                className={`btn w-100 rounded-0 py-2 ${elegido ? "btn-danger" : "btn-outline-dark"}`}
                                            >
                                                <div className="fw-bold">{s.time}</div>
                                                <div style={{ fontSize: "0.7rem" }}>{s.free === 0 ? "completo" : `${s.free} libre${s.free > 1 ? "s" : ""}`}</div>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

SelectorHueco.propTypes = {
    valor: PropTypes.shape({ date: PropTypes.string, time: PropTypes.string }),
    onChange: PropTypes.func.isRequired,
    recargar: PropTypes.number
};
