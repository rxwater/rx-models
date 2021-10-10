import { Attachment } from './Attachment';
import { MailIdentifier } from './MailIdentifier';
import { DraftAttachment } from './DraftAttachment';
import { RxUser } from './RxUser';
import { MailLabel } from './MailLabel';
import { MailBoxType } from './MailBoxType';
import { SendStatus } from './SendStatus';
import { AddressObject } from './AddressObject';

export const EntityMail = 'Mail';
export interface Mail  {
  id?: number;
  subject?: string;
  from?: AddressObject;
  to?: AddressObject;
  cc?: AddressObject;
  bcc?: AddressObject;
  date?: Date;
  messageId?: string;
  inReplyTo?: string;
  replyTo?: any;
  references?: any[];
  html?: string;
  text?: string;
  textAsHtml?: string;
  priority?: string;
  inMailBox: MailBoxType;
  showAsOriginal?: boolean;
  fromAddress?: string;
  seen?: boolean;
  answered?: boolean;
  deleted?: boolean;
  forwarded?: boolean;
  fromOldCustomer?: boolean;
  size?: number;
  inMailBoxBeforeDelete?: MailBoxType;
  scheduleSendDate?: Date;
  isSeparateSend?: boolean;
  sendStatus?: SendStatus;
  sendErrorMessage?: any[];
  fromConfigId?: number;
  createdAt?: Date;
  updatedAt?: Date;
  owner?: RxUser;
  labels?: MailLabel[];
  attachments?: Attachment[];
  identifier?: MailIdentifier;
  draftAttachments?: DraftAttachment[];
}
