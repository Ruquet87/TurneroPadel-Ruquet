// Datos de storage

// (Variables)
const turnoStorage = "turnosPadel";

// Guardar turnos en localStorage
function guardarTurnosEnStorage(listaTurnos) {
  localStorage.setItem(turnoStorage, JSON.stringify(listaTurnos));
}

// Recuperar turnos desde localStorage
function cargarTurnosDesdeStorage() {
  return JSON.parse(localStorage.getItem(turnoStorage)) || [];
}

// Función de orden superior: modifica la lista de turnos
function modificarTurnos(accion) {
  const turnos = cargarTurnosDesdeStorage();
  const turnosActualizados = accion(turnos); // recibe función como parámetro
  guardarTurnosEnStorage(turnosActualizados);
  return turnosActualizados;
}

// Borrar turno por ID
function borrarTurnoPorId(idTurno) {
  return modificarTurnos((turnos) => turnos.filter((t) => t.id !== idTurno));
}

// Vaciar todos los turnos
function vaciarTurnos() {
  localStorage.removeItem(turnoStorage);
}
