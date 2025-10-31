import { IPartner } from '../interfaces/partner.interface'

export type CreatePartnerDTO = Omit<IPartner, 'id' | 'createdAt'| 'image'> & {
  image?: File | null
}
