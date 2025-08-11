// Nederlandse archetypen mapping voor FitFi
export const DUTCH_ARCHETYPES = {
  klassiek: {
    id: 'klassiek',
    displayName: 'Klassiek',
    description: 'Tijdloze elegantie en verfijnde stukken die nooit uit de mode gaan',
    keywords: ['elegant', 'tijdloos', 'verfijnd', 'klassiek', 'sophisticated'],
    colors: ['navy', 'zwart', 'wit', 'beige', 'grijs'],
    occasions: ['werk', 'formeel', 'business', 'dinner'],
    icon: '👔',
    emoji: '✨'
  },
  casual_chic: {
    id: 'casual_chic',
    displayName: 'Casual Chic',
    description: 'Moeiteloos elegant met een relaxte twist - perfect voor de moderne lifestyle',
    keywords: ['relaxed', 'comfortable', 'effortless', 'modern', 'versatile'],
    colors: ['beige', 'wit', 'lichtblauw', 'roze', 'groen'],
    occasions: ['casual', 'weekend', 'lunch', 'shopping'],
    icon: '👗',
    emoji: '🌸'
  },
  urban: {
    id: 'urban',
    displayName: 'Urban',
    description: 'Stoere stadslook met functionele details - gemaakt voor het moderne stadsleven',
    keywords: ['functional', 'practical', 'edgy', 'modern', 'city'],
    colors: ['zwart', 'grijs', 'khaki', 'navy', 'wit'],
    occasions: ['casual', 'stad', 'werk', 'actief'],
    icon: '🏙️',
    emoji: '⚡'
  },
  streetstyle: {
    id: 'streetstyle',
    displayName: 'Streetstyle',
    description: 'Authentieke streetwear met attitude - voor de echte trendsetter',
    keywords: ['trendy', 'bold', 'authentic', 'creative', 'expressive'],
    colors: ['zwart', 'wit', 'rood', 'geel', 'neon'],
    occasions: ['casual', 'uitgaan', 'festival', 'vrienden'],
    icon: '🎨',
    emoji: '🔥'
  },
  retro: {
    id: 'retro',
    displayName: 'Retro',
    description: 'Vintage vibes met moderne twist - nostalgie die nooit verveelt',
    keywords: ['vintage', 'nostalgic', 'unique', 'timeless', 'classic'],
    colors: ['bruin', 'oranje', 'geel', 'bordeaux', 'groen'],
    occasions: ['casual', 'creatief', 'weekend', 'festival'],
    icon: '📻',
    emoji: '🌈'
  },
  luxury: {
    id: 'luxury',
    displayName: 'Luxury',
    description: 'Exclusieve stukken van topkwaliteit - voor de fijnproever',
    keywords: ['premium', 'exclusive', 'sophisticated', 'quality', 'refined'],
    colors: ['zwart', 'wit', 'goud', 'zilver', 'navy'],
    occasions: ['formeel', 'gala', 'business', 'special'],
    icon: '💎',
    emoji: '👑'
  }
};

// Mapping van quiz antwoorden naar archetypen
export const mapAnswersToArchetype = (answers) => {
  const { style, occasion = [], comfort = 5, color = [] } = answers;
  
  // Direct style mapping
  const styleMapping = {
    'minimalist': 'klassiek',
    'classic': 'klassiek',
    'bohemian': 'casual_chic',
    'streetwear': 'streetstyle',
    'vintage': 'retro',
    'luxury': 'luxury'
  };
  
  if (styleMapping[style]) {
    return styleMapping[style];
  }
  
  // Occasion-based mapping
  if (occasion.includes('work') || occasion.includes('formal')) {
    return comfort >= 7 ? 'casual_chic' : 'klassiek';
  }
  
  if (occasion.includes('active') || occasion.includes('casual')) {
    return 'urban';
  }
  
  if (occasion.includes('night') || occasion.includes('festival')) {
    return 'streetstyle';
  }
  
  // Color-based mapping
  if (color.includes('neutral') || color.includes('classic')) {
    return 'klassiek';
  }
  
  if (color.includes('vibrant') || color.includes('bold')) {
    return 'streetstyle';
  }
  
  // Default fallback
  return 'casual_chic';
};

// Get archetype by ID
const getArchetypeById = (id) => {
  return DUTCH_ARCHETYPES[id] || DUTCH_ARCHETYPES.casual_chic;
};

// Get all archetype options for dropdowns
const getArchetypeOptions = () => {
  return Object.values(DUTCH_ARCHETYPES).map(archetype => ({
    value: archetype.id,
    label: archetype.displayName,
    description: archetype.description,
    icon: archetype.icon
  }));
};

// Get archetype display name
const getArchetypeDisplayName = (id) => {
  return DUTCH_ARCHETYPES[id]?.displayName || 'Onbekend';
};

// Check if archetype exists
const isValidArchetype = (id) => {
  return Object.keys(DUTCH_ARCHETYPES).includes(id);
};

