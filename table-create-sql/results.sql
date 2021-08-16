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

 Date: 01/08/2021 11:07:45
*/


-- ----------------------------
-- Table structure for results
-- ----------------------------
DROP TABLE IF EXISTS "public"."results";
CREATE TABLE "public"."results" (
  "id" SERIAL PRIMARY KEY,
  "json" json,
  "survey_id" int4,
  "user_id" uuid,
  "time_spent" int4,
  "ip_address" inet DEFAULT '0.0.0.0'::inet,
  "is_completed" bool DEFAULT false,
  "created_at" timestamptz(6) DEFAULT now(),
  "updated_at" timestamptz(6) DEFAULT CURRENT_TIMESTAMP,
  "is_manual" bool DEFAULT false,
  "respondent_name" text COLLATE "pg_catalog"."default",
  "weblink_link_id" text COLLATE "pg_catalog"."default",
  "emaillink_link_id" text COLLATE "pg_catalog"."default",
  "emaillink_contact_id" int4
)
;
