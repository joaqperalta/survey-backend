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

 Date: 31/07/2021 14:25:44
*/


-- ----------------------------
-- Table structure for emaillinks_contacts
-- ----------------------------
DROP TABLE IF EXISTS "public"."emaillinks_contacts";
CREATE TABLE "public"."emaillinks_contacts" (
  "id" SERIAL PRIMARY KEY,
  "link_id" text COLLATE "pg_catalog"."default",
  "email_address" text COLLATE "pg_catalog"."default",
  "first_name" text COLLATE "pg_catalog"."default",
  "last_name" text COLLATE "pg_catalog"."default",
  "status" text COLLATE "pg_catalog"."default",
  "is_open" bool DEFAULT false,
  "is_responded" bool DEFAULT false,
  "result_id" int4
)
;
