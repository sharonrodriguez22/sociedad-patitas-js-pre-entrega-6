/* ============================================================
   SOCIEDAD PATITAS - Refugio canino
   Simulador de solicitud de adopción
   Pre-Entrega 6: Interactuando con Funciones de Orden Superior

   El refugio trabaja únicamente con perros rescatados.

   Qué se suma respecto de la Pre-Entrega 5:
   - Un MENÚ PRINCIPAL: el usuario elige si quiere consultar el
     refugio o postularse para adoptar.
   - Un PANEL DE CONSULTAS que trabaja sobre el array de objetos
     con métodos de orden superior:
       · Búsqueda:        forEach, find, filter, some
       · Transformación:  map, reduce
   - Funciones de orden superior propias:
       · crearFiltroPorSexo() → una función que RETORNA otra función
       · mostrarInforme()        → una función que RECIBE otra función

   Se mantiene todo lo anterior: las clases Rescatado y Solicitud,
   las funciones declaradas, expresadas y flecha, los ciclos y los
   métodos de array push, unshift, pop, indexOf y splice.

   Nota sobre los bucles: los for...of que recorrían la lista en las
   entregas anteriores se reemplazaron por forEach, map y filter. 
   Se conserva un for clásico en el cuestionario, donde sí hace falta el 
   índice y poder cortar antes de terminar.
   ============================================================ */

/* ============================================================
   1) VARIABLES GLOBALES
   ============================================================ */
const REFUGIO = "Sociedad Patitas";
const EDAD_MINIMA = 18;
const EDAD_MAXIMA = 100;
const LARGO_MINIMO_NOMBRE = 3;
const MAX_INTENTOS = 3;
const PUNTOS_POR_SI = 2;
const PUNTAJE_MAXIMO = 13; // 3 de vivienda + 5 preguntas x 2 puntos
const PUNTAJE_APROBADO = 11;
const PUNTAJE_SEGUIMIENTO = 7;
const MAX_SOLICITUDES = 10;  // tope de seguridad de las solicitudes
const MAX_VUELTAS_MENU = 30; // tope de seguridad del menú principal
const EDAD_CACHORRO = 2;     // hasta 2 años se considera cachorro

// Lista fija de preguntas. La recorro con un for usando .length
const PREGUNTAS = [
  "¿Puedes cubrir gastos de comida, vacunas y veterinario?",
  "¿Hay alguien en casa durante buena parte del día?",
  "¿Tu vivienda tiene rejas, balcón cerrado o patio seguro?",
  "¿Todas las personas que viven contigo están de acuerdo?",
  "¿Te comprometes a castrar al animal y recibir una visita de seguimiento?"
];

const NOMBRE_PROVISORIO = "Sin nombre";
const NOMBRE_DEFINITIVO = "Pelusa";

const MENU_PRINCIPAL =
  "🐾 " + REFUGIO + "\n\n" +
  "¿Qué quieres hacer?\n\n" +
  "1 - Consultar el refugio\n" +
  "2 - Iniciar una solicitud de adopción\n" +
  "3 - Salir\n\n" +
  "Escribe el número:";

const MENU_CONSULTAS =
  "🔎 Consultas del refugio\n\n" +
  "1 - Ver la lista completa de rescatados\n" +
  "2 - Buscar un rescatado por su nombre\n" +
  "3 - Ver los que se adaptan a mi vivienda\n" +
  "4 - ¿Hay cachorros o hembras disponibles?\n" +
  "5 - Imprimir las etiquetas de las jaulas\n" +
  "6 - Informe mensual del refugio\n" +
  "7 - Volver al menú principal\n\n" +
  "Escribe el número:";

const MENU_VIVIENDA =
  "¿En qué tipo de vivienda vives?\n\n" +
  "1 - Casa con patio\n" +
  "2 - Casa sin patio\n" +
  "3 - Departamento con balcón\n" +
  "4 - Departamento sin balcón\n\n" +
  "Escribe el número:";

// Estas sí cambian a lo largo del programa
let solicitudesEvaluadas = 0;
let solicitudesAprobadas = 0;
let adopcionesConcretadas = 0;
let reservasPendientes = 0;
let consultasRealizadas = 0;

/* ============================================================
   2) CLASE RESCATADO
   Es el "molde" de cada animal del refugio: agrupa sus datos
   (propiedades) y sus acciones (métodos). El constructor recibe
   6 parámetros y con this los guarda dentro del objeto que se
   está creando en ese momento.
   ============================================================ */
class Rescatado {
  constructor(nombre, sexo, edad, tamanio, puntosViviendaMinimos, costoMensual) {
    this.nombre = nombre;                                 // "Rocco"
    this.sexo = sexo;                                     // "macho" o "hembra"
    this.edad = edad;                                     // en años
    this.tamanio = tamanio;                               // "chico", "mediano" o "grande"
    this.puntosViviendaMinimos = puntosViviendaMinimos;   // espacio que necesita (1 a 3)
    this.costoMensual = costoMensual;                     // lo que cuesta mantenerlo por mes

    // Estas cuatro NO son parámetros: todo rescatado nace disponible
    // y sin familia. Cambian cuando se ejecuta reservar() o adoptar().
    this.reservado = false;
    this.reservadoPor = "";
    this.adoptado = false;
    this.adoptadoPor = "";
  }

  // INFORMA: arma la ficha del animal para consola o alert.
  describir() {
    let situacion = "disponible";

    if (this.adoptado) {
      situacion = "adoptado por " + this.adoptadoPor;
    } else if (this.reservado) {
      situacion = "reservado por " + this.reservadoPor + " (pendiente de visita)";
    }

    // Para que no quede escrito "1 años"
    let textoEdad = this.edad + " años";

    if (this.edad === 1) {
      textoEdad = "1 año";
    }

    return "🐶 " + this.nombre + " · " + this.sexo + " · porte " + this.tamanio +
           " · " + textoEdad + " · " + situacion;
  }

  // CALCULA: compara el espacio de la vivienda con el que necesita.
  esCompatibleCon(puntosVivienda) {
    return puntosVivienda >= this.puntosViviendaMinimos;
  }

  // INFORMA: true si todavía es cachorro.
  esCachorro() {
    return this.edad <= EDAD_CACHORRO;
  }

  // INFORMA: true solo si nadie lo adoptó ni lo reservó todavía.
  estaDisponible() {
    return this.adoptado === false && this.reservado === false;
  }

