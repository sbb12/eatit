// Import necessary types and the Pocketbase API wrapper
import type { User, DayTrack } from '$lib/types';
import { pb } from './pocketbase';

// Fetch a DayTrack record for a given user and date.
export async function getDayTrack(user: User, date: Date): Promise<DayTrack> {
	// Format the date to a string for comparison
	date.setHours(12, 0, 0, 0);
	const dateString = date.toISOString().split('T')[0];

	try {
		// Try to retrieve the DayTrack record
		const resp = (await pb.collection('day_track').getFirstListItem('', {
			filter: `user.id = "${user.id}" && date ~ "${dateString}%"`
		})) as unknown as DayTrack;

		return resp;
	} catch (e: any) {
		// If unsuccessful, return the error as a Record Error
		return e.data as DayTrack;
	}
}

// Create a new DayTrack record for a given user and date.
export async function createDayTrack(user: User, date: Date): Promise<DayTrack> {
	// Format the date to a string for creation
	date.setHours(12, 0, 0, 0);
	const dateString = date.toISOString();
	
	try {
		// Try to create the new DayTrack record
		const resp = (await pb.collection('day_track').create({
			user: user.id,
			date: dateString,
			goal: 1900,
			weight: null
		})) as unknown as DayTrack;

		return resp;
	} catch (e: any) {
		return e.data as DayTrack;
	}
}
