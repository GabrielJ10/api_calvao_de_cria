export default class Email {
  to: string;
  firstName: string;
  url: string;
  from: string;

  constructor(user: any, url: string) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = 'mock@email.com';
  }

  async send(subject: string, message: string) {
    console.log(`[MOCK EMAIL] To: ${this.to}, Subject: ${subject}`);
    return Promise.resolve();
  }

  async sendPasswordReset() {
    return this.send('Reset Token', 'Mock reset token');
  }
}
