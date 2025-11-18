export function normalizePhoneToWhatsApp(phone, defaultCountry='56'){ // Chile por defecto
  if (!phone) return null
  let digits = phone.replace(/[^\d]/g, '') // solo números
  // si empieza con 0, quítalo
  digits = digits.replace(/^0+/, '')
  // si no trae código de país y tiene 8-9 dígitos, anteponer Chile
  if (!digits.startsWith(defaultCountry) && digits.length <= 9) {
    digits = defaultCountry + digits
  }
  return `https://wa.me/${digits}`
}
