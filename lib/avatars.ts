export interface ScholarAvatar {
  id: string;
  name: string;
  title: string;
  gender: 'masculine' | 'feminine';
  robeColor: string;
  accentColor: string;
  accessory: string;
}

export const SCHOLAR_AVATARS: ScholarAvatar[] = [
  // 4 Masculine-Presenting Scholars
  {
    id: 'scholar_m1',
    name: 'Archivist Julian',
    title: 'Keeper of Rare Texts',
    gender: 'masculine',
    robeColor: '#173B2D',
    accentColor: '#B59A62',
    accessory: 'Round Spectacles & Scholar Cap',
  },
  {
    id: 'scholar_m2',
    name: 'Polymath Elijah',
    title: 'Theoretical Inquirer',
    gender: 'masculine',
    robeColor: '#2C5E4B',
    accentColor: '#A9C9A9',
    accessory: 'Curled Hair & Monocle',
  },
  {
    id: 'scholar_m3',
    name: 'Scribe Tobias',
    title: 'Master of Inscriptions',
    gender: 'masculine',
    robeColor: '#3D362A',
    accentColor: '#B59A62',
    accessory: 'Neat Coif & Quill behind Ear',
  },
  {
    id: 'scholar_m4',
    name: 'Astronomer Leon',
    title: 'Celestial Cartographer',
    gender: 'masculine',
    robeColor: '#1B2C3B',
    accentColor: '#B59A62',
    accessory: 'Star Hood & Astrolabe Pin',
  },

  // 4 Feminine-Presenting Scholars
  {
    id: 'scholar_f1',
    name: 'Curator Sophia',
    title: 'Historian of Codexes',
    gender: 'feminine',
    robeColor: '#173B2D',
    accentColor: '#B59A62',
    accessory: 'Braided Bun & Laurel Brooch',
  },
  {
    id: 'scholar_f2',
    name: 'Philosopher Beatrice',
    title: 'Dialectical Thinker',
    gender: 'feminine',
    robeColor: '#2A4E3F',
    accentColor: '#A9C9A9',
    accessory: 'Oval Spectacles & Ribbon Scarf',
  },
  {
    id: 'scholar_f3',
    name: 'Alchemist Miriam',
    title: 'Natural Sciences Fellow',
    gender: 'feminine',
    robeColor: '#4A3B2C',
    accentColor: '#B59A62',
    accessory: 'Twin Twists & Emerald Pin',
  },
  {
    id: 'scholar_f4',
    name: 'Geometer Clara',
    title: 'Architect of Logic',
    gender: 'feminine',
    robeColor: '#1F3738',
    accentColor: '#CBB177',
    accessory: 'Pencil Hairpin & Scholar Robes',
  },
];

export function getAvatarById(id: string): ScholarAvatar {
  return SCHOLAR_AVATARS.find((a) => a.id === id) || SCHOLAR_AVATARS[0];
}
