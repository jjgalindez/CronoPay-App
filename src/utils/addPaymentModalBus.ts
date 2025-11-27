type Listener = () => void

const listeners: Listener[] = []

export function subscribeAddPaymentModal(cb: Listener) {
  listeners.push(cb)
  return () => {
    const idx = listeners.indexOf(cb)
    if (idx !== -1) listeners.splice(idx, 1)
  }
}

export function openAddPaymentModal() {
  listeners.forEach((cb) => cb())
}