  // MODIFICA: lo aparta para una solicitud PREAPROBADA. Todavía no es
  // una adopción: el perro sigue en el refugio hasta la visita al
  // domicilio. Retorna false si ya estaba reservado o adoptado.
  reservar(nombreAdoptante) {
    if (this.estaDisponible() === false) {
      return false;
    }

    this.reservado = true;
    this.reservadoPor = nombreAdoptante;
    return true;
  }

  // MODIFICA: le cambia el nombre al que entró sin identificar.
  // Retorna el nombre que tenía antes.
  bautizar(nuevoNombre) {
    const anterior = this.nombre;
    this.nombre = nuevoNombre;
    return anterior;
  }

  // MODIFICA: marca al rescatado como adoptado y guarda quién se lo llevó.
  // Retorna false si ya estaba adoptado o si lo tiene reservado otra
  // persona, para no entregarlo dos veces.
  adoptar(nombreAdoptante) {
    if (this.adoptado) {
      return false;
    }

    if (this.reservado && this.reservadoPor !== nombreAdoptante) {
      return false;
    }

    // Si la reserva era de esta misma persona, se confirma
    this.reservado = false;
    this.reservadoPor = "";
    this.adoptado = true;
    this.adoptadoPor = nombreAdoptante;
    return true;
  }
}

/* ============================================================
   3) CLASE SOLICITUD
   Modela la postulación de cada persona que quiere adoptar.
   ============================================================ */
class Solicitud {
  constructor(nombreAdoptante, edad, tipoVivienda, puntosVivienda) {
    this.nombreAdoptante = nombreAdoptante;
    this.edad = edad;
    this.tipoVivienda = tipoVivienda;
    this.puntosVivienda = puntosVivienda;

    // El puntaje arranca con los puntos que dio la vivienda
    this.puntaje = puntosVivienda;
    this.estado = "EN EVALUACIÓN";
  }

  // MODIFICA el puntaje acumulado. Retorna el puntaje actualizado.
  sumarPuntos(puntos) {
    this.puntaje = this.puntaje + puntos;
    return this.puntaje;
  }

  // MODIFICA el estado. Reutiliza la función expresada clasificarSolicitud.
  evaluar() {
    this.estado = clasificarSolicitud(this.puntaje);
    return this.estado;
  }

  // INFORMA: true si la solicitud quedó aprobada o preaprobada.
  fueAceptada() {
    return this.estado === "APROBADA" || this.estado === "PREAPROBADA";
  }

  // INFORMA: una línea con el resumen de la solicitud.
  resumen() {
    return this.nombreAdoptante + " · " + this.tipoVivienda + " · " +
           this.puntaje + "/" + PUNTAJE_MAXIMO + " · " + this.estado;
  }
}

/* ============================================================
   4) EL ARRAY DE OBJETOS
   Cada objeto real se crea con el operador new y se guarda en una
   constante. new crea el objeto vacío, apunta this a ese objeto,
   ejecuta el constructor y lo devuelve ya armado.
   Después las instancias se guardan juntas en un array: ese array
   es la "base de datos" sobre la que trabajan todos los métodos
   de orden superior de esta entrega.
   ============================================================ */

// Rescatados que abren el día en el refugio
const rocco = new Rescatado("Rocco", "macho", 3, "grande", 3, 25000);
const luna = new Rescatado("Luna", "hembra", 2, "chico", 1, 12000);
const rescatadoSinNombre = new Rescatado(NOMBRE_PROVISORIO, "hembra", 1, "mediano", 2, 18000);
const nube = new Rescatado("Nube", "hembra", 5, "chico", 1, 14000);
const tobias = new Rescatado("Tobías", "macho", 7, "mediano", 2, 21000);

// Movimientos del día: un caso urgente y un ingreso nuevo
const nina = new Rescatado("Nina", "hembra", 1, "chico", 1, 15000);
const milo = new Rescatado("Milo", "macho", 4, "mediano", 2, 16000);

// Carbón ya encontró hogar la semana pasada. No entra a la lista
// de disponibles: queda para verificar que un rescatado adoptado
// no pueda volver a adoptarse.
const carbon = new Rescatado("Carbón", "macho", 6, "grande", 3, 23000);
carbon.adoptar("la familia Gómez");

// ARRAY DE OBJETOS. Está declarado con const porque la variable
// nunca se reasigna: lo que cambia es su contenido.
const rescatados = [rocco, luna, rescatadoSinNombre, nube, tobias];

/* ============================================================
   5) FUNCIONES FLECHA
   ============================================================ */

// Parámetro: texto. Retorna true o false.
const esAfirmativa = (texto) => texto === "si" || texto === "Si" || texto === "SI";

// Parámetro: texto. Retorna true o false.
const esNegativa = (texto) => texto === "no" || texto === "No" || texto === "NO";

// Parámetros: puntaje y minimo. Retorna cuántos puntos faltaron.
const puntosQueFaltan = (puntaje, minimo) => minimo - puntaje;

// Formato de dinero, para no repetir el signo $ en cada mensaje.
const enPesos = (monto) => "$" + monto.toLocaleString("es-AR");

/* ============================================================
   6) FUNCIONES DE ORDEN SUPERIOR PROPIAS
   ============================================================ */

// RETORNA UNA FUNCIÓN (patrón fábrica).
// En vez de escribir un filtro para las hembras y otro para los
// machos, fabrico el filtro que necesito. La función interna se sigue
// acordando del parámetro "sexo" aunque la externa ya terminó.

function crearFiltroPorSexo(sexo) {
  return (rescatado) => rescatado.sexo === sexo;
}

// Dos filtros distintos con la misma función
const esHembra = crearFiltroPorSexo("hembra");
const esMacho = crearFiltroPorSexo("macho");

// RETORNA UNA FUNCIÓN. Fabrica el filtro de compatibilidad para
// una vivienda concreta, invocando el método del objeto.
function crearFiltroPorVivienda(puntosVivienda) {
  return (rescatado) => rescatado.esCompatibleCon(puntosVivienda);
}

// RECIBE UNA FUNCIÓN por parámetro (callback).
// mostrarInforme no sabe CÓMO se muestra cada rescatado: eso lo
// decide la función "formatear" que le pasan al invocarla.
// Recorre con forEach y retorna cuántos elementos mostró.
function mostrarInforme(titulo, lista, formatear) {
  console.log("");
  console.log(titulo + " (" + lista.length + ")");

  if (lista.length === 0) {
    console.log("   (no hay rescatados que cumplan la condición)");
  }

  // forEach recibe dos datos por vuelta: el elemento y su índice
  lista.forEach((rescatado, indice) => {
    console.log("   " + (indice + 1) + ". " + formatear(rescatado));
  });

  return lista.length;
}

