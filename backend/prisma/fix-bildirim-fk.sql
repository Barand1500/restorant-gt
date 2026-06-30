-- Prisma db push bazen MySQL'de FK indeksini once silmeye calisir ve hata verir.
-- Bu dosya FK'yi kaldirip push'un yeniden olusturmasina izin verir.
ALTER TABLE `bildirim` DROP FOREIGN KEY `bildirim_sube_id_fkey`;
