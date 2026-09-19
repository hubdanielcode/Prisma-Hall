/*
  Warnings:

  - You are about to drop the column `cep` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `cpf` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `uf` on the `profiles` table. All the data in the column will be lost.
  - Added the required column `CEP` to the `profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `CPF` to the `profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `UF` to the `profiles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "cep",
DROP COLUMN "cpf",
DROP COLUMN "uf",
ADD COLUMN     "CEP" TEXT NOT NULL,
ADD COLUMN     "CPF" TEXT NOT NULL,
ADD COLUMN     "UF" TEXT NOT NULL;
