-- CreateEnum
CREATE TYPE "Prioridade" AS ENUM ('alta', 'media', 'baixa');

-- CreateTable
CREATE TABLE "Lista" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3),
    "moeda" TEXT NOT NULL DEFAULT 'BRL',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lista_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "listaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "descricao" TEXT,
    "imagemUrl" TEXT,
    "prioridade" "Prioridade" NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "preco" DOUBLE PRECISION NOT NULL,
    "cotas" INTEGER,
    "cotasReservadas" INTEGER NOT NULL DEFAULT 0,
    "cotasValor" DOUBLE PRECISION,
    "reservado" BOOLEAN NOT NULL DEFAULT false,
    "reservadoPor" TEXT,
    "reservadoEm" TIMESTAMP(3),
    "compradoFora" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lista_slug_key" ON "Lista"("slug");

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_listaId_fkey" FOREIGN KEY ("listaId") REFERENCES "Lista"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
