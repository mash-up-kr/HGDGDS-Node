import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@/common/entity/base.entity';
import { User } from '@/users/entities/user.entity';
import { NotificationType } from '@/common/enums/notification-type';

@Entity({ name: 'notification_logs' })
export class NotificationLog extends BaseEntity {
  @ManyToOne(() => User)
  @JoinColumn({ name: 'recipient_user_id' })
  recipientUser: User;

  @ManyToOne(() => User, {
    nullable: true,
  })
  @JoinColumn({ name: 'sender_user_id' })
  senderUser?: User;

  @Column({ name: 'notification_type', type: 'enum', enum: NotificationType })
  notificationType: NotificationType;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'is_read', default: false, type: 'boolean' })
  isRead: boolean;

  @Column({ name: 'scheduled_at', type: 'timestamp' })
  scheduledAt: Date;

  @Column({ name: 'sent_at', nullable: true, type: 'timestamp' })
  sentAt: Date | null;

  @Column({ name: 'device_id', type: 'text' })
  deviceId: string;
}
