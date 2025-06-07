import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@/common/entity/base.entity';
import { User } from '@/users/entities/user.entity';

export enum NotificationType {
    REMINDER = 'REMINDER',
    POKE = 'POKE',
}

@Entity({ name: 'notification_logs' })
export class NotificationLog extends BaseEntity {
    @ManyToOne(() => User, user => user.receivedNotifications)
    @JoinColumn({ name: 'recipient_user_id' })
    recipientUser: User;

    @ManyToOne(() => User, user => user.sentNotifications, {
        nullable: true
    })

    @JoinColumn({ name: 'sender_user_id' })
    senderUser?: User;

    @Column({ type: 'enum', enum: NotificationType })
    notificationType: NotificationType;

    @Column()
    title: string;

    @Column()
    message: string;

    @Column({ name: 'is_read', default: false })
    isRead: boolean;

    @Column()
    scheduledAt: Date;

    @Column({ nullable: true })
    sentAt?: Date;

    @Column({ name: 'device_id' })
    deviceId: string;
}