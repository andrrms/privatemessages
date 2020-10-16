import DataCodes from '../constants/dataCodes.json';
import { Context } from 'telegraf';
import { Debugger } from 'debug';

export interface User {
  id: number;

  user_id: number;
  first_name: string;
  last_name?: string;
  username?: string;

  coins: number;
  sell_msg: string;
  is_banned: boolean;
  is_admin: boolean;
  pay_once: boolean;
  notifications: boolean;

  ouro: number;
  prata: number;
  bronze: number;
}

export interface Payment {
  id: number;
  buyer_id: number;
  seller_id: number;
  message_id: number;
}

export interface Message {
  id: number;
  from_user_id: number;
  value: number;
  message: string;
  unique_callback_id: string;
}

export interface Group {
  id: number;
  chat_id: number;
  chat_title?: string;
  chat_members_count: number;
  chat_banned: boolean;
}

export interface DataTransport {
  response: boolean;
  response_code?: keyof typeof DataCodes;
  message: string;
  payload?: any;
}

export type TContextWithState = Context & {
  state: {
    update_from_admin: boolean;
    debug_mode: boolean;
    chat_is_private: boolean;
    debugger: Debugger;
  },
  scene: any;
  session: any;
}

export interface ISellMsg {
  firstname: string;
  username: string;
  value: number;
  totalamount: number;
}

export interface IJWTData {
  user_id: number;
  coins: number;
  is_admin: boolean;
  sell_msg: string;
  iat: number;
}