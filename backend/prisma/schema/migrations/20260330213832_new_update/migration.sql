-- CreateIndex
CREATE INDEX "Post_createdAt_status_idx" ON "Post"("createdAt", "status");

-- CreateIndex
CREATE INDEX "Product_status_deletedAt_idx" ON "Product"("status", "deletedAt");

-- CreateIndex
CREATE INDEX "Product_storeId_idx" ON "Product"("storeId");

-- CreateIndex
CREATE INDEX "Property_status_deletedAt_idx" ON "Property"("status", "deletedAt");

-- CreateIndex
CREATE INDEX "Property_listingType_idx" ON "Property"("listingType");

-- CreateIndex
CREATE INDEX "Property_city_idx" ON "Property"("city");
