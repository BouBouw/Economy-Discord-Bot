-- CreateTable
CREATE TABLE "profiles" (
    "id" SERIAL NOT NULL,
    "premium_type" INTEGER NOT NULL DEFAULT 0,
    "language" TEXT NOT NULL DEFAULT 'FR_fr',
    "user_id" TEXT NOT NULL,
    "display_name" TEXT,
    "background_url" TEXT,
    "experiences" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "balance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "in_bank" DECIMAL(10,2) NOT NULL DEFAULT 150,
    "cryptocurrencies" DECIMAL(16,9) NOT NULL DEFAULT 0,
    "credit_card" INTEGER NOT NULL DEFAULT 0,
    "reputations" INTEGER NOT NULL DEFAULT 0,
    "boost_int" INTEGER NOT NULL DEFAULT 0,
    "boost_duration" TIMESTAMP(3),
    "jobs" INTEGER,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "job_type" INTEGER,
    "experiences" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "daily_timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market" (
    "id" SERIAL NOT NULL,
    "cryptocurrencie_price" DECIMAL(10,2) NOT NULL DEFAULT 10,
    "current_price" DECIMAL(10,2) NOT NULL DEFAULT 10,
    "total_supply" DECIMAL(15,2) NOT NULL DEFAULT 1000000,
    "remaining_supply" DECIMAL(15,2) NOT NULL DEFAULT 1000000,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "market_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_sent" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "message_count" INTEGER NOT NULL DEFAULT 0,
    "last_update" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_sent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "transaction_type" INTEGER,
    "amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "cryptocurrencie" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voice_time" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "time_spent" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "voice_time_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blockchain_blocks" (
    "id" SERIAL NOT NULL,
    "hash" TEXT NOT NULL,
    "previous_hash" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "nonce" INTEGER NOT NULL,

    CONSTRAINT "blockchain_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blockchain_transactions" (
    "id" SERIAL NOT NULL,
    "block_hash" TEXT NOT NULL,
    "from_user" TEXT NOT NULL,
    "to_user" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "type" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blockchain_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crypto_history" (
    "id" SERIAL NOT NULL,
    "price" DECIMAL(10,6) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crypto_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "groups" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "group_players" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "invited_player" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "games_hosted" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "hostID" TEXT NOT NULL,
    "gameType" INTEGER NOT NULL,
    "gameMode" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "games_hosted_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_players" (
    "id" SERIAL NOT NULL,
    "game_uuid" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_players_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "message_sent_user_id_guild_id_channel_id_key" ON "message_sent"("user_id", "guild_id", "channel_id");

-- CreateIndex
CREATE UNIQUE INDEX "blockchain_blocks_hash_key" ON "blockchain_blocks"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "groups_uuid_key" ON "groups"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "games_hosted_uuid_key" ON "games_hosted"("uuid");

-- AddForeignKey
ALTER TABLE "blockchain_transactions" ADD CONSTRAINT "blockchain_transactions_block_hash_fkey" FOREIGN KEY ("block_hash") REFERENCES "blockchain_blocks"("hash") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_players" ADD CONSTRAINT "game_players_game_uuid_fkey" FOREIGN KEY ("game_uuid") REFERENCES "games_hosted"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
