export enum EventsEnum {
  PONG = 'pong',
  LOGOUT = 'logout',
  LOGIN = 'login',
  CREATE_USER = 'create_user',
  SET_CONNECTION_RSA_PUBLIC_KEY_STRING = 'set_connection_public_key_string',
  SEND_MESSAGE_TO_CONNECTION = 'send_message_to_connection',
  SEND_ENCRYPTED_SEED_PHRASE = 'send_encrypted_seed_phrase',
  GET_CONNECTION_RSA_PUBLIC_KEY_STRING = 'get_connection_rsa_public_key_string',
  UPDATE_USER = 'update_user',
  SET_STATE_APP = 'set_state_app',
  VERIFY = 'verify',

  GET_APPS = 'get_apps',

  RESEND_ASYNC_MESSAGE = 'resend_async_message',
}