// Distintas formas de mostrar un mismo rescatado. Se pasan como
// argumento a mostrarInforme y a map.
const estaLibre = (rescatado) => rescatado.estaDisponible();
const fichaCompleta = (rescatado) => rescatado.describir();
const soloNombre = (rescatado) => rescatado.nombre;
const etiquetaDeJaula = (rescatado) =>
  "🏷️ " + rescatado.nombre.toUpperCase() + " | " + rescatado.sexo + " | porte " + rescatado.tamanio +
  " | necesita " + rescatado.puntosViviendaMinimos + "/3 de espacio" +
  " | mantenimiento " + enPesos(rescatado.costoMensual) + " por mes";

/* ============================================================
   7) CONSULTAS SOBRE EL ARRAY DE OBJETOS
   Acá viven los métodos de orden superior del módulo. Cada función
   recibe la lista por parámetro y retorna un resultado.
   ============================================================ */

// BÚSQUEDA con find(). Retorna el PRIMER objeto que cumple la
// condición, o undefined si no hay ninguno.
// toLowerCase() y trim() evitan que "nina " no coincida con "Nina".
function buscarPorNombre(lista, nombre) {
  const buscado = nombre.trim().toLowerCase();
  return lista.find((rescatado) => rescatado.nombre.toLowerCase() === buscado);
}

// BÚSQUEDA con filter(). Retorna un ARRAY NUEVO con todos los que
// cumplen la condición. El original queda intacto (inmutabilidad).
// Se encadenan dos filtros: primero el que entra en esa vivienda
// (fabricado por crearFiltroPorVivienda) y después el que todavía
// no fue reservado por otra persona.
function filtrarCompatibles(lista, puntosVivienda) {
  return lista
    .filter(crearFiltroPorVivienda(puntosVivienda))
    .filter(estaLibre);
}

// BÚSQUEDA con filter(). Usa el método esCachorro() de cada objeto.
function filtrarCachorros(lista) {
  return lista.filter((rescatado) => rescatado.esCachorro());
}

// BÚSQUEDA con some(). Retorna true si al menos UNO cumple.
function hayDelSexo(lista, sexo) {
  return lista.some(crearFiltroPorSexo(sexo));
}

// BÚSQUEDA con some().
function hayCachorros(lista) {
  return lista.some((rescatado) => rescatado.esCachorro());
}

// TRANSFORMACIÓN con map(). Recibe N objetos y retorna un array
// nuevo de N textos. La forma de cada texto la define el callback
// que se pasa por parámetro.
function transformarEnTextos(lista, formatear) {
  return lista.map(formatear);
}

// TRANSFORMACIÓN con reduce(). Combina todos los elementos en UN
// solo valor: el gasto mensual total del refugio.
// El 0 del final es el valor inicial del acumulador.
function calcularCostoMensual(lista) {
  return lista.reduce((acumulador, rescatado) => acumulador + rescatado.costoMensual, 0);
}

// TRANSFORMACIÓN con reduce(). Suma las edades y divide por la
// cantidad. Retorna 0 si la lista está vacía, para no dividir entre cero.
function calcularEdadPromedio(lista) {
  if (lista.length === 0) {
    return 0;
  }

  const sumaDeEdades = lista.reduce((acumulador, rescatado) => acumulador + rescatado.edad, 0);
  return sumaDeEdades / lista.length;
}

// TRANSFORMACIÓN con reduce(). El acumulador no siempre es un
// número: acá arranca como un objeto vacío y termina siendo un
// conteo por porte, por ejemplo { chico: 3, mediano: 2, grande: 1 }.
function contarPorTamanio(lista) {
  return lista.reduce((conteo, rescatado) => {
    if (conteo[rescatado.tamanio] === undefined) {
      conteo[rescatado.tamanio] = 0;
    }

    conteo[rescatado.tamanio] = conteo[rescatado.tamanio] + 1;

    // Con llaves {} en la función flecha hay que escribir el return
    return conteo;
  }, {});
}

/* ============================================================
   8) FUNCIONES DE ENTRADA DE DATOS
   Piden información con prompt, la validan y RETORNAN el dato
   ya limpio. Si la persona falla todos los intentos, retornan
   un valor vacío para que el programa principal se dé cuenta.
   ============================================================ */

// Declarada. Parámetros: mensaje y largoMinimo. Retorna un texto.
function pedirTexto(mensaje, largoMinimo) {
  // "valor" e "intentos" son variables LOCALES: solo existen
  // aquí adentro y se reinician en cada llamada a la función
  let valor = "";
  let intentos = 0;

  while (valor === "" && intentos < MAX_INTENTOS) {
    const ingreso = prompt(mensaje);

    // Si aprieta "Cancelar", prompt devuelve null
    if (ingreso === null || ingreso.length < largoMinimo) {
      intentos++;
      console.log("❌ Dato inválido. Intentos restantes: " + (MAX_INTENTOS - intentos));
      alert("Tiene que tener al menos " + largoMinimo + " caracteres.\nTe quedan " + (MAX_INTENTOS - intentos) + " intentos.");
    } else {
      valor = ingreso;
    }
  }

  return valor;
}

// Declarada. Parámetros: mensaje, minimo y maximo. Retorna un número.
function pedirNumeroEntero(mensaje, minimo, maximo) {
  let valor = 0;
  let intentos = 0;

  while (valor === 0 && intentos < MAX_INTENTOS) {
    const ingreso = prompt(mensaje);
    const numero = Number(ingreso);

    // El resto (%) sirve para rechazar decimales: 30.5 % 1 da 0.5
    if (numero >= minimo && numero <= maximo && numero % 1 === 0) {
      valor = numero;
    } else {
      intentos++;
      console.log("❌ Número inválido. Intentos restantes: " + (MAX_INTENTOS - intentos));
      alert("Ingresa un número entero entre " + minimo + " y " + maximo + ".");
    }
  }

  return valor;
}

