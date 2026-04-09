import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/react/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/react/ui/card';
import { Input } from '@/components/react/ui/input';
import { Textarea } from '@/components/react/ui/textarea';
import type { Account, Hashtag } from '../../../tech/llm-projects/twitter-finder/twitterClient';

export function TwitterFinder() {
  const [form, setForm] = useState<FormState>({
    complaintText: '',
    city: '',
    country: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SearchResult | null>(null);

  const handleChange =
    (field: keyof FormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/twitter-finder/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          complaintText: form.complaintText,
          city: form.city,
          country: form.country || undefined,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || 'Failed to search Twitter accounts');
      }

      const data = (await response.json()) as SearchResult;
      setResult(data);
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyHandles = () => {
    if (!result) {
      return;
    }

    const handles = result.accounts.map((account) => account.handle).join(' ');
    void navigator.clipboard.writeText(handles);
  };

  const groupedAccounts = groupAccountsByRole(result?.accounts ?? []);

  return (
    <div className="space-y-8">
      <Card className="border border-slate-200/70 bg-white/70 shadow-sm backdrop-blur">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center justify-between gap-2">
            <span>Twitter Finder</span>
            <span className="text-xs font-normal text-slate-500">
              Find who to tag for your complaint
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Issue description</label>
              <Textarea
                value={form.complaintText}
                onChange={handleChange('complaintText')}
                placeholder="Potholes on the main road near the central market causing traffic and accidents..."
                className="min-h-[120px]"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">City</label>
                <Input
                  value={form.city}
                  onChange={handleChange('city')}
                  placeholder="Mumbai"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Country <span className="text-slate-400">(optional)</span>
                </label>
                <Input
                  value={form.country}
                  onChange={handleChange('country')}
                  placeholder="India"
                />
              </div>
            </div>
            {error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : (
              <p className="text-xs text-slate-500">
                We use a mock Twitter client for now, so results are illustrative. Later this can be
                wired to the real X API.
              </p>
            )}
            <div className="flex items-center justify-between gap-4">
              <Button type="submit" disabled={loading} className="min-w-[140px]">
                {loading ? 'Finding handles...' : 'Find handles to tag'}
              </Button>
              {result && result.accounts.length > 0 ? (
                <button
                  type="button"
                  onClick={handleCopyHandles}
                  className="text-xs font-medium text-slate-600 hover:text-slate-900 underline underline-offset-4"
                >
                  Copy all handles
                </button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {loading ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-slate-600"
          >
            Analyzing your complaint and searching for relevant accounts...
          </motion.div>
        ) : null}

        {result && result.accounts.length === 0 ? (
          <p className="text-sm text-slate-600">
            No accounts found yet. Try adding more detail to your complaint or specifying the city
            more clearly.
          </p>
        ) : null}

        {groupedAccounts.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-3"
          >
            {groupedAccounts.map((group) => (
              <section key={group.role} className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">
                    {group.label}
                  </h2>
                  <span className="text-xs text-slate-500">
                    {group.accounts.length} account{group.accounts.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  {group.accounts.map((account) => (
                    <Card
                      key={account.handle}
                      className="border-slate-200/80 bg-white/80 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <CardContent className="py-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-900">
                                {account.displayName}
                              </span>
                              <span className="text-xs text-slate-500">{account.handle}</span>
                            </div>
                            <p className="text-xs text-slate-600">{account.explanation}</p>
                          </div>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                            Score {(account.score * 100).toFixed(0)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            ))}
          </motion.div>
        ) : null}

        {result && result.hashtags.length > 0 ? (
          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">
              Suggested hashtags
            </h2>
            <div className="flex flex-wrap gap-2">
              {result.hashtags.map((hashtag) => (
                <span
                  key={hashtag.tag}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                >
                  <span>{hashtag.tag}</span>
                  <span className="text-[10px] text-slate-500">
                    {(hashtag.score * 100).toFixed(0)}
                  </span>
                </span>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function groupAccountsByRole(accounts: Account[]): RoleGroup[] {
  const byRole = new Map<RoleKey, Account[]>();

  accounts.forEach((account) => {
    const key: RoleKey = account.role || 'other';
    const existing = byRole.get(key) ?? [];
    byRole.set(key, [...existing, account]);
  });

  const order: RoleKey[] = [
    'gov_official',
    'city_department',
    'media',
    'journalist',
    'activist',
    'other',
  ];

  const labelByRole: Record<RoleKey, string> = {
    gov_official: 'Government officials',
    city_department: 'City departments',
    media: 'Media & local news',
    journalist: 'Journalists',
    activist: 'Citizen & activist groups',
    other: 'Others',
  };

  return order
    .map((role) => ({
      role,
      label: labelByRole[role],
      accounts: byRole.get(role) ?? [],
    }))
    .filter((group) => group.accounts.length > 0);
}

type RoleKey = Account['role'];

type FormState = {
  complaintText: string;
  city: string;
  country: string;
};

type SearchResult = {
  accounts: Account[];
  hashtags: Hashtag[];
};

type RoleGroup = {
  role: RoleKey;
  label: string;
  accounts: Account[];
};
