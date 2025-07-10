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
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import {
  CreateReservationResponse,
  GetReservationsQueryDto,
} from '../docs/dto/reservation.dto';
import { GlobalAuthGuard } from '@/common/guard/global-auth.guard';
import { ApiAuth } from '@/common/decorator/api.auth.decorator';
import { UpdateUserStatusRequest } from './dto/request/update.user.status.request';
import { CommonResponseDecorator } from '@/common/decorator/common.response.decorator';
import { CreateReservationResultRequest } from './dto/request/create-reservation-result.request';
import { RivalResponse } from './dto/response/rival.response';
import { CreateReservationRequest } from './dto/request/create-reservation.request';
import { UpdateReservationRequest } from './dto/request/update-reservation.request';
import { UpdateReservationResponse } from './dto/response/update-reservation.response';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
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
  NoEditPermissionException,
  CannotEditStartedException,
  InvalidTimeUpdateException,
  ReservationTimeNotReachedException,
  UserReservationNotFoundException,
  ReservationNotDoneException,
  ReservationResultAlreadyExistsException,
  ReservationAccessDeniedException,
  CurrentUserResultNotFoundException,
} from '@/common/exception/reservation.exception';
import { ValidationFailedException } from '@/common/exception/request-parsing.exception';
import { GetReservationMemberResponse } from './dto/response/get-reservation-member.response';
import { ReservationMemberDto } from './dto/reservation-member.dto';
import { GetReservationDetailResponse } from './dto/response/get-reservation-detail.response';
import { ReservationResultsService } from './reservation-results.service';
import { CreateReservationResultDto } from './dto/response/create-reservation-result.dto';
import { InvalidTokenException } from '@/common/exception/auth.exception';
import { GetReservationsResponse } from '@/reservations/dto/response/get-reservation-response';
import { GetReservationResultsResponse } from '@/reservations/dto/response/get-reservation-results.response';

