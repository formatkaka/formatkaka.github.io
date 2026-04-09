const MOCK_ACCOUNTS: Account[] = [
  {
    handle: '@CityCouncil',
    displayName: 'City Council',
    role: 'city_department',
    explanation: 'Official city council account for civic issues and governance.',
    score: 0.9,
  },
  {
    handle: '@MayorOffice',
    displayName: 'Office of the Mayor',
    role: 'gov_official',
    explanation: 'Mayor’s office, responsible for city-wide executive decisions.',
    score: 0.92,
  },
  {
    handle: '@CityTraffic',
    displayName: 'City Traffic Dept',
    role: 'city_department',
    explanation: 'Handles traffic, road maintenance, and transport complaints.',
    score: 0.88,
  },
  {
    handle: '@LocalNewsNow',
    displayName: 'Local News Now',
    role: 'media',
    explanation: 'Local news outlet covering city events and issues.',
    score: 0.8,
  },
  {
    handle: '@CivicWatch',
    displayName: 'Civic Watch',
    role: 'activist',
    explanation: 'Citizen group focused on accountability and public services.',
    score: 0.78,
  },
];

export class MockTwitterClient implements TwitterClient {
  async searchUsers(query: string, location?: string): Promise<Account[]> {
    const normalizedQuery = query.toLowerCase();
    const normalizedLocation = location?.toLowerCase() ?? '';

    if (!normalizedQuery && !normalizedLocation) {
      return MOCK_ACCOUNTS;
    }

    const scored = MOCK_ACCOUNTS.map((account) => {
      let scoreBoost = 0;

      if (normalizedQuery.includes('road') || normalizedQuery.includes('pothole')) {
        if (account.role === 'city_department') {
          scoreBoost += 0.05;
        }
      }

      if (normalizedQuery.includes('power') || normalizedQuery.includes('electricity')) {
        if (account.role === 'city_department') {
          scoreBoost += 0.03;
        }
      }

      if (normalizedLocation) {
        scoreBoost += 0.02;
      }

      return {
        ...account,
        score: Math.min(1, account.score + scoreBoost),
      };
    });

    return scored.sort((a, b) => b.score - a.score);
  }

  async searchHashtags(query: string): Promise<Hashtag[]> {
    const normalizedQuery = query.toLowerCase();

    const base: Hashtag[] = [
      {
        tag: '#MyCity',
        explanation: 'General city-related discussions and updates.',
        score: 0.7,
      },
      {
        tag: '#CivicIssues',
        explanation: 'Used for raising civic complaints and issues.',
        score: 0.8,
      },
    ];

    if (normalizedQuery.includes('pothole') || normalizedQuery.includes('road')) {
      base.push({
        tag: '#FixOurRoads',
        explanation: 'Popular tag for road maintenance and pothole complaints.',
        score: 0.85,
      });
    }

    if (normalizedQuery.includes('garbage') || normalizedQuery.includes('waste')) {
      base.push({
        tag: '#CleanCity',
        explanation: 'Often used for cleanliness and waste management complaints.',
        score: 0.82,
      });
    }

    return base.sort((a, b) => b.score - a.score);
  }
}

export type TwitterClient = {
  searchUsers: (query: string, location?: string) => Promise<Account[]>;
  searchHashtags: (query: string) => Promise<Hashtag[]>;
};

export type Account = {
  handle: string;
  displayName: string;
  role: 'gov_official' | 'city_department' | 'journalist' | 'media' | 'activist' | 'other';
  explanation: string;
  score: number;
};

export type Hashtag = {
  tag: string;
  explanation: string;
  score: number;
};

