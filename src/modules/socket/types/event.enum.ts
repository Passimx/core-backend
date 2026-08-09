export enum EventsEnum {
  CALL_ACTION = 'call_action',
  REPLY_ACTION = 'reply_action',
  CREATE_CHANNEL = 'create_channel',
  SEND_TO_CHANNEL = 'send_to_channel',
  JOIN_CONNECTION_TO_CHANNELS = 'join_connection_to_channels',
  LEAVE_CONNECTION_TO_CHANNELS = 'leave_connection_to_channels',

  LOGIN = 'login',
  CREATE_USER = 'create_user',
  SEND_ENCRYPTED_SEED_PHRASE = 'send_encrypted_seed_phrase',
  GET_CONNECTION_RSA_PUBLIC_KEY_STRING = 'get_connection_rsa_public_key_string',
  GET_APPS = 'get_apps',
}
