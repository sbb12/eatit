import { pb } from "$lib/pb/pocketbase";
import type { Food, RecordError } from "$lib/types";

// Fetches a Food record by ID
export async function getFoodID(RECORD_ID: string): Promise<Food | RecordError> {
    try {
        const record = await pb.collection('foods').getOne('RECORD_ID') as Food;
        return record;
    } catch (e) {
        console.log(e);
        return e as RecordError;
    }
}

// Fetches a Food record by barcode
export async function getFoodBarcode(barcode: string): Promise<Food | RecordError> {
    try {
        const record = await pb.collection('foods').getFirstListItem(`barcode="${barcode}"`) as Food;
        return record;
    } catch (e) {
        console.log(e);
        return e as RecordError;
    }
}

// Fetches a list of Food records by name
export async function getFoodsName(name: string): Promise<Food[]> {
    try {
        const records = await pb.collection('foods').getList(1, 50, {
            filter: `name ~ "${name}"`,
            sort: 'created',
        }) as unknown as Food[];
        return records;
    } catch (e) {
        console.log(e);
        return [];
    }
}

// Creates a new Food record
export async function createFood(food: Food): Promise<Food | RecordError> {
    try {
        const record = await pb.collection('foods').create(food) as Food;
        return record;
    } catch (e) {
        console.log(e);
        return e as RecordError;
    }
}
