import { readFile } from 'fs/promises';
import path from 'path';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import SparkPost from 'sparkpost';

@Injectable()
export class SparkpostService {
  private client: SparkPost;

  constructor(protected configService: ConfigService) {
    const sparkpostApiKey = configService.get<string>('SPARKPOST_API_KEY');

    this.client = new SparkPost(sparkpostApiKey, {
      endpoint: 'https://api.eu.sparkpost.com',
    });
  }

  async sendEmail(
    template: string,
    subject: string,
    recipient: string,
  ): Promise<void> {
    try {
      await this.client.transmissions.send({
        options: {
          sandbox: false,
        },
        content: {
          from: 'dev.oliinyk@gmail.com',
          subject: subject,
          html: template,
        },
        recipients: [{ address: recipient }],
      });

      console.log('Email sent successfully!');
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  private async loadTemplate(templateName: string): Promise<string> {
    const templatesFolderPath = path.join(__dirname, './templates');
    const templatePath = path.join(templatesFolderPath, templateName);
    return readFile(templatePath, 'utf8');
  }
}
