export enum ProfileImageCode {
  IMG_001 = 'IMG_001',
  IMG_002 = 'IMG_002',
  IMG_003 = 'IMG_003',
  IMG_004 = 'IMG_004',
  IMG_005 = 'IMG_005',
}

export const PROFILE_IMAGE_PATH_MAP: Record<ProfileImageCode, string> = {
  [ProfileImageCode.IMG_001]: 'profile-images/IMG_001.png',
  [ProfileImageCode.IMG_002]: 'profile-images/IMG_002.png',
  [ProfileImageCode.IMG_003]: 'profile-images/IMG_003.png',
  [ProfileImageCode.IMG_004]: 'profile-images/IMG_004.png',
  [ProfileImageCode.IMG_005]: 'profile-images/IMG_005.png',
};

export const getProfileImagePath = (
  profileImageCode: ProfileImageCode,
): string => {
  return PROFILE_IMAGE_PATH_MAP[profileImageCode];
};
