-- AlterTable
ALTER TABLE `product` DROP COLUMN `rehearsalPlanDays`,
    DROP COLUMN `rehearsalPlanPrice`;

-- AlterTable
ALTER TABLE `rentalbooking` MODIFY `planType` ENUM('STANDARD', 'TRY_ON') NOT NULL DEFAULT 'STANDARD';
