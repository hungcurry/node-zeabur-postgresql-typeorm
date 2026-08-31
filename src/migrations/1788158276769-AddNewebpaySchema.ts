import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddNewebpaySchema1788158276769 implements MigrationInterface {
    name = 'AddNewebpaySchema1788158276769'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "neweb_users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(50) NOT NULL, "email" character varying(320) NOT NULL, "role" character varying(20) NOT NULL, "password" character varying(72) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_35ffe22af4a2181ab8618a9dcf3" UNIQUE ("email"), CONSTRAINT "PK_7e9407ffde8a0aaa868fe9361c9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "course_plans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(50) NOT NULL, "credit_amount" integer NOT NULL, "price" numeric(10,2) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_6063ba74bf2bd220617fbc90b79" UNIQUE ("name"), CONSTRAINT "PK_f56d71bb8a12de915ead316a305" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "neweb_orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "merchant_order_no" character varying(30) NOT NULL, "amount" integer NOT NULL, "purchased_credits" integer NOT NULL, "payment_status" character varying(20) NOT NULL DEFAULT 'unpaid', "newebpay_trade_no" character varying(30), "payment_type" character varying(20), "paid_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "neweb_users_id" uuid NOT NULL, "course_plans_id" uuid NOT NULL, CONSTRAINT "UQ_fd804187277223d4823a84c8f01" UNIQUE ("merchant_order_no"), CONSTRAINT "PK_2ee6feff84347b8a4efb79e7ff6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "credit_purchases" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "purchased_credits" integer NOT NULL, "price_paid" numeric(10,2) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "purchase_at" TIMESTAMP WITH TIME ZONE NOT NULL, "neweb_users_id" uuid NOT NULL, "course_plans_id" uuid NOT NULL, CONSTRAINT "PK_89d96f2901d625d5879c1bc6f47" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "neweb_orders" ADD CONSTRAINT "np_order_neweb_users_id_fk" FOREIGN KEY ("neweb_users_id") REFERENCES "neweb_users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "neweb_orders" ADD CONSTRAINT "np_order_course_plans_id_fk" FOREIGN KEY ("course_plans_id") REFERENCES "course_plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "credit_purchases" ADD CONSTRAINT "credit_purchase_neweb_users_id_fk" FOREIGN KEY ("neweb_users_id") REFERENCES "neweb_users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "credit_purchases" ADD CONSTRAINT "credit_purchase_course_plans_id_fk" FOREIGN KEY ("course_plans_id") REFERENCES "course_plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "credit_purchases" DROP CONSTRAINT "credit_purchase_course_plans_id_fk"`);
        await queryRunner.query(`ALTER TABLE "credit_purchases" DROP CONSTRAINT "credit_purchase_neweb_users_id_fk"`);
        await queryRunner.query(`ALTER TABLE "neweb_orders" DROP CONSTRAINT "np_order_course_plans_id_fk"`);
        await queryRunner.query(`ALTER TABLE "neweb_orders" DROP CONSTRAINT "np_order_neweb_users_id_fk"`);
        await queryRunner.query(`DROP TABLE "credit_purchases"`);
        await queryRunner.query(`DROP TABLE "neweb_orders"`);
        await queryRunner.query(`DROP TABLE "course_plans"`);
        await queryRunner.query(`DROP TABLE "neweb_users"`);
    }

}
