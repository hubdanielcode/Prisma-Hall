/*
  Warnings:

  - You are about to drop the column `CEP` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `CPF` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `UF` on the `profiles` table. All the data in the column will be lost.
  - Added the required column `socialSecurityNumber` to the `profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zipCode` to the `profiles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "CEP",
DROP COLUMN "CPF",
DROP COLUMN "UF",
ADD COLUMN     "socialSecurityNumber" TEXT NOT NULL,
ADD COLUMN     "state" TEXT NOT NULL,
ADD COLUMN     "zipCode" TEXT NOT NULL;
