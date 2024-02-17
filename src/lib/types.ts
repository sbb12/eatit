export interface User {
	id: string;
	collectionId?: string;
	collectionName?: string;
	username?: string;
	verified?: boolean;
	emailVisibility?: boolean;
	email?: string;
	created?: string;
	updated?: string;
	name?: string;
	avatar?: string;
	calorie_goal?: number;
	code?: number;
	message?: string;
	data?: any;
}

export interface DayTrack {
	id: string;
	collectionId: string;
	collectionName: string;
	created: string;
	updated: string;
	date: string;
	goal: number;
	user: string;
	weight: number;
	code?: number;
	message?: string;
	data?: any;
}

export interface Recipe {
	id?: string;
	collectionId?: string;
	collectionName?: string;
	created?: string;
	updated?: string;
	name: string;
	image: string | File;
	ingredients: Ingredient[];
	instructions: string[];
	no_servings: number;
	serving_calories: number;
	serving_protein: number;
	serving_fat: number;
	serving_carbs: number;
	serving_cost: number;
	user?: string;
	code?: number;
	message?: string;
	data?: any;
}

export interface Food {
	id: string;
	collectionId?: string;
	collectionName?: string;
	created?: string;
	updated?: string;
	name: string;
	brands: string;
	barcode: string;
	image: string | File;
	type: string;
	options: Option[];
	code?: number;
	message?: string;
	data?: any;
}

export interface Meal {
	id: string;
	collectionId?: string;
	collectionName?: string;
	created?: string;
	updated?: string;
	day?: string;
	name: string;
	food?: Food;
	measure: string;
	quantity: number;
	calories: number;
	protein: number;
	carbs: number;
	fat: number;	
	cost: number;
	expand?: {
		food: Food;
	}
	code?: number;
	message?: string;
	data?: any;
}

export interface Option {
	measure: string;
	calories: number;
	protein: number;
	cost: number;
	fat: number;
	carbs: number;
	desc: string;
}

export interface Ingredient {
	food: string;
	name: string;
	quantity: 6;
	measure: 'string';
}

export interface PBError {
	code: number;
	status: number;
	message: string;
	data: {
		code: number;
		message: string;
		details: any
	}
}
