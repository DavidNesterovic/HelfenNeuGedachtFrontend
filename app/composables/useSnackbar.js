export const useSnackbar = () => {
  const snacks = useState('snackbar', () => [])

  const show = (message, { type = 'default', duration = 3000 } = {}) => {
    const id = Date.now() + Math.random()
    snacks.value = [...snacks.value, { id, message, type }]
    setTimeout(() => {
      snacks.value = snacks.value.filter(s => s.id !== id)
    }, duration)
  }

  return { snacks, show }
}
