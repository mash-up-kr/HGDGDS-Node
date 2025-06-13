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
  } from '@nestjs/common';
  import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiQuery,
  } from '@nestjs/swagger';
import { CreateReservationRequestDto, CreateReservationResponseDto,  GetReservationDetailResponseDto,  GetReservationMembersResponseDto,  GetReservationsQueryDto, GetReservationsResponseDto, JoinReservationRequestDto, JoinReservationResponseDto, UpdateReservationRequestDto, UpdateReservationResponseDto } from '../docs/dto/reservation.dto';
import { ErrorResponseDto } from '@/common/dto/response/error-response.dto';
import { PaginationMetadata } from '@/common/dto/response';

  
  @ApiTags('예약')
  @Controller('reservations')
  export class ReservationsController {
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
      summary: '예약 생성',
      description: '새로운 예약을 생성합니다. 이미지는 최대 3개까지 업로드 가능합니다.',
    })
    @ApiResponse({
      status: 201,
      description: '예약 생성 성공',
      type: CreateReservationResponseDto,
    })
    @ApiResponse({
      status: 400,
      description: '잘못된 요청 (유효하지 않은 카테고리, 날짜 형식 오류 등)',
      type: ErrorResponseDto,
      example: {
        code: '2002',
        message: '유효하지 않은 예약 시간입니다.'
      }
    })
    @ApiResponse({
      status: 401,
      description: '인증되지 않은 사용자',
      type: ErrorResponseDto,
      example: {
        code: '1003',
        message: '유효하지 않은 토큰입니다.'
      }
    })
    @ApiResponse({
      status: 422,
      description: '유효성 검사 실패',
      type: ErrorResponseDto,
      example: {
        code: '1002',
        message: '제목은 필수입니다.'
      }
    })
    async createReservation(@Body() createDto: CreateReservationRequestDto): Promise<CreateReservationResponseDto> {
   
      return {
        code: '200',
        message: 'OK',
        data: {
          id: 42,
          title: createDto.title,
          category: createDto.category,
          reservationDatetime: createDto.reservationDatetime,
          url: createDto.url ?? null, 
          description: createDto.description ?? null, 
          imageUrls: createDto.imageUrls ?? [],
          hostId: 1, 
          createdAt: new Date().toISOString(),
        }
      };
    }
    
    @Post(':reservationId/join')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
      summary: '예약 참가',
      description: '초대된 예약에 참가합니다. 사용자 ID를 함께 전송하여 참가 의사를 표현합니다.',
    })
    @ApiParam({
      name: 'reservationId',
      description: '참가할 예약 ID',
      example: 42,
      type: 'number',
    })
    @ApiResponse({
      status: 200,
      description: '예약 참가 성공',
      type: JoinReservationResponseDto,
    })
    @ApiResponse({
      status: 400,
      description: '잘못된 요청 (이미 참가한 예약, 정원 초과 등)',
      type: ErrorResponseDto,
      examples: {
        reservationFull: {
          summary: '예약 정원 초과',
          value: {
            code: '2001',
            message: '예약 정원이 초과되었습니다. (최대 20명)' //NOTE: 확인필요
          }
        },
        alreadyJoined: {
          summary: '이미 참가한 예약',
          value: {
            code: '2006',
            message: '이미 참가한 예약입니다.'
          }
        }
      }
    })
    @ApiResponse({
      status: 401,
      description: '인증되지 않은 사용자',
      type: ErrorResponseDto,
      example: {
        code: '1003',
        message: '유효하지 않은 토큰입니다.'
      }
    })
    @ApiResponse({
      status: 404,
      description: '예약을 찾을 수 없음',
      type: ErrorResponseDto,
      example: {
        code: '2000',
        message: '찾을 수 없는 예약입니다.'
      }
    })
    @ApiResponse({
      status: 409,
      description: '이미 참가한 예약',
      type: ErrorResponseDto,
      example: {
        code: '2006',
        message: '이미 참가한 예약입니다.'
      }
    })
    async joinReservation(
      @Param('reservationId', ParseIntPipe) reservationId: number,
      @Body() joinDto: JoinReservationRequestDto
    ): Promise<JoinReservationResponseDto> {
      
      // 임시로 최대 20명 제한 예시
      const maxParticipants = 20;
      const currentParticipants = 3; 
      
      return {
        code: '200',
        message: 'OK',
        data: {
          reservationId: reservationId,
          userId: joinDto.userId,
          joinedAt: new Date().toISOString(),
          participantInfo: {
            currentCount: currentParticipants + 1, 
            maxCount: maxParticipants,
            availableSlots: maxParticipants - currentParticipants - 1,
          },
          reservation: {
            id: reservationId,
            title: '브런치 모임',
            category: '맛집',
            reservationDatetime: '2025-01-04T09:00:00+09:00',
            hostId: 1,
          }
        }
      };
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
      summary: '예약 목록 - 예약정보',
      description: '현재 시간 기준으로 예약 목록을 조회합니다. before: 지난 예약, after: 예정된 예약',
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
        message: '유효하지 않은 토큰입니다.'
      }
    })
    async getReservations(@Query() query: GetReservationsQueryDto): Promise<GetReservationsResponseDto> {
       
      const mockReservations = [
        {
          id: 1,
          title: '매쉬업 아구찜 직팬 모임',
          category: '스포츠',
          reservationDatetime: '2025-07-11T19:00:00+09:00',
          participantCount: 3,
          maxParticipants: 20,
          hostId: 1,
          hostNickname: '서연',
          imageUrls: ['https://example.com/image1.jpg'],
          userStatus: 'default',
          isHost: false,
        },
        {
          id: 2,
          title: '매쉬업 아구찜 직팬 모임',
          category: '스포츠',
          reservationDatetime: '2025-07-11T19:00:00+09:00',
          participantCount: 3,
          maxParticipants: 20,
          hostId: 2,
          hostNickname: '서연',
          imageUrls: ['https://example.com/image2.jpg'],
          userStatus: 'default',
          isHost: true,
        }
      ];
  
   
      const metadata = new PaginationMetadata(query.page, query.limit, 10);
  
      return {
        code: '200',
        message: 'OK',
        data: {
          reservations: mockReservations,
          metadata: metadata
        }
      };
    }

  @Get(':reservationId/members')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '예약 멤버 조회',
    description: '특정 예약의 모든 참가자 정보를 조회합니다. 현재 사용자 정보도 별도로 제공됩니다.',
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
      message: '유효하지 않은 토큰입니다.'
    }
  })
  @ApiResponse({
    status: 404,
    description: '예약을 찾을 수 없음',
    type: ErrorResponseDto,
    example: {
      code: '2000',
      message: '찾을 수 없는 예약입니다.'
    }
  })
  @ApiResponse({
    status: 403,
    description: '접근 권한 없음 (참가하지 않은 예약)',
    type: ErrorResponseDto,
    example: {
      code: '2009',
      message: '해당 예약에 접근할 권한이 없습니다.'
    }
  })
  async getReservationMembers(
    @Param('reservationId', ParseIntPipe) reservationId: number
  ): Promise<GetReservationMembersResponseDto> {
    
    return {
      code: '200',
      message: 'OK',
      data: {
        members: [
          {
            userId: 1,
            nickname: '김파디',
            profileImageCode: '01',
            status: 'success',
            statusKr: '성공',
            statusMessage: '예약 내가 찜닷다',
            isMaster: true
          },
          {
            userId: 2,
            nickname: '이파디',
            profileImageCode: '02',
            status: 'fail',
            statusKr: '실패',
            statusMessage: '아쉬워서 화이팅',
            isMaster: false
          },
          {
            userId: 3,
            nickname: '박파디',
            profileImageCode: '03',
            status: 'ready',
            statusKr: '준비완료!',
            statusMessage: '나만 믿어라',
            isMaster: false
          },
          {
            userId: 4,
            nickname: '최파디',
            profileImageCode: '04',
            status: 'default',
            statusKr: '기본',
            statusMessage: '까먹지마',
            isMaster: false
          },
          {
            userId: 5,
            nickname: '정파디',
            profileImageCode: '05',
            status: 'default',
            statusKr: '기본',
            statusMessage: null,
            isMaster: false
          }
        ],
        me: {
          userId: 123,
          nickname: '김철수',
          profileImageCode: '01',
          status: 'default',
          statusKr: '기본',
          statusMessage: '예약 내가 찢는다!',
          isMaster: false
        },
        totalCount: 6
      }
    };
  }
  @Patch(':reservationId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '예약 정보 수정',
    description: '예약의 제목, 카테고리, 시간, 설명, 링크, 이미지를 수정합니다. 주최자만 수정 가능합니다.',
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
          message: '예약 시간이 과거입니다.'
        }
      },
      tooManyImages: {
        summary: '이미지 개수 초과',
        value: {
          code: '2005',
          message: '이미지는 최대 3개까지 업로드 가능합니다.'
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 사용자',
    type: ErrorResponseDto,
    example: {
      code: '1003',
      message: '유효하지 않은 토큰입니다.'
    }
  })
  @ApiResponse({
    status: 403,
    description: '수정 권한 없음 (호스트가 아님)',
    type: ErrorResponseDto,
    example: {
      code: '2013',
      message: '예약을 수정할 권한이 없습니다.'
    }
  })
  @ApiResponse({
    status: 404,
    description: '예약을 찾을 수 없음',
    type: ErrorResponseDto,
    example: {
      code: '2000',
      message: '찾을 수 없는 예약입니다.'
    }
  })
  @ApiResponse({
    status: 409,
    description: '수정 불가능한 상태',
    type: ErrorResponseDto,
    example: {
      code: '2014',
      message: '이미 시작된 예약은 수정할 수 없습니다.'
    }
  })
  async updateReservation(
    @Param('reservationId', ParseIntPipe) reservationId: number,
    @Body() updateDto: UpdateReservationRequestDto
  ): Promise<UpdateReservationResponseDto> {
     
    return {
      code: '200',
      message: 'OK',
      data: {
        id: reservationId,
        title: updateDto.title || '오아시스를 직접 본다니',
        category: updateDto.category || '아구',
        reservationDatetime: updateDto.reservationDatetime || '2025-08-21T19:00:00+09:00',
        description: updateDto.description ?? '1순위로 E열 선정하기. 만약에 안되면 H도 괜찮아요',
        linkUrl: updateDto.linkUrl ?? 'https://example.com/reservation-link',
        imageUrls: updateDto.imageUrls ?? [
          'https://example.com/image1.jpg',
          'https://example.com/image2.jpg'
        ],
        hostId: 1,
        participantCount: 4,
        maxParticipants: 20,
        updatedAt: new Date().toISOString(),
      }
    };
  }

  @Get(':reservationId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '예약 상세 조회',
    description: '특정 예약의 상세 정보를 조회합니다. 예약 정보만 포함하며, 멤버 정보는 별도 API에서 조회합니다.',
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
      message: '유효하지 않은 토큰입니다.'
    }
  })
  @ApiResponse({
    status: 404,
    description: '예약을 찾을 수 없음',
    type: ErrorResponseDto,
    example: {
      code: '2000',
      message: '찾을 수 없는 예약입니다.'
    }
  })
  @ApiResponse({
    status: 403,
    description: '접근 권한 없음',
    type: ErrorResponseDto,
    examples: {
      notParticipant: {
        summary: '참가하지 않은 예약',
        value: {
          code: '2009',
          message: '해당 예약에 접근할 권한이 없습니다.'
        }
      },
      reservationNotStarted: {
        summary: '아직 시작되지 않은 예약 (시간 제한)',
        value: {
          code: '2010',
          message: '예약이 아직 시작되지 않았습니다.'
        }
      }
    }
  })
  @ApiResponse({
    status: 410,
    description: '예약이 종료됨',
    type: ErrorResponseDto,
    example: {
      code: '2011',
      message: '예약이 이미 종료되었습니다.'
    }
  })
  async getReservationDetail(
    @Param('reservationId', ParseIntPipe) reservationId: number
  ): Promise<GetReservationDetailResponseDto> {
   
    
    return {
      code: '200',
      message: 'OK',
      data: {
        id: reservationId,
        title: '오아시스를 직접 본다니',
        category: '공연',
        reservationDatetime: '2025-08-21T19:00:00+09:00',
        description: '1순위로 E열 선정하기. 만약에 안되면 H도 괜찮아요',
        linkUrl: 'https://example.com/reservation-link',
        imageUrls: [
          'https://example.com/image1.jpg',
          'https://example.com/image2.jpg',
          'https://example.com/image3.jpg'
        ],
        host: {
          id: 1,
          nickname: '김파디',
          profileImageName: 'IMG_001'
        },
        currentUser: {
          id: 123,
          status: 'default',
          isHost: false,
          canEdit: false,
          canJoin: false
        },
        participantCount: 4,
        maxParticipants: 6,
        createdAt: '2025-06-13T10:00:00Z',
        updatedAt: '2025-06-13T15:30:00Z'
      }
    };
  }
}