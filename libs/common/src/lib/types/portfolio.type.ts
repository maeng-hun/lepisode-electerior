import { IPortfolio } from '../interfaces/portfolio.interface'

export type CreatePortfolioDTO = Omit<IPortfolio, 'id' | 'createdAt' | 'views' | 'images'> & {
  images?: File[] | null
}
