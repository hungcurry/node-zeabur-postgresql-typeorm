import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddArticleSchema1785134269557 implements MigrationInterface {
    name = 'AddArticleSchema1785134269557'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."articles_status_enum" AS ENUM('draft', 'published')`);
        await queryRunner.query(`CREATE TABLE "articles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "content" text NOT NULL, "status" "public"."articles_status_enum" NOT NULL DEFAULT 'draft', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_0a6e2c450d83e0b6052c2793334" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_articles_created_at" ON "articles"  ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "idx_articles_title" ON "articles"  ("title") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_articles_title"`);
        await queryRunner.query(`DROP INDEX "public"."idx_articles_created_at"`);
        await queryRunner.query(`DROP TABLE "articles"`);
        await queryRunner.query(`DROP TYPE "public"."articles_status_enum"`);
    }

}