// Declarada. Parámetros: pregunta, numero y total. Retorna "si", "no" o "".
function pedirRespuestaSiNo(pregunta, numero, total) {
  let respuesta = "";
  let intentos = 0;

  while (respuesta === "" && intentos < MAX_INTENTOS) {
    const ingreso = prompt("Pregunta " + numero + " de " + total + "\n\n" + pregunta + "\n\n(escribe si o no)");

    // Invoco las funciones flecha para no repetir las comparaciones
    if (esAfirmativa(ingreso)) {
      respuesta = "si";
    } else if (esNegativa(ingreso)) {
      respuesta = "no";
    } else {
      intentos++;
      console.log("   ⚠️ Responde solo 'si' o 'no'. Intentos restantes: " + (MAX_INTENTOS - intentos));
    }
  }

  return respuesta;
}

// Declarada. Muestra el menú de vivienda hasta que la opción sea válida.
// Retorna el objeto { nombre, puntos }; puntos queda en 0 si falla.
function pedirVivienda() {
  let vivienda = { nombre: "Sin definir", puntos: 0 };
  let intentos = 0;

  while (vivienda.puntos === 0 && intentos < MAX_INTENTOS) {
    const opcion = prompt(MENU_VIVIENDA);
    vivienda = obtenerVivienda(opcion);

    if (vivienda.puntos === 0) {
      intentos++;
      console.log("❌ Opción inválida. Intentos restantes: " + (MAX_INTENTOS - intentos));
      alert("Opción inválida. Elige un número del 1 al 4.");
    }
  }

  return vivienda;
}

/* ============================================================
   9) FUNCIONES DE PROCESAMIENTO
   ============================================================ */

// Declarada. Parámetro: opcion. Retorna un objeto literal con las
// dos características de la vivienda: su nombre y los puntos que suma.
function obtenerVivienda(opcion) {
  let vivienda = { nombre: "Sin definir", puntos: 0 };

  switch (opcion) {
    case "1":
      vivienda = { nombre: "Casa con patio", puntos: 3 };
      break;
    case "2":
      vivienda = { nombre: "Casa sin patio", puntos: 2 };
      break;
    case "3":
      vivienda = { nombre: "Departamento con balcón", puntos: 2 };
      break;
    case "4":
      vivienda = { nombre: "Departamento sin balcón", puntos: 1 };
      break;
    default:
      vivienda = { nombre: "Sin definir", puntos: 0 };
  }

  return vivienda;
}

// EXPRESADA. Parámetro: puntaje. Retorna el estado de la solicitud.
// La invoca el método evaluar() de la clase Solicitud.
const clasificarSolicitud = function (puntaje) {
  let estado = "";

  // Ordenado de la condición más exigente a la más general
  if (puntaje >= PUNTAJE_APROBADO) {
    estado = "APROBADA";
  } else if (puntaje >= PUNTAJE_SEGUIMIENTO) {
    estado = "PREAPROBADA";
  } else {
    estado = "RECHAZADA";
  }

  return estado;
};

// Declarada. Parámetro: puntos de vivienda. Retorna una recomendación.
function obtenerRecomendacion(puntosVivienda) {
  let texto = "";

  if (puntosVivienda === 3) {
    texto = "🐶 Puedes adoptar un perro de cualquier porte.";
  } else if (puntosVivienda === 2) {
    texto = "🐕 Te conviene un perro de porte chico o mediano.";
  } else {
    texto = "🐕‍🦺 Un perro de porte chico es tu mejor opción.";
  }

  return texto;
}

/* ============================================================
   10) FUNCIONES DE GESTIÓN DE LA LISTA DE RESCATADOS
   ============================================================ */

// push() agrega el nuevo rescatado AL FINAL de la lista.
function registrarIngreso(lista, rescatado) {
  lista.push(rescatado);
  console.log("🐾 Ingresó " + rescatado.nombre + " al refugio. Ahora hay " + lista.length + " rescatados.");
  return lista.length;
}

// unshift() lo agrega AL PRINCIPIO, porque los casos urgentes
// tienen prioridad para conseguir hogar.
function registrarUrgencia(lista, rescatado) {
  lista.unshift(rescatado);
  console.log("🚑 " + rescatado.nombre + " entró como caso urgente y quedó primero en la lista.");
  return lista.length;
}

// pop() saca el ÚLTIMO objeto de la lista y lo devuelve.
// Invoca el método adoptar() para dejar registrado el cambio de estado.
function registrarAdopcionDelDia(lista, familia) {
  const adoptado = lista.pop();

  adoptado.adoptar(familia);
  console.log("🏡 Se ha eliminado el elemento: " + adoptado.nombre + " (se fue con " + familia + ").");
  console.log("   Estado del objeto → " + adoptado.describir());

  return adoptado;
}

// Saca de la lista al rescatado que acaban de adoptar.
// indexOf() encuentra la posición exacta de ESE objeto y splice()
// lo retira. Retorna el objeto retirado, o null si no estaba.
function retirarDeLaLista(lista, rescatado) {
  const posicion = lista.indexOf(rescatado);

  if (posicion === -1) {
    return null;
  }

  const retirados = lista.splice(posicion, 1);
  console.log("📤 " + retirados[0].nombre + " salió de la lista de disponibles. Quedan " + lista.length + ".");
  return retirados[0];
}

/* ============================================================
   11) FUNCIONES DE SALIDA
   ============================================================ */

// Arma un texto con un rescatado por línea para mostrar en un
// alert o dentro de un prompt. map() transforma la lista de objetos
// en una lista de textos y join() los une con saltos de línea.
function armarTextoRescatados(lista, formatear) {
  return transformarEnTextos(lista, formatear).join("\n");
}

// Declarada. Parámetro: un objeto Solicitud.
function mostrarResultado(solicitud) {
  console.log("");
  console.log("📊 Puntaje final de " + solicitud.nombreAdoptante + ": " + solicitud.puntaje + " de " + PUNTAJE_MAXIMO);

  if (solicitud.estado === "APROBADA") {
    console.log("✅ Solicitud APROBADA. Puedes coordinar el encuentro con tu futuro compañero.");
    alert("✅ ¡Felicitaciones, " + solicitud.nombreAdoptante + "!\n\nPuntaje: " + solicitud.puntaje + "/" + PUNTAJE_MAXIMO + "\nTu solicitud fue APROBADA. 🐾");
  } else if (solicitud.estado === "PREAPROBADA") {
    console.log("🟡 Solicitud PREAPROBADA. Coordinamos una visita al domicilio antes de confirmar.");
    alert("🟡 " + solicitud.nombreAdoptante + ", tu solicitud quedó PREAPROBADA.\n\nPuntaje: " + solicitud.puntaje + "/" + PUNTAJE_MAXIMO + "\nCoordinamos una visita antes de confirmar.");
  } else {
    // Invoco la función flecha para saber cuánto le faltó
    const faltaron = puntosQueFaltan(solicitud.puntaje, PUNTAJE_SEGUIMIENTO);

    console.log("⛔ Solicitud RECHAZADA por ahora. Te faltaron " + faltaron + " puntos.");
    alert("⛔ " + solicitud.nombreAdoptante + ", por ahora no podemos aprobar la adopción.\n\nPuntaje: " + solicitud.puntaje + "/" + PUNTAJE_MAXIMO + "\nTe faltaron " + faltaron + " puntos.\n¿Te sumas como hogar de tránsito? 🐾");
  }
}

