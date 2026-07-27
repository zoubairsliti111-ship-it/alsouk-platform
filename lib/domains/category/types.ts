export interface Category {
  id: string
  slug: string
  name: string
  description: string | null
  parentId: string | null
  position: number
}

export interface CategoryTree extends Category {
  children: CategoryTree[]
}
