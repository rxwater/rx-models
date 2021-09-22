import { Attachment, EntityAttachment } from 'src/entity-interface/Attachment';
import { EntityMail, Mail } from 'src/entity-interface/Mail';
import { MailBoxType } from 'src/entity-interface/MailBoxType';
import {
  EntityMailIdentifier,
  MailIdentifier,
} from 'src/entity-interface/MailIdentifier';
import { StorageService } from 'src/storage/storage.service';
import { TypeOrmService } from 'src/typeorm/typeorm.service';
import { BUCKET_MAILS, FOLDER_ATTACHMENTS } from 'src/util/consts';
import { getExt } from 'src/util/get-ext';
import { MailerEvent, MailerEventType } from '../mailer.event';
import { JobOwner } from './job-owner';
import { MailTeller } from './mail-teller';

export interface IJob {
  jobOwner: JobOwner;

  start(): void;
  abort(): void;
  retry(): void;
}

export abstract class Job implements IJob {
  jobOwner: JobOwner;
  protected mailTeller = new MailTeller();
  protected mailAddress: string;
  protected isError = false;
  protected eventName = '';
  protected readonly typeOrmService: TypeOrmService;
  protected readonly storageService: StorageService;
  protected readonly accountId: number;

  constructor(enventName: string) {
    this.eventName = enventName;
  }

  emit(event: MailerEvent): void {
    event.name = this.eventName;
    this.jobOwner.emit(event);
  }

  error(message: string) {
    this.emit({
      type: MailerEventType.error,
      message: message,
    });
    this.isError = true;
  }

  start(): void {
    this.emit({
      type: MailerEventType.checkStorage,
      message: 'Check storage',
    });

    this.storageService
      .checkAndCreateBucket(BUCKET_MAILS)
      .then(() => {
        this.readLocalMailList();
      })
      .catch((error) => {
        console.error(error);
        this.error('Storage error:' + error);
      });
  }

  readLocalMailList(): void {
    this.emit({
      type: MailerEventType.readLocalMailList,
      message: 'Read local mail list',
    });

    const repository =
      this.typeOrmService.getRepository<MailIdentifier>(EntityMailIdentifier);
    repository
      .find({
        select: ['uidl'],
        where: { mailAddress: this.mailAddress },
      })
      .then((data) => {
        this.mailTeller.localMailList = data.map((mail) => mail.uidl);
        this.receive();
      })
      .catch((error) => {
        console.error(error);
        this.error('Read local mail list error:' + error);
      });
  }

  async saveMailToStorage(uidl: string, data: any, mailBox: MailBoxType) {
    const fileName = this.getMailFileName(uidl, mailBox);
    await this.storageService.putFileData(fileName, data, BUCKET_MAILS);
  }

  async saveMailToDatabase(
    uidl: string,
    passedMail: any,
    mailBox: MailBoxType,
  ) {
    const attachments = [];
    if (!passedMail) {
      throw new Error('NO parsed mail is provided');
    }
    for (let i = 0; i < passedMail.attachments.length; i++) {
      const attachementObj = passedMail.attachments[i];
      const path = `${
        this.mailAddress
      }/${FOLDER_ATTACHMENTS}/${uidl}-${i}.${getExt(attachementObj.filename)}`;
      if (attachementObj.related) {
        //可能不需要保存
        continue;
      }
      await this.storageService.putFileData(
        path,
        attachementObj.content,
        BUCKET_MAILS,
      );
      attachments.push(
        await this.typeOrmService
          .getRepository<Attachment>(EntityAttachment)
          .save({
            fileName: attachementObj.filename,
            mimeType: attachementObj.contentType,
            size: attachementObj.size,
            path: path,
          }),
      );
    }

    const mail = await this.typeOrmService
      .getRepository<Mail>(EntityMail)
      .save({
        subject: passedMail.subject,
        from: passedMail.from,
        to: passedMail.to,
        cc: passedMail.cc,
        bcc: passedMail.bcc,
        date: passedMail.date,
        messageId: passedMail.messageId,
        inReplyTo: passedMail.inReplyTo,
        replyTo: passedMail.replyTo,
        references: passedMail.references,
        html: passedMail.html,
        text: passedMail.text,
        textAsHtml: passedMail.textAsHtml,
        priority: passedMail.priority,
        belongsTo: { id: this.accountId },
        inMailBox: mailBox,
        fromAddress: passedMail.from?.value[0]?.address,
        attachments: attachments,
      });
    await this.typeOrmService
      .getRepository<MailIdentifier>(EntityMailIdentifier)
      .save({
        uidl: uidl,
        mailAddress: this.mailAddress,
        file: this.getMailFileName(uidl, mailBox),
        mail: mail,
        fromBox: mailBox,
      });
  }

  retry(): void {
    this.start();
  }

  private getMailFileName(uidl: string, mailBox: MailBoxType) {
    return `${this.mailAddress}/${mailBox}/${uidl}.eml`;
  }
  abstract receive(): void;
  abstract abort(): void;
}
