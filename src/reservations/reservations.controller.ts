import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Get,
  Query,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import {
  CreateReservationResponse,
  GetReservationDetailResponseDto,
  GetReservationMembersResponseDto,
  GetReservationsQueryDto,
  GetReservationsResponseDto,
  UpdateReservationRequestDto,
  UpdateReservationResponseDto,
} from '../docs/dto/reservation.dto';
import { ErrorResponseDto } from '@/common/dto/response/error-response.dto';
import { PaginationMetadata } from '@/common/dto/response';
import { GlobalAuthGuard } from '@/common/guard/global-auth.guard';
import { ApiAuth } from '@/common/decorator/api.auth.decorator';
import { UpdateUserStatusRequest } from './dto/request/update.user.status.request';
import { CommonResponseDecorator } from '@/common/decorator/common.response.decorator';
import { UpdateUserMessageRequest } from './dto/request/update.user.message.request';
import { CreateReservationResultDto } from './dto/request/create.reservation.result.dto';
import { ReservationResultDto } from './dto/response/result.dto';
import { RivalResponse } from './dto/response/rival.response';
import { CommonResponse } from '@/common/response/common.response';
import { CreateReservationRequest } from './dto/request/create-reservation.request';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { Roles } from '@/common/decorator/roles.decorator';
import { UserRole } from '@/common/enums/user-role';
import { CurrentUser } from '@/common/decorator/current-user.decorator';
import { User } from '@/users/entities/user.entity';
import { FilesService } from '@/files/files.service';
import { Reservation } from './entities/reservation.entity';
import { ApiErrorResponse } from '@/common/decorator/api-error-response.decorator';
import {
  ReservationAlreadyJoinedException,
  ReservationFullException,
  ReservationNotFoundException,
  ReservationTimeNotReachedException,
  UserReservationNotFoundException,
} from '@/common/exception/reservation.exception';
import { ValidationFailedException } from '@/common/exception/request-parsing.exception';

