import { useState, useEffect } from 'react';
import { Moon, Sun, Settings, Type, Save, Clipboard, FileDown } from 'lucide-react';
import { jsPDF } from 'jspdf';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

import '../App.css'

const FuturisticMarkdownPreviewer = () => {
  const [markdown, setMarkdown] = useState(() => localStorage.getItem('markdown') || '');
  const [darkMode, setDarkMode] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState('neon');
  const [showSaveOptions, setShowSaveOptions] = useState(false);

  useEffect(() => {
    localStorage.setItem('markdown', markdown);
  }, [markdown]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);
  const toggleSettings = () => setShowSettings((prev) => !prev);
  const adjustFontSize = (delta) => setFontSize((prev) => Math.min(Math.max(prev + delta, 12), 24));

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    setShowSettings(false);
  };

  const themeStyles = {
    neon: 'text-neon-blue',
    purple: 'text-purple-600',
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const saveAsFile = (fileType) => {
    let content = markdown;
    let fileExtension = 'md';
    let mimeType = 'text/markdown';

    if (fileType === 'html') {
      content = `<html><body>${markdown}</body></html>`;
      fileExtension = 'html';
      mimeType = 'text/html';
    } else if (fileType === 'txt') {
      fileExtension = 'txt';
      mimeType = 'text/plain';
    } else if (fileType === 'pdf') {
      const doc = new jsPDF();
      doc.text(content, 10, 10); // Adjust coordinates as needed
      doc.save(`document.${fileExtension}`);
      return; // Exit early to prevent further processing
    }

    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `markdown_preview.${fileExtension}`; // Using a simple filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} transition-colors duration-300`}>
      <div className="container mx-auto p-4">
        <header className={`flex justify-between items-center mb-4 p-2 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h1 className={`text-2xl font-bold ${themeStyles[theme]}`}>Futuristic Markdown Previewer</h1>
          <div className="flex space-x-4">
            <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-700 transition-colors duration-200">
              {darkMode ? <Sun className="text-yellow-400" /> : <Moon className="text-gray-600" />}
            </button>
            <button onClick={() => adjustFontSize(-2)} className="p-2 rounded-full hover:bg-gray-700 transition-colors duration-200">
              <Type className="text-sm" />
            </button>
            <button onClick={() => adjustFontSize(2)} className="p-2 rounded-full hover:bg-gray-700 transition-colors duration-200">
              <Type className="text-lg" />
            </button>
            <button onClick={toggleSettings} className="p-2 rounded-full hover:bg-gray-700 transition-colors duration-200">
              <Settings className={theme === 'neon' ? 'text-neon-green' : 'text-purple-400'} />
            </button>
          </div>
        </header>

        {showSettings && (
          <div className={`mb-4 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <h2 className="text-xl font-semibold mb-2">Theme Settings</h2>
            <div className="flex space-x-4">
              {['neon', 'purple'].map((t) => (
                <button
                  key={t}
                  onClick={() => handleThemeChange(t)}
                  className={`px-4 py-2 rounded ${theme === t ? (t === 'neon' ? 'bg-neon-blue' : 'bg-purple-600') + ' text-white' : 'bg-gray-200 text-gray-800'}`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <textarea
            className={`w-full md:w-1/2 h-96 p-4 rounded-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} shadow-lg focus:outline-none focus:ring-2 ${theme === 'neon' ? 'focus:ring-neon-blue' : 'focus:ring-purple-600'} transition-shadow duration-200`}
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            style={{ fontSize: `${fontSize}px` }} // Corrected this line
            placeholder="Enter your Markdown here..."
          />
          <div
            className={`w-full md:w-1/2 h-96 overflow-auto p-4 rounded-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} shadow-lg`}
            style={{ fontSize: `${fontSize}px` }} // Corrected this line
          >
            <ReactMarkdown
              components={{
                code({ inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={atomDark}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {markdown}
            </ReactMarkdown>
          </div>
        </div>

        <div className="mt-4 flex justify-end relative">
          <button
            onClick={() => setShowSaveOptions(!showSaveOptions)}
            className={`px-4 py-2 rounded-lg ${theme === 'neon' ? 'bg-neon-green hover:bg-neon-green-600' : 'bg-purple-600 hover:bg-purple-700'} text-white transition-colors duration-200 flex items-center`}
          >
            <Save className="mr-2" /> Save Options
          </button>
          {showSaveOptions && (
            <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} ring-1 mt-16 ring-black ring-opacity-5`}>
              <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                <button
                  onClick={copyToClipboard}
                  className={`block px-4 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} w-full text-left`}
                  role="menuitem"
                >
                  <Clipboard className="inline mr-2" size={16} /> Copy to Clipboard
                </button>
                <button
                  onClick={() => saveAsFile('md')}
                  className={`block px-4 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} w-full text-left`}
                  role="menuitem"
                >
                  <FileDown className="inline mr-2" size={16} /> Save as Markdown
                </button>
                <button
                  onClick={() => saveAsFile('html')}
                  className={`block px-4 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} w-full text-left`}
                  role="menuitem"
                >
                  <FileDown className="inline mr-2" size={16} /> Save as HTML
                </button>
                <button
                  onClick={() => saveAsFile('txt')}
                  className={`block px-4 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} w-full text-left`}
                  role="menuitem"
                >
                  <FileDown className="inline mr-2" size={16} /> Save as Text
                </button>
                <button
                  onClick={() => saveAsFile('pdf')}
                  className={`block px-4 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} w-full text-left`}
                  role="menuitem"
                >
                  <FileDown className="inline mr-2" size={16} /> Save as PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FuturisticMarkdownPreviewer;
