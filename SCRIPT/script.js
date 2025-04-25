// Precios de los torneos
const preciosTorneos = {
  fifa: 20,
  valorant: 30,
  fortnite: 25,
  cod: 35,
  lol: 30,
};

// Elementos del DOM
const form = document.getElementById("inscripcionForm");
const modal = document.getElementById("resultModal");
const closeModal = document.getElementById("closeModal");
const modalTitle = document.getElementById("modalTitle");
const modalMessage = document.getElementById("modalMessage");
const detallePago = document.getElementById("detallePago");

// Validar edad (mínimo 14 años)
function validarEdad(fechaNacimiento) {
  const hoy = new Date();
  const fechaNac = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - fechaNac.getFullYear();
  const mes = hoy.getMonth() - fechaNac.getMonth();

  if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
    edad--;
  }

  return edad >= 14;
}

// Mostrar error
function mostrarError(elemento, mensaje) {
  const errorElement = document.getElementById(elemento + "Error");
  errorElement.textContent = mensaje;
  errorElement.style.display = "block";
}

// Ocultar error
function ocultarError(elemento) {
  const errorElement = document.getElementById(elemento + "Error");
  errorElement.style.display = "none";
}

// Validar formulario
form.addEventListener("submit", function (e) {
  e.preventDefault();

  let valido = true;

  // Validar nombre
  if (!form.nombre.value.trim()) {
    mostrarError("nombre", "Por favor ingresa tu nombre completo");
    valido = false;
  } else {
    ocultarError("nombre");
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(form.email.value)) {
    mostrarError("email", "Por favor ingresa un correo válido");
    valido = false;
  } else {
    ocultarError("email");
  }

  // Validar fecha de nacimiento
  if (!form.fechaNacimiento.value) {
    mostrarError("edad", "Por favor ingresa tu fecha de nacimiento");
    valido = false;
  } else if (!validarEdad(form.fechaNacimiento.value)) {
    mostrarError("edad", "Debes tener al menos 14 años para inscribirte");
    valido = false;
  } else {
    ocultarError("edad");
  }

  // Validar torneo seleccionado
  if (!form.torneo.value) {
    mostrarError("torneo", "Por favor selecciona un torneo");
    valido = false;
  } else {
    ocultarError("torneo");
  }

  // Validar monto pagado
  const torneoSeleccionado = form.torneo.value;
  const montoPagado = parseFloat(form.montoPagado.value);
  const precioTorneo = preciosTorneos[torneoSeleccionado];

  if (isNaN(montoPagado)) {
    mostrarError("pago", "Por favor ingresa un monto válido");
    valido = false;
  } else if (montoPagado < precioTorneo) {
    mostrarError("pago", `El monto mínimo es $${precioTorneo}`);
    valido = false;
  } else {
    ocultarError("pago");
  }

  // Mostrar resultados
  if (valido) {
    const vuelto = montoPagado - precioTorneo;

    modalTitle.textContent = "¡Inscripción Exitosa!";
    modalMessage.textContent = `Gracias ${form.nombre.value}, tu inscripción al torneo ha sido registrada. Te enviaremos los detalles al correo ${form.email.value}.`;

    detallePago.innerHTML = `
        <p><strong>Detalle de pago:</strong></p>
        <p>Costo del torneo: $${precioTorneo}</p>
        <p>Monto pagado: $${montoPagado.toFixed(2)}</p>
        ${
          vuelto > 0
            ? `<p>Tu vuelto: $${vuelto.toFixed(2)}</p>`
            : "<p>No hay vuelto.</p>"
        }
        <p style="margin-top: 1rem;"><strong>¡Prepárate para la competencia!</strong></p>
      `;

    modal.style.display = "flex";
  } else {
    modalTitle.textContent = "Error en el Formulario";
    modalMessage.textContent =
      "Por favor corrige los errores indicados para completar tu inscripción.";
    detallePago.innerHTML = "";
    modal.style.display = "flex";
  }
});

// Cerrar modal
closeModal.addEventListener("click", function () {
  modal.style.display = "none";
});

// Cerrar modal al hacer clic fuera
window.addEventListener("click", function (event) {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});
