// DOM
const formularioTurno = document.getElementById("formTurno");
const botonReservar = document.getElementById("btn-reservar");
const botonVaciar = document.getElementById("btn-vaciar");
const botonVer = document.getElementById("btn-ver-turnos");
const contenedorTurnos = document.getElementById("turnos-reservados");

// Campo "nombre-apellido" solo letras y espacios

const inputNombre = document.getElementById("nombre-apellido");
inputNombre.addEventListener("input", () => {
  inputNombre.value = inputNombre.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ ]/g, "");
});

// Fecha a partir del dia actual en adelante

const inputFecha = document.getElementById("fecha");
const hoy = new Date();
const año = hoy.getFullYear();
const mes = String(hoy.getMonth() + 1).padStart(2, "0");
const dia = String(hoy.getDate()).padStart(2, "0");
inputFecha.min = `${año}-${mes}-${dia}`;

// ------------------ FETCH + TRY-CATCH-FINALLY ------------------ //
async function cargarHorarios() {
  try {
    const respuesta = await fetch("./data/horarios.json");
    if (!respuesta.ok) {
      throw new Error("No se pudieron cargar los horarios");
    }

    const horarios = await respuesta.json();

    const selectHora = document.getElementById("hora");
    horarios.forEach((horario) => {
      const option = document.createElement("option");
      option.value = horario.hora;
      option.textContent = horario.hora;
      selectHora.appendChild(option);
    });

    console.log("Horarios cargados:", horarios);
  } catch (error) {
    console.error("Error al cargar horarios:", error);
    Swal.fire("Error al cargar horarios", error.message, "error");
  } finally {
    console.log("Proceso de carga de horarios finalizado");
  }
}

// ------------------ EVENTOS ------------------ //

// Cambie el evento DOMContentLoaded por un boton (ver turnos) para mostrar/ocultar los turnos en pantalla cuando el usuario quiera.

botonVer.addEventListener("click", () => {
  if (contenedorTurnos.innerHTML === "<h2>Turnos Reservados</h2>") {
    cargarHorarios();
    mostrarTurnosEnPantalla(cargarTurnosDesdeStorage());
  } else {
    contenedorTurnos.innerHTML = "<h2>Turnos Reservados</h2>";
  }
});

// Reservar turno
botonReservar.addEventListener("click", () => {
  const nombre = document.getElementById("nombre-apellido").value;
  const fecha = document.getElementById("fecha").value;
  const hora = document.getElementById("hora").value;

  validarYReservar({ nombre, fecha, hora }, (turnoValido) => {
    const turnosExistentes = cargarTurnosDesdeStorage();

    // Verificar si ya hay un turno con la misma fecha y hora
    const yaReservado = turnosExistentes.some(
      (turnoExistente) =>
        turnoExistente.fecha === turnoValido.fecha &&
        turnoExistente.hora === turnoValido.hora
    );

    if (yaReservado) {
      Swal.fire("Ese horario ya está reservado para ese día", "", "error");
      return;
    }

    const nuevoTurno = {
      id: Date.now(), // se uso para crear un id unico, para poder guardar y borrar
      nombre: turnoValido.nombre,
      fecha: turnoValido.fecha,
      hora: turnoValido.hora,
    };

    const turnosActualizados = modificarTurnos((turnos) => [
      ...turnos,
      nuevoTurno,
    ]);

    mostrarTurnosEnPantalla(turnosActualizados);
    Swal.fire("Turno reservado", "", "success");
    formularioTurno.reset();
  });
});

// Vaciar todos los turnos
botonVaciar.addEventListener("click", () => {
  vaciarTurnos();
  mostrarTurnosEnPantalla([]);
  Swal.fire("Todos los turnos fueron eliminados", "", "warning");
});

// ------------------ FUNCIONES ------------------ //

// Validar datos antes de ejecutar acción

function validarYReservar(turno, accion) {
  if (!turno.nombre || !turno.fecha || !turno.hora) {
    Swal.fire("Por favor complete todos los campos", "", "error");
    return;
  }
  accion(turno);
}

// Turnos en pantalla
function mostrarTurnosEnPantalla(listaTurnos) {
  contenedorTurnos.innerHTML = "<h2>Turnos Reservados</h2>";

  // Ordenar por fecha y hora

  const turnosOrdenados = listaTurnos.sort((turnoA, turnoB) => {
    if (turnoA.fecha === turnoB.fecha) {
      return turnoA.hora.localeCompare(turnoB.hora);
    }
    return new Date(turnoA.fecha) - new Date(turnoB.fecha);
  });

  // Agrupar por fecha

  const grupos = {};
  turnosOrdenados.forEach((turno) => {
    if (!grupos[turno.fecha]) {
      grupos[turno.fecha] = [];
    }
    grupos[turno.fecha].push(turno);
  });

  // Mostrar cada grupo, elimine el for in
  Object.keys(grupos).forEach((fecha) => {
    // Encabezado con la fecha
    const tituloFecha = document.createElement("h3");
    tituloFecha.textContent = `📅 ${fecha}`;
    contenedorTurnos.appendChild(tituloFecha);

    // Mostrar turnos de esa fecha
    grupos[fecha].forEach((turno) => {
      const divTurno = document.createElement("div");
      divTurno.textContent = ` ${turno.hora} hs - ${turno.nombre}`;

      const botonBorrar = document.createElement("button");
      botonBorrar.textContent = "X";
      botonBorrar.addEventListener("click", () => {
        mostrarTurnosEnPantalla(borrarTurnoPorId(turno.id));
        Swal.fire("Turno eliminado", "", "info");
      });

      divTurno.appendChild(botonBorrar);
      contenedorTurnos.appendChild(divTurno);
    });
  });
}
