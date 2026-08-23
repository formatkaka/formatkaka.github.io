export const battleScenes: BattleScene[] = [
  {
    title: 'The first patrol',
    kicker: 'Kaksar · May 1999',
    detail:
      'A patrol from 4 JAT moved into the Kaksar heights as reports of intrusion emerged. These six names open the sequence together.',
    soldierIndices: [0, 1, 2, 3, 4, 5],
    sectors: ['kaksar'],
  },
  {
    title: 'Operation Safed Sagar',
    kicker: 'The air campaign · May 1999',
    detail:
      'The Indian Air Force entered the high-altitude campaign under Operation Safed Sagar. This chapter remembers a fighter pilot and the four members of a Mi-17 crew.',
    soldierIndices: [6, 7, 8, 9, 10],
    sectors: [],
    theatreLabel: 'Across the theatre',
  },
  {
    title: 'The Batalik battles',
    kicker: 'Batalik sector',
    detail:
      'Batalik was a wide field of steep approaches and separated heights. Units advanced through terrain where altitude and exposure shaped every movement.',
    soldierIndices: [11],
    sectors: ['batalik'],
  },
  {
    title: 'The road through Tololing',
    kicker: 'Dras sector · June 1999',
    detail:
      'Tololing dominated the approach through Dras. Its early assaults and eventual capture became a pivotal chapter in the effort to recover the heights.',
    soldierIndices: [12, 13, 15],
    sectors: ['dras'],
  },
  {
    title: 'From Turtuk to Dras',
    kicker: 'Across the sectors',
    detail:
      'Operation Vijay unfolded across distinct sectors rather than a single battlefield. These names connect the Turtuk heights with the continuing operations around Dras.',
    soldierIndices: [14, 16],
    sectors: ['turtuk', 'dras'],
  },
  {
    title: 'Knoll and Black Rock',
    kicker: 'Tololing complex · June 1999',
    detail:
      'Beyond Tololing, the fighting continued across the Knoll and Black Rock features. The climbs were made at night, over rock and under observation from higher positions.',
    soldierIndices: [17, 18, 19],
    sectors: ['dras'],
  },
  {
    title: 'The Batalik heights',
    kicker: 'Point 4812 and Khalubar',
    detail:
      'The advances at Point 4812 and Khalubar Ridge belong to the larger struggle for the Batalik heights. Two names are brought forward in this chapter.',
    soldierIndices: [20, 21],
    sectors: ['batalik'],
  },
  {
    title: 'The final heights',
    kicker: 'Pimple II and Point 4875 · July 1999',
    detail:
      'Pimple II and Point 4875 mark the closing part of this sequence. These selected names remain part of the much larger remembrance of those lost during Operation Vijay.',
    soldierIndices: [22, 23],
    sectors: ['dras'],
  },
];

export type BattleScene = {
  title: string;
  kicker: string;
  detail: string;
  soldierIndices: number[];
  sectors: CampaignSector[];
  theatreLabel?: string;
};

export type CampaignSector = 'dras' | 'kaksar' | 'batalik' | 'turtuk';
