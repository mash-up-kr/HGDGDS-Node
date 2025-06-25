import { ReservationCategory } from '@/common/enums/reservation-category';
import { User } from '@/users/entities/user.entity';

export class CreateReservationDto {
  title: string;
  category: ReservationCategory;
  reservationDatetime: Date;
  description?: string;
  linkUrl?: string;
  // hostId: number;
  host: User;
  similarGroupId?: number;
  images?: string[];

  constructor(
    title: string,
    category: ReservationCategory,
    reservationDatetime: Date,
    // hostId: number,
    host: User,
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
    // this.hostId = hostId;
    this.host = host;
    this.similarGroupId = similarGroupId;
    this.images = images;
  }
}
