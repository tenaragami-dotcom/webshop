-- CreateTable
CREATE TABLE `coupon` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `discountPercent` INTEGER NOT NULL DEFAULT 10,
    `sourceOrderId` VARCHAR(191) NOT NULL,
    `issuedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NOT NULL,
    `usedAt` DATETIME(3) NULL,
    `usedOrderId` VARCHAR(191) NULL,

    UNIQUE INDEX `coupon_code_key`(`code`),
    UNIQUE INDEX `coupon_sourceOrderId_key`(`sourceOrderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable
ALTER TABLE `order` ADD COLUMN `couponId` VARCHAR(191) NULL,
    ADD COLUMN `discountAmount` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `coupon` ADD CONSTRAINT `coupon_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order` ADD CONSTRAINT `order_couponId_fkey` FOREIGN KEY (`couponId`) REFERENCES `coupon`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
