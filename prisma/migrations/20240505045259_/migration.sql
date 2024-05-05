/*
  Warnings:

  - You are about to drop the column `paymentMethodId` on the `payment` table. All the data in the column will be lost.
  - The primary key for the `paymentmethod` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `type` on the `paymentmethod` table. All the data in the column will be lost.
  - Added the required column `paymentMethod` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `payment` DROP FOREIGN KEY `Payment_paymentMethodId_fkey`;

-- AlterTable
ALTER TABLE `payment` DROP COLUMN `paymentMethodId`,
    ADD COLUMN `paymentMethod` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `paymentmethod` DROP PRIMARY KEY,
    DROP COLUMN `type`,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_paymentMethod_fkey` FOREIGN KEY (`paymentMethod`) REFERENCES `PaymentMethod`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
