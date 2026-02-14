export type Tkanaku = {
	uid: string;
	selavu: number;
	selavanathu: number;
	ethuku: string;
};


export type Tvaralaru = {
	kanaku: string;
	neram: Date;
	matram: string;
	ethu: "selavu" | "selavanathu" | "ethuku";
};
