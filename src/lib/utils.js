/**
 * Returns true if the given date string is more than 90 days in the past.
 */
export function isOutside90Days(dateStr) {
  if (!dateStr) return false
  const booking = new Date(dateStr)
  const now = new Date()
  const diffDays = (now - booking) / (1000 * 60 * 60 * 24)
  return diffDays > 90
}

/**
 * Validates the refund form fields.
 * Returns an object of field -> error message.
 * Empty object means no errors.
 */
export function validateForm(form) {
  const errors = {}

  const trimmedName = form.fullName.trim()
  if (!trimmedName) {
    errors.fullName = 'Full name is required.'
  } else {
    const nameParts = trimmedName.split(/\s+/)
    if (nameParts.length < 2 || nameParts.some(part => part.length < 2)) {
      errors.fullName = 'Please enter your full first and last name.'
    }
  }

  if (!form.email.trim()) {
    errors.email = 'Email is required.'
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email.trim())) {
    errors.email = 'Please enter a valid email address.'
  }

  if (!form.bookingReference.trim()) {
    errors.bookingReference = 'Booking reference is required.'
  } else if (!/^DLX-\d{5}$/.test(form.bookingReference.trim())) {
    errors.bookingReference = 'Booking reference must be in the format DLX-12345.'
  }

  if (!form.bookingDate)
    errors.bookingDate = 'Booking date is required.'

  if (!form.refundReason)
    errors.refundReason = 'Please select a refund reason.'

  if (!form.additionalDetails.trim())
    errors.additionalDetails = 'Please provide additional details.'

  return errors
}
