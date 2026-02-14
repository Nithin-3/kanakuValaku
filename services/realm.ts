import Realm from 'realm';
import { KanakuSchema, VaralaruSchema } from './schema';
import { v4 as uuid } from 'uuid';
import { BSON } from 'realm';

let realmInstance: Realm | null = null;

const getRealm = async () => {
	if (!realmInstance) {
		realmInstance = await Realm.open({
			schema: [KanakuSchema, VaralaruSchema],
			schemaVersion: 3, // Bumped for 'order' field
		});
	}
	return realmInstance;
};

export const getKanaku = async () => {
	const realm = await getRealm();
	return realm.objects('Kanaku').sorted('order');
};

export const getVaralaru = async (uid: string) => {
	const realm = await getRealm();
	return realm.objects('Varalaru').filtered('kanaku == $0', uid).sorted('neram', true);
};

export const addKanaku = async (ethuku: string, selavu: number, selavanathu: number) => {
	const realm = await getRealm();
	const maxOrder = realm.objects('Kanaku').max('order') as number || 0;
	realm.write(() => {
		realm.create('Kanaku', {
			uid: uuid(),
			ethuku,
			selavu,
			selavanathu,
			completed: false,
			order: maxOrder + 1,
		});
	});
}

// Helper for synchronous history creation inside a write transaction
const createHistoryEntry = (realm: Realm, uid: string, ethu: string, matram: string) => {
	realm.create('Varalaru', {
		_id: new BSON.ObjectId(),
		kanaku: uid,
		neram: new Date(),
		matram,
		ethu
	});
};

export async function updateKanaku(uid: string, ethuku: string, key: "ethuku"): Promise<void>;
export async function updateKanaku(uid: string, selavu: number, key: "selavu"): Promise<void>;
export async function updateKanaku(uid: string, selavanathu: number, key: "selavanathu"): Promise<void>;
export async function updateKanaku(uid: string, data: string | number, key: "ethuku" | "selavu" | "selavanathu"): Promise<void> {
	const realm = await getRealm();
	realm.write(() => {
		const kanaku = realm.objectForPrimaryKey('Kanaku', uid);
		if (kanaku) {
			// @ts-ignore
			kanaku[key] = data;
			createHistoryEntry(realm, uid, key, `${data}-ஆக திருத்தப்பட்டது`);
		} else {
			throw new Error(`Item with id ${uid} not found`);
		}
	});
}

export const toggleKanaku = async (uid: string) => {
	const realm = await getRealm();
	realm.write(() => {
		const kanaku = realm.objectForPrimaryKey('Kanaku', uid);
		if (kanaku) {
			// @ts-ignore
			kanaku.completed = !kanaku.completed;
		}
	});
};


export const updateOrder = async (updates: { key: string, order: number }[]) => {
	const realm = await getRealm();
	realm.write(() => {
		updates.forEach(({ key, order }) => {
			const kanaku = realm.objectForPrimaryKey('Kanaku', key);
			if (kanaku) {
				// @ts-ignore
				kanaku.order = order;
			}
		});
	});
};

export const deleteKanaku = async (uid: string) => {
	const realm = await getRealm();
	realm.write(() => {
		const kanaku = realm.objectForPrimaryKey('Kanaku', uid);
		if (kanaku) {
			// Delete related history first
			const history = realm.objects('Varalaru').filtered('kanaku == $0', uid);
			realm.delete(history);
			realm.delete(kanaku);
		} else {
			throw new Error(`Item with id ${uid} not found`);
		}
	});
}

export const closeRealm = () => {
	if (realmInstance && !realmInstance.isClosed) {
		realmInstance.close();
		realmInstance = null;
	}
}