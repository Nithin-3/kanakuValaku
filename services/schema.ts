import Realm from 'realm';

export const KanakuSchema: Realm.ObjectSchema = {
	name: 'Kanaku',
	primaryKey: 'uid',
	properties: {
		uid: 'string',
		selavu: { type: 'float', default: 0 },
		selavanathu: { type: 'float', default: 0 },
		ethuku: 'string',
		completed: { type: 'bool', default: false },
		order: { type: 'int', default: 0 },
	},
};

export const VaralaruSchema: Realm.ObjectSchema = {
	name: 'Varalaru',
	primaryKey: '_id',
	properties: {
		_id: 'objectId',
		kanaku: 'string', // reference Kanaku.uid
		neram: 'date',
		matram: 'string',
		ethu: 'string', // "selavu" | "selavanathu" | "ethuku"
	},
};
