// src/components/ai/DescriptionGenerator.jsx

import React, { useState } from 'react';
import aiService from '../../api/aiService';
import { Sparkles, RefreshCw, CheckCircle, Edit, FileText } from 'lucide-react';

const DescriptionGenerator = ({ providerId, onSave }) => {
  const [bio, setBio] = useState('');
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAccepted, setIsAccepted] = useState(false);

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
    if (onSave) onSave(generatedDescription);
  };

  const handleRegenerate = () => {
    setIsAccepted(false);
    setGeneratedDescription('');
    handleGenerate();
  };

  const handleEdit = () => {
    setIsAccepted(false);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-2">
        <FileText className="h-5 w-5" style={{ color: '#056db3' }} />
        <h3 className="text-xl font-bold text-gray-800">✍️ Profile Description Generator</h3>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Write a short bio about yourself. AI will turn it into a professional description that attracts clients.
      </p>

      <div className="space-y-3">
        <label htmlFor="provider-bio" className="block text-sm font-medium text-gray-700">
          Your Bio:
        </label>
        <textarea
          id="provider-bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Example: I'm a plumber in Nairobi with 5 years of experience. I specialize in pipe repairs and installations."
          rows={3}
          disabled={isLoading || isAccepted}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#056db3] focus:border-transparent disabled:bg-gray-100 transition-shadow"
        />

        <button
          onClick={handleGenerate}
          disabled={isLoading || isAccepted || !bio.trim()}
          className="w-full flex items-center justify-center gap-2 bg-[#056db3] hover:bg-[#045a94] disabled:bg-gray-300 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
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
    </div>
  );
};

export default DescriptionGenerator;