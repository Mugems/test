const PAYMENT_MODES = [
  "Cash",
  "Online",
  "Cheque/DD"
]

const PAYMENT_MODES_OPTIONS = PAYMENT_MODES.map((mode) => ({
  label: mode,
  value: mode,
}));

export default PAYMENT_MODES_OPTIONS;