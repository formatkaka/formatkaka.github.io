export type NameWallLocale = 'en' | 'hi';

export const NAME_WALL_LANGUAGE_KEY = 'kargil-name-wall-language';

export const localeLabels: Record<NameWallLocale, string> = {
  en: 'English',
  hi: 'हिंदी',
};

/** Short interface copy shared by the static template and the interactive wall. */
export const uiCopy: Record<NameWallLocale, Record<string, string>> = {
  en: {
    languageLabel: 'Language',
    remembranceEyebrow: 'In remembrance of the fallen · Kargil, 1999',
    introTitle: 'Names across<br />the heights.',
    introLede:
      'Follow 24 selected names through eight campaign chapters. They form one narrative path through a much larger roll of honour; the Chakra opens the wall around each group.',
    introScope: 'This first edition also carries one family remembrance, beginning with Captain Saurabh Kalia.',
    begin: 'Begin the remembrance',
    campaignTitle: 'The war unfolded across several fronts.',
    campaignBody:
      'From Mushkoh and Dras through Kaksar and Batalik toward Turtuk, troops fought to recover commanding heights. The Srinagar–Leh road below made those positions strategically vital.',
    mapKey: 'Map key',
    lineOfControl: 'Line of Control',
    road: 'Srinagar–Leh road',
    fronts: 'Campaign fronts',
    schematic: 'Schematic · not to scale. Geography based on the official Kargil Vijay Diwas campaign diagram.',
    followCampaign: 'Follow the campaign through the names',
    officialDiagram: 'Official PIB campaign diagram',
    operationVijay: 'Operation Vijay',
    selectedNames: '24 selected names · 8 chapters',
    currentChapter: 'Current chapter',
    sectorLocator: 'Sector locator',
    namesBroughtForward: 'Names brought forward',
    exploreChapter: 'Explore this chapter',
    previousChapter: 'Previous chapter',
    nextChapter: 'Next chapter',
    supportingRemembrance: 'Supporting remembrance',
    returnToBattle: 'Return to the battle chapter',
    supportingRemembrances: 'supporting remembrances',
    chapterArchive: 'Chapter archive',
    selectToEnlarge: '3 photographs · select to enlarge',
    viewOriginal: 'View original and licence',
    closeDetails: 'Close chapter details',
    closePhoto: 'Close expanded photograph',
    previousPhoto: 'Previous photograph',
    nextPhoto: 'Next photograph',
    readMore: 'Read more',
    endingEyebrow: 'One path through a larger remembrance',
    endingTitle: 'Twenty-four names, held within many more.',
    endingBody:
      'These 24 selected stories are not a complete roll of honour and do not rank sacrifice. They stand within the larger remembrance of all who laid down their lives during Operation Vijay.',
    firstStudy: 'Explore the first remembrance study',
    warMemorial: 'Kargil War Memorial',
  },
  hi: {
    languageLabel: 'भाषा',
    remembranceEyebrow: 'शहीदों की स्मृति में · कारगिल, 1999',
    introTitle: 'ऊँचाइयों पर<br />अंकित नाम।',
    introLede:
      'आठ अभियान अध्यायों में चुने गए 24 नामों का अनुसरण करें। यह बहुत बड़े सम्मान-रोल के बीच एक कथा-पथ है; चक्र हर समूह के चारों ओर दीवार खोलता है।',
    introScope: 'इस प्रथम संस्करण में कैप्टन सौरभ कालिया से शुरू होने वाली एक पारिवारिक स्मृति भी शामिल है।',
    begin: 'स्मरण यात्रा शुरू करें',
    campaignTitle: 'युद्ध कई मोर्चों पर लड़ा गया।',
    campaignBody:
      'मुश्कोह और द्रास से काकसर और बटालिक होते हुए तुरतुक तक, सैनिकों ने रणनीतिक ऊँचाइयों को वापस लेने के लिए संघर्ष किया। नीचे की श्रीनगर–लेह सड़क ने इन चौकियों को अत्यंत महत्वपूर्ण बनाया।',
    mapKey: 'मानचित्र संकेत',
    lineOfControl: 'नियंत्रण रेखा',
    road: 'श्रीनगर–लेह सड़क',
    fronts: 'अभियान के मोर्चे',
    schematic: 'सांकेतिक मानचित्र · पैमाने के अनुसार नहीं। भूगोल आधिकारिक कारगिल विजय दिवस अभियान-चित्र पर आधारित है।',
    followCampaign: 'नामों के साथ अभियान का अनुसरण करें',
    officialDiagram: 'आधिकारिक PIB अभियान-चित्र',
    operationVijay: 'ऑपरेशन विजय',
    selectedNames: 'चुने गए 24 नाम · 8 अध्याय',
    currentChapter: 'वर्तमान अध्याय',
    sectorLocator: 'क्षेत्र संकेतक',
    namesBroughtForward: 'सामने लाए गए नाम',
    exploreChapter: 'इस अध्याय को देखें',
    previousChapter: 'पिछला अध्याय',
    nextChapter: 'अगला अध्याय',
    supportingRemembrance: 'संबंधित स्मरण',
    returnToBattle: 'युद्ध अध्याय पर लौटें',
    supportingRemembrances: 'संबंधित स्मरण',
    chapterArchive: 'अध्याय अभिलेख',
    selectToEnlarge: '3 तस्वीरें · बड़ा देखने के लिए चुनें',
    viewOriginal: 'मूल और लाइसेंस देखें',
    closeDetails: 'अध्याय विवरण बंद करें',
    closePhoto: 'बड़ी तस्वीर बंद करें',
    previousPhoto: 'पिछली तस्वीर',
    nextPhoto: 'अगली तस्वीर',
    readMore: 'और पढ़ें',
    endingEyebrow: 'एक बड़ी स्मृति के बीच एक पथ',
    endingTitle: 'चौबीस नाम, अनगिनत नामों के बीच।',
    endingBody:
      'ये 24 चयनित कथाएँ सम्मान-रोल की पूरी सूची नहीं हैं और बलिदान की कोई श्रेणी नहीं बनातीं। वे ऑपरेशन विजय में प्राण न्योछावर करने वाले सभी लोगों की व्यापक स्मृति का हिस्सा हैं।',
    firstStudy: 'पहले स्मरण अध्ययन को देखें',
    warMemorial: 'कारगिल युद्ध स्मारक',
  },
};

