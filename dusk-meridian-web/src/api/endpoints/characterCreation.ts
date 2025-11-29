import { apiClient } from '../client';
import * as CharacterCreationTypes from '../types/characterCreation';

export const characterCreationApi = {
  // NFT Validation
  async validateNFTs(walletAddress: string): Promise<CharacterCreationTypes.NFTValidationResponse> {
    const response = await apiClient.get<CharacterCreationTypes.NFTValidationResponse>(
      `/nft/validate-nfts?walletAddress=${walletAddress}`
    );
    // apiClient.get returns response.data from axios, which is the actual data
    // Backend returns data directly, not wrapped in { data: ... }
    return response as any as CharacterCreationTypes.NFTValidationResponse;
  },

  async getNFTBonuses(walletAddress: string): Promise<CharacterCreationTypes.NFTBonuses> {
    const response = await apiClient.get<CharacterCreationTypes.NFTBonuses>(
      `/nft/bonuses?walletAddress=${walletAddress}`
    );
    // apiClient.get returns response.data from axios, which is the actual data
    // Backend returns data directly, not wrapped in { data: ... }
    return response as any as CharacterCreationTypes.NFTBonuses;
  },

  // Character Creation Configuration
  async getCreationConfig(walletAddress: string): Promise<CharacterCreationTypes.CharacterCreationConfig> {
    const response = await apiClient.get<CharacterCreationTypes.CharacterCreationConfig>(
      `/character/creation-config?walletAddress=${walletAddress}`
    );
    return response as any as CharacterCreationTypes.CharacterCreationConfig;
  },

  // Geographical Traits
  async getGeographicalTraits(): Promise<CharacterCreationTypes.GeographicalTrait[]> {
    const response = await apiClient.get<CharacterCreationTypes.GeographicalTrait[]>('/geographicaltraits');
    return response as any as CharacterCreationTypes.GeographicalTrait[];
  },

  async getGeographicalTraitsByRegion(regionName: string): Promise<CharacterCreationTypes.GeographicalTrait[]> {
    const response = await apiClient.get<CharacterCreationTypes.GeographicalTrait[]>(
      `/geographicaltraits/region/${regionName}`
    );
    return response as any as CharacterCreationTypes.GeographicalTrait[];
  },

  // Skill Templates
  async getSkillTemplates(requiredNFTTier?: number): Promise<CharacterCreationTypes.SkillTemplate[]> {
    const params = requiredNFTTier ? `?requiredNFTTier=${requiredNFTTier}` : '';
    const response = await apiClient.get<CharacterCreationTypes.SkillTemplate[]>(`/skilltemplates${params}`);
    return response as any as CharacterCreationTypes.SkillTemplate[];
  },

  async getSkillTemplatesByCategory(category: string): Promise<CharacterCreationTypes.SkillTemplate[]> {
    const response = await apiClient.get<CharacterCreationTypes.SkillTemplate[]>(
      `/skilltemplates/category/${category}`
    );
    return response as any as CharacterCreationTypes.SkillTemplate[];
  },

  // Character Validation
  async validateCharacter(
    request: CharacterCreationTypes.CharacterValidationRequest
  ): Promise<CharacterCreationTypes.CharacterValidationResponse> {
    const response = await apiClient.post<CharacterCreationTypes.CharacterValidationResponse>(
      '/character/validate',
      request
    );
    return response as any as CharacterCreationTypes.CharacterValidationResponse;
  },

  // Character Creation (Production - Requires Auth)
  async createCharacter(
    request: CharacterCreationTypes.CharacterCreationRequest
  ): Promise<CharacterCreationTypes.CharacterCreationResponse> {
    const response = await apiClient.post<CharacterCreationTypes.CharacterCreationResponse>(
      '/character/create',
      request
    );
    return response as any as CharacterCreationTypes.CharacterCreationResponse;
  },

  // Smart Character Creation - Uses dev or prod endpoint based on environment
  async createCharacterSmart(
    characterData: CharacterCreationTypes.CharacterCreationData
  ): Promise<CharacterCreationTypes.CharacterCreationResponse> {
    const useDevEndpoint = import.meta.env.VITE_USE_DEV_CHARACTER_CREATION === 'true';

    if (useDevEndpoint) {
      console.log('[CharacterCreation API] Using development endpoint (no auth)');
      return this.createCharacterDev(characterData);
    } else {
      console.log('[CharacterCreation API] Using production endpoint (auth required)');
      // Convert CharacterCreationData to CharacterCreationRequest format
      const request: CharacterCreationTypes.CharacterCreationRequest = {
        name: characterData.basicInfo.name,
        raceId: characterData.basicInfo.race?.id || 1,
        classId: characterData.basicInfo.characterClass?.id || 1,
        geographicalTraitId: characterData.geographicalTrait?.id,
        skillTemplateId: characterData.skillConfiguration.templateId,
        customSkillIds: characterData.skillConfiguration.selectedSkills,
        attributeDistribution: characterData.attributes,
        walletAddress: characterData.walletAddress,
        selectedNFTs: characterData.selectedNFTs,
        appearance: {
          modelType: 'Standard',
          customizationData: {}
        }
      };
      return this.createCharacter(request);
    }
  },

  // Development Character Creation (No Auth Required)
  async createCharacterDev(
    characterData: CharacterCreationTypes.CharacterCreationData
  ): Promise<CharacterCreationTypes.CharacterCreationResponse> {
    // Transform frontend data structure to backend API format
    // Matches CreateCharacterDevRequest model from backend
    const request = {
      characterName: characterData.basicInfo.name,
      walletAddress: characterData.walletAddress || '0x0000000000000000000000000000000000000DEV',
      passportId: null,
      // NFT Tiers - explicitly include all 4 tiers (even if null)
      selectedTier1NFT: characterData.selectedNFTs.tier1 || 'dev-tier1',
      selectedTier2NFT: characterData.selectedNFTs.tier2 || 'dev-tier2',
      selectedTier3NFT: characterData.selectedNFTs.tier3 || null,
      selectedTier4NFT: characterData.selectedNFTs.tier4 || null,
      // Geographical trait - backend will auto-select "mountain-dweller" if null
      selectedGeographicalTraitId: characterData.geographicalTrait?.id || null,
      // Build configuration - enum: 0 = Template, 1 = Custom
      buildType: characterData.skillConfiguration.useTemplate ? 0 : 1,
      selectedTemplateId: characterData.skillConfiguration.templateId || null,
      selectedSkillIds: characterData.skillConfiguration.selectedSkills || [],
      // Character basics
      className: characterData.basicInfo.characterClass?.name || 'Adventurer',
      // Appearance customization
      appearance: {
        modelType: 'Standard',
        customizationData: {}
      }
      // NOTE: raceId and attributeDistribution are NOT in backend CreateCharacterDevRequest model
      // They are handled by the backend based on className and defaults
    };

    console.log('[CharacterCreation API] Sending dev character creation request:', request);

    const response = await apiClient.post<CharacterCreationTypes.CharacterCreationResponse>(
      '/character/create-dev',
      request
    );
    return response as any as CharacterCreationTypes.CharacterCreationResponse;
  },

  // Character Name Availability
  async checkNameAvailability(name: string): Promise<{ available: boolean; suggestions?: string[] }> {
    const response = await apiClient.get<{ available: boolean; suggestions?: string[] }>(
      `/character/check-name?name=${encodeURIComponent(name)}`
    );
    return response as any as { available: boolean; suggestions?: string[] };
  },

  // Helper Methods
  async getAvailableRaces(): Promise<CharacterCreationTypes.Race[]> {
    const response = await apiClient.get<CharacterCreationTypes.Race[]>('/character/races');
    return response as any as CharacterCreationTypes.Race[];
  },

  async getAvailableClasses(): Promise<CharacterCreationTypes.CharacterClass[]> {
    const response = await apiClient.get<CharacterCreationTypes.CharacterClass[]>('/character/classes');
    return response as any as CharacterCreationTypes.CharacterClass[];
  },

  async getAllSkills(): Promise<CharacterCreationTypes.Skill[]> {
    const response = await apiClient.get<CharacterCreationTypes.Skill[]>('/character/skills');
    return response as any as CharacterCreationTypes.Skill[];
  },

  // Character Slots Information
  async getCharacterSlots(walletAddress: string): Promise<CharacterCreationTypes.CharacterSlots> {
    const response = await apiClient.get<CharacterCreationTypes.CharacterSlots>(
      `/character/slots?walletAddress=${walletAddress}`
    );
    return response as any as CharacterCreationTypes.CharacterSlots;
  },
};

