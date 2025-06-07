import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration202506080343081749321789003 implements MigrationInterface {
    name = 'Migration202506080343081749321789003'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "similar_groups" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_e7a98c8a9bb175e1a1d12f5d2b4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "reservation_results" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "isSuccess" boolean NOT NULL, "description" character varying, "successDatetime" TIMESTAMP, "reservation_id" integer, "user_id" integer, CONSTRAINT "PK_f0885885a50a00e5074ab8a857f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_reservations_status_enum" AS ENUM('기본', '준비완료', '실패', '성공')`);
        await queryRunner.query(`CREATE TABLE "user_reservations" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "status" "public"."user_reservations_status_enum" NOT NULL DEFAULT '기본', "status_message" character varying, "user_id" integer, "reservation_id" integer, CONSTRAINT "PK_b23a4d5bd06a7ab41c26f2aee1f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."reservations_category_enum" AS ENUM('맛집', '액티비티', '공연', '운동경기', '기타')`);
        await queryRunner.query(`CREATE TABLE "reservations" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "title" character varying NOT NULL, "category" "public"."reservations_category_enum" NOT NULL, "reservationDatetime" TIMESTAMP NOT NULL, "description" character varying, "linkUrl" character varying, "host_id" integer, "similar_group_id" integer, CONSTRAINT "PK_da95cef71b617ac35dc5bcda243" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."notification_logs_notificationtype_enum" AS ENUM('REMINDER', 'POKE')`);
        await queryRunner.query(`CREATE TABLE "notification_logs" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "notificationType" "public"."notification_logs_notificationtype_enum" NOT NULL, "title" character varying NOT NULL, "message" character varying NOT NULL, "is_read" boolean NOT NULL DEFAULT false, "scheduledAt" TIMESTAMP NOT NULL, "sentAt" TIMESTAMP, "device_id" character varying NOT NULL, "recipient_user_id" integer, "sender_user_id" integer, CONSTRAINT "PK_19c524e644cdeaebfcffc284871" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."images_parent_type_enum" AS ENUM('USER_PROFILE', 'RESERVATION', 'RESERVATION_RESULT')`);
        await queryRunner.query(`CREATE TABLE "images" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "s3_file_path" character varying NOT NULL, "parent_type" "public"."images_parent_type_enum" NOT NULL, "parent_id" integer NOT NULL, CONSTRAINT "PK_1fe148074c6a1a91b63cb9ee3c9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isActive"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" ADD "profile_url" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD "device_id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_69c064f0f99e36e4e44c702d673" UNIQUE ("device_id")`);
        await queryRunner.query(`ALTER TABLE "users" ADD "reservation_alarm_setting" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "users" ADD "poke_alarm_setting" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "nickname"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "nickname" character varying NOT NULL`);
        await queryRunner.query(`ALTER TYPE "public"."users_role_enum" RENAME TO "users_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('HOST', 'GUEST')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum" USING "role"::"text"::"public"."users_role_enum"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'GUEST'`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum_old"`);
        await queryRunner.query(`ALTER TABLE "reservation_results" ADD CONSTRAINT "FK_5ece74ea6924483669d6c8f767b" FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservation_results" ADD CONSTRAINT "FK_9cc4eb446f5e54e2426d37edd93" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_reservations" ADD CONSTRAINT "FK_a64268156f8624383e60727a697" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_reservations" ADD CONSTRAINT "FK_ab877df6831b2f7ef6eb51e4337" FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservations" ADD CONSTRAINT "FK_6679bd78b746f077f4152fc405e" FOREIGN KEY ("host_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reservations" ADD CONSTRAINT "FK_e15557ca53f6d9f489cecebb783" FOREIGN KEY ("similar_group_id") REFERENCES "similar_groups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification_logs" ADD CONSTRAINT "FK_4a106b58808f39fff82df34e55c" FOREIGN KEY ("recipient_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification_logs" ADD CONSTRAINT "FK_11f701b91c189d4e44430d4d782" FOREIGN KEY ("sender_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification_logs" DROP CONSTRAINT "FK_11f701b91c189d4e44430d4d782"`);
        await queryRunner.query(`ALTER TABLE "notification_logs" DROP CONSTRAINT "FK_4a106b58808f39fff82df34e55c"`);
        await queryRunner.query(`ALTER TABLE "reservations" DROP CONSTRAINT "FK_e15557ca53f6d9f489cecebb783"`);
        await queryRunner.query(`ALTER TABLE "reservations" DROP CONSTRAINT "FK_6679bd78b746f077f4152fc405e"`);
        await queryRunner.query(`ALTER TABLE "user_reservations" DROP CONSTRAINT "FK_ab877df6831b2f7ef6eb51e4337"`);
        await queryRunner.query(`ALTER TABLE "user_reservations" DROP CONSTRAINT "FK_a64268156f8624383e60727a697"`);
        await queryRunner.query(`ALTER TABLE "reservation_results" DROP CONSTRAINT "FK_9cc4eb446f5e54e2426d37edd93"`);
        await queryRunner.query(`ALTER TABLE "reservation_results" DROP CONSTRAINT "FK_5ece74ea6924483669d6c8f767b"`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum_old" AS ENUM('superuser', 'staff', 'user')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum_old" USING "role"::"text"::"public"."users_role_enum_old"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'user'`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."users_role_enum_old" RENAME TO "users_role_enum"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "nickname"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "nickname" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "poke_alarm_setting"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "reservation_alarm_setting"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_69c064f0f99e36e4e44c702d673"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "device_id"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "profile_url"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "isActive" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "users" ADD "password" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD "email" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")`);
        await queryRunner.query(`DROP TABLE "images"`);
        await queryRunner.query(`DROP TYPE "public"."images_parent_type_enum"`);
        await queryRunner.query(`DROP TABLE "notification_logs"`);
        await queryRunner.query(`DROP TYPE "public"."notification_logs_notificationtype_enum"`);
        await queryRunner.query(`DROP TABLE "reservations"`);
        await queryRunner.query(`DROP TYPE "public"."reservations_category_enum"`);
        await queryRunner.query(`DROP TABLE "user_reservations"`);
        await queryRunner.query(`DROP TYPE "public"."user_reservations_status_enum"`);
        await queryRunner.query(`DROP TABLE "reservation_results"`);
        await queryRunner.query(`DROP TABLE "similar_groups"`);
    }

}
