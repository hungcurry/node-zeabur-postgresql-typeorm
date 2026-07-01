import type { MigrationInterface, QueryRunner } from 'typeorm'

export class InitProject1782885693122 implements MigrationInterface {
  name = 'InitProject1782885693122'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "age" integer, "name" character varying(255), "role" character varying(255), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "profiles" ("id" integer NOT NULL, "name" character varying(50) NOT NULL, CONSTRAINT "PK_8e520eb4da7dc01d0e190447c8e" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "orders" ("id" SERIAL NOT NULL, "amount" integer NOT NULL, "createdAt" bigint NOT NULL, "updatedAt" bigint NOT NULL, "profile_id" integer NOT NULL, CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "price" integer NOT NULL, "stock" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "category_id" uuid NOT NULL, CONSTRAINT "UQ_c30f00a871de74c8e8c213acc4a" UNIQUE ("title"), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "order_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "product_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "product_category_id_fk"`)
    await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "order_profile_id_fk"`)
    await queryRunner.query(`DROP TABLE "products"`)
    await queryRunner.query(`DROP TABLE "orders"`)
    await queryRunner.query(`DROP TABLE "categories"`)
    await queryRunner.query(`DROP TABLE "profiles"`)
    await queryRunner.query(`DROP TABLE "users"`)
  }
}
