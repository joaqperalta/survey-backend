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

 Date: 31/07/2021 14:36:11
*/


-- ----------------------------
-- Table structure for organizations
-- ----------------------------
DROP TABLE IF EXISTS "public"."organizations";
CREATE TABLE "public"."organizations" (
  "id" SERIAL PRIMARY KEY,
  "name" text COLLATE "pg_catalog"."default",
  "created_at" timestamptz(6) DEFAULT now(),
  "is_deleted" bool DEFAULT false
)
;