@ApiAuth()
@ApiTags('예약')
@Roles(UserRole.USER)
@UseGuards(GlobalAuthGuard)
@Controller('reservations')
export class ReservationsController {
  constructor(
    private readonly reservationsService: ReservationsService,
    private readonly filesService: FilesService,
    private readonly reservationResultService: ReservationResultsService,
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
  @ApiOperation({
    summary: '예약 목록 - 예약정보 ✅',
    description:
      '현재 시간 기준으로 예약 목록을 조회합니다. BEFORE: 지난 예약, AFTER: 예정된 예약',
  })
  @ApiQuery({
    name: 'status',
    description: '예약 상태 (BEFORE: 지난 예약, AFTER: 예정된 예약)',
    enum: ['BEFORE', 'AFTER'],
    required: false,
    example: 'AFTER',
  })
  @ApiErrorResponse(InvalidTokenException)
  @CommonResponseDecorator(GetReservationsResponse)
  async getReservations(
    @Query() query: GetReservationsQueryDto,
    @CurrentUser() user: User,
  ): Promise<GetReservationsResponse> {
    return await this.reservationsService.getReservations(query, user.id);
  }

  @Get(':reservationId/members')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '예약 멤버 조회 ✅',
    description:
      '특정 예약의 모든 참가자 정보를 조회합니다. 현재 사용자 정보도 별도로 제공됩니다.',
  })
  @ApiParam({
    name: 'reservationId',
    description: '조회할 예약 ID',
    example: 42,
    type: 'number',
  })
  @CommonResponseDecorator(GetReservationMemberResponse)
  @ApiErrorResponse(ValidationFailedException)
  @ApiErrorResponse(ReservationNotFoundException)
  @ApiErrorResponse(UserReservationNotFoundException)
  async getReservationMembers(
    @Param('reservationId', ParseIntPipe) reservationId: number,
    @CurrentUser() user: User,
  ): Promise<GetReservationMemberResponse> {
    const members: ReservationMemberDto[] =
      await this.reservationsService.getMembers(reservationId);
    return new GetReservationMemberResponse(members, user.id);
  }

  @Patch(':reservationId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '예약 정보 수정 ✅',
    description:
      '예약의 제목, 카테고리, 시간, 설명, 링크, 이미지를 수정합니다. 주최자만 수정 가능합니다.',
  })
  @ApiParam({
    name: 'reservationId',
    description: '수정할 예약 ID',
    example: 42,
    type: 'number',
  })
  @ApiErrorResponse(ValidationFailedException)
  @ApiErrorResponse(ReservationNotFoundException)
  @ApiErrorResponse(NoEditPermissionException)
  @ApiErrorResponse(CannotEditStartedException)
  @ApiErrorResponse(InvalidTimeUpdateException)
  @CommonResponseDecorator(UpdateReservationResponse)
  async updateReservation(
    @Param('reservationId', ParseIntPipe) reservationId: number,
    @Body() body: UpdateReservationRequest,
    @CurrentUser() user: User,
  ): Promise<UpdateReservationResponse> {
    const updateDto = new UpdateReservationDto(
      body.title,
      body.category,
      body.reservationDatetime ? new Date(body.reservationDatetime) : undefined,
      body.description,
      body.linkUrl,
      body.images,
    );

    const updatedReservation = await this.reservationsService.updateReservation(
      reservationId,
      user.id,
      updateDto,
    );

    const memberCount =
      await this.reservationsService.getMemberCount(reservationId);

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

    return new UpdateReservationResponse(
      updatedReservation,
      user,
      memberCount,
      imageUrls,
    );
  }

  @Get(':reservationId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '예약 상세 조회 ✅',
    description:
      '특정 예약의 상세 정보를 조회합니다.예약에 초대 받았을때 유저에게 예약정보를 보여줄 때도 사용합니다. 예약 정보만 포함하며, 멤버 정보는 별도 API에서 조회합니다.',
  })
  @ApiParam({
    name: 'reservationId',
    description: '조회할 예약 ID',
    example: 42,
    type: 'number',
  })
  @CommonResponseDecorator(GetReservationDetailResponse)
  @ApiErrorResponse(ValidationFailedException)
  @ApiErrorResponse(ReservationNotFoundException)
  async getReservationDetail(
    @Param('reservationId', ParseIntPipe) reservationId: number,
    @CurrentUser() user: User,
  ): Promise<GetReservationDetailResponse> {
    return await this.reservationsService.getReservationDetail(
      reservationId,
      user.id,
    );
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
      user,
      reservationId,
      user.id,
      body.status,
    );
  }

  @Post(':reservationId/results')
  @ApiOperation({
    summary: '예약 결과 등록 ✅',
  })
  @ApiParam({
    name: 'reservationId',
    description: '예약 ID',
    example: '12345',
  })
  @ApiBody({ type: CreateReservationResultRequest })
  @CommonResponseDecorator(CreateReservationResultDto)
  @ApiErrorResponse(ValidationFailedException)
  @ApiErrorResponse(ReservationNotFoundException)
  @ApiErrorResponse(UserReservationNotFoundException)
  @ApiErrorResponse(ReservationNotDoneException)
  @ApiErrorResponse(ReservationResultAlreadyExistsException)
  async addReservationResult(
    @Param('reservationId', ParseIntPipe) reservationId: number,
    @Body() body: CreateReservationResultRequest,
    @CurrentUser() user: User,
  ): Promise<CreateReservationResultDto> {
    const result = await this.reservationResultService.createReservationResult(
      reservationId,
      user,
      body,
    );

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

    return new CreateReservationResultDto(result, imageUrls);
  }

  @Post('/:reservationId/kok/:userId')
  @ApiOperation({
    summary: '콕찌르기 ✅',
    description: '같은 예약에 참여한 다른 사용자를 콕 찔러 알림을 보냅니다.',
  })
  @ApiParam({
    name: 'reservationId',
    description: '예약 ID',
    example: '12345',
  })
  @ApiParam({
    name: 'userId',
    description: '콕 찔림을 당할 사용자의 ID',
    example: '67890',
  })
  @ApiErrorResponse(ReservationAccessDeniedException)
  @ApiErrorResponse(ReservationNotFoundException)
  async kokReservation(
    @CurrentUser() currentUser: User,
    @Param('reservationId', ParseIntPipe) reservationId: number,
    @Param('userId', ParseIntPipe) targetUserId: number,
  ): Promise<void> {
    await this.reservationsService.kokUserInReservation(
      reservationId,
      currentUser,
      targetUserId,
    );
  }

  @Get(':reservationId/results')
  @ApiOperation({
    summary: '구성원들의 예약 결과 목록 조회 ✅',
  })
  @ApiParam({
    name: 'reservationId',
    description: '예약 ID',
    example: '12345',
  })
  @CommonResponseDecorator(GetReservationResultsResponse)
  @ApiErrorResponse(ReservationAccessDeniedException)
  @ApiErrorResponse(ReservationNotDoneException)
  @ApiErrorResponse(CurrentUserResultNotFoundException)
  @ApiErrorResponse(ReservationNotFoundException)
  async getReservationResults(
    @Param('reservationId', ParseIntPipe) reservationId: number,
    @CurrentUser() user: User,
  ): Promise<GetReservationResultsResponse> {
    return await this.reservationResultService.getReservationResults(
      reservationId,
      user.id,
    );
  }

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
