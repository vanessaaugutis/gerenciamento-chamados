import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1783956461652 implements MigrationInterface {
    name = 'InitialSchema1783956461652'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "categories" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "description" text, CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "histories" ("id" SERIAL NOT NULL, "change" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, "ticketId" integer, CONSTRAINT "PK_36b0e707452a8b674f9d95da743" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "email" character varying(150) NOT NULL, "password" character varying(255) NOT NULL, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tickets" ("id" SERIAL NOT NULL, "subject" character varying(150) NOT NULL, "description" text NOT NULL, "priority" character varying(20) NOT NULL DEFAULT 'Média', "status" character varying(30) NOT NULL DEFAULT 'Aberto', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "dueDate" date, "categoryId" integer, "responsibleId" integer, "requesterId" integer, CONSTRAINT "PK_343bc942ae261cf7a1377f48fd0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "comments" ("id" SERIAL NOT NULL, "text" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, "ticketId" integer, CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "histories" ADD CONSTRAINT "FK_0c320e3e56813ce3b175add32ba" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "histories" ADD CONSTRAINT "FK_0a02148994e800301d0141eb1a1" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tickets" ADD CONSTRAINT "FK_f47458a36c743b14e0371b70a6e" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tickets" ADD CONSTRAINT "FK_3fdafcae7969ff6bf165492ecb9" FOREIGN KEY ("responsibleId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tickets" ADD CONSTRAINT "FK_ffff1b4554585c0c9b95d062605" FOREIGN KEY ("requesterId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_7e8d7c49f218ebb14314fdb3749" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_469fc1a5c6798a3b7a6de4dfc6e" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_469fc1a5c6798a3b7a6de4dfc6e"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_7e8d7c49f218ebb14314fdb3749"`);
        await queryRunner.query(`ALTER TABLE "tickets" DROP CONSTRAINT "FK_ffff1b4554585c0c9b95d062605"`);
        await queryRunner.query(`ALTER TABLE "tickets" DROP CONSTRAINT "FK_3fdafcae7969ff6bf165492ecb9"`);
        await queryRunner.query(`ALTER TABLE "tickets" DROP CONSTRAINT "FK_f47458a36c743b14e0371b70a6e"`);
        await queryRunner.query(`ALTER TABLE "histories" DROP CONSTRAINT "FK_0a02148994e800301d0141eb1a1"`);
        await queryRunner.query(`ALTER TABLE "histories" DROP CONSTRAINT "FK_0c320e3e56813ce3b175add32ba"`);
        await queryRunner.query(`DROP TABLE "comments"`);
        await queryRunner.query(`DROP TABLE "tickets"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "histories"`);
        await queryRunner.query(`DROP TABLE "categories"`);
    }

}
