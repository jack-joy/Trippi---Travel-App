import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  'sign-in': undefined;
  'sign-up': undefined;
};

export type TabParamList = {
  feed: undefined;
  explore: undefined;
  create: undefined;
  notifications: undefined;
  profile: undefined;
};

export type RootStackParamList = {
  '(tabs)': NavigatorScreenParams<TabParamList>;
  '(auth)': NavigatorScreenParams<AuthStackParamList>;
  'trip/[id]': { id: string };
  'user/[id]': { id: string };
  'comments/[postId]': { postId: string };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
