-- AlterTable
ALTER TABLE `order` ADD COLUMN `cancelledAt` DATETIME(3) NULL,
    ADD COLUMN `cancellationFee` INTEGER NULL;
