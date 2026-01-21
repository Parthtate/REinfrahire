'use client';

import { useState } from 'react';
import { Search, Loader2, Filter, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SearchResult {
  userId: string;
  similarity: number;
  firstName: string;
  lastName: string;
  email: string;
  coreField: string;
  totalExperience: number;
  location: string;
  position: string;
  resumeUrl: string;
}

export default function SemanticCandidateSearch() {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [currentKeyword, setCurrentKeyword] = useState('');
  const [filters, setFilters] = useState({
    coreField: '',
    minExperience: '',
    location: ''
  });
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const addKeyword = () => {
    const trimmed = currentKeyword.trim();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords([...keywords, trimmed]);
      setCurrentKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  const handleSearch = async () => {
    if (keywords.length === 0) {
      alert('Please add at least one keyword');
      return;
    }

    setIsSearching(true);

    try {
      const response = await fetch('/api/admin/search-candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: keywords.join(' '),
          filters: {
            coreField: filters.coreField || undefined,
            minExperience: filters.minExperience 
              ? parseInt(filters.minExperience) 
              : undefined,
            location: filters.location || undefined
          },
          useHybrid: true
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          {/* Search Input */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Type keyword: 'Computer Engineer', 'React', 'JavaScript'..."
                value={currentKeyword}
                onChange={(e) => setCurrentKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
              />
            </div>
            <Button onClick={addKeyword} variant="outline">
              Add
            </Button>
            <Button 
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              size="icon"
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button 
              onClick={handleSearch}
              disabled={isSearching || keywords.length === 0}
              className="min-w-32"
            >
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  AI Search
                </>
              )}
            </Button>
          </div>

          {/* Keywords */}
          {keywords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {keywords.map((kw, i) => (
                <Badge key={i} variant="secondary">
                  {kw}
                  <button
                    onClick={() => removeKeyword(kw)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <Select
                value={filters.coreField}
                onValueChange={(v) => setFilters({...filters, coreField: v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Engineering Field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Civil">Civil Engineering</SelectItem>
                  <SelectItem value="Electrical">Electrical Engineering</SelectItem>
                  <SelectItem value="Mechanical">Mechanical Engineering</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.minExperience}
                onValueChange={(v) => setFilters({...filters, minExperience: v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Min Experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Fresher</SelectItem>
                  <SelectItem value="12">1+ years</SelectItem>
                  <SelectItem value="36">3+ years</SelectItem>
                  <SelectItem value="60">5+ years</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Location (e.g., Pune)"
                value={filters.location}
                onChange={(e) => setFilters({...filters, location: e.target.value})}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">
            {results.length} Candidates Found
          </h3>
          <div className="grid gap-4">
            {results.map((r) => (
              <Card key={r.userId} className="p-6">
                <div className="flex justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h4 className="text-lg font-semibold">
                        {r.firstName} {r.lastName}
                      </h4>
                      <Badge className="bg-green-100 text-green-800">
                        {(r.similarity * 100).toFixed(0)}% Match
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>📧 {r.email}</span>
                      {r.position && <span>💼 {r.position}</span>}
                      {r.coreField && <span>🎯 {r.coreField}</span>}
                      {r.totalExperience > 0 && (
                        <span>⏱️ {Math.floor(r.totalExperience / 12)} yrs</span>
                      )}
                      {r.location && <span>📍 {r.location}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
                    {r.resumeUrl && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(r.resumeUrl, '_blank')}
                      >
                        Resume
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}