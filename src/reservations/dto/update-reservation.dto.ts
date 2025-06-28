import { ReservationCategory } from '@/common/enums/reservation-category';

export class UpdateReservationDto {
  readonly title?: string;
  readonly category?: ReservationCategory;
  readonly reservationDatetime?: Date;
  readonly description?: string;
  readonly linkUrl?: string;
  readonly images?: string[];

  constructor(
    title?: string,
    category?: ReservationCategory,
    reservationDatetime?: Date,
    description?: string,
    linkUrl?: string,
    images?: string[],
  ) {
    this.title = title;
    this.category = category;
    this.reservationDatetime = reservationDatetime;
    this.description = description;
    this.linkUrl = linkUrl;
    this.images = images;
  }
}