export const sceneCopy: Record<NameWallLocale, Array<{ title: string; kicker: string; detail: string }>> = {
  en: [
    { title: 'The first patrol', kicker: 'Kaksar · May 1999', detail: 'A patrol from 4 JAT moved into the Kaksar heights as reports of intrusion emerged. These six names open the sequence together.' },
    { title: 'Operation Safed Sagar', kicker: 'The air campaign · May 1999', detail: 'The Indian Air Force entered the high-altitude campaign under Operation Safed Sagar. This chapter remembers a fighter pilot and the four members of a Mi-17 crew.' },
    { title: 'The Batalik battles', kicker: 'Batalik sector', detail: 'Batalik was a wide field of steep approaches and separated heights. Units advanced through terrain where altitude and exposure shaped every movement.' },
    { title: 'The road through Tololing', kicker: 'Dras sector · June 1999', detail: 'Tololing dominated the approach through Dras. Its early assaults and eventual capture became a pivotal chapter in the effort to recover the heights.' },
    { title: 'From Turtuk to Dras', kicker: 'Across the sectors', detail: 'Operation Vijay unfolded across distinct sectors rather than a single battlefield. These names connect the Turtuk heights with the continuing operations around Dras.' },
    { title: 'Knoll and Black Rock', kicker: 'Tololing complex · June 1999', detail: 'Beyond Tololing, the fighting continued across the Knoll and Black Rock features. The climbs were made at night, over rock and under observation from higher positions.' },
    { title: 'The Batalik heights', kicker: 'Point 4812 and Khalubar', detail: 'The advances at Point 4812 and Khalubar Ridge belong to the larger struggle for the Batalik heights. Two names are brought forward in this chapter.' },
    { title: 'The final heights', kicker: 'Pimple II and Point 4875 · July 1999', detail: 'Pimple II and Point 4875 mark the closing part of this sequence. These selected names remain part of the much larger remembrance of those lost during Operation Vijay.' },
  ],
  hi: [
    { title: 'पहली गश्त', kicker: 'काकसर · मई 1999', detail: 'घुसपैठ की खबरें आने पर 4 JAT की एक गश्ती टुकड़ी काकसर की ऊँचाइयों में पहुँची। ये छह नाम इस क्रम की शुरुआत एक साथ करते हैं।' },
    { title: 'ऑपरेशन सफेद सागर', kicker: 'हवाई अभियान · मई 1999', detail: 'भारतीय वायुसेना ऑपरेशन सफेद सागर के अंतर्गत ऊँचाई वाले अभियान में उतरी। यह अध्याय एक लड़ाकू पायलट और Mi-17 दल के चार सदस्यों को स्मरण करता है।' },
    { title: 'बटालिक की लड़ाइयाँ', kicker: 'बटालिक क्षेत्र', detail: 'बटालिक खड़ी चढ़ाइयों और अलग-अलग चोटियों का विस्तृत क्षेत्र था। ऊँचाई और खुले भूभाग ने हर कदम को प्रभावित किया।' },
    { title: 'तोलोलिंग की राह', kicker: 'द्रास क्षेत्र · जून 1999', detail: 'द्रास की ओर जाने वाले मार्ग पर तोलोलिंग का प्रभुत्व था। शुरुआती हमले और उसका अंततः कब्ज़ा ऊँचाइयाँ वापस लेने के प्रयास का निर्णायक अध्याय बने।' },
    { title: 'तुरतुक से द्रास तक', kicker: 'विभिन्न क्षेत्र', detail: 'ऑपरेशन विजय एक ही युद्धभूमि के बजाय अलग-अलग क्षेत्रों में आगे बढ़ा। ये नाम तुरतुक की ऊँचाइयों को द्रास के लगातार अभियानों से जोड़ते हैं।' },
    { title: 'नॉल और ब्लैक रॉक', kicker: 'तोलोलिंग परिसर · जून 1999', detail: 'तोलोलिंग के आगे नॉल और ब्लैक रॉक की चोटियों पर लड़ाई जारी रही। ऊँची चौकियों की निगरानी में रात के समय चट्टानों पर चढ़ाई की गई।' },
    { title: 'बटालिक की ऊँचाइयाँ', kicker: 'पॉइंट 4812 और खालूबार', detail: 'पॉइंट 4812 और खालूबार रिज की बढ़त बटालिक की ऊँचाइयों के लिए बड़े संघर्ष का हिस्सा थी। इस अध्याय में दो नाम सामने आते हैं।' },
    { title: 'अंतिम ऊँचाइयाँ', kicker: 'पिंपल II और पॉइंट 4875 · जुलाई 1999', detail: 'पिंपल II और पॉइंट 4875 इस क्रम के अंतिम चरण को चिह्नित करते हैं। ये नाम ऑपरेशन विजय में खोए सभी जीवन की बहुत बड़ी स्मृति का हिस्सा हैं।' },
  ],
};

