// Páginas de servicio con intención de búsqueda local ("... en Jaén").
// Textos orientativos: sin precios ni plazos cerrados. Pendientes de revisión por el taller.
// servicioId enlaza con el catálogo de la API (preselecciona el servicio al pedir cita);
// si es null, el asistente de reservas arranca con el motivo ya escrito.

export const PAGINAS_SERVICIO = [
    {
        slug: "diagnosis-electronica-jaen",
        servicioId: 3,
        nombre: "Diagnosis electrónica",
        titulo: "Diagnosis electrónica en Jaén",
        descripcion: "¿Se te ha encendido un testigo o el coche da tirones? Diagnosis electrónica en Jaén con equipos multimarca y especialistas en Citroën, Peugeot y DS. Pide cita.",
        icono: "fa-microchip",
        imagen: "diagnosis",
        intro: [
            "Cuando se enciende un testigo en el cuadro, el coche pierde potencia o hace cosas raras, lo primero es saber qué está pasando. Con la diagnosis electrónica leemos los códigos de avería de las centralitas y comprobamos los valores de los sensores en funcionamiento.",
            "La lectura de códigos es solo el punto de partida: Francisco y Jacinto interpretan los datos y revisan el coche antes de decirte qué hay que reparar. Así evitas cambiar piezas a ciegas."
        ],
        incluye: [
            "Lectura y borrado de códigos de avería de motor, ABS, airbag y otros sistemas",
            "Comprobación de sensores y parámetros en tiempo real",
            "Revisión del origen de la avería antes de proponer la reparación",
            "Explicación clara de lo que ha salido y presupuesto sin compromiso"
        ],
        senales: [
            "Testigo de motor, ABS, airbag o precalentamiento encendido",
            "Pérdida de potencia, tirones o el coche entra en modo de emergencia",
            "Consumo más alto de lo normal o humo extraño por el escape",
            "Arranques difíciles o el motor se para"
        ],
        faq: [
            {
                pregunta: "¿Basta con borrar el testigo?",
                respuesta: "No. Si se borra el código sin reparar la causa, el testigo vuelve a encenderse y la avería puede ir a más. Lo importante es encontrar el origen."
            },
            {
                pregunta: "¿Trabajáis con todas las marcas?",
                respuesta: "Sí, trabajamos con equipos multimarca. Además somos especialistas en Citroën, Peugeot y DS."
            },
            {
                pregunta: "¿Puedo seguir circulando con el testigo encendido?",
                respuesta: "Depende del testigo. Si es rojo o parpadea, para el coche en cuanto sea seguro y llámanos. Si es ámbar, pide cita cuanto antes para revisarlo."
            }
        ]
    },
    {
        slug: "frenos-jaen",
        servicioId: 2,
        nombre: "Frenos",
        titulo: "Frenos en Jaén: pastillas, discos y líquido",
        descripcion: "Revisión y cambio de pastillas, discos y líquido de frenos en Jaén. Si chirrían, vibran o el pedal va largo, pide cita en JaFrauto Motor (Polígono Los Olivares).",
        icono: "fa-circle-stop",
        imagen: "sistemafrenos",
        intro: [
            "Los frenos son el sistema de seguridad más importante del coche. Revisamos pastillas, discos, pinzas y líquido de frenos y te decimos qué hay que cambiar y qué puede esperar.",
            "Si notas cualquier cambio al frenar, no lo dejes pasar: cuanto antes se revisa, más fácil es que la reparación sea sencilla."
        ],
        incluye: [
            "Revisión del desgaste de pastillas y discos",
            "Sustitución de pastillas y discos cuando es necesario",
            "Comprobación y cambio del líquido de frenos",
            "Revisión de pinzas, latiguillos y freno de mano"
        ],
        senales: [
            "Chirridos o ruido metálico al frenar",
            "Vibración en el volante o el pedal al frenar",
            "El pedal va más largo o más blando de lo normal",
            "El coche se va hacia un lado al frenar o se enciende el testigo de frenos"
        ],
        faq: [
            {
                pregunta: "¿Cada cuánto hay que cambiar las pastillas?",
                respuesta: "Depende mucho del coche y de cómo se conduzca. Lo mejor es revisarlas en cada mantenimiento y seguir lo que indica el fabricante."
            },
            {
                pregunta: "¿Hay que cambiar los discos siempre que se cambian las pastillas?",
                respuesta: "No siempre. Medimos el grosor y el estado de los discos y solo los cambiamos si están por debajo del mínimo o dañados."
            }
        ]
    },
    {
        slug: "cambio-de-embrague-jaen",
        servicioId: null,
        motivo: "Revisión o cambio de embrague",
        nombre: "Cambio de embrague",
        titulo: "Cambio de embrague en Jaén",
        descripcion: "¿Patina el embrague, cuesta meter las marchas o hace ruido? Revisión y cambio de embrague en Jaén con presupuesto previo. Pide cita en JaFrauto Motor.",
        icono: "fa-gears",
        imagen: "taller",
        intro: [
            "El embrague se desgasta con el uso y suele avisar antes de fallar del todo. Revisamos el conjunto completo para confirmar si hay que cambiarlo y qué piezas lo necesitan.",
            "Antes de empezar te damos un presupuesto con lo que incluye la reparación, para que no haya sorpresas."
        ],
        incluye: [
            "Diagnóstico del embrague y del sistema de accionamiento",
            "Sustitución del kit de embrague (disco, maza y cojinete) cuando es necesario",
            "Revisión del volante motor y del sistema hidráulico",
            "Prueba del coche al terminar"
        ],
        senales: [
            "El motor sube de vueltas pero el coche no acelera igual (el embrague patina)",
            "Cuesta meter las marchas o rascan",
            "El pedal está muy duro, muy blando o el punto de embrague ha cambiado",
            "Ruidos o vibraciones al pisar o soltar el pedal"
        ],
        faq: [
            {
                pregunta: "¿Puedo seguir usando el coche si el embrague patina?",
                respuesta: "Durante poco tiempo, pero el desgaste se acelera y puede dejarte tirado. Pide cita en cuanto lo notes."
            },
            {
                pregunta: "¿Siempre hay que cambiar el volante motor?",
                respuesta: "No. Lo revisamos al desmontar y solo lo cambiamos si está dañado o desgastado; te lo consultamos antes."
            }
        ]
    },
    {
        slug: "kit-de-distribucion-jaen",
        servicioId: null,
        motivo: "Cambio de kit de distribución",
        nombre: "Kit de distribución",
        titulo: "Cambio de kit de distribución en Jaén",
        descripcion: "Cambio de correa o kit de distribución en Jaén según los intervalos del fabricante. Evita una avería grave del motor: pide cita o presupuesto en JaFrauto Motor.",
        icono: "fa-gear",
        imagen: "taller",
        intro: [
            "La correa de distribución sincroniza el movimiento del motor. Si se rompe, la avería suele ser grave y cara, por eso conviene cambiarla en los plazos que marca el fabricante.",
            "Comprobamos el intervalo de tu coche y cambiamos el kit completo con los elementos que recomienda la marca."
        ],
        incluye: [
            "Consulta del intervalo de cambio de tu modelo (kilómetros y años)",
            "Sustitución de la correa o cadena y de los tensores y rodillos",
            "Cambio de la bomba de agua cuando va accionada por la distribución",
            "Revisión del resto de correas y del sistema de refrigeración"
        ],
        senales: [
            "Has llegado a los kilómetros o años que indica el libro de mantenimiento",
            "No sabes cuándo se cambió por última vez (por ejemplo, coche de segunda mano)",
            "Ruidos de silbido o golpeteo en la zona de la distribución",
            "Pérdidas de refrigerante cerca de la bomba de agua"
        ],
        faq: [
            {
                pregunta: "¿Cada cuánto se cambia la distribución?",
                respuesta: "Depende del modelo: cada fabricante marca kilómetros y años. Dinos tu coche y te lo confirmamos."
            },
            {
                pregunta: "¿Los coches con cadena también hay que revisarlos?",
                respuesta: "Sí. La cadena dura más, pero tensores y guías se desgastan. Si hace ruido al arrancar, conviene revisarla."
            }
        ]
    },
    {
        slug: "pre-itv-jaen",
        servicioId: 6,
        nombre: "Pre-ITV",
        titulo: "Revisión pre-ITV en Jaén",
        descripcion: "Revisión pre-ITV en Jaén: comprobamos luces, frenos, neumáticos, emisiones y más puntos clave para que pases la inspección a la primera. Pide cita.",
        icono: "fa-clipboard-check",
        imagen: "preitv",
        intro: [
            "Antes de ir a la ITV revisamos los puntos que más fallan en la inspección para que no tengas que volver. Si encontramos algo, te lo explicamos y decides si lo reparamos.",
            "Es una forma sencilla de ahorrarte una segunda visita a la estación y el tiempo que supone."
        ],
        incluye: [
            "Luces, intermitentes y reglaje de faros",
            "Frenos, suspensión y dirección",
            "Neumáticos, limpiaparabrisas y elementos de seguridad",
            "Niveles y comprobación de emisiones"
        ],
        senales: [
            "Te toca la ITV en las próximas semanas",
            "La última vez te salió algún defecto leve",
            "Tienes algún testigo encendido en el cuadro",
            "Llevas tiempo sin hacer el mantenimiento"
        ],
        faq: [
            {
                pregunta: "¿Con cuánta antelación hago la pre-ITV?",
                respuesta: "Unas semanas antes de la fecha, para tener margen si hay que reparar algo."
            },
            {
                pregunta: "¿Me lleváis el coche a la ITV?",
                respuesta: "Pregúntanos al pedir cita y te contamos qué opciones hay."
            }
        ]
    },
    {
        slug: "aire-acondicionado-coche-jaen",
        servicioId: 5,
        nombre: "Aire acondicionado",
        titulo: "Carga y reparación de aire acondicionado del coche en Jaén",
        descripcion: "¿El aire acondicionado del coche no enfría? Revisión, carga de gas y detección de fugas en Jaén. Prepara el coche para el verano en JaFrauto Motor.",
        icono: "fa-snowflake",
        imagen: "aireacondicionado",
        intro: [
            "Con el calor de Jaén, un aire acondicionado que no enfría se nota enseguida. Revisamos el circuito, comprobamos si hay fugas y lo recargamos con la cantidad que indica el fabricante.",
            "Si el problema no es de gas, buscamos la causa: compresor, ventiladores, filtros o la parte eléctrica."
        ],
        incluye: [
            "Comprobación de presiones y del funcionamiento del circuito",
            "Detección de fugas",
            "Vaciado y carga de gas según el fabricante",
            "Revisión del filtro de habitáculo"
        ],
        senales: [
            "El aire sale templado o tarda mucho en enfriar",
            "Malos olores al encender la climatización",
            "Ruidos al conectar el aire acondicionado",
            "Los cristales se empañan y cuesta desempañarlos"
        ],
        faq: [
            {
                pregunta: "¿Cada cuánto hay que recargar el aire?",
                respuesta: "Un circuito en buen estado pierde muy poco gas. Si tienes que recargarlo a menudo, probablemente hay una fuga que conviene localizar."
            },
            {
                pregunta: "¿Cuándo es mejor revisarlo?",
                respuesta: "En primavera, antes de que llegue el calor, para evitar esperas en plena temporada."
            }
        ]
    },
    {
        slug: "codificacion-de-llaves-jaen",
        servicioId: null,
        motivo: "Codificación o duplicado de llave",
        nombre: "Codificación de llaves",
        titulo: "Codificación de llaves de coche en Jaén",
        descripcion: "Duplicado y codificación de llaves y mandos de coche en Jaén. Si has perdido una llave o el mando no funciona, consulta en JaFrauto Motor.",
        icono: "fa-key",
        imagen: "taller",
        intro: [
            "Las llaves actuales llevan un transpondedor que el coche tiene que reconocer. Si has perdido una llave, quieres una de repuesto o el mando ha dejado de funcionar, la codificamos para tu coche.",
            "Las opciones dependen del modelo, así que lo mejor es que nos digas marca, modelo y año al pedir cita."
        ],
        incluye: [
            "Codificación de llaves y mandos nuevos",
            "Duplicado de llave de repuesto",
            "Revisión del mando a distancia y del inmovilizador",
            "Borrado de llaves perdidas cuando el sistema lo permite"
        ],
        senales: [
            "Has perdido una llave y solo te queda una",
            "El mando no abre o cierra el coche",
            "El coche no arranca y parpadea el testigo del inmovilizador",
            "Quieres una llave de repuesto por seguridad"
        ],
        faq: [
            {
                pregunta: "¿Qué tengo que traer?",
                respuesta: "El coche, la documentación y, si la tienes, la llave que funciona. Con eso vemos qué opciones hay para tu modelo."
            },
            {
                pregunta: "¿Se puede anular una llave perdida?",
                respuesta: "En muchos modelos sí. Te lo confirmamos según tu coche."
            }
        ]
    },
    {
        slug: "cambio-de-aceite-revision-jaen",
        servicioId: 1,
        nombre: "Cambio de aceite y revisión",
        titulo: "Cambio de aceite y revisión en Jaén",
        descripcion: "Cambio de aceite, filtros y revisión de mantenimiento en Jaén según el plan del fabricante. Taller Eurorepar en el Polígono Los Olivares. Pide cita online.",
        icono: "fa-oil-can",
        imagen: "cambioaceite",
        intro: [
            "El mantenimiento periódico es la forma más barata de evitar averías. Cambiamos el aceite y los filtros con las especificaciones de tu coche y revisamos los puntos clave.",
            "Al terminar te contamos cómo está el coche y qué conviene vigilar en los próximos kilómetros."
        ],
        incluye: [
            "Cambio de aceite con la especificación del fabricante",
            "Cambio de filtro de aceite y revisión de filtros de aire, habitáculo y combustible",
            "Revisión de niveles, frenos, neumáticos, luces y batería",
            "Puesta a cero del indicador de mantenimiento"
        ],
        senales: [
            "Te avisa el indicador de mantenimiento del cuadro",
            "Has llegado a los kilómetros o al tiempo del último cambio",
            "Se enciende el testigo de presión de aceite",
            "Vas a hacer un viaje largo"
        ],
        faq: [
            {
                pregunta: "¿Cada cuánto se cambia el aceite?",
                respuesta: "Lo marca el fabricante según el motor y el tipo de aceite. Te lo confirmamos con el plan de mantenimiento de tu coche."
            },
            {
                pregunta: "¿Mantenéis la garantía del fabricante?",
                respuesta: "Sí, si el mantenimiento se hace siguiendo el plan y las especificaciones del fabricante. Pregúntanos si tienes dudas con tu caso."
            }
        ]
    }
];

export const paginaPorSlug = (slug) => PAGINAS_SERVICIO.find((p) => p.slug === slug);
