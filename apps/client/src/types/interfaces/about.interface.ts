export interface ITab {
  key: 'company' | 'service' | 'inquiry'
  label: string
}

export interface IDotLottieElement extends HTMLElement {
  play: () => void
  stop: () => void
}
