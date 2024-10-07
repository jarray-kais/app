import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // your email provider
      auth: {
        user: process.env.NODEJS_GMAIL_APP_USER, // your email address
        pass: process.env.NODEJS_GMAIL_APP_PASSWORD, // your email password
      },
    });
  }
  async sendMail(to: string, subject: string, html?: string) {
    const mailOptions = {
      from: process.env.NODEJS_GMAIL_APP_USER, //sender address
      to, //recipients
      subject, //subject of the email

      html, //html body of the email
    };

    //send the mail
    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Message sent: %s', info.messageId);
    } catch (error) {
      Logger.error(error.message);
      throw new Error('Failed to send email');
    }
  }
}
