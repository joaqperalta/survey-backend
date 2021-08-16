/*
 Navicat Premium Data Transfer

 Source Server         : connection1
 Source Server Type    : PostgreSQL
 Source Server Version : 130001
 Source Host           : localhost:5432
 Source Catalog        : surveywizard
 Source Schema         : public

 Target Server Type    : PostgreSQL
 Target Server Version : 130001
 File Encoding         : 65001

 Date: 31/07/2021 14:31:23
*/


-- ----------------------------
-- Table structure for surveys
-- ----------------------------
DROP TABLE IF EXISTS "public"."surveys";
CREATE TABLE "public"."surveys" (
  "id" uuid,
  "name" text COLLATE "pg_catalog"."default",
  "json" json,
  "user_id" uuid,
  "is_share" bool DEFAULT false,
  "is_active" bool DEFAULT false,
  "is_deleted" bool DEFAULT false,
  "created_at" timestamptz(6) DEFAULT now(),
  "updated_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
  "category_id" uuid,
  "is_multi_responses" bool DEFAULT false
)
;

-- ----------------------------
-- Primary Key structure for table surveys
-- ----------------------------
ALTER TABLE "public"."surveys" ADD CONSTRAINT "surveys_pkey" PRIMARY KEY ("id");
