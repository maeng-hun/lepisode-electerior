export interface ISubMenu {
  label: string
  route: string
}

export interface ISidebarMenu {
  icon?: string
  label: string
  route?: string
  children?: ISubMenu[]
}