// Declarada. Parámetro: numero de solicitud.
function mostrarEncabezado(numero) {
  console.log("");
  console.log("===============================");
  console.log("NUEVA SOLICITUD Nº " + numero);
  console.log("===============================");
}

// Declarada. Resumen final de la sesión.
function mostrarResumen(lista) {
  console.log("");
  console.log("===============================");
  console.log("RESUMEN DE LA SESIÓN");
  console.log("===============================");
  console.log("Consultas realizadas: " + consultasRealizadas);
  console.log("Solicitudes evaluadas: " + solicitudesEvaluadas);
  console.log("Aprobadas o preaprobadas: " + solicitudesAprobadas);
  console.log("Adopciones concretadas: " + adopcionesConcretadas);
  console.log("Reservas pendientes de visita: " + reservasPendientes);

  mostrarInforme("🏠 Rescatados que siguen esperando hogar", lista, fichaCompleta);

  if (adopcionesConcretadas > 0 || reservasPendientes > 0) {
    console.log("");
    console.log("🎉 ¡Gracias por adoptar en " + REFUGIO + "!");
  } else {
    console.log("");
    console.log("🐾 Gracias por tu interés en " + REFUGIO + ". Te esperamos.");
  }

  alert(
    "Simulador finalizado.\n\n" +
    "Consultas: " + consultasRealizadas + "\n" +
    "Solicitudes evaluadas: " + solicitudesEvaluadas + "\n" +
    "Aprobadas o preaprobadas: " + solicitudesAprobadas + "\n" +
    "Adopciones concretadas: " + adopcionesConcretadas + "\n" +
    "Reservas pendientes de visita: " + reservasPendientes + "\n" +
    "Rescatados esperando hogar: " + lista.length + "\n\n" +
    "¡Gracias por pasar por " + REFUGIO + "! 🐾"
  );
}

/* ============================================================
   12) PANEL DE CONSULTAS
   Cada opción del menú ejecuta un método de orden superior
   distinto sobre el array de objetos, según lo que pida el usuario.
   ============================================================ */

// OPCIÓN 1 → forEach (dentro de mostrarInforme)
function consultarListaCompleta(lista) {
  mostrarInforme("🏠 Rescatados disponibles en " + REFUGIO, lista, fichaCompleta);
  alert("🏠 Rescatados disponibles (" + lista.length + "):\n\n" + armarTextoRescatados(lista, fichaCompleta));
}

// OPCIÓN 2 → find
function consultarPorNombre(lista) {
  const nombre = prompt(
    "🔎 ¿Por quién quieres preguntar?\n\n" +
    "Disponibles: " + transformarEnTextos(lista, soloNombre).join(", ") + "\n\n" +
    "Escribe el nombre:"
  );

  if (nombre === null || nombre === "") {
    console.log("🔎 Consulta cancelada.");
    return null;
  }

  // find retorna el objeto completo, no un índice
  const encontrado = buscarPorNombre(lista, nombre);

  if (encontrado === undefined) {
    console.log("❌ " + nombre + " no figura entre los disponibles.");
    alert("❌ " + nombre + " no figura entre nuestros rescatados disponibles.");
  } else {
    console.log("✅ Encontrado con find():");
    console.log(encontrado);
    alert(
      "✅ ¡" + encontrado.nombre + " está disponible!\n\n" +
      encontrado.describir() + "\n" +
      "Necesita " + encontrado.puntosViviendaMinimos + "/3 de espacio.\n" +
      "Mantenimiento: " + enPesos(encontrado.costoMensual) + " por mes."
    );
  }

  return encontrado;
}

// OPCIÓN 3 → filter
function consultarPorVivienda(lista) {
  const vivienda = pedirVivienda();

  if (vivienda.puntos === 0) {
    console.log("🔎 Consulta cancelada: no se eligió una vivienda válida.");
    return [];
  }

  // filter no modifica el array original: crea uno nuevo
  const compatibles = filtrarCompatibles(lista, vivienda.puntos);

  mostrarInforme("🏡 Se adaptan a " + vivienda.nombre, compatibles, fichaCompleta);
  console.log("   La lista original sigue teniendo " + lista.length + " rescatados (filter no la modifica).");

  if (compatibles.length === 0) {
    alert("Por ahora no tenemos rescatados que se adapten a " + vivienda.nombre + ".\n¡Pero seguimos recibiendo animales todas las semanas! 🐾");
  } else {
    alert(
      "🏡 Se adaptan a " + vivienda.nombre + " (" + compatibles.length + " de " + lista.length + "):\n\n" +
      armarTextoRescatados(compatibles, fichaCompleta) + "\n\n" +
      obtenerRecomendacion(vivienda.puntos)
    );
  }

  return compatibles;
}

// OPCIÓN 4 → some (+ filter para mostrar el detalle)
function consultarDisponibilidad(lista) {
  const hayHembras = hayDelSexo(lista, "hembra");
  const hayMachos = hayDelSexo(lista, "macho");
  const hayChiquitos = hayCachorros(lista);

  console.log("");
  console.log("❓ Disponibilidad con some():");
  console.log("   ¿Hay hembras?   " + hayHembras);
  console.log("   ¿Hay machos?    " + hayMachos);
  console.log("   ¿Hay cachorros? " + hayChiquitos);

  // Los filtros fabricados con crearFiltroPorSexo se reutilizan acá
  mostrarInforme("🐕 Hembras disponibles", lista.filter(esHembra), soloNombre);
  mostrarInforme("🐕 Machos disponibles", lista.filter(esMacho), soloNombre);

  let textoCachorros = "😿 Por ahora no hay cachorros.";

  if (hayChiquitos) {
    const cachorros = filtrarCachorros(lista);
    textoCachorros = "🍼 Cachorros (hasta " + EDAD_CACHORRO + " años): " + transformarEnTextos(cachorros, soloNombre).join(", ");
  }

  console.log("   " + textoCachorros);

  alert(
    "❓ Disponibilidad en " + REFUGIO + "\n\n" +
    "¿Hay hembras? " + hayHembras + "\n" +
    "¿Hay machos? " + hayMachos + "\n" +
    "¿Hay cachorros? " + hayChiquitos + "\n\n" +
    textoCachorros
  );
}

