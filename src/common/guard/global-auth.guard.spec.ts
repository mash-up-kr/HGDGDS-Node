import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GlobalAuthGuard } from '@/common/guard/global-auth.guard';
import { ROLES_PUBLIC } from '@/common/decorator/public.decorator';

describe('GlobalAuthGuard', () => {
  let guard: GlobalAuthGuard;
  let reflector: Reflector;

  const createMockContext = (user: any = null) =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user }),
        getResponse: jest.fn().mockReturnValue({}),
      }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new GlobalAuthGuard(reflector);
  });

  it('should allow access if no roles required', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    const mockContext = createMockContext();
    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('should allow access if @Public() is set', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([ROLES_PUBLIC]);

    const mockContext = createMockContext();
    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  // 실제 인증이 필요한 테스트는 통합 테스트에서 처리
  it('should be defined', () => {
    expect(guard).toBeDefined();
  });
});