export const storyCopy: Record<NameWallLocale, Record<'beginning' | 'ending', { eyebrow: string; title: string; paragraphs: string[]; facts: string[] }>> = {
  en: {
    beginning: { eyebrow: 'How the war began · May 1999', title: 'The heights had been occupied.', paragraphs: ['Intruders crossed the Line of Control and occupied commanding positions above the Kargil–Drass sector. From the ridgelines, they threatened the road connecting Kashmir and Ladakh.', 'Patrols sent into the high country revealed the scale of the intrusion. India launched Operation Vijay to recover the positions—an ascent fought at extreme altitude, across exposed rock and snow.'], facts: ['May 1999', 'Kargil–Drass sector', 'Operation Vijay'] },
    ending: { eyebrow: 'How it ended · 26 July 1999', title: 'The positions were recovered.', paragraphs: ['After more than two months of fighting, Indian forces recovered the occupied positions and the intruders were evicted or withdrew behind the Line of Control. Operation Vijay had achieved its objective.', 'The cost remains inseparable from the victory. Official accounts record 527 Indian soldiers killed. Every 26 July, Kargil Vijay Diwas remembers their courage and sacrifice.'], facts: ['26 July 1999', 'Positions restored', 'Kargil Vijay Diwas'] },
  },
  hi: {
    beginning: { eyebrow: 'युद्ध कैसे शुरू हुआ · मई 1999', title: 'ऊँचाइयों पर कब्ज़ा हो चुका था।', paragraphs: ['घुसपैठियों ने नियंत्रण रेखा पार कर कारगिल–द्रास क्षेत्र के ऊपर रणनीतिक चौकियों पर कब्ज़ा कर लिया था। इन पर्वत-शृंखलाओं से कश्मीर और लद्दाख को जोड़ने वाली सड़क खतरे में थी।', 'ऊँचे पहाड़ी क्षेत्र में भेजी गई गश्तों ने घुसपैठ का वास्तविक विस्तार सामने रखा। भारत ने चौकियाँ वापस लेने के लिए ऑपरेशन विजय शुरू किया—अत्यधिक ऊँचाई, खुली चट्टानों और बर्फ के बीच लड़ी गई चढ़ाई।'], facts: ['मई 1999', 'कारगिल–द्रास क्षेत्र', 'ऑपरेशन विजय'] },
    ending: { eyebrow: 'युद्ध का अंत · 26 जुलाई 1999', title: 'चौकियाँ वापस ले ली गईं।', paragraphs: ['दो महीने से अधिक की लड़ाई के बाद भारतीय सेनाओं ने कब्ज़ाई गई चौकियाँ वापस ले लीं और घुसपैठियों को पीछे हटना पड़ा। ऑपरेशन विजय ने अपना लक्ष्य पूरा किया।', 'इस विजय से इसकी कीमत अलग नहीं की जा सकती। आधिकारिक विवरणों में 527 भारतीय सैनिकों के शहीद होने का उल्लेख है। हर 26 जुलाई को कारगिल विजय दिवस उनके साहस और बलिदान को स्मरण करता है।'], facts: ['26 जुलाई 1999', 'चौकियाँ पुनः सुरक्षित', 'कारगिल विजय दिवस'] },
  },
};
