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

 Date: 31/07/2021 14:23:54
*/


-- ----------------------------
-- Table structure for emaillinks
-- ----------------------------
DROP TABLE IF EXISTS "public"."emaillinks";
CREATE TABLE "public"."emaillinks" (
  "id" uuid NOT NULL,
  "name" text COLLATE "pg_catalog"."default",
  "link_id" text COLLATE "pg_catalog"."default",
  "survey_id" int4,
  "email_content" text COLLATE "pg_catalog"."default",
  "sender_name" text COLLATE "pg_catalog"."default",
  "sender_email" text COLLATE "pg_catalog"."default",
  "close_quota" int4,
  "close_date" date,
  "contacts_file" text COLLATE "pg_catalog"."default",
  "is_sent" bool DEFAULT false,
  "created_at" timestamptz(6) DEFAULT now(),
  "is_deleted" bool DEFAULT false,
  "user_id" uuid
)
;