// Utility functions for character creation
export const characterCreationUtils = {
  // Validate character name format
  validateCharacterName(name: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (name.length < CharacterCreationTypes.CHARACTER_NAME_MIN_LENGTH) {
      errors.push(`Name must be at least ${CharacterCreationTypes.CHARACTER_NAME_MIN_LENGTH} characters long`);
    }

    if (name.length > CharacterCreationTypes.CHARACTER_NAME_MAX_LENGTH) {
      errors.push(`Name must be no more than ${CharacterCreationTypes.CHARACTER_NAME_MAX_LENGTH} characters long`);
    }

    if (!/^[a-zA-Z0-9\s\-]+$/.test(name)) {
      errors.push('Name can only contain letters, numbers, spaces, and hyphens');
    }

    if (/^\s|\s$/.test(name)) {
      errors.push('Name cannot start or end with spaces');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  // Calculate total attribute points used
  calculateUsedAttributePoints(attributes: CharacterCreationTypes.AttributeDistribution): number {
    return Object.values(attributes).reduce((sum, value) => sum + value, 0);
  },

  // Validate attribute distribution
  validateAttributeDistribution(
    attributes: CharacterCreationTypes.AttributeDistribution,
    totalPoints: number
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const usedPoints = this.calculateUsedAttributePoints(attributes);

    if (usedPoints !== totalPoints) {
      errors.push(`You must use exactly ${totalPoints} attribute points (currently using ${usedPoints})`);
    }

    Object.entries(attributes).forEach(([attr, value]) => {
      if (value < CharacterCreationTypes.MIN_ATTRIBUTE_VALUE) {
        errors.push(`${attr} cannot be less than ${CharacterCreationTypes.MIN_ATTRIBUTE_VALUE}`);
      }
      if (value > CharacterCreationTypes.MAX_ATTRIBUTE_VALUE) {
        errors.push(`${attr} cannot be more than ${CharacterCreationTypes.MAX_ATTRIBUTE_VALUE}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  },

  // Calculate total attribute points available (base + NFT bonuses)
  calculateTotalAttributePoints(nftBonuses?: CharacterCreationTypes.NFTBonuses): number {
    let total = CharacterCreationTypes.BASE_ATTRIBUTE_POINTS;
    if (nftBonuses?.attributePointBonus) {
      total += nftBonuses.attributePointBonus;
    }
    return total;
  },

  // Calculate max skills allowed (base + NFT bonuses)
  calculateMaxSkills(nftBonuses?: CharacterCreationTypes.NFTBonuses): number {
    let max = CharacterCreationTypes.DEFAULT_MAX_SKILLS;
    if (nftBonuses?.skillPointBonus) {
      max += nftBonuses.skillPointBonus;
    }
    return max;
  },

  // Validate skill selection
  validateSkillSelection(
    selectedSkills: string[],
    allSkills: CharacterCreationTypes.Skill[],
    maxSkills: number
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Handle undefined or null selectedSkills
    if (!selectedSkills || !Array.isArray(selectedSkills)) {
      errors.push('No skills selected');
      return { valid: false, errors };
    }

    if (selectedSkills.length < CharacterCreationTypes.MIN_SKILLS_REQUIRED) {
      errors.push(`You must select at least ${CharacterCreationTypes.MIN_SKILLS_REQUIRED} skills`);
    }

    if (selectedSkills.length > maxSkills) {
      errors.push(`You cannot select more than ${maxSkills} skills`);
    }

    // Check for skill prerequisites
    const selectedSkillObjects = allSkills.filter(skill => selectedSkills.includes(skill.id));

    selectedSkillObjects.forEach(skill => {
      if (skill.prerequisites.length > 0) {
        const missingPrereqs = skill.prerequisites.filter(prereq => !selectedSkills.includes(prereq));
        if (missingPrereqs.length > 0) {
          const prereqNames = allSkills
            .filter(s => missingPrereqs.includes(s.id))
            .map(s => s.name)
            .join(', ');
          errors.push(`${skill.name} requires the following skills: ${prereqNames}`);
        }
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  },

  // Apply template selections to character state
  applySkillTemplate(
    template: CharacterCreationTypes.SkillTemplate,
    baseAttributes: CharacterCreationTypes.AttributeDistribution
  ): {
    skills: string[];
    attributes: CharacterCreationTypes.AttributeDistribution;
  } {
    const modifiedAttributes = { ...baseAttributes };

    // Apply stat modifiers from template
    Object.entries(template.statModifiers).forEach(([stat, modifier]) => {
      if (stat in modifiedAttributes) {
        const currentValue = modifiedAttributes[stat as keyof CharacterCreationTypes.AttributeDistribution];
        const newValue = Math.max(
          CharacterCreationTypes.MIN_ATTRIBUTE_VALUE,
          Math.min(CharacterCreationTypes.MAX_ATTRIBUTE_VALUE, currentValue + modifier)
        );
        modifiedAttributes[stat as keyof CharacterCreationTypes.AttributeDistribution] = newValue;
      }
    });

    return {
      skills: [...template.preselectedSkillIds],
      attributes: modifiedAttributes
    };
  },

  // Get NFT tier display information
  getNFTTierInfo(tier: number): { name: string; color: string; description: string } {
    const tierInfo = {
      1: { name: 'Basic', color: 'text-gray-400', description: 'Essential character slot' },
      2: { name: 'Standard', color: 'text-blue-400', description: 'Character customization access' },
      3: { name: 'Premium', color: 'text-purple-400', description: 'Bonus features and stats' },
      4: { name: 'Elite', color: 'text-yellow-400', description: 'Exclusive content and abilities' }
    };

    return tierInfo[tier as keyof typeof tierInfo] || tierInfo[1];
  }
};