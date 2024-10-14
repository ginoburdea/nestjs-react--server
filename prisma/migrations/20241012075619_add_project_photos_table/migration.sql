-- CreateTable
CREATE TABLE "ProjectPhotos" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "ProjectPhotos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProjectPhotos" ADD CONSTRAINT "ProjectPhotos_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
