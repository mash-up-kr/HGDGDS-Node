import { ReservationCategory } from '@/common/enums/reservation-category';

export class CreateReservationDto {
  title: string;
  category: ReservationCategory;
  reservationDatetime: Date;
  description?: string;
  linkUrl?: string;
  hostId: number;
  similarGroupId?: number;
  images?: string[];

  constructor(
    title: string,
    category: ReservationCategory,
    reservationDatetime: Date,
    hostId: number,
    description?: string,
    linkUrl?: string,
    images?: string[],
    similarGroupId?: number,
  ) {
    this.title = title;
    this.category = category;
    this.reservationDatetime = reservationDatetime;
    this.description = description;
    this.linkUrl = linkUrl;
    this.hostId = hostId;
    this.similarGroupId = similarGroupId;
    this.images = images;
  }
}
