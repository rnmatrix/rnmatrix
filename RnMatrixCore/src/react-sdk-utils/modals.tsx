import React from 'react';
import { Text, Alert } from 'react-native';

// TODO: translate
const _t = (s, obj?) => {
  if (!obj) return s;

  return s.replace(/(\{\{)(.*?)(\}\})/gm, Object.values(obj)[0]);
};

type Question = {
  title: string;
  description?: string | JSX.Element;
  button?: string;
  danger?: boolean;
};

export const showError = async (question: Question): Promise<boolean> => {
  return false;
};

export const ask = async (question: Question): Promise<boolean> => {
  return false;
};

interface Confirmation extends Question {
  member?: any;
  groupMember?: any;
  action: any;
  askReason?: boolean;
  matrixClient?: any;
}

export const confirm = async (
  question: Confirmation,
): Promise<[boolean, string]> => {
  const confirmed = await new Promise<boolean>((resolve) =>
  // @ts-ignore
    Alert.alert(question.title, question.description, [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: () => resolve(false),
      },
      {
        text: question.action,
        style: question.danger ? 'destructive' : 'default',
        onPress: () => resolve(true),
      },
    ]),
  );
  return [confirmed, ''];
};

export const showInfo = async (question: Question): Promise<boolean> => {
  return false;
};

export const warnSelfDemote = async () => {
  return ask({
    title: _t('Demote yourself?'),
    description: (
      <Text>
        {_t(
          'You will not be able to undo this change as you are demoting yourself, ' +
            'if you are the last privileged user in the room it will be impossible ' +
            'to regain privileges.',
        )}
      </Text>
    ),
    button: _t('Demote'),
  });
};