// OPCIÓN 5 → map
function imprimirEtiquetas(lista) {
  // map transforma N objetos en N textos, sin tocar los originales
  const etiquetas = transformarEnTextos(lista, etiquetaDeJaula);

  console.log("");
  console.log("🏷️ Etiquetas generadas con map() (" + etiquetas.length + "):");
  etiquetas.forEach((etiqueta) => console.log("   " + etiqueta));
  console.log("   El array original sigue siendo de objetos:", lista.length, "rescatados.");

  alert("🏷️ Etiquetas para las jaulas\n\n" + etiquetas.join("\n\n"));

  return etiquetas;
}

// OPCIÓN 6 → reduce (tres usos distintos)
function mostrarInformeMensual(lista) {
  const costoTotal = calcularCostoMensual(lista);
  const edadPromedio = calcularEdadPromedio(lista);
  const porTamanio = contarPorTamanio(lista);

  // Un reduce más: el costo del rescatado más caro de mantener
  const masCostoso = lista.reduce((masCaro, rescatado) => {
    if (rescatado.costoMensual > masCaro.costoMensual) {
      return rescatado;
    }

    return masCaro;
  }, lista[0]);

  console.log("");
  console.log("📈 Informe mensual del refugio (reduce)");
  console.log("   Rescatados a cargo: " + lista.length);
  console.log("   Gasto mensual total: " + enPesos(costoTotal));
  console.log("   Edad promedio: " + edadPromedio.toFixed(1) + " años");
  console.log("   Conteo por porte:", porTamanio);

  let textoMasCostoso = "";

  if (lista.length > 0) {
    textoMasCostoso = "El que más cuesta mantener es " + masCostoso.nombre + " (" + enPesos(masCostoso.costoMensual) + ").";
    console.log("   " + textoMasCostoso);
  }

  alert(
    "📈 Informe mensual de " + REFUGIO + "\n\n" +
    "Rescatados a cargo: " + lista.length + "\n" +
    "Chicos: " + (porTamanio.chico || 0) + "  ·  Medianos: " + (porTamanio.mediano || 0) +
    "  ·  Grandes: " + (porTamanio.grande || 0) + "\n" +
    "Edad promedio: " + edadPromedio.toFixed(1) + " años\n" +
    "Gasto mensual total: " + enPesos(costoTotal) + "\n\n" +
    textoMasCostoso + "\n\n" +
    "Con tu donación mensual ayudas a cubrir esto. 🐾"
  );
}

// Submenú completo. Se repite hasta que la persona elige volver.
function abrirPanelDeConsultas(lista) {
  let enElPanel = true;
  let vueltas = 0;

  while (enElPanel && vueltas < MAX_VUELTAS_MENU) {
    const opcion = prompt(MENU_CONSULTAS);
    vueltas++;

    switch (opcion) {
      case "1":
        consultarListaCompleta(lista);
        consultasRealizadas++;
        break;
      case "2":
        consultarPorNombre(lista);
        consultasRealizadas++;
        break;
      case "3":
        consultarPorVivienda(lista);
        consultasRealizadas++;
        break;
      case "4":
        consultarDisponibilidad(lista);
        consultasRealizadas++;
        break;
      case "5":
        imprimirEtiquetas(lista);
        consultasRealizadas++;
        break;
      case "6":
        mostrarInformeMensual(lista);
        consultasRealizadas++;
        break;
      case "7":
        enElPanel = false;
        break;
      default:
        // null es cuando aprietan Cancelar
        if (opcion === null) {
          enElPanel = false;
        } else {
          console.log("❌ Opción inválida en el panel de consultas: " + opcion);
          alert("Opción inválida. Elige un número del 1 al 7.");
        }
    }
  }

  return consultasRealizadas;
}

/* ============================================================
   13) SOLICITUD DE ADOPCIÓN
   Todo el circuito de la Pre-Entrega 5, ahora dentro de una
   función para que el menú principal pueda invocarlo.
   ============================================================ */
