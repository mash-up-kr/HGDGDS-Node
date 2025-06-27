export enum ProfileImageCode {
  IMG_001 = 'IMG_001',
  IMG_002 = 'IMG_002',
  IMG_003 = 'IMG_003',
  IMG_004 = 'IMG_004',
  IMG_005 = 'IMG_005',
}

export const PROFILE_IMAGE_URL_MAP: Record<ProfileImageCode, string> = {
  [ProfileImageCode.IMG_001]:
    'https://kr.object.ncloudstorage.com/app-images/assets/img_profile_01.png',
  [ProfileImageCode.IMG_002]:
    'https://kr.object.ncloudstorage.com/app-images/assets/img_profile_02.png',
  [ProfileImageCode.IMG_003]:
    'https://kr.object.ncloudstorage.com/app-images/assets/img_profile_03.png',
  [ProfileImageCode.IMG_004]:
    'https://kr.object.ncloudstorage.com/app-images/assets/img_profile_04.png',
  [ProfileImageCode.IMG_005]:
    'https://kr.object.ncloudstorage.com/app-images/assets/img_profile_05.png',
};

export const getProfileImageUrl = (
  profileImageCode: ProfileImageCode,
): string => {
  return PROFILE_IMAGE_URL_MAP[profileImageCode];
};