@ApiAuth()
@ApiTags('예약')
@Roles(UserRole.USER)
@UseGuards(GlobalAuthGuard)
@Controller('reservations')
export class ReservationsController {
  constructor(
    private readonly reservationsService: ReservationsService,
    private readonly filesService: FilesService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '예약 생성 ✅',
    description:
      '새로운 예약을 생성합니다. 이미지는 최대 3개까지 업로드 가능합니다.',
  })
  @ApiErrorResponse(ValidationFailedException)
  @CommonResponseDecorator(CreateReservationResponse)
  async createReservation(
    @CurrentUser() user: User,
    @Body() body: CreateReservationRequest,
  ): Promise<CreateReservationResponse> {
    const createDto = new CreateReservationDto(
      body.title,
      body.category,
      new Date(body.reservationDatetime),
      user,
      body.description,
      body.linkUrl,
      body.images,
      undefined, // TODO : similarGroupId는 현재 사용하지 않음
    );
    const reservation: Reservation =
      await this.reservationsService.createReservation(createDto);

    const imageUrls: string[] = [];
    if (body.images && body.images.length > 0) {
      for (const image of body.images) {
        try {
          const url = await this.filesService.getAccessPresignedUrl(image);
          imageUrls.push(url);
        } catch (error) {
          console.error(image + ' URL 생성 실패:', error);
        }
      }
    }

    return new CreateReservationResponse(reservation, user, imageUrls);
  }

  @Post(':reservationId/join')
  @ApiOperation({
    summary: '예약 참가 ✅',
    description:
      '초대된 예약에 참가합니다. 사용자 ID를 함께 전송하여 참가 의사를 표현합니다.',
  })
  @ApiParam({
    name: 'reservationId',
    description: '참가할 예약 ID',
    example: 42,
    type: 'number',
  })
  @ApiErrorResponse(ValidationFailedException)
  @ApiErrorResponse(ReservationFullException)
  @ApiErrorResponse(ReservationNotFoundException)
  @ApiErrorResponse(ReservationAlreadyJoinedException)
  @CommonResponseDecorator()
  async joinReservation(
    @Param('reservationId', ParseIntPipe) reservationId: number,
    @CurrentUser() user: User,
  ): Promise<void> {
    await this.reservationsService.joinReservation(reservationId, user.id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '예약 목록 - 예약정보',
    description:
      '현재 시간 기준으로 예약 목록을 조회합니다. before: 지난 예약, after: 예정된 예약',
  })
  @ApiQuery({
    name: 'status',
    description: '예약 상태 (before: 지난 예약, after: 예정된 예약)',
    enum: ['before', 'after'],
    required: false,
    example: 'after',
  })
  @ApiResponse({
    status: 200,
    description: '예약 목록 조회 성공',
    type: GetReservationsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 사용자',
    type: ErrorResponseDto,
    example: {
      code: '1003',
      message: '유효하지 않은 토큰입니다.',
    },
  })
  getReservations(
    @Query() query: GetReservationsQueryDto,
  ): GetReservationsResponseDto {
    const mockReservations = [
      {
        reservationId: 1,
        title: '매쉬업 아구찜 직팬 모임',
        category: '운동경기',
        reservationDatetime: '2025-07-11T19:00:00+09:00',
        participantCount: 3,
        maxParticipants: 20,
        hostId: 1,
        hostNickname: '서연',
        images: ['path/image1.jpg'],
        userStatus: 'default',
        isHost: false,
      },
      {
        reservationId: 2,
        title: '매쉬업 아구찜 직팬 모임',
        category: '운동경기',
        reservationDatetime: '2025-07-11T19:00:00+09:00',
        participantCount: 3,
        maxParticipants: 20,
        hostId: 2,
        hostNickname: '서연',
        images: ['path/image1.jpg'],
        userStatus: 'default',
        isHost: true,
      },
    ];

    const metadata = new PaginationMetadata(query.page, query.limit, 10);

    return {
      code: '200',
      message: 'OK',
      data: {
        reservations: mockReservations,
        metadata: metadata,
      },
    };
  }

  @Get(':reservationId/members')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '예약 멤버 조회',
    description:
      '특정 예약의 모든 참가자 정보를 조회합니다. 현재 사용자 정보도 별도로 제공됩니다.',
  })
  @ApiParam({
    name: 'reservationId',
    description: '조회할 예약 ID',
    example: 42,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: '예약 멤버 조회 성공',
    type: GetReservationMembersResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 사용자',
    type: ErrorResponseDto,
    example: {
      code: '1003',
      message: '유효하지 않은 토큰입니다.',
    },
  })
  @ApiResponse({
    status: 404,
    description: '예약을 찾을 수 없음',
    type: ErrorResponseDto,
    example: {
      code: '2000',
      message: '찾을 수 없는 예약입니다.',
    },
  })
  @ApiResponse({
    status: 403,
    description: '접근 권한 없음 (참가하지 않은 예약)',
    type: ErrorResponseDto,
    example: {
      code: '2009',
      message: '해당 예약에 접근할 권한이 없습니다.',
    },
  })
  getReservationMembers(
    @Param('reservationId', ParseIntPipe) reservationId: number,
  ): GetReservationMembersResponseDto {
    return {
      code: '200',
      message: 'OK',
      data: {
        members: [
          {
            userId: 1,
            nickname: '김파디',
            profileImageCode: '01',
            status: 'SUCCESS',
            statusKr: '성공',
            statusMessage: '예약 내가 찜닷다',
            isHost: true,
          },
          {
            userId: 2,
            nickname: '이파디',
            profileImageCode: '02',
            status: 'FAIL',
            statusKr: '실패',
            statusMessage: '아쉬워서 화이팅',
            isHost: false,
          },
          {
            userId: 3,
            nickname: '박파디',
            profileImageCode: '03',
            status: 'READY',
            statusKr: '준비완료!',
            statusMessage: '나만 믿어라',
            isHost: false,
          },
          {
            userId: 4,
            nickname: '최파디',
            profileImageCode: '04',
            status: 'DEFAULT',
            statusKr: '기본',
            statusMessage: '까먹지마',
            isHost: false,
          },
          {
            userId: 5,
            nickname: '정파디',
            profileImageCode: '05',
            status: 'DEFAULT',
            statusKr: '기본',
            statusMessage: null,
            isHost: false,
          },
        ],
        me: {
          userId: 123,
          nickname: '김철수',
          profileImageCode: '01',
          status: 'DEFAULT',
          statusKr: '기본',
          statusMessage: '예약 내가 찢는다!',
          isHost: false,
        },
        totalCount: 6,
      },
    };
  }
  @Patch(':reservationId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '예약 정보 수정',
    description:
      '예약의 제목, 카테고리, 시간, 설명, 링크, 이미지를 수정합니다. 주최자만 수정 가능합니다.',
  })
  @ApiParam({
    name: 'reservationId',
    description: '수정할 예약 ID',
    example: 42,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: '예약 수정 성공',
    type: UpdateReservationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (유효하지 않은 데이터)',
    type: ErrorResponseDto,
    examples: {
      invalidTime: {
        summary: '유효하지 않은 예약 시간',
        value: {
          code: '2002',
          message: '예약 시간이 과거입니다.',
        },
      },
      tooManyImages: {
        summary: '이미지 개수 초과',
        value: {
          code: '2005',
          message: '이미지는 최대 3개까지 업로드 가능합니다.',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 사용자',
    type: ErrorResponseDto,
    example: {
      code: '1003',
      message: '유효하지 않은 토큰입니다.',
    },
  })
  @ApiResponse({
    status: 403,
    description: '수정 권한 없음 (호스트가 아님)',
    type: ErrorResponseDto,
    example: {
      code: '2013',
      message: '예약을 수정할 권한이 없습니다.',
    },
  })
  @ApiResponse({
    status: 404,
    description: '예약을 찾을 수 없음',
    type: ErrorResponseDto,
    example: {
      code: '2000',
      message: '찾을 수 없는 예약입니다.',
    },
  })
  @ApiResponse({
    status: 409,
    description: '수정 불가능한 상태',
    type: ErrorResponseDto,
    example: {
      code: '2014',
      message: '이미 시작된 예약은 수정할 수 없습니다.',
    },
  })
  updateReservation(
    @Param('reservationId', ParseIntPipe) reservationId: number,
    @Body() updateDto: UpdateReservationRequestDto,
  ): UpdateReservationResponseDto {
    return {
      code: '200',
      message: 'OK',
      data: {
        reservationId: reservationId,
        title: updateDto.title || '오아시스를 직접 본다니',
        category: updateDto.category || '아구',
        reservationDatetime:
          updateDto.reservationDatetime || '2025-08-21T19:00:00+09:00',
        description:
          updateDto.description ??
          '1순위로 E열 선정하기. 만약에 안되면 H도 괜찮아요',
        linkUrl: updateDto.linkUrl ?? 'https://example.com/reservation-link',
        images: updateDto.images ?? ['path/image1.jpg', 'path/image1.jpg'],
        hostId: 1,
        participantCount: 4,
        maxParticipants: 20,
        createddAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
  }

  @Get(':reservationId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '예약 상세 조회',
    description:
      '특정 예약의 상세 정보를 조회합니다. 예약 정보만 포함하며, 멤버 정보는 별도 API에서 조회합니다.',
  })
  @ApiParam({
    name: 'reservationId',
    description: '조회할 예약 ID',
    example: 42,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: '예약 상세 조회 성공',
    type: GetReservationDetailResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 사용자',
    type: ErrorResponseDto,
    example: {
      code: '1003',
      message: '유효하지 않은 토큰입니다.',
    },
  })
  @ApiResponse({
    status: 404,
    description: '예약을 찾을 수 없음',
    type: ErrorResponseDto,
    example: {
      code: '2000',
      message: '찾을 수 없는 예약입니다.',
    },
  })
  getReservationDetail(
    @Param('reservationId', ParseIntPipe) reservationId: number,
  ): GetReservationDetailResponseDto {
    return {
      code: '200',
      message: 'OK',
      data: {
        reservationId: reservationId,
        title: '오아시스를 직접 본다니',
        category: '공연',
        reservationDatetime: '2025-08-21T19:00:00+09:00',
        description: '1순위로 E열 선정하기. 만약에 안되면 H도 괜찮아요',
        linkUrl: 'https://example.com/reservation-link',
        images: ['path/image1.jpg', 'path/image1.jpg', 'path/image1.jpg'],
        host: {
          hostId: 1,
          nickname: '김파디',
          profileImageName: 'IMG_001',
        },
        currentUser: {
          userId: 123,
          status: 'default',
          isHost: false,
          canEdit: false,
          canJoin: false,
        },
        participantCount: 4,
        maxParticipants: 6,
        createdAt: '2025-06-13T10:00:00Z',
        updatedAt: '2025-06-13T15:30:00Z',
      },
    };
  }

  @Patch(':reservationId/users/status')
  @ApiOperation({
    summary: '준비완료/해제 상태변경 ✅',
    description: '예약 시간 1시간 이내에만 준비완료/해제 가능합니다.',
  })
  @ApiParam({
    name: 'reservationId',
    description: '예약 ID',
    example: 12345,
    type: 'number',
  })
  @ApiBody({ type: UpdateUserStatusRequest })
  @ApiErrorResponse(ValidationFailedException)
  @ApiErrorResponse(ReservationNotFoundException)
  @ApiErrorResponse(ReservationTimeNotReachedException)
  @ApiErrorResponse(UserReservationNotFoundException)
  @CommonResponseDecorator()
  async updateReservationUserStatus(
    @Param('reservationId', ParseIntPipe) reservationId: number,
    @Body() body: UpdateUserStatusRequest,
    @CurrentUser() user: User,
  ): Promise<void> {
    await this.reservationsService.updateUserStatus(
      reservationId,
      user.id,
      body.status,
    );
  }

  @Patch(':reservationId/users/message')
  @ApiOperation({
    summary: '상태 메시지 변경',
  })
  @ApiParam({
    name: 'reservationId',
    description: '예약 ID',
    example: '12345',
  })
  @ApiBody({ type: UpdateUserMessageRequest })
  @CommonResponseDecorator()
  @ApiResponse({
    status: 404,
    description: '본인이 속한 예약만 접근 가능',
    schema: {
      example: {
        code: 2009,
        message: '본인이 속한 예약만 접근 가능한 기능입니다.',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '예약시간 24시간 이내에만 메시지 변경 가능',
    schema: {
      example: {
        code: 2010,
        message: '예약시간 24시간 이내에만 접근 가능한 기능입니다.',
      },
    },
  })
  updateReservationUserMessage() {}

  @Post(':reservationId/results')
  @ApiOperation({
    summary: '예약 결과 등록',
  })
  @ApiParam({
    name: 'reservationId',
    description: '예약 ID',
    example: '12345',
  })
  @ApiBody({ type: CreateReservationResultDto })
  @ApiResponse({
    status: 404,
    description: '본인이 속한 예약만 접근 가능',
    schema: {
      example: {
        code: 2009,
        message: '본인이 속한 예약만 접근 가능한 기능입니다.',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '예약시간 이후에만 결과 등록 가능',
    schema: {
      example: {
        code: 2010,
        message: '예약시간 이후에만 접근 가능한 기능입니다.',
      },
    },
  })
  addReservationResult() {
    return new CommonResponse(200, 'OK', {
      message: '예약 결과가 등록되었습니다.',
    });
  }

  @Post('/:reservation_id/kok/:user_id')
  @ApiOperation({
    summary: '콕찌르기',
  })
  @ApiParam({
    name: 'reservation_id',
    description: '예약 ID',
    example: '12345',
  })
  @ApiParam({
    name: 'user_id',
    description: '사용자 ID',
    example: '67890',
  })
  @CommonResponseDecorator()
  @ApiResponse({
    status: 404,
    description: '본인이 속한 예약만 접근 가능',
    schema: {
      example: {
        code: 2009,
        message: '본인이 속한 예약만 접근 가능한 기능입니다.',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '예약시간 24시간 이내에만 콕찌르기 가능',
    schema: {
      example: {
        code: 2010,
        message: '예약시간 24시간 이내에만 접근 가능한 기능입니다.',
      },
    },
  })
  kokReservation() {}

  @Get(':reservationId/results')
  @ApiOperation({
    summary: '예약 결과 목록 조회',
  })
  @ApiParam({
    name: 'reservationId',
    description: '예약 ID',
    example: '12345',
  })
  @CommonResponseDecorator([ReservationResultDto])
  @ApiResponse({
    status: 404,
    description: '본인이 속한 예약만 접근 가능',
    schema: {
      example: {
        code: 2009,
        message: '본인이 속한 예약만 접근 가능한 기능입니다.',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '예약시간 이후에만 결과 조회 가능',
    schema: {
      example: {
        code: 2010,
        message: '예약시간 이후에만 접근 가능한 기능입니다.',
      },
    },
  })
  addReservationResults() {}

  @Get(':reservationId/results/rival_count')
  @ApiOperation({
    summary: '예약에 함께 도전하는 라이벌 수 조회',
  })
  @CommonResponseDecorator(RivalResponse)
  @ApiResponse({
    status: 404,
    description: '본인이 속한 예약만 접근 가능',
    schema: {
      example: {
        code: 2009,
        message: '본인이 속한 예약만 접근 가능한 기능입니다.',
      },
    },
  })
  getRivalCount() {}
}