function procesarSolicitud(lista) {
  let tipoVivienda = "Sin definir";
  let puntosVivienda = 0;
  let solicitudValida = true;

  mostrarEncabezado(solicitudesEvaluadas + 1);

  // ----- ENTRADA: nombre -----
  const nombre = pedirTexto("Ingresa tu nombre y apellido:", LARGO_MINIMO_NOMBRE);

  if (nombre === "") {
    solicitudValida = false;
  } else {
    console.log("✅ Nombre registrado: " + nombre);
  }

  // ----- ENTRADA: edad -----
  let edad = 0;

  if (solicitudValida) {
    edad = pedirNumeroEntero(nombre + ", ¿cuántos años tienes?", 1, EDAD_MAXIMA);

    if (edad === 0) {
      solicitudValida = false;
    } else {
      console.log("✅ Edad registrada: " + edad + " años");
    }
  }

  // ----- PROCESAMIENTO: requisito excluyente de edad -----
  if (solicitudValida) {
    if (edad < EDAD_MINIMA) {
      solicitudValida = false;
      console.log("⛔ " + nombre + " tiene " + edad + " años y el mínimo para adoptar es " + EDAD_MINIMA + ".");
      alert("⛔ Lo sentimos, " + nombre + ".\n\nPara adoptar hay que ser mayor de " + EDAD_MINIMA + " años.\nPero puedes sumarte como voluntario/a. 🐾");
    } else {
      console.log("✅ Cumple el requisito de edad mínima.");
    }
  }

  // ----- ENTRADA + PROCESAMIENTO: tipo de vivienda -----
  if (solicitudValida) {
    const vivienda = pedirVivienda();
    tipoVivienda = vivienda.nombre;
    puntosVivienda = vivienda.puntos;

    if (puntosVivienda === 0) {
      solicitudValida = false;
    } else {
      console.log("🏠 Vivienda: " + tipoVivienda + " (+" + puntosVivienda + " puntos)");
    }
  }

  // ----- INSTANCIACIÓN: se crea el objeto de esta solicitud -----
  const solicitud = new Solicitud(nombre, edad, tipoVivienda, puntosVivienda);

  // ----- ENTRADA: cuestionario recorriendo el arreglo con for -----
  if (solicitudValida) {
    console.log("");
    console.log("--- Cuestionario de responsabilidad (" + PREGUNTAS.length + " preguntas) ---");

    // Acá se usa un for clásico y no forEach por dos motivos:
    // necesito el índice para numerar las preguntas, y necesito poder
    // cortar el recorrido a mitad de camino si la persona cancela.
    // Un forEach no se puede frenar con break.
    for (let i = 0; i < PREGUNTAS.length && solicitudValida; i++) {
      const respuesta = pedirRespuestaSiNo(PREGUNTAS[i], i + 1, PREGUNTAS.length);

      if (respuesta === "si") {
        // El método del objeto acumula el puntaje
        solicitud.sumarPuntos(PUNTOS_POR_SI);
        console.log("   " + (i + 1) + ". " + PREGUNTAS[i] + " → SÍ (+" + PUNTOS_POR_SI + " puntos)");
      } else if (respuesta === "no") {
        console.log("   " + (i + 1) + ". " + PREGUNTAS[i] + " → NO (+0 puntos)");
      } else {
        solicitudValida = false;
      }
    }
  }

  solicitudesEvaluadas++;

  if (!solicitudValida) {
    console.log("🔒 Solicitud cancelada o incompleta. No se pudo evaluar.");
    alert("Solicitud cancelada.\nPuedes volver a intentarlo cuando quieras. 🐾");
    return solicitud;
  }

  // ----- PROCESAMIENTO + SALIDA: resultado -----
  solicitud.evaluar();
  mostrarResultado(solicitud);

  console.log("💡 Recomendación: " + obtenerRecomendacion(solicitud.puntosVivienda));
  console.log("📄 " + solicitud.resumen());

  if (solicitud.fueAceptada()) {
    solicitudesAprobadas++;
    elegirRescatado(lista, solicitud);
  }

  return solicitud;
}

// Muestra solo los compatibles (filter) y busca al elegido (find).
// Una solicitud APROBADA se lleva el perro en el momento.
// Una solicitud PREAPROBADA solo puede RESERVARLO: el perro se queda
// en el refugio hasta que se haga la visita al domicilio.
function elegirRescatado(lista, solicitud) {
  const esAdopcionDirecta = solicitud.estado === "APROBADA";
  const compatibles = filtrarCompatibles(lista, solicitud.puntosVivienda);

  mostrarInforme("🔎 Rescatados compatibles con " + solicitud.tipoVivienda, compatibles, fichaCompleta);

  if (compatibles.length === 0) {
    alert("Por ahora no tenemos rescatados libres que se adapten a " + solicitud.tipoVivienda + ".\n¡Pero seguimos recibiendo perros todas las semanas! 🐾");
    return null;
  }

  // El texto del cuadro cambia según el estado de la solicitud
  let consigna = "¿A cuál quieres adoptar?";

  if (esAdopcionDirecta === false) {
    consigna = "Tu solicitud está PREAPROBADA, así que todavía no puedes llevártelo.\n¿A cuál quieres reservar hasta la visita?";
  }

  const elegido = prompt(
    "🏠 Rescatados que se adaptan a tu vivienda (" + compatibles.length + "):\n\n" +
    armarTextoRescatados(compatibles, fichaCompleta) +
    "\n\n" + consigna + "\nEscribe su nombre tal como aparece (o Cancelar para pensarlo):"
  );

  if (elegido === null || elegido === "") {
    console.log("🕒 " + solicitud.nombreAdoptante + " prefiere pensarlo.");
    return null;
  }

  // find busca dentro de los compatibles, así no se puede elegir
  // por error a uno que no entra en esa vivienda
  const rescatadoElegido = buscarPorNombre(compatibles, elegido);

  if (rescatadoElegido === undefined) {
    // Si no está entre los compatibles, reviso la lista completa
    // para poder dar un mensaje más útil
    const enElRefugio = buscarPorNombre(lista, elegido);

    if (enElRefugio === undefined) {
      console.log("❌ " + elegido + " no está en la lista del refugio.");
      alert("❌ " + elegido + " no figura entre nuestros rescatados.");
    } else if (enElRefugio.estaDisponible() === false) {
      console.log("🔒 " + enElRefugio.nombre + " ya está reservado por " + enElRefugio.reservadoPor + ".");
      alert("🔒 " + enElRefugio.nombre + " ya está reservado por otra persona.\n\nElige otro de la lista. 🐾");
    } else {
      console.log("⚠️ " + enElRefugio.nombre + " necesita más espacio del que ofrece " + solicitud.tipoVivienda + ".");
      alert("⚠️ " + enElRefugio.nombre + " es de porte " + enElRefugio.tamanio + " y necesita más espacio.\n\n" + obtenerRecomendacion(solicitud.puntosVivienda));
    }

    return null;
  }

  if (esAdopcionDirecta) {
    // APROBADA: adoptar() cambia el estado y el perro sale del refugio
    rescatadoElegido.adoptar(solicitud.nombreAdoptante);
    retirarDeLaLista(lista, rescatadoElegido); // indexOf + splice
    adopcionesConcretadas++;

    console.log("🎉 " + rescatadoElegido.describir());
    alert(
      "🎉 ¡Felicitaciones, " + solicitud.nombreAdoptante + "!\n\n" +
      rescatadoElegido.nombre + " se va contigo.\n\n" +
      rescatadoElegido.describir()
    );
  } else {
    // PREAPROBADA: solo se reserva. El perro NO sale de la lista.
    rescatadoElegido.reservar(solicitud.nombreAdoptante);
    reservasPendientes++;

    console.log("🔖 " + rescatadoElegido.describir());
    console.log("   Sigue en el refugio hasta la visita al domicilio.");
    alert(
      "🔖 " + solicitud.nombreAdoptante + ", tu solicitud quedó PREAPROBADA.\n\n" +
      rescatadoElegido.nombre + " queda RESERVADO a tu nombre, pero todavía no puedes llevártelo.\n\n" +
      "Próximo paso: coordinamos la visita al domicilio y ahí confirmamos la adopción. 🐾"
    );
  }

  return rescatadoElegido;
}

