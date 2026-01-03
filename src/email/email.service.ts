import * as fs from 'fs';
import path from 'path';

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import handlebars from 'handlebars';

import { User } from '../users/entities/user.entity.js';
import { PgBossService } from '../common/modules/pgboss/pgboss.service.js';
import { SparkpostService } from '../common/modules/sparkpost/sparkpost.service.js';


type Job<T> = {
  data: T;
  id: string;
};

function readAsyncFile(path: string, options) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, options, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

@Injectable()
export class EmailService {
  constructor(
    private pgBossService: PgBossService,
    private sparkPostService: SparkpostService,
    private configService: ConfigService,
  ) {}

  #getDomain(env: string) {
    return `https://${env === 'development' ? 'dev.' : ''}kcb-service.com`;
  }

  #getLogoSrc(env: string) {
    return `${this.#getDomain(env)}/images/kcb-service-logo.png`;
  }

  async sendSignupEmail(user: Omit<User,'password'>, code: string) {
    await this.sendEmail('signup', 'Welcome!', { ...user, code });
  }

  async sendResetEmail(user: User, code: string, redirectURL: string) {
    await this.sendEmail('reset', 'Reset password', {
      ...user,
      code,
      redirectURL,
    });
  }

  async passwordUpdated(user: User) {
    await this.sendEmail('resetSuccess', 'Reset password', {
      ...user,
    });
  }

  async sendEmail<T>(template: string, subject: string, emailDetails: T) {
    const queue = `email-queue-${template}`;

    await this.pgBossService.createJob(queue, {
      template,
      emailDetails,
      subject,
    });

    await this.pgBossService.registerJobHandler(
      queue,
      async (
        job: Job<{
          template: string;
          emailDetails: Record<string, any>;
          subject: string;
        }>,
      ) => {
        try {
          const {
            template: templateName,
            emailDetails: templateDetails,
            subject: emailSubject,
          } = job.data;
          const html = (await this.loadTemplate(
            templateName,
            templateDetails,
          )) as string;

          await this.sparkPostService.sendEmail(
            html,
            emailSubject,
            templateDetails.email,
          );
        } catch (e) {
          if (e) {
            throw new HttpException(
              'Could not load template',
              HttpStatus.NOT_FOUND,
            );
          }
        }
      },
    );
  }

  private async loadTemplate<T extends Record<string, any>>(
    templateName: string,
    options: T,
  ): Promise<string | undefined> {
    try {
      const templatePath = path.join(
        process.cwd(),
        'src',
        'email',
        'templates',
        `${templateName}.hbs`,
      );

      console.log('Loading template from:', templatePath);

      const templateSource = await readAsyncFile(templatePath, 'utf8');
      const env = this.configService.get('NODE_ENV');

      return handlebars.compile(templateSource)({
        ...options,
        logo: this.#getLogoSrc(env),
        domain: this.#getDomain(env),
      });
    } catch (e) {
      console.error('Load template error: ',e.message);
    }
  }
}
