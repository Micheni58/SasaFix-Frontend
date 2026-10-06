// src/components/ai/DescriptionGenerator.jsx

import React, { useState, useEffect } from 'react';
import aiService from '../../api/aiService';
import apiClient from '../../api/apiClient';
import { Sparkles, RefreshCw, CheckCircle, Edit, FileText, Loader2 } from 'lucide-react';

const DescriptionGenerator = ({ providerId, onSave }) => {
  const [bio, setBio] = useState('');
  const [currentBio, setCurrentBio] = useState('');
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);
  const [isAccepted, setIsAccepted] = useState(false);
  const [providerData, setProviderData] = useState(null);

  // Fetch provider data on mount
  useEffect(() => {
    const fetchProviderBio = async () => {
      if (!providerId) return;
      
      setIsFetching(true);
      try {
        // ✅ Use /providers (matches backend pattern)
        const response = await apiClient.get(`/providers/${providerId}`);
        const data = response.data;
        setProviderData(data);
        
        // Set the bio if it exists
        if (data.bio) {
          setBio(data.bio);
          setCurrentBio(data.bio);
        } else {
          setBio('');
          setCurrentBio('');
        }
      } catch (err) {
        console.warn('Failed to fetch provider bio:', err);
        setError('Could not load your current bio. You can still generate a new one.');
      } finally {
        setIsFetching(false);
      }
    };

    fetchProviderBio();
  }, [providerId]);

  const handleGenerate = async () => {
    if (!bio.trim()) {
      setError('Please enter some information about yourself first.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await aiService.generateDescription(providerId, bio);
      setGeneratedDescription(result.description);
    } catch (err) {
      setError(err.detail || 'Failed to generate description. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = () => {
    setIsAccepted(true);
    if (onSave) {
      onSave(generatedDescription);
    }
    
    // ✅ Use /providers (matches backend pattern)
    const saveBio = async () => {
      try {
        await apiClient.patch(`/providers/${providerId}`, {
          bio: generatedDescription
        });
      } catch (err) {
        console.warn('Could not save bio to backend:', err);
      }
    };
    saveBio();
  };

  const handleRegenerate = () => {
    setIsAccepted(false);
    setGeneratedDescription('');
    handleGenerate();
  };

  const handleEdit = () => {
    setIsAccepted(false);
    setBio(generatedDescription);
    setGeneratedDescription('');
  };

  const handleReset = () => {
    setBio(currentBio);
    setGeneratedDescription('');
    setIsAccepted(false);
    setError(null);
  };

  // Show loading state while fetching
  if (isFetching) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-5 w-5" style={{ color: '#056db3' }} />
          <h3 className="text-xl font-bold text-gray-800">✍️ Profile Description Generator</h3>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#056db3' }} />
          <span className="ml-3 text-gray-500">Loading your profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-2">
        <FileText className="h-5 w-5" style={{ color: '#056db3' }} />
        <h3 className="text-xl font-bold text-gray-800">✍️ Profile Description Generator</h3>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Write a short bio about yourself. AI will turn it into a professional description that attracts clients.
      </p>

      {/* Show current bio status */}
      {currentBio && !isAccepted && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs font-medium text-blue-700 flex items-center gap-1">
            <FileText className="h-3 w-3" />
            Current Bio:
          </p>
          <p className="text-sm text-gray-700 mt-1 line-clamp-2">
            {currentBio.length > 100 ? `${currentBio.substring(0, 100)}...` : currentBio}
          </p>
          {currentBio.length > 100 && (
            <button
              onClick={() => setBio(currentBio)}
              className="text-xs text-[#056db3] hover:underline mt-1"
            >
              Use current bio
            </button>
          )}
        </div>
      )}

      <div className="space-y-3">
        <label htmlFor="provider-bio" className="block text-sm font-medium text-gray-700">
          {currentBio ? 'Edit Your Bio:' : 'Your Bio:'}
        </label>
        <textarea
          id="provider-bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Example: I'm a plumber in Nairobi with 5 years of experience. I specialize in pipe repairs and installations."
          rows={4}
          disabled={isLoading || isAccepted}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#056db3] focus:border-transparent disabled:bg-gray-100 transition-shadow"
        />

        <div className="flex gap-3">
          <button
            onClick={handleGenerate}
            disabled={isLoading || isAccepted || !bio.trim()}
            className="flex-1 flex items-center justify-center gap-2 bg-[#056db3] hover:bg-[#045a94] disabled:bg-gray-300 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Description
              </>
            )}
          </button>

          {currentBio && !isAccepted && (
            <button
              onClick={handleReset}
              disabled={isLoading || isAccepted}
              className="px-4 py-2.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              title="Reset to current bio"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 text-red-700 p-3 rounded-lg border border-red-200">
          ❌ {error}
        </div>
      )}

      {generatedDescription && !isAccepted && (
        <div className="mt-6 border-t border-gray-200 pt-4">
          <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4" style={{ color: '#056db3' }} />
            AI Generated Description:
          </h4>
          <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-[#056db3] text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
            {generatedDescription}
          </div>
          <div className="flex gap-3 mt-3">
            <button
              onClick={handleAccept}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <CheckCircle className="h-4 w-4" />
              Accept & Save
            </button>
            <button
              onClick={handleRegenerate}
              className="flex-1 flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Regenerate
            </button>
          </div>
        </div>
      )}

      {isAccepted && (
        <div className="mt-6 border-t border-gray-200 pt-4">
          <div className="bg-green-50 text-green-700 p-2 rounded-lg inline-block mb-3 border border-green-200">
            <CheckCircle className="h-4 w-4 inline mr-1" />
            Description Saved!
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-green-500 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
            {generatedDescription}
          </div>
          <div className="flex gap-3 mt-3">
            <button
              onClick={handleEdit}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <Edit className="h-4 w-4" />
              Edit Manually
            </button>
            <button
              onClick={handleRegenerate}
              className="flex-1 flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Show character count */}
      <div className="mt-2 text-xs text-gray-400 flex justify-between">
        <span>
          {bio.length > 0 ? `${bio.length} characters` : 'No bio entered yet'}
        </span>
        {bio.length > 0 && bio.length < 20 && (
          <span className="text-amber-500">Consider adding more detail for better results</span>
        )}
      </div>
    </div>
  );
};

export default DescriptionGenerator;