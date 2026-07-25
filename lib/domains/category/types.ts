export interface Category {
  id: string
  slug: string
  name: string
  description?: string
  icon?: string
  parentId?: string | null
  isActive: boolean
}

export interface CategoryTree extends Category {
  children: CategoryTree[]
}
