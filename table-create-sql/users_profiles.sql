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

 Date: 31/07/2021 14:33:52
*/


-- ----------------------------
-- Table structure for users_profiles
-- ----------------------------
DROP TABLE IF EXISTS "public"."users_profiles";
CREATE TABLE "public"."users_profiles" (
  "user_id" uuid,
  "location" text COLLATE "pg_catalog"."default" DEFAULT ''::text,
  "birthday" date,
  "gender" text COLLATE "pg_catalog"."default" DEFAULT ''::text,
  "short_description" text COLLATE "pg_catalog"."default" DEFAULT ''::text,
  "long_description" text COLLATE "pg_catalog"."default" DEFAULT ''::text
)
;

-- ----------------------------
-- Primary Key structure for table users_profiles
-- ----------------------------
ALTER TABLE "public"."users_profiles" ADD CONSTRAINT "users_profiles_pkey" PRIMARY KEY ("user_id");
