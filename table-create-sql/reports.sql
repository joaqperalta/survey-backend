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

 Date: 31/07/2021 15:11:06
*/


-- ----------------------------
-- Table structure for reports
-- ----------------------------
DROP TABLE IF EXISTS "public"."reports";
CREATE TABLE "public"."reports" (
  "id" SERIAL PRIMARY KEY,
  "name" text COLLATE "pg_catalog"."default",
  "survey_id" int4,
  "user_id" uuid,
  "type" text COLLATE "pg_catalog"."default",
  "filter" json,
  "sections" json,
  "created_at" timestamptz(6) DEFAULT now(),
  "is_deleted" bool DEFAULT false,
  "share_id" uuid DEFAULT uuid_generate_v1()
)
;
