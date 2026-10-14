export function esMayorDeEdad(fechaNacimientoStr) {
  const fechaNacimiento = new Date(fechaNacimientoStr);
  const hoy = new Date();
  let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
  const diferenciaMes = hoy.getMonth() - fechaNacimiento.getMonth();
  if (
    diferenciaMes < 0 ||
    (diferenciaMes === 0 && hoy.getDate() < fechaNacimiento.getDate())
  ) {
    edad--;
  }
  return edad >= 18;
}

export const esEmailValido = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const esCorreoDuoc = (email) =>
  email.endsWith("@duocuc.cl") || email.endsWith("@duoc.cl");
