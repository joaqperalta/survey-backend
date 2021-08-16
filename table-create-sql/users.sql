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

 Date: 31/07/2021 14:32:00
*/


-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS "public"."users";
CREATE TABLE "public"."users" (
  "id" uuid NOT NULL,
  "name" text COLLATE "pg_catalog"."default",
  "email" text COLLATE "pg_catalog"."default",
  "password" text COLLATE "pg_catalog"."default",
  "role" int4 DEFAULT 1,
  "avatar" text COLLATE "pg_catalog"."default",
  "p_create" bool DEFAULT false,
  "p_edit" bool DEFAULT false,
  "p_view" bool DEFAULT false,
  "p_copy" bool DEFAULT false,
  "p_delete" bool DEFAULT false,
  "created_at" timestamptz(6) DEFAULT now(),
  "is_deleted" bool DEFAULT false,
  "is_active" bool DEFAULT true,
  "organization_id" int4
)
;

-- ----------------------------
-- Primary Key structure for table users
-- ----------------------------
ALTER TABLE "public"."users" ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");
