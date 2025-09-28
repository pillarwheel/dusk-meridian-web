import React, { useState, useEffect } from 'react';
import {
  Zap,
  BookOpen,
  Target,
  ToggleLeft,
  ToggleRight,
  Search,
  Filter,
  ChevronDown,
  X,
  Plus,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/utils/cn';
import * as CharacterCreationTypes from '@/api/types/characterCreation';
import { SkillTemplateCard } from '../utility/SkillTemplateCard';
import { LoadingSpinner } from '../utility/LoadingSpinner';
import { characterCreationApi, characterCreationUtils } from '@/api/endpoints/characterCreation';

interface SkillConfigurationStepProps {
  mode: CharacterCreationTypes.BuildType;
  selectedTemplate?: CharacterCreationTypes.SkillTemplate;
  customSkillIds: string[];
  nftBonuses?: CharacterCreationTypes.NFTBonuses;
  onModeChange: (mode: CharacterCreationTypes.BuildType) => void;
  onTemplateSelect: (template: CharacterCreationTypes.SkillTemplate) => void;
  onCustomSkillsChange: (skillIds: string[]) => void;
  onValidationChange: (isValid: boolean, errors: string[]) => void;
}

interface SkillCardProps {
  skill: CharacterCreationTypes.Skill;
  isSelected: boolean;
  isDisabled: boolean;
  onToggle: (skillId: string) => void;
}

const SkillCard: React.FC<SkillCardProps> = ({ skill, isSelected, isDisabled, onToggle }) => {
  const getSkillTypeColor = () => {
    switch (skill.skillType) {
      case 'active': return 'text-red-400 bg-red-400/20 border-red-400/30';
      case 'passive': return 'text-blue-400 bg-blue-400/20 border-blue-400/30';
      case 'toggle': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
      default: return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
    }
  };

  const getCategoryColor = () => {
    switch (skill.category.toLowerCase()) {
      case 'combat': return 'text-red-400';
      case 'magic': return 'text-purple-400';
      case 'defense': return 'text-blue-400';
      case 'utility': return 'text-green-400';
      case 'social': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div
      onClick={() => !isDisabled && onToggle(skill.id)}
      className={cn(
        'border rounded-lg p-4 transition-all cursor-pointer',
        isSelected ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border',
        isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={cn('p-2 rounded-lg border', getSkillTypeColor())}>
            <Zap className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm">{skill.name}</h4>
            <div className="flex items-center space-x-2 mt-1">
              <span className={cn('text-xs', getCategoryColor())}>
                {skill.category}
              </span>
              <span className={cn('text-xs px-2 py-1 rounded-full border', getSkillTypeColor())}>
                {skill.skillType}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {skill.prerequisites.length > 0 && (
            <AlertTriangle className="w-4 h-4 text-yellow-400" title="Has Prerequisites" />
          )}
          {isSelected && <CheckCircle2 className="w-5 h-5 text-primary" />}
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
        {skill.description}
      </p>

      {/* Prerequisites */}
      {skill.prerequisites.length > 0 && (
        <div className="mb-3">
          <h5 className="text-xs font-medium text-muted-foreground mb-1">Prerequisites</h5>
          <div className="text-xs text-yellow-400">
            Requires {skill.prerequisites.length} skill{skill.prerequisites.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Effects Preview */}
      {skill.effects.length > 0 && (
        <div>
          <h5 className="text-xs font-medium text-muted-foreground mb-1">Effects</h5>
          <div className="space-y-1">
            {skill.effects.slice(0, 2).map((effect, index) => (
              <div key={index} className="text-xs text-foreground">
                {effect.description}
              </div>
            ))}
            {skill.effects.length > 2 && (
              <div className="text-xs text-muted-foreground">
                +{skill.effects.length - 2} more effects
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const SkillConfigurationStep: React.FC<SkillConfigurationStepProps> = ({
  mode,
  selectedTemplate,
  customSkillIds,
  nftBonuses,
  onModeChange,
  onTemplateSelect,
  onCustomSkillsChange,
  onValidationChange
}) => {
  const [templates, setTemplates] = useState<CharacterCreationTypes.SkillTemplate[]>([]);
  const [allSkills, setAllSkills] = useState<CharacterCreationTypes.Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Custom mode filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    validateStep();
  }, [mode, selectedTemplate, customSkillIds, allSkills]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [templatesData, skillsData] = await Promise.all([
        characterCreationApi.getSkillTemplates(),
        characterCreationApi.getAllSkills()
      ]);

      const activeTemplates = templatesData.filter(t => t.isActive);
      const activeSkills = skillsData.filter(s => s.isActive);

      setTemplates(activeTemplates);
      setAllSkills(activeSkills);

      console.log('⚡ Loaded skill templates:', activeTemplates.length);
      console.log('🎯 Loaded skills:', activeSkills.length);
    } catch (err) {
      console.error('Failed to load skills data:', err);
      setError('Failed to load skills and templates');
    } finally {
      setIsLoading(false);
    }
  };

  const validateStep = () => {
    const errors: string[] = [];
    const maxSkills = characterCreationUtils.calculateMaxSkills(nftBonuses);

    if (mode === 'template') {
      if (!selectedTemplate) {
        errors.push('Please select a skill template');
      }
    } else {
      // Custom mode validation
      const validation = characterCreationUtils.validateSkillSelection(
        customSkillIds,
        allSkills,
        maxSkills
      );

      if (!validation.valid) {
        errors.push(...validation.errors);
      }
    }

    onValidationChange(errors.length === 0, errors);
  };

  const getFilteredTemplates = () => {
    let filtered = templates;

    // Filter by NFT tier access
    if (nftBonuses) {
      const highestTier = nftBonuses.tier;
      filtered = filtered.filter(template =>
        !template.requiredNFTTier || template.requiredNFTTier <= highestTier
      );
    }

    return filtered.sort((a, b) => a.sortOrder - b.sortOrder);
  };

  const getTemplatesByCategory = () => {
    const filtered = getFilteredTemplates();
    const grouped = filtered.reduce((acc, template) => {
      if (!acc[template.category]) {
        acc[template.category] = [];
      }
      acc[template.category].push(template);
      return acc;
    }, {} as Record<string, CharacterCreationTypes.SkillTemplate[]>);

    return Object.entries(grouped).map(([category, templateList]) => ({
      category,
      templates: templateList
    }));
  };

  const getFilteredSkills = () => {
    let filtered = allSkills;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(skill => skill.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(skill =>
        skill.name.toLowerCase().includes(term) ||
        skill.description.toLowerCase().includes(term) ||
        skill.category.toLowerCase().includes(term)
      );
    }

    return filtered;
  };

  const getAvailableCategories = () => {
    const categories = [...new Set(allSkills.map(skill => skill.category))];
    return categories.sort();
  };

  const handleCustomSkillToggle = (skillId: string) => {
    const maxSkills = characterCreationUtils.calculateMaxSkills(nftBonuses);
    const isSelected = customSkillIds.includes(skillId);

    if (isSelected) {
      // Remove skill
      onCustomSkillsChange(customSkillIds.filter(id => id !== skillId));
    } else {
      // Add skill if under limit
      if (customSkillIds.length < maxSkills) {
        onCustomSkillsChange([...customSkillIds, skillId]);
      }
    }
  };

  const isSkillDisabled = (skill: CharacterCreationTypes.Skill) => {
    const maxSkills = characterCreationUtils.calculateMaxSkills(nftBonuses);
    const isSelected = customSkillIds.includes(skill.id);
    const isAtLimit = customSkillIds.length >= maxSkills;

    // Check prerequisites
    const hasPrerequisites = skill.prerequisites.every(prereq =>
      customSkillIds.includes(prereq)
    );

    return (!isSelected && isAtLimit) || (skill.prerequisites.length > 0 && !hasPrerequisites);
  };

  const getSelectedSkillsFromTemplate = () => {
    if (!selectedTemplate) return [];
    return allSkills.filter(skill => selectedTemplate.preselectedSkillIds.includes(skill.id));
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <LoadingSpinner
          size="lg"
          message="Loading Skills & Templates"
          submessage="Fetching available skills and templates..."
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-600/20 border border-red-600/30 rounded-lg p-6 max-w-md mx-auto">
          <Zap className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Skills</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg hover:bg-red-600/30 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const maxSkills = characterCreationUtils.calculateMaxSkills(nftBonuses);
  const currentSkillCount = mode === 'template'
    ? selectedTemplate?.preselectedSkillIds.length || 0
    : customSkillIds.length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Skills & Abilities</h2>
        <p className="text-muted-foreground">
          Choose your character's skills using templates or custom selection
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Selection Mode</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            onClick={() => onModeChange('template')}
            className={cn(
              'border rounded-lg p-4 cursor-pointer transition-all',
              mode === 'template' ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
            )}
          >
            <div className="flex items-center space-x-3 mb-3">
              <BookOpen className={cn('w-6 h-6', mode === 'template' ? 'text-primary' : 'text-muted-foreground')} />
              <h4 className="font-semibold">Template Selection</h4>
              {mode === 'template' ? (
                <ToggleRight className="w-6 h-6 text-primary ml-auto" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-muted-foreground ml-auto" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Choose from pre-made skill combinations designed for specific playstyles
            </p>
          </div>

          <div
            onClick={() => onModeChange('custom')}
            className={cn(
              'border rounded-lg p-4 cursor-pointer transition-all',
              mode === 'custom' ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
            )}
          >
            <div className="flex items-center space-x-3 mb-3">
              <Target className={cn('w-6 h-6', mode === 'custom' ? 'text-primary' : 'text-muted-foreground')} />
              <h4 className="font-semibold">Custom Selection</h4>
              {mode === 'custom' ? (
                <ToggleRight className="w-6 h-6 text-primary ml-auto" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-muted-foreground ml-auto" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Hand-pick individual skills to create your own unique build
            </p>
          </div>
        </div>

        {/* Skill Limits */}
        <div className="mt-6 bg-secondary/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Skill Points</span>
            <span className="font-medium">
              {currentSkillCount} / {maxSkills}
              {nftBonuses?.skillPointBonus && (
                <span className="text-green-400 ml-2">
                  (+{nftBonuses.skillPointBonus} NFT Bonus)
                </span>
              )}
            </span>
          </div>
          <div className="w-full bg-border rounded-full h-2 mt-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${(currentSkillCount / maxSkills) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Template Mode */}
      {mode === 'template' && (
        <div className="space-y-6">
          {/* Selected Template */}
          {selectedTemplate && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Selected Template</h3>
                <button
                  onClick={() => onTemplateSelect(undefined as any)}
                  className="px-3 py-2 text-sm bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg hover:bg-red-600/30 transition-colors flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Change</span>
                </button>
              </div>
              <SkillTemplateCard
                template={selectedTemplate}
                isSelected={true}
                allSkills={allSkills}
                className="bg-background"
              />

              {/* Template Skills Preview */}
              <div className="mt-6">
                <h4 className="font-medium mb-3">Included Skills ({getSelectedSkillsFromTemplate().length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {getSelectedSkillsFromTemplate().map(skill => (
                    <div key={skill.id} className="bg-secondary/50 rounded-lg p-3">
                      <h5 className="font-medium text-sm">{skill.name}</h5>
                      <p className="text-xs text-muted-foreground line-clamp-2">{skill.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Template Categories */}
          {getTemplatesByCategory().map(({ category, templates: categoryTemplates }) => (
            <div key={category} className="space-y-4">
              <h3 className="text-xl font-semibold">{category} Templates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryTemplates.map(template => (
                  <SkillTemplateCard
                    key={template.templateId}
                    template={template}
                    isSelected={selectedTemplate?.templateId === template.templateId}
                    isLocked={nftBonuses && template.requiredNFTTier && template.requiredNFTTier > nftBonuses.tier}
                    onSelect={onTemplateSelect}
                    allSkills={allSkills}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Custom Mode */}
      {mode === 'custom' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search skills by name, description, or category..."
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-2 bg-secondary border border-border rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span>{selectedCategory === 'all' ? 'All Categories' : selectedCategory}</span>
                  <ChevronDown className={cn('w-4 h-4 transition-transform', showFilters && 'rotate-180')} />
                </button>

                {showFilters && (
                  <div className="absolute top-full left-0 mt-2 bg-card border border-border rounded-lg shadow-lg min-w-48 z-10">
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setSelectedCategory('all');
                          setShowFilters(false);
                        }}
                        className={cn(
                          'w-full text-left px-3 py-2 rounded-lg transition-colors',
                          selectedCategory === 'all' ? 'bg-primary/20 text-primary' : 'hover:bg-secondary'
                        )}
                      >
                        All Categories
                      </button>

                      {getAvailableCategories().map(category => (
                        <button
                          key={category}
                          onClick={() => {
                            setSelectedCategory(category);
                            setShowFilters(false);
                          }}
                          className={cn(
                            'w-full text-left px-3 py-2 rounded-lg transition-colors',
                            selectedCategory === category ? 'bg-primary/20 text-primary' : 'hover:bg-secondary'
                          )}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Selected Skills */}
          {customSkillIds.length > 0 && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Selected Skills ({customSkillIds.length})</h3>
                <button
                  onClick={() => onCustomSkillsChange([])}
                  className="px-3 py-2 text-sm bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg hover:bg-red-600/30 transition-colors"
                >
                  Clear All
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {allSkills
                  .filter(skill => customSkillIds.includes(skill.id))
                  .map(skill => (
                    <div key={skill.id} className="bg-background border border-primary/20 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-sm">{skill.name}</h5>
                        <button
                          onClick={() => handleCustomSkillToggle(skill.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">{skill.category}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Available Skills */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Available Skills</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFilteredSkills().map(skill => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  isSelected={customSkillIds.includes(skill.id)}
                  isDisabled={isSkillDisabled(skill)}
                  onToggle={handleCustomSkillToggle}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};