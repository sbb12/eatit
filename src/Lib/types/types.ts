export interface OptionType{
    measure: string,
    calories: number,
    protein: number,
    cost: number,
    fat: number,
    carbs: number,
    desc: string,
}

export interface Food {
    id: string,
    name: string,
    barcode: string,
    image: string,
    options: OptionType[],
}