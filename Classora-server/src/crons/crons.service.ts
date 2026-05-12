import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Role } from 'src/common/roles.enum';
import { NotificationsService } from 'src/notifications/notifications.service';
import { MembershipStatus } from 'src/user-membership/user-membership.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class CronsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Cron('0 20 22 * * 5', {
    name: 'active-users-report',
    timeZone: 'America/Argentina/Buenos_Aires',
  })
  async sendActiveUsersReport() {
    const users = await this.usersService.getAllUsers(1, 100);
    const activeUsers = users.filter(
      (user) => user.role === Role.User && user.isActive === true,
    );
    await this.notificationsService.sendActiveUsersReport(
      activeUsers,
      'gympower.ok@gmail.com',
    );
  }

  @Cron('0 20 21 * * 4', {
    name: 'active-users-report',
    timeZone: 'America/Argentina/Buenos_Aires',
  })
  async sendActiveUsersReportTryout() {
    const users = await this.usersService.getAllUsers(1, 100);
    const activeUsers = users.filter(
      (user) => user.role === Role.User && user.isActive === true,
    );
    await this.notificationsService.sendActiveUsersReport(
      activeUsers,
      'gympower.ok@gmail.com',
    );
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'expired-membership',
    timeZone: 'America/Argentina/Buenos_Aires',
  })
  async expiredMembership() {
    const users = await this.usersService.getAllUsers(1, 100);
    const expiredUsers = users.filter((user) =>
      user.memberships.some(
        (member) => member.status === MembershipStatus.EXPIRED,
      ),
    );

    await Promise.all(
      expiredUsers.map((user) =>
        this.notificationsService.sendExpiredMembershipEmail(
          user.name,
          user.email,
        ),
      ),
    );
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'membership-expiring-soon',
    timeZone: 'America/Argentina/Buenos_Aires',
  })
  async membershipExpiringSoon() {
    const users = await this.usersService.getAllUsers(1, 100);

    const hoy = new Date();
    hoy.setDate(hoy.getDate() + 3);
    const en3dias = hoy.toISOString().split('T')[0];

    for (const user of users) {
      for (const membresia of user.memberships) {
        const vencimiento = new Date(membresia.endDate)
          .toISOString()
          .split('T')[0];

        if (
          vencimiento === en3dias &&
          membresia.status === MembershipStatus.ACTIVE
        ) {
          await this.notificationsService.sendMembershipExpiringSoonEmail(
            user.name,
            user.email,
          );
        }
      }
    }
  }
}
