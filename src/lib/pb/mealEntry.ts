import type { Meal } from "$lib/types";
import { pb } from "./pocketbase";


export async function getMealEntriesID(dayID: string) : Promise<Meal[]>{

    const meals_resp = await pb.collection('meal_entry').getList(1, 50, {
        filter: 'day.id = "' + dayID + '"',
        expand: 'food',
        sort: 'created'
    }) as unknown as any ;

    const meals = meals_resp.items.map((m: Meal) => {
        return {
            id: m.id,
            name: m.name,
            measure: m.measure,
            quantity: m.quantity,
            calories: m.calories,
            protein: m.protein,
            carbs: m.carbs,
            fat: m.fat,
            cost: m.cost,
            food: m.expand?.food ,
        }
    });

    return meals as Meal[];
}



export async function deleteMeal(id: string) : Promise<void> {
    await pb.collection('meal_entry').delete(id);
}