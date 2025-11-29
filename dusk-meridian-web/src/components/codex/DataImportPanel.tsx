import React, { useState } from 'react';
import { Upload, FileJson, FileText, Database, CheckCircle, AlertCircle } from 'lucide-react';
import {
  parseJSONFile,
  readMarkdownFile,
  importLoreFromJSON,
  importLoreFromMarkdown,
  populateSampleLore
} from '@/utils/codexDataImporter';

export const DataImportPanel: React.FC = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleJSONImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setMessage(null);

    try {
      const data = await parseJSONFile(file);
      await importLoreFromJSON(data);
      setMessage({
        type: 'success',
        text: `Successfully imported ${data.length} lore entries from ${file.name}`
      });
    } catch (error) {
      console.error('Import failed:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to import JSON file'
      });
    } finally {
      setIsImporting(false);
      event.target.value = ''; // Reset input
    }
  };

  const handleMarkdownImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setMessage(null);

    try {
      const content = await readMarkdownFile(file);
      const fileName = file.name.replace('.md', '');
      const id = fileName.toLowerCase().replace(/\s+/g, '-');

      // Extract title from first heading or use filename
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : fileName;

      await importLoreFromMarkdown(id, title, 'Lore', content);

      setMessage({
        type: 'success',
        text: `Successfully imported "${title}" from ${file.name}`
      });
    } catch (error) {
      console.error('Import failed:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to import Markdown file'
      });
    } finally {
      setIsImporting(false);
      event.target.value = ''; // Reset input
    }
  };

  const handlePopulateSample = async () => {
    setIsImporting(true);
    setMessage(null);

    try {
      await populateSampleLore();
      setMessage({
        type: 'success',
        text: 'Successfully populated sample Dusk Meridian lore'
      });
    } catch (error) {
      console.error('Import failed:', error);
      setMessage({
        type: 'error',
        text: 'Failed to populate sample lore'
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-3 mb-2">
          <Upload className="w-6 h-6 text-green-400" />
          <h2 className="text-2xl font-bold">Data Import</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Import Codex data from JSON or Markdown files to populate the local cache
        </p>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`p-4 rounded-lg flex items-center space-x-3 ${
            message.type === 'success'
              ? 'bg-green-600/20 border border-green-600/30 text-green-400'
              : 'bg-red-600/20 border border-red-600/30 text-red-400'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <p>{message.text}</p>
        </div>
      )}

      {/* Import Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* JSON Import */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center space-x-3 mb-4">
            <FileJson className="w-6 h-6 text-blue-400" />
            <h3 className="text-lg font-semibold">Import from JSON</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Import lore entries from a JSON file. Expected format: array of objects with id, title,
            category, content, and summary fields.
          </p>
          <label className="block">
            <input
              type="file"
              accept=".json"
              onChange={handleJSONImport}
              disabled={isImporting}
              className="hidden"
            />
            <div className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg cursor-pointer text-center transition-colors">
              {isImporting ? 'Importing...' : 'Choose JSON File'}
            </div>
          </label>
        </div>

        {/* Markdown Import */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="w-6 h-6 text-purple-400" />
            <h3 className="text-lg font-semibold">Import from Markdown</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Import a single lore entry from a Markdown file. The first heading will be used as the
            title.
          </p>
          <label className="block">
            <input
              type="file"
              accept=".md,.markdown"
              onChange={handleMarkdownImport}
              disabled={isImporting}
              className="hidden"
            />
            <div className="px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg cursor-pointer text-center transition-colors">
              {isImporting ? 'Importing...' : 'Choose Markdown File'}
            </div>
          </label>
        </div>
      </div>

      {/* Sample Data */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <div className="flex items-center space-x-3 mb-4">
          <Database className="w-6 h-6 text-green-400" />
          <h3 className="text-lg font-semibold">Populate Sample Lore</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Populate the Codex with sample Dusk Meridian lore entries for testing and demonstration purposes.
        </p>
        <button
          onClick={handlePopulateSample}
          disabled={isImporting}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
        >
          {isImporting ? 'Importing...' : 'Populate Sample Lore'}
        </button>
      </div>

      {/* Format Guide */}
      <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3 text-blue-400">JSON Format Guide</h3>
        <pre className="bg-background p-4 rounded overflow-x-auto text-sm">
{`[
  {
    "id": "unique-entry-id",
    "title": "Entry Title",
    "category": "World",
    "subcategory": "Geography",
    "content": "Full markdown content...",
    "summary": "Brief summary...",
    "tags": ["tag1", "tag2"]
  }
]`}
        </pre>
      </div>
    </div>
  );
};
