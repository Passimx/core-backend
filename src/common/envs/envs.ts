import * as process from 'process';
import { config } from 'dotenv';
import { NumbersUtils } from '../utils/numbers.utils';
import { BooleanUtils } from '../utils/boolean.utils';

config();

export const Envs = {
  app: {
    host: '0.0.0.0',
    socketPort: NumbersUtils.toNumberOrDefault(
      process.env.NOTIFICATION_SERVICE_SOCKET_PORT_NOTIFICATIONT,
      7022,
    ),
    pingTime: NumbersUtils.toNumberOrDefault(process.env.PING_TIME, 25000),
    appPort: NumbersUtils.toNumberOrDefault(
      process.env.NOTIFICATION_SERVICE_APP_PORT,
      7021,
    ),
    appSalt: 'sha256',
  },
  database: {
    host: process.env.PG_HOST,
    port: Number(process.env.PG_PORT),
    database: process.env.PG_DATABASE,
    username: process.env.PG_USERNAME,
    password: process.env.PG_PASSWORD,
  },
  kafka: {
    host: process.env.KAFKA_HOST || 'kafka',
    port: NumbersUtils.toNumberOrDefault(process.env.KAFKA_EXTERNAL_PORT, 9094),
    user: process.env.KAFKA_CLIENT_USERS || 'user',
    password: process.env.KAFKA_USER_PASSWORD || 'bitnami',
    groupId: process.env.CHATS_SERVICE_KAFKA_GROUP_ID || 'core-local',
    kafkaIsConnect: BooleanUtils.strToBoolWithDefault(
      process.env.KAFKA_IS_CONNECT,
      true,
    ),
  },
};
