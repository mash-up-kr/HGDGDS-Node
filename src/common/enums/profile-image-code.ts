export enum ProfileImageCode {
  PURPLE = 'PURPLE',
  ORANGE = 'ORANGE',
  GREEN = 'GREEN',
  BLUE = 'BLUE',
PINK = 'PINK',
}

export const PROFILE_IMAGE_PATH_MAP: Record<ProfileImageCode, string> = {
  [ProfileImageCode.PURPLE]: 'profile-images/IMG_001.png',
  [ProfileImageCode.ORANGE]: 'profile-images/IMG_002.png',
  [ProfileImageCode.GREEN]: 'profile-images/IMG_003.png',
  [ProfileImageCode.BLUE]: 'profile-images/IMG_004.png',
  [ProfileImageCode.PINK]: 'profile-images/IMG_005.png',
};

export const getProfileImagePath = (
  profileImageCode: ProfileImageCode,
): string => {
  return PROFILE_IMAGE_PATH_MAP[profileImageCode];
};
