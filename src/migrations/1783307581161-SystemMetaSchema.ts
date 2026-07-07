import type { MigrationInterface, QueryRunner } from 'typeorm'

export class SystemMetaSchema1783307581161 implements MigrationInterface {
  name = 'SystemMetaSchema1783307581161'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "system_metas" ("key" character varying(255) NOT NULL, "value" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d8867fe7f93f296504fc71c05bf" PRIMARY KEY ("key"))`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "system_metas"`)
  }
}
