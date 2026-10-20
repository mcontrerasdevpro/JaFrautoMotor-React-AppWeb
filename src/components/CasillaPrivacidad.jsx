import PropTypes from "prop-types";
import { Link } from "react-router-dom";

// Casilla obligatoria de aceptación de la política de privacidad (RGPD)
export const CasillaPrivacidad = ({ id, checked, onChange, oscuro = false }) => (
    <div className="form-check mt-3">
        <input
            id={id}
            type="checkbox"
            className="form-check-input"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            required
        />
        <label htmlFor={id} className={`form-check-label small ${oscuro ? "text-white-50" : "text-secondary"}`}>
            He leído y acepto la{" "}
            <Link to="/politicaPrivacidad" target="_blank" className="text-danger fw-bold">política de privacidad</Link>.
            Usaremos tus datos solo para atender tu solicitud.
        </label>
    </div>
);

CasillaPrivacidad.propTypes = {
    id: PropTypes.string.isRequired,
    checked: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    oscuro: PropTypes.bool
};
