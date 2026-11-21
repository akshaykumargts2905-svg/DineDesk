-- Step 1: Normalize any existing orders that had legacy statuses
UPDATE "Order" SET "status" = 'CONFIRMED' WHERE "status"::text = 'PLACED';
UPDATE "Order" SET "status" = 'READY' WHERE "status"::text IN ('SERVED', 'COMPLETED', 'CANCELLED');

-- Step 2: Normalize any existing order status history
UPDATE "OrderStatusHistory" SET "fromStatus" = 'CONFIRMED' WHERE "fromStatus"::text = 'PLACED';
UPDATE "OrderStatusHistory" SET "fromStatus" = 'READY' WHERE "fromStatus"::text IN ('SERVED', 'COMPLETED', 'CANCELLED');

UPDATE "OrderStatusHistory" SET "toStatus" = 'CONFIRMED' WHERE "toStatus"::text = 'PLACED';
UPDATE "OrderStatusHistory" SET "toStatus" = 'READY' WHERE "toStatus"::text IN ('SERVED', 'COMPLETED', 'CANCELLED');

-- Step 3: Alter the OrderStatus enum to only ('CONFIRMED', 'ACCEPTED', 'PREPARING', 'READY')
CREATE TYPE "OrderStatus_new" AS ENUM ('CONFIRMED', 'ACCEPTED', 'PREPARING', 'READY');

ALTER TABLE "Order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TABLE "OrderStatusHistory" ALTER COLUMN "fromStatus" TYPE "OrderStatus_new" USING ("fromStatus"::text::"OrderStatus_new");
ALTER TABLE "OrderStatusHistory" ALTER COLUMN "toStatus" TYPE "OrderStatus_new" USING ("toStatus"::text::"OrderStatus_new");

ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "OrderStatus_old";

ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'CONFIRMED';
