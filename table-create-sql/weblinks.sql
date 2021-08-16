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

 Date: 31/07/2021 14:34:47
*/


-- ----------------------------
-- Table structure for weblinks
-- ----------------------------
DROP TABLE IF EXISTS "public"."weblinks";
CREATE TABLE "public"."weblinks" (
  "id" uuid,
  "name" text COLLATE "pg_catalog"."default",
  "link_id" text COLLATE "pg_catalog"."default",
  "survey_id" int4,
  "close_quota" int4,
  "close_date" date,
  "is_active" bool,
  "created_at" timestamptz(6) DEFAULT now(),
  "is_deleted" bool DEFAULT false,
  "user_id" uuid,
  "is_multiple" bool
)
;

-- ----------------------------
-- Primary Key structure for table weblinks
-- ----------------------------
ALTER TABLE "public"."weblinks" ADD CONSTRAINT "weblinks_pkey" PRIMARY KEY ("id");
