import { registerDecorator, ValidationOptions } from 'class-validator';

const FILE_PREFIX_PATTERNS = [
  /^\/reservations\/\d+\/info$/,
  /^\/reservations\/\d+\/result$/,
  // 새로운 패턴이 생기면 여기에 추가
];
export function IsValidFilePrefix(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidFilePrefix',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return FILE_PREFIX_PATTERNS.some((pattern) => pattern.test(value));
        },
        defaultMessage() {
          return '유효한 filePrefix가 아닙니다.';
        },
      },
    });
  };
}
