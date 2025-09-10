import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, GitBranch } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  published_at: string;
  prerelease: boolean;
  draft: boolean;
  html_url: string;
}

const fetchGitHubReleases = async (): Promise<GitHubRelease[]> => {
  const response = await fetch('https://api.github.com/repos/Digital-Democracy-Hub-Schweiz/e-collecting-pilot/releases');
  
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }
  
  const releases = await response.json();
  return releases.filter((release: GitHubRelease) => !release.draft);
};

export const VersionSwitcher = () => {
  const { t } = useTranslation('common');
  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const {
    data: releases,
    isLoading,
    error
  } = useQuery({
    queryKey: ['github-releases'],
    queryFn: fetchGitHubReleases,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const handleVersionSelect = (version: string, release?: GitHubRelease) => {
    setSelectedVersion(version);
    setIsOpen(false);
    console.log('Version selected:', version, release);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Set latest release as default when releases are loaded
  useEffect(() => {
    if (releases && releases.length > 0 && !selectedVersion) {
      const latestRelease = releases[0]; // GitHub returns releases sorted by date (newest first)
      setSelectedVersion(latestRelease.tag_name);
      console.log('Latest release selected:', latestRelease.tag_name);
    }
    if (error) {
      console.error('Error loading releases:', error);
    }
  }, [releases, error, selectedVersion]);

  const getCurrentVersionLabel = () => {
    if (!selectedVersion && isLoading) {
      return t('loading', { fallback: 'Loading...' });
    }
    if (!selectedVersion) {
      return t('version.noVersion', { fallback: 'No version' });
    }
    return selectedVersion;
  };

  if (error) {
    return (
      <div className="text-xs text-white/60">
        {t('version.error', { fallback: 'Version info unavailable' })}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 text-white hover:bg-white/10 hover:text-white text-xs h-8 px-3 rounded transition-colors disabled:opacity-50"
        disabled={isLoading}
      >
        <GitBranch className="w-3 h-3" />
        {getCurrentVersionLabel()}
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 bottom-full mb-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
          {releases && releases.length > 0 ? (
            releases.slice(0, 10).map((release) => (
              <div
                key={release.id}
                onClick={() => handleVersionSelect(release.tag_name, release)}
                className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 text-gray-900 ${selectedVersion === release.tag_name ? 'bg-gray-50' : ''}`}
              >
                <span className="text-sm text-gray-900">{release.tag_name}</span>
              </div>
            ))
          ) : (
            !isLoading && (
              <div className="px-4 py-2 text-sm text-gray-500">
                {t('version.noReleases', { fallback: 'No releases found' })}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};