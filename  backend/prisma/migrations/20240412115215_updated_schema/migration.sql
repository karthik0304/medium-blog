/*
  Warnings:

  - You are about to drop the column `contentt` on the `post` table. All the data in the column will be lost.
  - Added the required column `content` to the `post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "post" DROP COLUMN "contentt",
ADD COLUMN     "content" TEXT NOT NULL;
