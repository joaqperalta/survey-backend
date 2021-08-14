/*
 Navicat Premium Data Transfer

 Source Server         : ddddd
 Source Server Type    : PostgreSQL
 Source Server Version : 130001
 Source Host           : 34.230.165.54:5432
 Source Catalog        : surveywizard
 Source Schema         : public

 Target Server Type    : PostgreSQL
 Target Server Version : 130001
 File Encoding         : 65001

 Date: 11/06/2021 22:47:34
*/


-- ----------------------------
-- Table structure for users_profiles
-- ----------------------------
DROP TABLE IF EXISTS "public"."users_profiles";
CREATE TABLE "public"."users_profiles" (
  "user_id" uuid NOT NULL,
  "location" text COLLATE "pg_catalog"."default" DEFAULT ''::text,
  "birthday" date,
  "gender" text COLLATE "pg_catalog"."default" DEFAULT ''::text,
  "short_description" text COLLATE "pg_catalog"."default" DEFAULT ''::text,
  "long_description" text COLLATE "pg_catalog"."default" DEFAULT ''::text
)
;

-- ----------------------------
-- Records of users_profiles
-- ----------------------------
INSERT INTO "public"."users_profiles" VALUES ('095ff2de-50ce-11eb-a07c-bf277141b12d', 'Dubai, UAE', '1979-12-31', 'male', 'I am a super manager of Survey Wizard.', '');

-- ----------------------------
-- Primary Key structure for table users_profiles
-- ----------------------------
ALTER TABLE "public"."users_profiles" ADD CONSTRAINT "users_profiles_pkey" PRIMARY KEY ("user_id");
