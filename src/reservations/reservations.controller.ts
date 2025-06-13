import { CommonResponse } from '@/common/response/common.response';
import { Controller, Get, Patch, Post } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { UpdateUserStatusRequest } from './request/update.user.status.request';
import { UpdateUserMessageRequest } from './request/update.user.message.request';
import { CommonResponseDecorator } from '@/common/decorator/common.response.decorator';
import { CreateReservationResultDto } from './request/create.reservation.result.dto';
import { ReservationResultDto } from './response/result.dto';
import { RivalResponse } from './response/rival.response';
import { ApiAuth } from '@/common/decorator/api.auth.decorator';

@ApiAuth()
@ApiTags('Reservations')
@Controller('reservations')
export class ReservationsController {
  @Patch(':reservationId/users/status')
  @ApiOperation({
    summary: '준비완료/해제 상태변경',
  })
  @ApiParam({
    name: 'reservationId',
    description: '예약 ID',
    example: '12345',
  })
  @ApiBody({ type: UpdateUserStatusRequest })
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
    description: '예약시간 24시간 이내에만 준비완료 가능',
    schema: {
      example: {
        code: 2010,
        message: '예약시간 24시간 이내에만 접근 가능한 기능입니다.',
      },
    },
  })
  updateReservationUserStatus() {}

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
