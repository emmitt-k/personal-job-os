import { useState, useEffect } from 'react';
import { Search, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

export function LeadSearch() {
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [keywords, setKeywords] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    // Generate X-Ray search query
    const parts = ['site:linkedin.com/in/'];
    if (role) parts.push(`"${role}"`);
    if (company) parts.push(`"${company}"`);
    if (location) parts.push(`"${location}"`);
    if (keywords) parts.push(keywords);
    
    setQuery(parts.join(' '));
  }, [role, company, location, keywords]);

  const handleSearch = () => {
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(query);
  };

  return (
    <section className="w-full lg:w-80 shrink-0 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 bg-blue-100 text-blue-700 rounded-md">
          <Search className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Lead Search</h2>
          <p className="text-sm text-zinc-500">Google X-Ray Search</p>
        </div>
      </div>

      <Card className="bg-white border-zinc-200 shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-zinc-700">Role / Job Title</Label>
              <Input 
                type="text" 
                placeholder="e.g. Recruiter"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-zinc-700">Company</Label>
              <Input 
                type="text" 
                placeholder="e.g. Google"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-zinc-700">Location</Label>
              <Input 
                type="text" 
                placeholder="e.g. San Francisco"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-zinc-700">Keywords (Optional)</Label>
              <Input 
                type="text" 
                placeholder="e.g. Tech, Hiring"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>

          <div className="pt-2">
            <div className="bg-zinc-50 rounded-md border border-zinc-200 p-3">
              <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-2 block">
                Generated Query
              </label>
              <div className="flex flex-col gap-2">
                <code className="text-sm text-zinc-800 break-all bg-white px-3 py-2 rounded border border-zinc-100 font-mono">
                  {query || 'site:linkedin.com/in/'}
                </code>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1 h-9"
                    onClick={copyToClipboard}
                  >
                    Copy
                  </Button>
                  <Button 
                    className="flex-[2] h-9 gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleSearch}
                  >
                    Search
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
