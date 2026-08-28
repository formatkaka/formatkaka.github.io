export type RemembranceImage = {
  src: string;
  alt: string;
  caption: string;
};

export type RemembranceStory = {
  sceneIndex: number;
  soldiers: number[];
  place: string;
  title: string;
  introduction: string;
  paragraphs: string[];
  images: RemembranceImage[];
  source: string;
};

const bookSource = (chapter: string) =>
  `Story and photographs from Rachna Bisht Rawat’s Kargil: Untold Stories from the War · ${chapter}.`;

export const remembranceStories: RemembranceStory[] = [
  {
    sceneIndex: 0,
    soldiers: [0, 1, 2, 3, 4, 5],
    place: 'Kaksar',
    title: 'The six of 4 JAT',
    introduction:
      'Captain Saurabh Kalia’s story is told in detail in the book, but this first patrol belongs to six names, not one.',
    paragraphs: [
      'Sepoy Arjun Ram, Sepoy Bhanwar Lal Bagaria, Sepoy Bhika Ram, Sepoy Moola Ram and Sepoy Naresh Singh were with Saurabh in the Kaksar patrol. The book records them together when their bodies were returned to India in June 1999.',
      'This wall brings the six forward together for the same reason: their families endured the loss together in public memory, even though each life had its own home, voice and history beyond the patrol.',
    ],
    images: [],
    source: bookSource('“Unbroken”'),
  },
  {
    sceneIndex: 0,
    soldiers: [0],
    place: 'Palampur',
    title: 'Captain Saurabh Kalia: the first cheque',
    introduction:
      'One family, beyond the battle. The Kalia family kept a small record of a life that had only just begun.',
    paragraphs: [
      'Saurabh was twenty-two when he was commissioned. After signing the first cheque of his life, he handed it to his mother, telling her that he had begun earning and she need not worry about money anymore.',
      'Vijaya Kalia kept it. The cheque was never cashed; Saurabh died before his first salary reached his account. In the Kalia home, it remains less a financial document than the beginning of a son’s adult life, abruptly interrupted.',
    ],
    images: [
      {
        src: '/assets/kargil-name-wall/families/saurabh-kalia-commissioning.jpg',
        alt: 'Saurabh Kalia standing between his parents after his commissioning',
        caption: 'Narinder and Vijaya Kalia pin Saurabh’s insignia after his commissioning',
      },
      {
        src: '/assets/kargil-name-wall/families/saurabh-kalia-first-cheque.jpg',
        alt: 'Vijaya Kalia holding the first cheque Saurabh gave her',
        caption: 'Vijaya Kalia holds the first cheque Saurabh left for her',
      },
    ],
    source: bookSource('“Unbroken”'),
  },
  {
    sceneIndex: 1,
    soldiers: [],
    place: 'Kargil–Tololing–Batalik',
    title: 'Flying Officer Gunjan Saxena: a lifeline in the air',
    introduction:
      'A voice beyond the 24-name wall. Gunjan Saxena flew Cheetah helicopter sorties through the early months of the war.',
    paragraphs: [
      'She surveyed the Kargil–Tololing–Batalik area, carried supplies and evacuated wounded soldiers from improvised high-altitude helipads. Her account makes the air campaign feel less distant: every sortie connected the mountains to the people waiting below.',
      'Her parents knew the risks but did not ask her to step away from duty. The book records that she declined the option to leave Srinagar when the work became dangerous.',
    ],
    images: [
      {
        src: '/assets/kargil-name-wall/remembrances/I-F27.jpg',
        alt: 'Flying Officer Gunjan Saxena in uniform',
        caption: 'Flying Officer Gunjan Saxena, who flew during the Kargil War',
      },
    ],
    source: bookSource('“Kargil’s Only Woman Warrior”'),
  },
  {
    sceneIndex: 2,
    soldiers: [],
    place: 'Batalik',
    title: 'Major Sonam Wangchuk: a blessing before Batalik',
    introduction:
      'A voice beyond the 24-name wall. Before leaving for Batalik, Sonam Wangchuk and the Ladakh Scouts received the Dalai Lama’s blessing.',
    paragraphs: [
      'The book describes the soldiers returning to their trucks with sacred threads at their necks, then moving from Karu towards the fighting. It preserves an intimate moment before the scale of war took over: men preparing themselves, spiritually and practically, for what was ahead.',
      'Wangchuk survived the war and was awarded the Maha Vir Chakra. His account helps locate the Batalik battles within Ladakh’s own landscape, language and community.',
    ],
    images: [
      {
        src: '/assets/kargil-name-wall/remembrances/I-F5.jpg',
        alt: 'Major Sonam Wangchuk with Ladakh Scouts after victory at Rock Fall',
        caption: 'Major Sonam Wangchuk with Ladakh Scouts at Rock Fall after victory',
      },
      {
        src: '/assets/kargil-name-wall/remembrances/I-F6.jpg',
        alt: 'Major Sonam Wangchuk during an interview',
        caption: 'Sonam Wangchuk in a later conversation about the war',
      },
    ],
    source: bookSource('“Not Without My Men”'),
  },
  {
    sceneIndex: 2,
    soldiers: [],
    place: 'Batalik',
    title: 'Captain B. M. Cariappa: returning to the ridge',
    introduction:
      'A voice beyond the 24-name wall. Nearly two decades after Kargil, B. M. Cariappa asked to return to Batalik, where he and 5 Para had fought.',
    paragraphs: [
      'The book’s interview returns to battle maps and comrades rather than a simple victory narrative. It records a survivor revisiting the geography where the memory of the unit remained inseparable from the landscape.',
      'Cariappa’s presence gives this chapter a necessary counterpoint: the memorial holds those who died, while those who came back carry a different, continuing form of remembrance.',
    ],
    images: [
      {
        src: '/assets/kargil-name-wall/remembrances/I-F18.jpg',
        alt: 'Captain B. M. Cariappa with Lance Naik Sher Singh and Naib Subedar Ram Niwas',
        caption: 'Captain B. M. Cariappa with comrades from 5 Para',
      },
      {
        src: '/assets/kargil-name-wall/remembrances/I-F19.jpg',
        alt: 'Captain B. M. Cariappa with 5 Para soldiers on a peak after an operation',
        caption: 'Captain Cariappa and soldiers of 5 Para after an operation',
      },
    ],
    source: bookSource('“Endgame”'),
  },
  {
    sceneIndex: 4,
    soldiers: [14],
    place: 'Turtuk',
    title: 'Captain Haneef-ud-din: a mother’s answer',
    introduction:
      'In 1999, Hema Aziz was told that constant fire made it impossible to recover her son’s body.',
    paragraphs: [
      'She asked that no other soldier risk his life to retrieve him. Haneef’s body was recovered forty-three days later, and she later travelled with her other sons to see the place where he died.',
      'Before the war, Haneef had been known to his commanding officer as a gifted singer and the youngest officer in the battalion. His mother, a classical singer, continued her morning riyaaz in the Delhi home where his photograph remained.',
    ],
    images: [
      {
        src: '/assets/kargil-name-wall/remembrances/I-F7.jpg',
        alt: 'Captain Haneef-ud-din smiling in a family photograph',
        caption: 'Captain Haneef-ud-din from his mother’s personal album',
      },
      {
        src: '/assets/kargil-name-wall/remembrances/I-F8.jpg',
        alt: 'Hema Aziz pictured after the Kargil War',
        caption:
          'Hema Aziz, who asked that no other soldier be put at risk to recover Haneef’s body',
      },
    ],
    source: bookSource('“Haneef”'),
  },
  {
    sceneIndex: 5,
    soldiers: [],
    place: 'Tololing to Muzaffarnagar',
    title: 'Lieutenant Hitesh Kumar: his mother’s dream',
    introduction:
      'A voice beyond the 24-name wall. Hitesh Kumar was four when his father, Lance Naik Bachan Singh of 2 Rajputana Rifles, was killed at Tololing.',
    paragraphs: [
      'Years later, Hitesh entered the Indian Military Academy and was allotted his father’s battalion through parental claim. His mother, Kamesh Bala, had spent years working towards the future her husband had imagined for their twin sons.',
      'The story does not resolve loss. It shows how a family can keep a relationship with a person alive through memories, schooling, a regiment and a decision to carry a name forward.',
    ],
    images: [
      {
        src: '/assets/kargil-name-wall/remembrances/I-F22.jpg',
        alt: 'Lance Naik Bachan Singh, who died during the Kargil War',
        caption: 'Lance Naik Bachan Singh of 2 Rajputana Rifles',
      },
      {
        src: '/assets/kargil-name-wall/remembrances/I-F23.jpg',
        alt: 'Lieutenant Hitesh Kumar with his mother and twin brother after his passing-out parade',
        caption:
          'Lieutenant Hitesh Kumar with his mother and twin brother after his passing-out parade',
      },
    ],
    source: bookSource('“The Legacy”'),
  },
  {
    sceneIndex: 5,
    soldiers: [15, 17, 19],
    place: 'Tololing complex',
    title: 'One photograph before the assault',
    introduction:
      'Vijyant Thapar, Vivek Gupta and Padmapani Acharya were photographed together in Vijyant’s tent before the fighting that followed.',
    paragraphs: [
      'The image holds an ordinary pause between operations: three officers from 2 Rajputana Rifles together, smiling for the camera. All three were killed during the Kargil War.',
      'It is included here not as a symbol of inevitability, but as a record of companionship—of people who shared a tent, a unit and a future that was about to change beyond recognition.',
    ],
    images: [
      {
        src: '/assets/kargil-name-wall/remembrances/I-F10.jpg',
        alt: 'Vijyant Thapar, Vivek Gupta and Padmapani Acharya together in a tent',
        caption: 'Vijyant Thapar, Vivek Gupta and Padmapani Acharya in Vijyant’s tent',
      },
    ],
    source: bookSource('“The Last Letter” · illustration caption'),
  },
  {
    sceneIndex: 5,
    soldiers: [19],
    place: 'Kupwara to Dras',
    title: 'Lieutenant Vijyant Thapar: a promise kept',
    introduction:
      'Before Kargil, Vijyant had befriended Ruksana, a young girl in Kupwara who had withdrawn after violence took her father.',
    paragraphs: [
      'He won her trust with patience and small gifts, and asked his family to keep supporting her if anything happened to him. After his death, his father found Ruksana and continued to visit and support her.',
      'The relationship became a way for the Thapars to carry forward something their son had chosen to do: care for a child beyond his own family and beyond the battlefield.',
    ],
    images: [
      {
        src: '/assets/kargil-name-wall/remembrances/I-F9.jpg',
        alt: 'Lieutenant Vijyant Thapar in combat uniform',
        caption: 'Lieutenant Vijyant Thapar in combat greens',
      },
      {
        src: '/assets/kargil-name-wall/remembrances/I-F13.jpg',
        alt: 'Colonel Virender Thapar with Ruksana',
        caption: 'Colonel Virender Thapar with Ruksana, whom Vijyant asked his family to support',
      },
    ],
    source: bookSource('“The Last Letter”'),
  },
  {
    sceneIndex: 6,
    soldiers: [21],
    place: 'Lucknow',
    title: 'Captain Manoj Kumar Pandey: a reason to speak',
    introduction:
      'When visitors came to Mohini Pandey in Lucknow, she told them that their presence gave her a chance to talk about the son she had lost.',
    paragraphs: [
      'That small observation matters in a memorial: remembrance is not only a ceremony or an anniversary. It can also be the permission to say a person’s name, to tell a story again, and to have it heard.',
    ],
    images: [],
    source: bookSource('“The Legacy”'),
  },
  {
    sceneIndex: 7,
    soldiers: [22],
    place: 'Delhi to Pimple II',
    title: 'Captain Anuj Nayyar: the parcel that returned',
    introduction:
      'During the war, Anuj’s mother and fiancée gathered snacks, juice and a small envelope of money to send to him through an officer flying to the sector.',
    paragraphs: [
      'Anuj never received the parcel. His mother later recalled that it came back with his coffin, along with his engagement ring, watch and wallet.',
      'She helped his fiancée’s family encourage her to marry again, saying she would never have wanted the young woman to carry the loss for the rest of her life. It is a story of grief that also made room for another person’s future.',
    ],
    images: [
      {
        src: '/assets/kargil-name-wall/remembrances/I-F14.jpg',
        alt: 'Anuj Nayyar as a cadet at the National Defence Academy',
        caption: 'Anuj Nayyar as a cadet at the National Defence Academy',
      },
      {
        src: '/assets/kargil-name-wall/remembrances/I-F15.jpg',
        alt: 'Anuj Nayyar with his family at his passing-out parade',
        caption: 'The Nayyars at Anuj’s passing-out parade',
      },
      {
        src: '/assets/kargil-name-wall/remembrances/I-F16.jpg',
        alt: 'Anuj Nayyar being promoted to captain on the battlefield',
        caption: 'Anuj Nayyar being promoted to captain on the battlefield',
      },
    ],
    source: bookSource('“Premonition”'),
  },
  {
    sceneIndex: 7,
    soldiers: [23],
    place: 'Point 4875',
    title: 'After Point 4875: burial with respect',
    introduction:
      'A week after Captain Vikram Batra was killed at Point 4875, 13 J&K Rifles prepared a ceremonial burial for enemy soldiers whose bodies remained on the battlefield.',
    paragraphs: [
      'The unit’s own losses were still immediate: their wounded had been evacuated and their dead carried down from the heights. Yet the burial was organised with military honour.',
      'This moment sits beside the battle story as a reminder that war’s aftermath is made of human bodies, families and difficult acts of dignity—not victory alone.',
    ],
    images: [
      {
        src: '/assets/kargil-name-wall/remembrances/I-F50.jpg',
        alt: 'Captain Vikram Batra inspecting a captured weapon',
        caption: 'Captain Vikram Batra inspecting a weapon seized after an earlier operation',
      },
      {
        src: '/assets/kargil-name-wall/remembrances/I-F28.jpg',
        alt: 'Soldiers of 13 J and K Rifles during a ceremonial burial',
        caption: 'Soldiers of 13 J&K Rifles respectfully bury enemy soldiers killed in battle',
      },
    ],
    source: bookSource('“Burying the Dead” · illustration caption'),
  },
];

export const getRemembrancesForScene = (sceneIndex: number) =>
  remembranceStories.filter((story) => story.sceneIndex === sceneIndex);
