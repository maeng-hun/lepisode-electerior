import { Exclude, Expose } from 'class-transformer'

@Exclude()
export class AdminDTO {
  @Expose()
  id: string

  @Expose()
  email: string

  @Expose()
  name: string

  passwordHash: string

  @Expose()
  role: 'SUPER_ADMIN' | 'ADMIN'
}