/* ============================================================
   PROGRAMA PRINCIPAL
   ============================================================ */

console.log("🐾 Simulador de adopción de " + REFUGIO);

/* ------------------------------------------------------------
   VERIFICACIÓN POR CONSOLA
   Antes de abrir el simulador compruebo que las clases y los
   métodos de orden superior devuelven lo que corresponde.
   ------------------------------------------------------------ */
console.log("");
console.log("--- Verificación de las clases ---");
console.log(rocco);
console.log("describir() → " + rocco.describir());
console.log("esCompatibleCon(1) → " + rocco.esCompatibleCon(1)); // false: es grande
console.log("esCachorro() → " + luna.esCachorro());              // true: tiene 2 años
console.log("estaDisponible() → " + rocco.estaDisponible());     // true: nadie lo pidió
console.log("¿Se puede volver a adoptar a Carbón? " + carbon.adoptar("otra persona")); // false
console.log("estaDisponible() de Carbón → " + carbon.estaDisponible()); // false: ya tiene hogar

console.log("");
console.log("--- Verificación de las funciones de orden superior ---");

// find → un objeto
console.log("find('luna') →", buscarPorNombre(rescatados, "luna"));

// filter → un array nuevo
console.log("filter(esHembra) →", transformarEnTextos(rescatados.filter(esHembra), soloNombre));
console.log("filter(compatibles con 1 punto) →", transformarEnTextos(filtrarCompatibles(rescatados, 1), soloNombre));

// some → true o false
console.log("some(hay hembras) → " + hayDelSexo(rescatados, "hembra"));
console.log("some(hay cachorros) → " + hayCachorros(rescatados));

// map → un array de textos del mismo largo
console.log("map(soloNombre) →", transformarEnTextos(rescatados, soloNombre));

// reduce → un solo valor
console.log("reduce(costo mensual) → " + enPesos(calcularCostoMensual(rescatados)));
console.log("reduce(edad promedio) → " + calcularEdadPromedio(rescatados).toFixed(1) + " años");
console.log("reduce(conteo por porte) →", contarPorTamanio(rescatados));

// La lista original nunca se modificó con estos métodos
console.log("El array original sigue intacto: " + rescatados.length + " rescatados.");

/* ------------------------------------------------------------
   ARRANQUE DEL SIMULADOR
   Todo lo que abre ventanas (alert y prompt) vive dentro de esta
   función. No se ejecuta enseguida: espera al evento load, que
   avisa cuando el navegador terminó de dibujar la página.
   Si se ejecutara de inmediato, el primer alert congelaría el hilo
   principal antes del primer dibujado y detrás del cartel se vería
   una pantalla en blanco en vez del index.
   ------------------------------------------------------------ */
function iniciarSimulador() {
  /* ------------------------------------------------------------
     MOVIMIENTOS DEL REFUGIO DE HOY
     ------------------------------------------------------------ */
  alert("🐾 " + REFUGIO + "\n\nBienvenida al simulador de adopción.\nAbre la consola con F12 para ver el detalle.");

  console.log("");
  console.log("--- Movimientos del refugio de hoy ---");
  console.log("Lista al abrir: " + rescatados.length + " rescatados");

  registrarUrgencia(rescatados, nina);                                         // unshift
  const adoptadoHoy = registrarAdopcionDelDia(rescatados, "la familia Pérez"); // pop
  registrarIngreso(rescatados, milo);                                          // push

  // find localiza al que entró sin nombre y su método bautizar() lo renombra
  const sinBautizar = buscarPorNombre(rescatados, NOMBRE_PROVISORIO);
  let textoBautizo = "";

  if (sinBautizar !== undefined) {
    const anterior = sinBautizar.bautizar(NOMBRE_DEFINITIVO);
    textoBautizo = "✏️ \"" + anterior + "\" ya tiene nombre: " + NOMBRE_DEFINITIVO + ".\n";
    console.log("✏️ \"" + anterior + "\" pasó a llamarse \"" + NOMBRE_DEFINITIVO + "\".");
  }

  mostrarInforme("🏠 Rescatados esperando hogar", rescatados, fichaCompleta);

  alert(
    "📋 Movimientos del refugio de hoy\n\n" +
    "🚑 " + nina.nombre + " ingresó como caso urgente y quedó primero.\n" +
    "🏡 Se ha eliminado el elemento: " + adoptadoHoy.nombre + " (fue adoptado).\n" +
    "🐾 " + milo.nombre + " ingresó al refugio.\n" +
    textoBautizo +
    "\n🏠 Rescatados esperando hogar (" + rescatados.length + "):\n\n" +
    armarTextoRescatados(rescatados, fichaCompleta)
  );

  /* ------------------------------------------------------------
     MENÚ PRINCIPAL (do...while)
     Según lo que elija la persona se ejecuta el panel de consultas
     o el circuito de solicitud de adopción.
     ------------------------------------------------------------ */
  let seguirEnElMenu = true;
  let vueltasDelMenu = 0;

  do {
    const opcion = prompt(MENU_PRINCIPAL);
    vueltasDelMenu++;

    switch (opcion) {
      case "1":
        abrirPanelDeConsultas(rescatados);
        break;

      case "2":
        procesarSolicitud(rescatados);

        if (solicitudesEvaluadas >= MAX_SOLICITUDES) {
          seguirEnElMenu = false;
          console.log("⚠️ Se alcanzó el máximo de " + MAX_SOLICITUDES + " solicitudes por sesión.");
          alert("Llegaste al máximo de " + MAX_SOLICITUDES + " solicitudes.\nRecarga la página para seguir. 🐾");
        }
        break;

      case "3":
        seguirEnElMenu = false;
        break;

      default:
        // null es cuando aprietan Cancelar
        if (opcion === null) {
          seguirEnElMenu = false;
        } else {
          console.log("❌ Opción inválida en el menú principal: " + opcion);
          alert("Opción inválida. Elige 1, 2 o 3.");
        }
    }

  // La segunda condición asegura que el menú siempre termina
  } while (seguirEnElMenu && vueltasDelMenu < MAX_VUELTAS_MENU);

  // ----- SALIDA final -----
  mostrarResumen(rescatados);
}

// load espera a que la página esté dibujada; el setTimeout le da al
// navegador un respiro más antes de abrir la primera ventana.
window.addEventListener("load", function () {
  setTimeout(iniciarSimulador, 300);
});
