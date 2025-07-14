"use client";

import React, { useState, useEffect } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [hfToken, setHfToken] = useState('');
  const [mainModel, setMainModel] = useState('HuggingFaceTB/SmolLM3-3B');
  const [assistantModel, setAssistantModel] = useState('HuggingFaceTB/SmolLM3-3B');

  const modelOptions = [
    "HuggingFaceTB/SmolLM3-3B",
    "microsoft/DialoGPT-medium",
    "facebook/blenderbot-400M-distill",
    "distilbert/distilgpt2",
    "google/flan-t5-base"
  ];

  useEffect(() => {
    // Load settings from localStorage when the modal opens
    if (isOpen) {
      const storedToken = localStorage.getItem('hf_token');
      const storedMainModel = localStorage.getItem('main_model');
      const storedAssistantModel = localStorage.getItem('assistant_model');
      
      if (storedToken) setHfToken(storedToken);
      if (storedMainModel) setMainModel(storedMainModel);
      if (storedAssistantModel) setAssistantModel(storedAssistantModel);
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('hf_token', hfToken);
    localStorage.setItem('main_model', mainModel);
    localStorage.setItem('assistant_model', assistantModel);
    alert('Settings saved!');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg border border-green-700 shadow-lg w-11/12 md:w-1/2 lg:w-1/3">
        <h2 className="text-2xl font-bold text-green-400 mb-4">Settings</h2>
        <div className="mb-4">
          <label htmlFor="hfToken" className="block text-green-300 text-sm font-bold mb-2">
            Hugging Face Access Token:
          </label>
          <input
            type="password"
            id="hfToken"
            className="shadow appearance-none border border-green-600 rounded w-full py-2 px-3 text-green-200 leading-tight focus:outline-none focus:shadow-outline bg-gray-800"
            value={hfToken}
            onChange={(e) => setHfToken(e.target.value)}
            placeholder="hf_YOUR_ACCESS_TOKEN"
          />
          <p className="text-xs text-green-500 mt-1">
            Your token will be stored locally in your browser.
          </p>
        </div>

        <div className="mb-4">
          <label htmlFor="mainModel" className="block text-green-300 text-sm font-bold mb-2">
            Corrupt Terminal Model:
          </label>
          <select
            id="mainModel"
            value={mainModel}
            onChange={(e) => setMainModel(e.target.value)}
            className="shadow appearance-none border border-green-600 rounded w-full py-2 px-3 text-green-200 leading-tight focus:outline-none focus:shadow-outline bg-gray-800"
          >
            {modelOptions.map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="assistantModel" className="block text-green-300 text-sm font-bold mb-2">
            Assistant Log Model:
          </label>
          <select
            id="assistantModel"
            value={assistantModel}
            onChange={(e) => setAssistantModel(e.target.value)}
            className="shadow appearance-none border border-green-600 rounded w-full py-2 px-3 text-green-200 leading-tight focus:outline-none focus:shadow-outline bg-gray-800"
          >
            {modelOptions.map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end">
          <button
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mr-2 transition duration-300 ease-in-out"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-green-700 hover:bg-green-600 text-black font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
            onClick={handleSave}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
