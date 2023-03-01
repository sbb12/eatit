interface Option{
    measure: string,
    cost: number,
    protein: number,
    fat: number,
    carb: number,
}

export interface Meal {
    id: string,
    name: string,
    barcode: string,
    image: string,
    options: Option[],
}