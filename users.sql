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

 Date: 11/06/2021 22:46:46
*/


-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS "public"."users";
CREATE TABLE "public"."users" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v1(),
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
-- Records of users
-- ----------------------------
INSERT INTO "public"."users" VALUES ('b1a972a6-595e-11eb-a851-853331335579', 'Panda Po', 'po@demo.com', '123456', 2, NULL, 'f', 'f', 'f', 'f', 'f', '2021-01-18 07:28:00.697878+00', 'f', 't', NULL);
INSERT INTO "public"."users" VALUES ('15716834-595f-11eb-a851-853331335579', 'Zira', 'zira@demo.com', '123456', 1, NULL, 'f', 'f', 'f', 'f', 'f', '2021-01-18 07:30:48.123163+00', 't', 't', NULL);
INSERT INTO "public"."users" VALUES ('f683408c-595e-11eb-a851-853331335579', 'Lucifer', 'lucifer@demo.com', '123456', 1, NULL, 'f', 'f', 'f', 'f', 'f', '2021-01-18 07:29:56.221101+00', 'f', 't', 5);
INSERT INTO "public"."users" VALUES ('a4eb8628-50c9-11eb-a07c-bf277141b12d', 'Super Oasis', 'trmlucifer2020@gmail.com', '123456', 0, NULL, 't', 't', 't', 't', 't', '2021-01-17 20:23:53.920941+00', 'f', 'f', NULL);
INSERT INTO "public"."users" VALUES ('095ff2de-50ce-11eb-a07c-bf277141b12d', 'Mohamed Omer', 'uaenic@gmail.com', 'Mm@3062011', 0, NULL, 't', 't', 't', 't', 't', '2021-01-17 20:23:53.920941+00', 'f', 't', 4);
INSERT INTO "public"."users" VALUES ('81aa5336-595e-11eb-a851-853331335579', 'Oogway', 'oogway@demo.com', '123456', 1, NULL, 't', 't', 't', 't', 't', '2021-01-18 07:26:39.535557+00', 'f', 't', NULL);
INSERT INTO "public"."users" VALUES ('d0c52e40-91ef-11eb-ac93-271d9b62dc35', 'spring', 'spring@gmail.com', 'Password123!', 1, NULL, 'f', 'f', 'f', 'f', 'f', '2021-03-31 07:07:54.906274+00', 'f', 't', NULL);
INSERT INTO "public"."users" VALUES ('0c400de2-ca84-11eb-b81a-e12587bcd1e3', 'Vu dung ', 'Vuvandung0519@outlook.com', 'tarademo', 1, NULL, 'f', 'f', 'f', 'f', 'f', '2021-06-11 07:10:05.284277+00', 'f', 't', NULL);

-- ----------------------------
-- Primary Key structure for table users
-- ----------------------------
ALTER TABLE "public"."users" ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");
