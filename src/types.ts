export interface WeightOption {
  labelAr: string;
  labelEn: string;
  value: string;
  price: number;
}

export interface Product {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  tags: string[];
  weights: WeightOption[];
  roastTypeAr?: string;
  roastTypeEn?: string;
}

export interface Category {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
}

export interface CartItem extends Product {
  cartItemId: string;
  quantity: number;
  selectedWeight: string;
  selectedWeightLabelAr: string;
  selectedWeightLabelEn: string;
  selectedPrice: number;
}
